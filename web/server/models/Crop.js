const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    variety: { type: String },
    quantity: { type: String },
    price: { type: String },
    status: { type: String, enum: ['Ready', 'Growing', 'Pending', 'Out of Stock'], default: 'Growing' },
    icon: { type: String, default: '🌱' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Crop', cropSchema);
