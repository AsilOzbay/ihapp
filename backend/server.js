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
const nodemailer = require('nodemailer');




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
const tempUsers = {};

app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Hash the password (temporary storage)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Temporary user storage in memory (could be replaced with Redis or similar storage)
    tempUsers[email] = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationCode,
    };

    // Nodemailer Configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Sender email address
        pass: process.env.EMAIL_PASS, // App password or email password
      },
    });

    // Email Options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Recipient address
      subject: 'Verify Your Email',
      text: `Hello ${firstName},\n\nYour verification code is: ${verificationCode}\n\nThank you!`,
    };

    // Send Email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email', error });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Verification email sent successfully.' });
    });
  } catch (err) {
    console.error("Error processing registration:", err.message);
    res.status(500).json({ message: 'Error processing registration', error: err.message });
  }
});

app.post('/verify', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Check if the user exists in temp storage
    const tempUser = tempUsers[email];
    if (!tempUser) {
      return res.status(400).json({ message: 'Verification expired or invalid email.' });
    }

    // Check if verification code matches
    if (tempUser.verificationCode !== parseInt(verificationCode, 10)) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    // Create user in the database
    const newUser = new User({
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true,
    });

    await newUser.save();

    // Remove the user from temporary storage
    delete tempUsers[email];

    res.status(201).json({ message: 'User verified and registered successfully.' });
  } catch (err) {
    console.error("Error verifying user:", err.message);
    res.status(500).json({ message: 'Error verifying user', error: err.message });
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
        dailyChange: parseFloat(response.data.priceChangePercent), // daily % change
        volume: parseFloat(response.data.volume),
        highPrice: parseFloat(response.data.highPrice),
        lowPrice: parseFloat(response.data.lowPrice),
  
        // 2) We'll initialize weeklyChange & monthlyChange to 0 for now
        weeklyChange: 0,
        monthlyChange: 0,
      }));
  
      console.log('Crypto data fetched successfully for 30 symbols.');
  
      // 3) Now we iterate each coin and fetch weekly/monthly changes
      //    NOTE: This could cause up to 60 calls (for 30 coins weekly+monthly).
      //    If that's acceptable, keep this here.
      //    Otherwise, consider calling fetchWeeklyChange/fetchMonthlyChange
      //    less frequently (e.g. in a separate function or on a schedule).
      for (let coin of cachedCryptoData) {
        const binanceSymbol = coin.symbol + 'USDT';
        // try-catch inside so if one symbol fails, others continue
        try {
          coin.weeklyChange = await fetchWeeklyChange(binanceSymbol);
          coin.monthlyChange = await fetchMonthlyChange(binanceSymbol);
        } catch (error) {
          console.error(`Failed to fetch weekly/monthly for ${binanceSymbol}`, error.message);
        }
      }
  
    } catch (error) {
      console.error('Error fetching crypto data:', error.message);
    }
  };

// --------------------------------------------------------
// PART 2: Add or replace endpoints for multi-timeframe
// Insert around line ~290 or so, near your other CRYPTO endpoints.
// --------------------------------------------------------


// ---------------------------------------------------------------------
// NEW: /gainers endpoint with "rename" logic for coin.change
// ---------------------------------------------------------------------
app.get('/gainers', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'daily';

    let sortField;
    if (timeframe === 'weekly') {
      sortField = 'weeklyChange';
    } else if (timeframe === 'monthly') {
      sortField = 'monthlyChange';
    } else {
      // default daily
      sortField = 'dailyChange';
    }

    // Sort the coins DESCENDING by the chosen field
    const sorted = [...cachedCryptoData].sort((a, b) => b[sortField] - a[sortField]);

    // Grab top 5
    const top5Gainers = sorted.slice(0, 5);

    // Rename the correct timeframe field into coin.change (for the front-end)
    top5Gainers.forEach((coin) => {
      coin.change = coin[sortField]; 
      // e.g. coin.change = coin.dailyChange if timeframe='daily'
      // coin.change = coin.weeklyChange if 'weekly'
      // coin.change = coin.monthlyChange if 'monthly'
    });

    return res.json({
      timeframe,
      data: top5Gainers,
    });
  } catch (error) {
    console.error('Error in /gainers:', error.message);
    return res.status(500).json({ message: 'Failed to get gainers' });
  }
});


app.get('/losers', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'daily';

    let sortField;
    if (timeframe === 'weekly') {
      sortField = 'weeklyChange';
    } else if (timeframe === 'monthly') {
      sortField = 'monthlyChange';
    } else {
      // default daily
      sortField = 'dailyChange';
    }

    // Sort ascending
    const sorted = [...cachedCryptoData].sort((a, b) => a[sortField] - b[sortField]);
    const top5Losers = sorted.slice(0, 5);

    top5Losers.forEach((coin) => {
      coin.change = coin[sortField];
    });

    return res.json({
      timeframe,
      data: top5Losers,
    });
  } catch (error) {
    console.error('Error in /losers:', error.message);
    return res.status(500).json({ message: 'Failed to get losers' });
  }
});



