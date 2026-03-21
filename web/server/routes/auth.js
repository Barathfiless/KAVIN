const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, phone, password, role } = req.body;
        
        if (!name || !phone || !password) {
            return res.status(400).json({ message: 'Name, phone and password are required' });
        }

        let user = await User.findOne({ phone });
        if (user) return res.status(400).json({ message: 'Account already with this Phone no' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, phone, password: hashedPassword, role: role || 'farmer' });
        
        await user.save();
        console.log(`New user created: ${name} (${role || 'farmer'})`);
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        console.log(`Login attempt for phone: ${phone}`);
        
        if (!phone || !password) {
            return res.status(400).json({ message: 'Phone and password are required' });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            console.log(`User not found: ${phone}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Password mismatch for: ${phone}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // No expiry — token stays valid until user logs out and it's deleted
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'farmer_platform_secret_key_123'
        );
        
        console.log(`Login successful for ${user.name} (${user.role})`);
        res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Search for farmers by name or phone
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const users = await User.find({
            role: 'farmer',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Search failed' });
    }
});

// Follow / Unfollow user
router.post('/:id/follow', async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.body.currentUserId;
        
        if (!currentUserId) return res.status(400).json({ message: 'User ID required' });
        if (targetId === currentUserId) return res.status(400).json({ message: 'Cannot follow yourself' });

        const targetUser = await User.findById(targetId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(targetId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
        } else {
            // Follow
            currentUser.following.push(targetId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({ success: true, isFollowing: !isFollowing });
    } catch (err) {
        console.error('Follow error:', err);
        res.status(500).json({ message: 'Failed to update follow status' });
    }
});

module.exports = router;
