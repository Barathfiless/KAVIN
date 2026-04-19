const mongoose = require('mongoose');

// Function to generate unique 8-character community ID
function generateCommunityId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    communityId: { type: String, unique: true, sparse: true }, // Unique ID for broadcast communities
    description: { type: String },
    image: { type: String },
    type: { type: String, enum: ['public', 'private', 'broadcast', 'direct'], default: 'public' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: {
        text: String,
        senderName: String,
        timestamp: { type: Date, default: Date.now }
    },
    settings: {
        allowMemberMessages: { type: Boolean, default: false } // false = Admin only, true = Anyone can post
    }
}, { timestamps: true });

// Pre-save hook to generate communityId for broadcast communities
CommunitySchema.pre('save', async function() {
    if (this.isNew && this.type === 'broadcast' && !this.communityId) {
        let isUnique = false;
        let newId;
        let attempts = 0;
        const maxAttempts = 10;
        
        // Keep generating until we get a unique ID
        while (!isUnique && attempts < maxAttempts) {
            newId = generateCommunityId();
            
            try {
                // Use this.constructor to reference the model
                const existing = await this.constructor.findOne({ communityId: newId });
                if (!existing) {
                    isUnique = true;
                }
            } catch (err) {
                console.error('Error checking community ID uniqueness:', err);
                throw err;
            }
            
            attempts++;
        }
        
        if (!isUnique) {
            throw new Error('Failed to generate unique community ID after 10 attempts');
        }
        
        this.communityId = newId;
        console.log('Generated community ID:', newId);
    }
});

module.exports = mongoose.model('Community', CommunitySchema);
