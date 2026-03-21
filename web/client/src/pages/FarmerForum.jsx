import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Users, TrendingUp, 
    MessageCircle, Hash, Search, ThumbsUp, 
    Send, X, PlusCircle 
} from 'lucide-react';

const FarmerForum = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
    const [filter, setFilter] = useState('All');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'Farmer';

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/forum/all');
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Forum fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/forum/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPost, userId, userName }),
            });
            if (res.ok) {
                setShowPostModal(false);
                setNewPost({ title: '', content: '', category: 'General' });
                fetchPosts();
            }
        } catch (err) {
            console.error('Failed to post:', err);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/forum/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) fetchPosts();
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    const categories = ['General', 'Crops', 'Pests', 'Market', 'Equipment'];

    return (
        <div className="forum-page">
            <header className="page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)', margin: 0 }}>Farmer Community</h1>
                </div>
                <button className="btn-primary" onClick={() => setShowPostModal(true)}>
                    <PlusCircle size={20} />
                    <span>Start Discussion</span>
                </button>
            </header>

            <AnimatePresence>
                {showPostModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" onClick={() => setShowPostModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="post-modal" onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{posts.length === 0 ? 'First Discussion' : 'Start a Discussion'}</h2>
                                <button onClick={() => setShowPostModal(false)} className="modal-close"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreatePost}>
                                <div className="form-group">
                                    <label>What's on your mind?</label>
                                    <input 
                                        type="text" required placeholder="Discussion title..." 
                                        value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})}>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Details</label>
                                    <textarea 
                                        required placeholder="Share your experience or ask a question..." 
                                        rows={6}
                                        value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})}
                                    ></textarea>
                                </div>
                                <button type="submit" className="submit-post-btn">
                                    <Send size={18} /> Post Discussion
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="forum-layout">
                <main className="forum-main">
                    <div className="forum-filters">
                        {['All', ...categories].map(c => (
                            <button 
                                key={c} onClick={() => setFilter(c)}
                                className={`f-pill ${filter === c ? 'active' : ''}`}
                            >
                                {c === 'All' ? 'Popular' : c}
                            </button>
                        ))}
                    </div>

                    <div className="posts-container">
                        {loading ? (
                            [1,2,3].map(i => <div key={i} className="shimmer-post" />)
                        ) : posts.length > 0 ? (
                            posts.filter(p => filter === 'All' || p.category === filter).map((post, index) => (
                                <motion.div 
                                    key={post._id}
                                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="forum-post-card"
                                >
                                    <div className="post-header">
                                        <div className="post-author-icon">
                                            {post.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="post-meta">
                                            <h3>{post.title}</h3>
                                            <p>Posted by <span className="author">Farmer {post.userName}</span> · {new Date(post.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`post-cat-tag ${post.category.toLowerCase()}`}>{post.category}</span>
                                    </div>
                                    <div className="post-content">
                                        <p>{post.content}</p>
                                    </div>
                                    <div className="post-footer">
                                        <button className={`post-action ${post.likes.includes(userId) ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
                                            <ThumbsUp size={16} fill={post.likes.includes(userId) ? 'currentColor' : 'none'} />
                                            <span>{post.likes.length || 0} Likes</span>
                                        </button>
                                        <button className="post-action">
                                            <MessageCircle size={16} />
                                            <span>{post.commentCount || 0} Comments</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="empty-forum">
                                <MessageCircle size={64} />
                                <h3>No discussions yet</h3>
                                <p>Be the leader and start the first discussion in our community.</p>
                            </div>
                        )}
                    </div>
                </main>

                <aside className="forum-sidebar">
                    <div className="side-card promo">
                        <TrendingUp size={32} />
                        <h4>Market Insights</h4>
                        <p>Weekly report on local crop demand and price trends.</p>
                        <button>Generate Report</button>
                    </div>
                    <div className="side-card">
                        <h3>Community Rules</h3>
                        <ul className="rules-list">
                            <li>Be respectful to others</li>
                            <li>Share verified advice only</li>
                            <li>No promotional spam</li>
                            <li>Keep it agriculture-focused</li>
                        </ul>
                    </div>
                </aside>
            </div>

            <style>{`
                .forum-page { display: flex; flex-direction: column; gap: 25px; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .forum-layout { display: grid; grid-template-columns: 1fr 320px; gap: 30px; }
                .forum-filters { display: flex; gap: 10px; margin-bottom: 24px; }
                .f-pill { padding: 10px 20px; border-radius: 20px; background: white; border: 1.5px solid #edf2f7; font-weight: 700; color: #718096; cursor: pointer; transition: all 0.3s; }
                .f-pill.active { background: #2d6a4f; color: white; border-color: #2d6a4f; box-shadow: 0 4px 12px rgba(45,106,79,0.3); }

                .posts-container { display: flex; flex-direction: column; gap: 16px; }
                .forum-post-card { background: white; border-radius: 24px; padding: 24px; border: 1px solid #edf2f7; transition: all 0.3s; }
                .forum-post-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                
                .post-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; position: relative; }
                .post-author-icon { width: 44px; height: 44px; border-radius: 12px; background: #d8f3dc; color: #2d6a4f; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
                .post-meta h3 { margin: 0; font-size: 1.2rem; color: #1a202c; }
                .post-meta p { margin: 4px 0 0; font-size: 0.85rem; color: #a0aec0; }
                .post-cat-tag { position: absolute; top: 0; right: 0; padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
                .post-cat-tag.general { background: #edf2f7; color: #4a5568; }
                .post-cat-tag.crops { background: #f0fff4; color: #2f855a; }
                .post-cat-tag.market { background: #ebf8ff; color: #2b6cb0; }

                .post-content { margin-bottom: 20px; color: #4a5568; line-height: 1.6; }
                .post-footer { display: flex; gap: 20px; padding-top: 16px; border-top: 1px solid #f7fafc; }
                .post-action { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #718096; font-size: 0.9rem; font-weight: 600; cursor: pointer; padding: 6px 12px; border-radius: 10px; transition: all 0.2s; }
                .post-action:hover { background: #f7fafc; color: #2d6a4f; }
                .post-action.liked { color: #2d6a4f; }

                .side-card { background: white; padding: 24px; border-radius: 24px; border: 1px solid #edf2f7; margin-bottom: 20px; }
                .side-card.promo { background: #1b4332; color: white; }
                .side-card h3 { font-size: 1.1rem; color: #1a202c; margin-top: 0; }
                .rules-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
                .rules-list li { font-size: 0.9rem; color: #4a5568; display: flex; align-items: center; gap: 10px; }
                .rules-list li::before { content: '✓'; color: #2d6a4f; font-weight: 900; }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
                .post-modal { background: white; border-radius: 32px; width: 600px; max-width: 95vw; padding: 40px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .modal-header h2 { margin: 0; font-size: 1.6rem; color: #1a202c; }
                .modal-close { background: #f7fafc; border: none; padding: 8px; border-radius: 50%; cursor: pointer; color: #718096; }
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 700; color: #2d3748; font-size: 0.9rem; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
                .form-group input:focus, .form-group textarea:focus { border-color: #2d6a4f; }
                .submit-post-btn { width: 100%; padding: 16px; background: #2d6a4f; color: white; border: none; border-radius: 14px; font-weight: 800; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; }
                .submit-post-btn:hover { background: #1b4332; transform: translateY(-2px); }

                .shimmer-post { height: 180px; background: white; border-radius: 24px; border: 1px solid #edf2f7; animation: pulseF 1.5s infinite; }
                @keyframes pulseF { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

                .empty-forum { text-align: center; padding: 60px 24px; color: #a0aec0; }
                .empty-forum h3 { color: #2d3748; margin-top: 20px; }
            `}</style>
        </div>
    );
};

export default FarmerForum;

