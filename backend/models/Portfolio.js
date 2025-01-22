const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  action: { type: String, enum: ['buy', 'sell'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  transactions: [TransactionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);
module.exports = Portfolio;