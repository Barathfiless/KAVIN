const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const Message = require('../models/Message');
const User = require('../models/User');

// ─── FARMER BROADCAST COMMUNITIES ───────────────────────────────────────────

// Get all broadcast communities (farmer-managed)
router.get('/broadcast/all', async (req, res) => {
    try {
        const communities = await Community.find({ type: 'broadcast' }).sort({ updatedAt: -1 });
        res.json(communities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get communities where farmer is admin
router.get('/admin/:userId', async (req, res) => {
    try {
        const communities = await Community.find({ admins: req.params.userId, type: 'broadcast' }).sort({ updatedAt: -1 });
        res.json(communities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get communities a user has joined (as member)
router.get('/joined/:userId', async (req, res) => {
    try {
        const communities = await Community.find({
            members: req.params.userId,
            type: 'broadcast'
        }).sort({ updatedAt: -1 });
        res.json(communities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new broadcast community (farmer only)
router.post('/create', async (req, res) => {
    const { name, description, adminId, adminName, settings } = req.body;
    
    console.log('Create community request:', { name, description, adminId, adminName, settings });
    
    try {
        const newCommunity = new Community({
            name,
            description,
            type: 'broadcast',
            admins: [adminId],
            members: [adminId],
            settings: settings || { allowMemberMessages: false },
            lastMessage: {
                text: `Welcome to ${name}!`,
                senderName: 'System',
                timestamp: new Date()
            }
        });
        
        console.log('Attempting to save community...');
        const saved = await newCommunity.save();
        console.log('Community saved successfully:', saved.communityId);
        
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error creating community:', err);
        res.status(400).json({ message: err.message, error: err.toString() });
    }
});

// Join a broadcast community (customer)
router.post('/:id/join', async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!community.members.map(String).includes(String(req.body.userId))) {
            community.members.push(req.body.userId);
            await community.save();
        }
        res.json(community);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get announcements for a community
router.get('/:id/announcements', async (req, res) => {
    try {
        const messages = await Message.find({
            community: req.params.id,
            messageType: 'announcement'
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post an announcement (admin / farmer only)
router.post('/:id/announce', async (req, res) => {
    const { sender, senderName, senderRole, text, image } = req.body;
    try {
        // Verify sender is admin OR everyone can post
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        
        // Universal grant for farmers in broadcast communities
        const user = await User.findById(sender).catch(err => null);
        const roleFromDB = user?.role?.toLowerCase();
        const roleFromBody = senderRole?.toLowerCase();
        
        const isOfficialAdmin = community.admins.map(String).includes(String(sender));
        const isFarmer = roleFromDB === 'farmer' || roleFromBody === 'farmer';
        const isAdmin = isOfficialAdmin || isFarmer;
        
        console.log('--- Broadcast Permission Check ---');
        console.log('User:', senderName, 'ID:', String(sender));
        console.log('Roles - DB:', roleFromDB, 'Body:', roleFromBody);
        console.log('isOfficialAdmin:', isOfficialAdmin, 'isFarmer:', isFarmer);
        console.log('Final isAdmin:', isAdmin);
        console.log('---------------------------------');

        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admins can post in this community' });
        }

        const newMsg = new Message({
            community: req.params.id,
            sender,
            senderName,
            senderRole,
            text,
            media: req.body.media,
            mediaType: req.body.mediaType,
            messageType: 'announcement'
        });
        const saved = await newMsg.save();

        await Community.findByIdAndUpdate(req.params.id, {
            lastMessage: {
                text: text || (req.body.mediaType ? `📸 ${req.body.mediaType}` : '📸 Attachment'),
                senderName,
                timestamp: new Date()
            }
        });

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// React to an announcement
router.post('/:msgId/react', async (req, res) => {
    const { userId, emoji } = req.body;
    try {
        const message = await Message.findById(req.params.msgId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        // Remove existing reaction from this user, then add new one
        message.reactions = message.reactions.filter(r => String(r.userId) !== String(userId));
        if (emoji) message.reactions.push({ userId, emoji });
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── DIRECT CHATS ────────────────────────────────────────────────────────────

// Get user's direct chats
router.get('/my/:userId', async (req, res) => {
    try {
        const communities = await Community.find({
            members: req.params.userId,
            type: 'direct'
        }).sort({ updatedAt: -1 });
        res.json(communities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search users for direct chat
router.get('/users/search', async (req, res) => {
    const { q, currentUserId } = req.query;
    try {
        const users = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                {
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { phone: { $regex: q } }
                    ]
                }
            ]
        }).limit(10).select('name phone role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search community by ID
router.get('/search-by-id/:communityId', async (req, res) => {
    try {
        const community = await Community.findOne({ 
            communityId: req.params.communityId.toUpperCase(),
            type: 'broadcast'
        });
        
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        
        res.json(community);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start or get direct chat
router.post('/direct', async (req, res) => {
    const { userId, targetUserId, userName, targetUserName } = req.body;
    try {
        let chat = await Community.findOne({
            type: 'direct',
            members: { $all: [userId, targetUserId], $size: 2 }
        });

        if (!chat) {
            chat = new Community({
                name: `${userName} & ${targetUserName}`,
                type: 'direct',
                members: [userId, targetUserId],
                admins: [userId, targetUserId],
                lastMessage: {
                    text: 'Chat started',
                    senderName: 'System',
                    timestamp: new Date()
                }
            });
            await chat.save();
        }
        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get messages for direct chat
router.get('/:id/messages', async (req, res) => {
    try {
        const messages = await Message.find({
            community: req.params.id,
            messageType: 'chat'
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Send a chat message
router.post('/:id/send', async (req, res) => {
    const { sender, senderName, senderRole, text, media, mediaType } = req.body;
    try {
        const newMsg = new Message({
            community: req.params.id,
            sender,
            senderName,
            senderRole,
            text,
            media,
            mediaType,
            messageType: 'chat'
        });
        const saved = await newMsg.save();

        await Community.findByIdAndUpdate(req.params.id, {
            lastMessage: {
                text: text || (mediaType ? `📸 ${mediaType}` : '📸 Attachment'),
                senderName,
                timestamp: new Date()
            }
        });

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a community (admin only)
router.delete('/:id', async (req, res) => {
    const { userId } = req.query; // Get userId from query params
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        
        // Verify user exists and has the correct role for broadcast deletion
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if user is admin
        const isAdmin = community.admins.map(String).includes(String(userId)) || user.role === 'farmer';
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admins can delete this community' });
        }

        // For broadcast communities, additional role check
        if (community.type === 'broadcast' && user.role !== 'farmer') {
            return res.status(403).json({ message: 'Only farmers can delete broadcast communities' });
        }

        // Delete associated messages
        await Message.deleteMany({ community: req.params.id });
        
        // Delete the community
        await Community.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Community deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
