// server.js

// -------------------- IMPORTS --------------------
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/User');
const Portfolio = require('./models/Portfolio');


// -------------------- CONFIG --------------------
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';

// -------------------- DATABASE CONNECTION --------------------
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// -------------------- AUTH ENDPOINTS --------------------

// Register
app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error registering user', error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// -------------------- CRYPTO DATA FETCHING --------------------
// Cache variables
let cachedCryptoData = [];
let cachedTrendingData = [];
let cachedExchangesData = [];
let lastFetchTime = null;

// Fetch cryptocurrency data (Top 50 pairs from Binance)
const fetchCryptoData = async () => {
    try {
      // Valid 30 symbols
      const symbols = [
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT',
        'DOGEUSDT', 'MATICUSDT', 'SOLUSDT', 'DOTUSDT', 'SHIBUSDT',
        'TRXUSDT', 'LTCUSDT', 'LINKUSDT', 'AVAXUSDT', 'UNIUSDT',
        'ATOMUSDT', 'ETCUSDT', 'XLMUSDT', 'BCHUSDT', 'APTUSDT',
        'APEUSDT', 'FILUSDT', 'NEARUSDT', 'QNTUSDT', 'AAVEUSDT',
        'AXSUSDT', 'SANDUSDT', 'VETUSDT', 'EGLDUSDT', 'EOSUSDT'
      ];
  
      const requests = symbols.map((symbol) =>
        axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      );
      const responses = await Promise.all(requests);
  
      cachedCryptoData = responses.map((response) => ({
        symbol: response.data.symbol.replace('USDT', ''),
        price: parseFloat(response.data.lastPrice),
        change: parseFloat(response.data.priceChangePercent),
        volume: parseFloat(response.data.volume),
        highPrice: parseFloat(response.data.highPrice),
        lowPrice: parseFloat(response.data.lowPrice),
      }));
  
      console.log('Crypto data fetched successfully for 30 symbols.');
    } catch (error) {
      console.error('Error fetching crypto data:', error.message);
    }
  };

// Fetch trending coins (You can keep this shorter or also expand)
const fetchTrendingCoins = async () => {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    const requests = symbols.map((symbol) =>
      axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
    );
    const responses = await Promise.all(requests);

    cachedTrendingData = responses.map((response) => ({
      symbol: response.data.symbol.replace('USDT', ''),
      price: parseFloat(response.data.lastPrice),
      change: parseFloat(response.data.priceChangePercent),
    }));
    console.log('Trending coins fetched successfully.');
  } catch (error) {
    console.error('Error fetching trending coins:', error.message);
  }
};

// Fetch top exchanges (static data for now)
const fetchTopExchanges = async () => {
  cachedExchangesData = [
    { rank: 1, exchange: 'Binance', volume: '$20B', change: '2.1%' },
    { rank: 2, exchange: 'Coinbase', volume: '$12B', change: '1.5%' },
    { rank: 3, exchange: 'Kraken', volume: '$8B', change: '0.8%' },
    { rank: 4, exchange: 'Bitfinex', volume: '$5B', change: '-1.2%' },
    { rank: 5, exchange: 'KuCoin', volume: '$4B', change: '0.5%' },
  ];
};

// Initial data fetch
const fetchAllData = async () => {
  await fetchCryptoData();
  await fetchTrendingCoins();
  await fetchTopExchanges();
  lastFetchTime = new Date();
};

fetchAllData();

// -------------------- CRYPTO ENDPOINTS --------------------
app.get('/crypto-data', (req, res) => {
  res.json({ data: cachedCryptoData, lastUpdated: lastFetchTime });
});

app.get('/trending-coins', (req, res) => {
  res.json({ data: cachedTrendingData });
});

app.get('/top-exchanges', (req, res) => {
  res.json({ data: cachedExchangesData });
});

// Manually refresh data
app.get('/refresh-data', async (req, res) => {
  await fetchAllData();
  res.json({ message: 'Data refreshed successfully.' });
});

// -------------------- GRAPH/HISTORICAL DATA --------------------
const historicalDataCache = {};

