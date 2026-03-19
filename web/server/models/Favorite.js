const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The farmer being favorited
    farmName: { type: String, required: true },
    farmLocation: { type: String },
    farmRating: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
