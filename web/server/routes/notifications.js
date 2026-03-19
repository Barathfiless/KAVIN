const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET notifications for a user filtered by portal
router.get('/:userId', async (req, res) => {
    try {
        const { portal } = req.query; // ?portal=farmer or ?portal=customer
        const query = { userId: req.params.userId };
        if (portal) query.portal = portal;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(notifications);
    } catch (err) {
        console.error('Fetch notifications error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST create a new notification
router.post('/', async (req, res) => {
    try {
        const { userId, portal, title, message, type } = req.body;
        if (!userId || !portal || !title || !message) {
            return res.status(400).json({ message: 'userId, portal, title, and message are required' });
        }
        const notif = new Notification({ userId, portal, title, message, type: type || 'info' });
        await notif.save();
        res.status(201).json(notif);
    } catch (err) {
        console.error('Create notification error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PATCH mark single notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notif = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        res.json(notif);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH mark ALL as read for a user + portal
router.patch('/read-all/:userId', async (req, res) => {
    try {
        const { portal } = req.query;
        const query = { userId: req.params.userId, read: false };
        if (portal) query.portal = portal;

        await Notification.updateMany(query, { read: true });
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE a single notification
router.delete('/:id', async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
