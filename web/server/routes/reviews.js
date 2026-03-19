const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Post a review
router.post('/add', async (req, res) => {
    try {
        const review = new Review(req.body);
        const saved = await review.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get reviews for a farmer
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const reviews = await Review.find({ farmerId: req.params.farmerId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all reviews for discovery/global feed
router.get('/all', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
