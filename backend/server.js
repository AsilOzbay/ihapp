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
const transporter = nodemailer.createTransport({
     host: 'smtp.office365.com',
     port: 587,
     secure: false, // if you use TLS with port 587
     auth: {
      user: 'investinghub2025@hotmail.com',     // e.g. "investinghub2025@hotmail.com"
       pass: 'fferplakdablmmmy', // e.g. "SomeAppSpecificPassword"
     },
     
   });
transporter.verify((err, success) => {
    if (err) {
      console.error('SMTP Connection Error:', err);
    } else {
      console.log('SMTP is ready to take messages');
    }
  });
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

    // STEP 1: Generate a 6-digit 2FA code
   const twoFactorCode = generate2FACode();

   // STEP 2: Set expiration time for 2FA code (e.g., 5 min from now)
   const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

   // STEP 3: Update user in the database
   user.twoFactorCode = twoFactorCode;
   user.twoFactorCodeExpires = expires;
   await user.save();

   // STEP 4: Send code via email using our transporter
   const mailOptions = {
     from: process.env.EMAIL_USER,   // e.g. "investinghub2025@hotmail.com"
     to: user.email,                 // the user's email
     subject: 'Your 2FA Code',
     text: `Your 2FA code is: ${twoFactorCode}\nThis code will expire in 5 minutes.`,
   };

  try {
     await transporter.sendMail(mailOptions);
     console.log(`2FA code sent to ${user.email}`);
   } catch (error) {
     console.error('Error sending 2FA email:', error.message);
     console.error('Full error object:', error);
     // Optionally handle email errors, e.g. revert changes, return error
   }

   // STEP 5: Return a response telling the user to verify the code
   res.json({
     message: '2FA code sent to your email. Please verify to complete login.',
     userId: user._id,  // We'll need the userId to know which account we’re verifying
   });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});


 app.post('/verify-2fa', async (req, res) => {
     try {
       const { userId, code } = req.body;
       if (!userId || !code) {
         return res.status(400).json({ message: 'userId and code are required.' });
       }
  
       // 1) Find the user
       const user = await User.findById(userId);
       if (!user) {
         return res.status(404).json({ message: 'User not found.' });
       }
  
       // 2) Check if code matches and not expired
       const now = new Date();
       if (
        user.twoFactorCode !== code ||
         !user.twoFactorCodeExpires ||
         user.twoFactorCodeExpires < now
       ) {
         return res.status(400).json({ message: 'Invalid or expired code.' });
       }  
       // 3) If valid, create the JWT
       const token = jwt.sign(
         { id: user._id },
         process.env.JWT_SECRET || 'secretkey',
         { expiresIn: '1h' }
       );
  
       // 4) Clear the code from the DB (so user can’t re-use it)
       user.twoFactorCode = null;
       user.twoFactorCodeExpires = null;
       await user.save();
  
       // 5) Return the token + user data
       res.json({
         message: '2FA verification successful.',
         token,
         user: {
           id: user._id,
           firstName: user.firstName,
           lastName: user.lastName,
           email: user.email,
         },
       });
     } catch (err) {
       res.status(500).json({ message: 'Error verifying 2FA', error: err.message });
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

// -------------------- 2FA --------------------

function generate2FACode() {
    // Returns a 6-digit string, e.g. "123456"
    return Math.floor(100000 + Math.random() * 900000).toString();
   }


// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
