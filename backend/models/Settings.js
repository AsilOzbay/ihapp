const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  selectedCoins: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
