const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
app.use(express.json());
app.use(cors());

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User registration endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});

// Cryptocurrency data caching and fetching
let cachedCryptoData = [];
let cachedTrendingData = [];
let cachedExchangesData = [];
let lastFetchTime = null;

// Fetch cryptocurrency data
const fetchCryptoData = async () => {
    try {
        const symbols = ["BTCUSDT", "ETHUSDT", "XRPUSDT", "SOLUSDT", "DOGEUSDT"];
        const requests = symbols.map((symbol) =>
            axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
        );
        const responses = await Promise.all(requests);

        cachedCryptoData = responses.map((response) => ({
            symbol: response.data.symbol.replace("USDT", ""),
            price: parseFloat(response.data.lastPrice),
            change: parseFloat(response.data.priceChangePercent),
            volume: parseFloat(response.data.volume),
            highPrice: parseFloat(response.data.highPrice),
            lowPrice: parseFloat(response.data.lowPrice),
        }));
        console.log("Crypto data fetched successfully.");
    } catch (error) {
        console.error("Error fetching crypto data:", error.message);
    }
};

// Fetch trending coins
const fetchTrendingCoins = async () => {
    try {
        const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
        const requests = symbols.map((symbol) =>
            axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
        );
        const responses = await Promise.all(requests);

        cachedTrendingData = responses.map((response) => ({
            symbol: response.data.symbol.replace("USDT", ""),
            price: parseFloat(response.data.lastPrice),
            change: parseFloat(response.data.priceChangePercent),
        }));
        console.log("Trending coins fetched successfully.");
    } catch (error) {
        console.error("Error fetching trending coins:", error.message);
    }
};

// Fetch top exchanges (static data for now)
const fetchTopExchanges = async () => {
    cachedExchangesData = [
        { rank: 1, exchange: "Binance", volume: "$20B", change: "2.1%" },
        { rank: 2, exchange: "Coinbase", volume: "$12B", change: "1.5%" },
        { rank: 3, exchange: "Kraken", volume: "$8B", change: "0.8%" },
        { rank: 4, exchange: "Bitfinex", volume: "$5B", change: "-1.2%" },
        { rank: 5, exchange: "KuCoin", volume: "$4B", change: "0.5%" },
    ];
};

// Fetch all data initially
const fetchAllData = async () => {
    await fetchCryptoData();
    await fetchTrendingCoins();
    await fetchTopExchanges();
    lastFetchTime = new Date();
};

fetchAllData();

// Endpoints for cryptocurrency data
app.get('/crypto-data', (req, res) => {
    res.json({ data: cachedCryptoData, lastUpdated: lastFetchTime });
});

app.get('/trending-coins', (req, res) => {
    res.json({ data: cachedTrendingData });
});

app.get('/top-exchanges', (req, res) => {
    res.json({ data: cachedExchangesData });
});

// Optional: Endpoint to manually refresh data
app.get('/refresh-data', async (req, res) => {
    await fetchAllData();
    res.json({ message: "Data refreshed successfully." });
});

// Cache for historical price data
const historicalDataCache = {};

// Fetch historical data from Binance
const fetchHistoricalData = async (symbol, interval = "1m", limit = 20) => {
    try {
        const response = await axios.get(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        );
        return response.data.map((entry) => ({
            time: new Date(entry[0]).toLocaleTimeString(), // Timestamp
            price: parseFloat(entry[4]), // Closing price
        }));
    } catch (error) {
        console.error("Error fetching historical data:", error.message);
        return [];
    }
};

// Endpoint to fetch graph data
app.get("/graph-data/:symbol", async (req, res) => {
    const { symbol } = req.params;

    // Convert symbol to Binance format
    const binanceSymbol = `${symbol.toUpperCase()}USDT`;

    // Check cache
    if (historicalDataCache[binanceSymbol]) {
        return res.json(historicalDataCache[binanceSymbol]);
    }

    // Fetch and cache data
    const historicalData = await fetchHistoricalData(binanceSymbol);
    historicalDataCache[binanceSymbol] = historicalData;
    res.json(historicalData);
});

// Periodic refresh of historical data (optional)
setInterval(async () => {
    const symbols = ["BTCUSDT", "ETHUSDT"]; // Add symbols as needed
    for (const symbol of symbols) {
        historicalDataCache[symbol] = await fetchHistoricalData(symbol);
    }
    console.log("Historical data refreshed.");
}, 60000); // Refresh every 60 seconds

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