// This version sorts the 30 coins by 24hr change (descending) and picks top 5
const fetchTrendingCoins = async () => {
  try {
    // Make sure we have some data in cachedCryptoData
    // If it's empty, fetch it once:
    if (!cachedCryptoData || !cachedCryptoData.length) {
      await fetchCryptoData(); // This fetches all 30 coins
    }
    
    // Sort them by 'change' descending and take top 5
    const sortedByGainers = [...cachedCryptoData].sort((a, b) => b.change - a.change);
    cachedTrendingData = sortedByGainers.slice(0, 5);

    console.log('Top 5 daily gainers set in cachedTrendingData');
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
  // Return cached data with all change rates included
  res.json({
    data: cachedCryptoData.map((coin) => ({
      symbol: coin.symbol,
      price: coin.price,
      dailyChange: coin.dailyChange,
      weeklyChange: coin.weeklyChange,
      monthlyChange: coin.monthlyChange,
      volume: coin.volume,
    })),
    lastUpdated: lastFetchTime,
  });
});


app.get('/top-exchanges', (req, res) => {
  res.json({ data: cachedExchangesData });
});

// Manually refresh data
app.get('/refresh-data', async (req, res) => {
  await fetchAllData();
  res.json({ message: 'Data refreshed successfully.' });
});

// This will take our 30 cached coins and pick the 5 with the *lowest* (most negative) daily change
const fetchTopLosers = async () => {
  try {
    // If we haven't fetched the 30 coins yet, do so:
    if (!cachedCryptoData || !cachedCryptoData.length) {
      await fetchCryptoData();
    }

    // Sort ascending by % change:
    const sorted = [...cachedCryptoData].sort((a, b) => a.change - b.change);

    // Take the first 5 (these will be the biggest losers):
    cachedTopLosersData = sorted.slice(0, 5);
    console.log('Top 5 daily losers set in cachedTopLosersData');
  } catch (error) {
    console.error('Error in fetchTopLosers:', error.message);
  }
};

async function fetchWeeklyChange(symbol) {
  try {
    // Get 8 daily candles so we have 7 intervals
    // (because we need the price from day0 close and day7 close)
    const limit = 8; 
    const interval = '1d';

    const response = await axios.get(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );

    const klines = response.data; 
    if (klines.length < 2) {
      return 0; // Not enough data to compute weekly change
    }

    // First candle's close price
    const firstClose = parseFloat(klines[0][4]);
    // Last candle's close price (7 days later)
    const lastClose = parseFloat(klines[klines.length - 1][4]);

    // Calculate % change
    const weeklyChange = ((lastClose - firstClose) / firstClose) * 100;
    return weeklyChange;
  } catch (error) {
    console.error(`Error fetching weekly change for ${symbol}:`, error.message);
    return 0;
  }
}


async function fetchMonthlyChange(symbol) {
  try {
    // For 30 days, we fetch 31 daily candles
    const limit = 31; 
    const interval = '1d';

    const response = await axios.get(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );

    const klines = response.data; 
    if (klines.length < 2) {
      return 0;
    }

    const firstClose = parseFloat(klines[0][4]);
    const lastClose = parseFloat(klines[klines.length - 1][4]);
    const monthlyChange = ((lastClose - firstClose) / firstClose) * 100;

    return monthlyChange;
  } catch (error) {
    console.error(`Error fetching monthly change for ${symbol}:`, error.message);
    return 0;
  }
}




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
let historicalDataCache = {};
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

  app.post('/portfolio/:id/transaction', async (req, res) => {
    const { id } = req.params;
    const { symbol, action, quantity, price } = req.body;
  
    if (!symbol || !action || !quantity || !price) {
      return res.status(400).json({ message: 'All fields are required: symbol, action, quantity, price' });
    }
  
    try {
      const total = quantity * price;
      if (quantity <= 0 || price <= 0) {
        return res.status(400).json({ message: 'Quantity and price must be positive numbers' });
      }
  
      if (!['buy', 'sell'].includes(action)) {
        return res.status(400).json({ message: 'Action must be either "buy" or "sell"' });
      }
  
      const portfolio = await Portfolio.findById(id);
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
  
      const newTransaction = {
        symbol,
        action,
        quantity,
        price,
        total,
        date: new Date(), // Add timestamp
      };
  
      portfolio.transactions.push(newTransaction);
      await portfolio.save();
  
      res.status(201).json({ message: 'Transaction added successfully', portfolio });
    } catch (error) {
      res.status(500).json({ message: 'Error adding transaction', error: error.message });
    }
  });
  

  const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }
  
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      req.user = verified; // Attach user data to the request object
      next();
    } catch (error) {
      res.status(403).json({ message: 'Invalid Token' });
    }
  };
  
  app.get('/portfolios', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Use authenticated user ID

  try {
    const portfolios = await Portfolio.find({ userId }); // Fetch portfolios for the authenticated user
    res.status(200).json(portfolios);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolios', error: error.message });
  }
});

// Fetch a single portfolio by ID
app.get('/portfolio/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});



// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
