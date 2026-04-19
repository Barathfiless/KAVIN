const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    type: { type: String, enum: ['public', 'private', 'broadcast', 'direct'], default: 'public' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: {
        text: String,
        senderName: String,
        timestamp: { type: Date, default: Date.now }
    }
}, { timestamps: true });

module.exports = mongoose.model('Community', CommunitySchema);
