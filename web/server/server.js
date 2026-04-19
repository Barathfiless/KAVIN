const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const cropRoutes = require('./routes/crops');
const notificationRoutes = require('./routes/notifications');
const orderRoutes = require('./routes/orders');
const favoriteRoutes = require('./routes/favorites');
const reviewRoutes = require('./routes/reviews');
const forumRoutes = require('./routes/forums');
const aiRoutes = require('./routes/ai'); // Import AI routes
const energyRoutes = require('./routes/energy'); // Energy logic
const communityRoutes = require('./routes/communities'); // Community Chat

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/ai', aiRoutes); // Mount AI routes
app.use('/api/energy', energyRoutes); // Mount Energy Planner routes
app.use('/api/communities', communityRoutes); // Mount Community routes

app.get('/', (req, res) => {
    res.send('Farmer Platform API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