// Helper to fetch historical data from Binance
const fetchHistoricalData = async (symbol, interval = '1m', limit = 20) => {
  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    return response.data.map((entry) => ({
      time: new Date(entry[0]).toLocaleTimeString(), // Timestamp
      price: parseFloat(entry[4]), // Closing price
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    return [];
  }
};

// Endpoint to get graph data
app.get('/graph-data/:symbol', async (req, res) => {
  const { symbol } = req.params;
  // Convert to Binance symbol
  const binanceSymbol = `${symbol.toUpperCase()}USDT`;

  // Check cache
  if (historicalDataCache[binanceSymbol]) {
    return res.json(historicalDataCache[binanceSymbol]);
  }

  // Fetch and store in cache
  const historicalData = await fetchHistoricalData(binanceSymbol);
  historicalDataCache[binanceSymbol] = historicalData;
  res.json(historicalData);
});

// Periodic refresh of historical data
setInterval(async () => {
  const symbols = ['BTCUSDT', 'ETHUSDT']; // add more symbols if needed
  for (const symbol of symbols) {
    historicalDataCache[symbol] = await fetchHistoricalData(symbol);
  }
  console.log('Historical data refreshed.');
}, 6000000); // every 6000 seconds

app.get('/crypto-data', async (req, res) => {
    const { timeframe = '1D' } = req.query; // Default to 1-day data
    let interval;
    
    // Map timeframe to Binance interval
    switch (timeframe) {
      case '1H':
        interval = '1m';
        break;
      case '1D':
        interval = '1h';
        break;
      case '1W':
        interval = '4h';
        break;
      case '1M':
        interval = '1d';
        break;
      case '1Y':
        interval = '1w';
        break;
      default:
        interval = '1h';
    }
  
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT'];
      const requests = symbols.map((symbol) =>
        fetchHistoricalData(symbol, interval, 20) // Use your helper
      );
      const data = await Promise.all(requests);
  
      res.json({ data, timeframe });
    } catch (error) {
      console.error('Error fetching crypto data:', error.message);
      res.status(500).json({ message: 'Error fetching crypto data' });
    }
  });

// -------------------- Portfolio --------------------




  app.post('/create-portfolio', async (req, res) => {
    console.log(`islem eklendi`);
    const { userId, name, avatar } = req.body;
  
    if (!userId || !name) {
      return res.status(400).json({ message: 'userId and name are required' });
    }
  
    try {
      const portfolio = new Portfolio({
        userId,
        name,
        avatar,
        transactions: [],
      });
  
      await portfolio.save();
      res.status(201).json({ message: 'Portfolio created successfully', portfolio });
    } catch (error) {
      res.status(500).json({ message: 'Error creating portfolio', error: error.message });
    }
  });

  app.post('/portfolio/:id/transaction', async (req, res) => {
    const { id } = req.params; // Portfolio ID
    const { symbol, action, quantity, price } = req.body;
  
    // Validate input
    if (!symbol || !action || !quantity || !price) {
      return res.status(400).json({ message: 'All fields are required: symbol, action, quantity, price' });
    }
  
    try {
      const total = quantity * price; // Calculate the total value of the transaction
      if (quantity <= 0 || price <= 0) {
        return res.status(400).json({ message: 'Quantity and price must be positive numbers' });
      }
      
      if (!['buy', 'sell'].includes(action)) {
        return res.status(400).json({ message: 'Action must be either "buy" or "sell"' });
      }
      // Find the portfolio by ID and update it
      const portfolio = await Portfolio.findById(id);
  
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
  
      // Add the transaction to the portfolio
      portfolio.transactions.push({
        symbol,
        action,
        quantity,
        price,
        total,
      });
  

      // Save the updated portfolio
      await portfolio.save();
  
      res.status(201).json({ message: 'Transaction added successfully', portfolio });
    } catch (error) {
      res.status(500).json({ message: 'Error adding transaction', error: error.message });
    }
  });


  app.put('/portfolio/:portfolioId/transaction/:transactionId', async (req, res) => {
    const { portfolioId, transactionId } = req.params;
    const { symbol, action, quantity, price } = req.body;
  
    if (!symbol || !action || !quantity || !price) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found.' });
      }
  
      const transaction = portfolio.transactions.id(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found.' });
      }
  
      transaction.symbol = symbol;
      transaction.action = action;
      transaction.quantity = quantity;
      transaction.price = price;
      transaction.total = quantity * price;
  
      await portfolio.save();
      res.status(200).json({ message: 'Transaction updated successfully.', transactions: portfolio.transactions });
    } catch (error) {
      res.status(500).json({ message: 'Error updating transaction', error: error.message });
    }
  });

  app.delete('/portfolio/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const portfolio = await Portfolio.findByIdAndDelete(id);
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found.' });
      }
      res.status(200).json({ message: 'Portfolio deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting portfolio', error: error.message });
    }
  });

  app.get('/portfolios', async (req, res) => {
    console.log("portfolios")
    const { userId } = req.query;

  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
  
    try {
      const portfolios = await Portfolio.find({ userId });
      res.status(200).json(portfolios);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching portfolios', error: error.message });
    }
  });


// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
