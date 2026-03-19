const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

// Add a favorite
router.post('/add', async (req, res) => {
    try {
        const favorite = new Favorite(req.body);
        const saved = await favorite.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove a favorite
router.delete('/:userId/:farmId', async (req, res) => {
    try {
        await Favorite.findOneAndDelete({ 
            userId: req.params.userId, 
            farmId: req.params.farmId 
        });
        res.json({ message: 'Removed from favorites' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get favorites for a user
router.get('/:userId', async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.params.userId });
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
