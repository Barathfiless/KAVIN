const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Place a new order (Customer)
router.post('/place', async (req, res) => {
    try {
        const order = new Order(req.body);
        const saved = await order.save();

        // Create a notification for the farmer
        await new Notification({
            userId: req.body.farmerId,
            portal: 'farmer',
            title: 'New Order Received!',
            message: `${req.body.customerName} ordered ${req.body.quantity} unit(s) of ${req.body.cropName}.`,
            type: 'success'
        }).save();

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all orders for a customer
router.get('/customer/:customerId', async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.customerId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all orders for a farmer
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const orders = await Order.find({ farmerId: req.params.farmerId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update order status (Farmer)
router.put('/:id/status', async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Order not found' });

        // Notify the customer about the status change
        await new Notification({
            userId: updated.customerId,
            portal: 'customer',
            title: 'Order Status Updated',
            message: `Your order for ${updated.cropName} is now ${req.body.status}.`,
            type: 'info'
        }).save();

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
