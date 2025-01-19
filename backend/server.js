const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';

// MongoDB'ye bağlan
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Kullanıcı kayıt endpoint'i
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email'in mevcut olup olmadığını kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcı oluştur
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

// Kullanıcı giriş endpoint'i
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Şifreyi doğrula
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // JWT token oluştur
        const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});

// Sunucuyu başlat
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
