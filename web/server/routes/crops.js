const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// Get all ready crops for customers
router.get('/ready', async (req, res) => {
    try {
        const crops = await Crop.find({ status: 'Ready' });
        res.json(crops);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all crops for a user (dummy user ID for now or could use middleware)
router.get('/:userId', async (req, res) => {
    try {
        const crops = await Crop.find({ userId: req.params.userId });
        res.json(crops);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new crop
router.post('/add', async (req, res) => {
    const crop = new Crop({
        userId: req.body.userId,
        name: req.body.name,
        variety: req.body.variety,
        quantity: req.body.quantity,
        price: req.body.price,
        status: req.body.status,
        icon: req.body.icon
    });

    try {
        const newCrop = await crop.save();
        res.status(201).json(newCrop);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a crop
router.put('/:id', async (req, res) => {
    try {
        const updatedCrop = await Crop.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedCrop) return res.status(404).json({ message: 'Crop not found' });
        res.json(updatedCrop);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a crop
router.delete('/:id', async (req, res) => {
    try {
        const deletedCrop = await Crop.findByIdAndDelete(req.params.id);
        if (!deletedCrop) return res.status(404).json({ message: 'Crop not found' });
        res.json({ message: 'Crop deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
