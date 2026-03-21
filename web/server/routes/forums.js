const express = require('express');
const router = express.Router();
const { Post, Comment } = require('../models/Post');
const User = require('../models/User');

// Get all posts (Explore)
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get personalized feed (Following)
router.get('/feed/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Only include posts from people they actually follow
        const userIds = Array.isArray(user.following) ? user.following : [];
        
        const posts = await Post.find({ userId: { $in: userIds } }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a post
router.post('/add', async (req, res) => {
    try {
        const post = new Post(req.body);
        const saved = await post.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Like/Unlike a post
router.post('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.body.userId;
        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
        } else {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        }
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Share a post
router.post('/:id/share', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: 1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment
router.post('/:id/comment', async (req, res) => {
    try {
        const comment = new Comment({ ...req.body, postId: req.params.id });
        const saved = await comment.save();
        // Update comment count on post
        await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        // Ensure the user requesting deletion is the author
        const userId = req.body.userId || req.query.userId;
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
