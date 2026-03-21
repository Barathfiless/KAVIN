import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, MessageCircle, Send, Share2, PlusSquare, 
    Search, MapPin, Tag, Leaf, IndianRupee, Image as ImageIcon,
    X, UserPlus, UserCheck, MoreHorizontal, Sprout, Trash2
} from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

const FarmerForum = () => {
    const location = useLocation();
    const portalMode = location.pathname.startsWith('/customer') ? 'customer' : 'farmer';

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(portalMode === 'customer' ? 'Following' : 'Explore'); // Customers start in Following mode
    
    // Post creation state
    const [showPostModal, setShowPostModal] = useState(false);
    const [newPost, setNewPost] = useState({ 
        title: '', content: '', image: '', cropName: '', cropType: '', soilType: '', location: '', price: '' 
    });

    // Search and follow state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [currentUserInfo, setCurrentUserInfo] = useState(null);
    const [hoveredUser, setHoveredUser] = useState(null); 
    const [hoveredData, setHoveredData] = useState(null);
    const hoverTimeoutRef = useRef(null);

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || (portalMode === 'customer' ? 'Customer' : 'Farmer');

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [viewMode]);

    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`);
            const data = await res.json();
            setCurrentUserInfo(data);
        } catch (err) {
            console.error('Failed to fetch user:', err);
        }
    };

    const handleHoverStart = async (targetId) => {
        setHoveredUser(targetId);
        try {
            const res = await fetch(`http://localhost:5000/api/auth/user/${targetId}`);
            const data = await res.json();
            setHoveredData(data);
        } catch (err) {
            console.error("Failed to fetch hover user", err);
        }
    };

    const handleHoverEnd = () => {
        setHoveredUser(null);
        setHoveredData(null);
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const endpoint = viewMode === 'Following' 
                ? `http://localhost:5000/api/forum/feed/${userId}` 
                : 'http://localhost:5000/api/forum/all';
            const res = await fetch(endpoint);
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Forum fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPost({ ...newPost, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        if (!newPost.content.trim()) {
            alert('Please fill out the description for your post.');
            return;
        }

        try {
            // Ensure title is present as it is required by the schema
            const postToSave = { 
                ...newPost, 
                userId, 
                userName, 
                category: 'General',
                title: newPost.title || newPost.cropName || 'New Produce Listing'
            };

            const res = await fetch('http://localhost:5000/api/forum/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postToSave),
            });
            if (res.ok) {
                setShowPostModal(false);
                setNewPost({ title: '', content: '', image: '', cropName: '', cropType: '', soilType: '', location: '', price: '' });
                fetchPosts();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message}`);
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
        } catch (err) { }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/forum/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                fetchPosts();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete post');
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`http://localhost:5000/api/auth/search?q=${searchQuery}`);
            const data = await res.json();
            setSearchResults(data.filter(u => u._id !== userId)); // exclude self
        } catch (err) { }
        setSearching(false);
    };

    const handleFollow = async (targetId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/auth/${targetId}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentUserId: userId }),
            });
            if (res.ok) {
                await fetchUserInfo(); // refresh following list
                if (viewMode === 'Following') fetchPosts(); // refresh feed if in following mode
            }
        } catch (err) { }
    };

    const isFollowing = (targetId) => {
        return currentUserInfo?.following?.includes(targetId);
    };

    const formatPrice = (p) => p ? `₹${p}` : 'Not Specified';

    return (
        <div className="social-forum-page">
            <AnimatePresence>
                {showPostModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" onClick={() => setShowPostModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            className="create-post-modal" onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Create New Post</h2>
                                <button onClick={() => setShowPostModal(false)} className="modal-close"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreatePost} className="post-form-layout">
                                <div className="image-upload-section">
                                    {newPost.image ? (
                                        <div className="image-preview" style={{ backgroundImage: `url(${newPost.image})` }}>
                                            <button type="button" onClick={() => setNewPost({...newPost, image: ''})} className="remove-img-btn"><X size={16}/></button>
                                        </div>
                                    ) : (
                                        <label className="upload-placeholder">
                                            <ImageIcon size={48} color="#a0aec0" />
                                            <span>Upload Crop Image</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                        </label>
                                    )}
                                </div>
                                <div className="post-details-section">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                                    <div style={{ position: 'relative' }}>
                                        <textarea 
                                            placeholder="Write a description for your produce... What's the story behind it?" 
                                            rows={15} 
                                            className="desc-input"
                                            style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '15px', fontSize: '1.05rem', marginBottom: '25px', width: '100%', boxSizing: 'border-box', minHeight: '300px' }}
                                            value={newPost.content} 
                                            onChange={e => setNewPost({...newPost, content: e.target.value})}
                                        ></textarea>
                                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                            <VoiceInput onResult={(val) => setNewPost(prev => ({ ...prev, content: prev.content + ' ' + val }))} placeholder="Speak description..." />
                                        </div>
                                    </div>
                                    
                                    <div className="input-grid">
                                        <div className="input-group">
                                            <Tag size={16} />
                                            <input type="text" placeholder="Crop Name (e.g. Tomatoes)" required
                                                value={newPost.cropName} onChange={e => setNewPost({...newPost, cropName: e.target.value})} />
                                            <VoiceInput onResult={(val) => setNewPost({...newPost, cropName: val})} />
                                        </div>
                                        <div className="input-group">
                                            <Sprout size={16} />
                                            <input type="text" placeholder="Crop/Variety Type" 
                                                value={newPost.cropType} onChange={e => setNewPost({...newPost, cropType: e.target.value})} />
                                            <VoiceInput onResult={(val) => setNewPost({...newPost, cropType: val})} />
                                        </div>
                                        <div className="input-grid">
                                            <div className="input-group">
                                                <Leaf size={16} />
                                                <input type="text" placeholder="Soil Type (e.g. Red, Loam)" 
                                                    value={newPost.soilType} onChange={e => setNewPost({...newPost, soilType: e.target.value})} />
                                                <VoiceInput onResult={(val) => setNewPost({...newPost, soilType: val})} />
                                            </div>
                                            <div className="input-group">
                                                <MapPin size={16} />
                                                <input type="text" placeholder="Location" required
                                                    value={newPost.location} onChange={e => setNewPost({...newPost, location: e.target.value})} />
                                                <VoiceInput onResult={(val) => setNewPost({...newPost, location: val})} />
                                            </div>
                                            <div className="input-group">
                                                <IndianRupee size={16} />
                                                <input type="text" placeholder="Price (e.g. 50/kg)" 
                                                    value={newPost.price} onChange={e => setNewPost({...newPost, price: e.target.value})} />
                                                <VoiceInput onResult={(val) => setNewPost({...newPost, price: val})} />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="publish-btn">Share Post</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="social-layout">
                {/* Main Feed Column */}
                <main className="feed-column">
                    <div className="feed-tabs">
                        <button className={viewMode === 'Explore' ? 'active' : ''} onClick={() => setViewMode('Explore')}>Explore</button>
                        <button className={viewMode === 'Following' ? 'active' : ''} onClick={() => setViewMode('Following')}>Following</button>
                    </div>

                    <div className="feed-posts">
                        {loading ? (
                            <div className="loading-feed">Loading posts...</div>
                        ) : posts.length > 0 ? (
                            posts.map((post, index) => {
                                const isLiked = post.likes?.includes(userId);
                                return (
                                    <motion.div 
                                        key={post._id}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.1, 0.5) }}
                                        className="social-post-card"
                                    >
                                        <div className="sp-header">
                                            <div className="sp-user-info" style={{ position: 'relative' }}>
                                                <div className="sp-avatar">{post.userName.charAt(0).toUpperCase()}</div>
                                                <div className="sp-meta">
                                                    <span 
                                                        className="sp-username" 
                                                        style={{ cursor: 'pointer' }}
                                                        onMouseEnter={() => handleHoverStart(post.userId)}
                                                        onMouseLeave={handleHoverEnd}
                                                    >
                                                        {post.userName}
                                                    </span>
                                                    <span className="sp-time">{new Date(post.createdAt).toLocaleDateString()} {post.location && `· ${post.location}`}</span>
                                                </div>

                                                <AnimatePresence>
                                                    {hoveredUser === post.userId && hoveredData && (
                                                        <motion.div 
                                                            className="farmer-hover-card"
                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            onMouseEnter={() => setHoveredUser(post.userId)}
                                                            onMouseLeave={handleHoverEnd}
                                                        >
                                                            <div className="hc-header">
                                                                <div className="sp-avatar my-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>{hoveredData.name.charAt(0).toUpperCase()}</div>
                                                                <div className="hc-top-info">
                                                                    <div className="hc-name">{hoveredData.name}</div>
                                                                    <div className="hc-phone" style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {hoveredData.phone}</div>
                                                                </div>
                                                            </div>
                                                            <div className="hc-stats">
                                                                <div className="hc-stat">
                                                                    <strong>{hoveredData.followers?.length || 0}</strong>
                                                                    <span>Followers</span>
                                                                </div>
                                                                <div className="hc-stat">
                                                                    <strong>{hoveredData.following?.length || 0}</strong>
                                                                    <span>Following</span>
                                                                </div>
                                                            </div>
                                                            {hoveredData._id !== userId && (
                                                                <button 
                                                                    className={`hc-follow-btn ${isFollowing(hoveredData._id) ? 'following' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleFollow(hoveredData._id);
                                                                        // Update local hovered data to show immediate change
                                                                        setHoveredData(prev => ({
                                                                            ...prev,
                                                                            followers: isFollowing(hoveredData._id) 
                                                                                ? prev.followers.filter(id => id !== userId)
                                                                                : [...(prev.followers || []), userId]
                                                                        }));
                                                                    }}
                                                                >
                                                                    {isFollowing(hoveredData._id) ? 'Unfollow' : 'Follow Farmer'}
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            {portalMode === 'farmer' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {post.userId === userId && (
                                                        <button className="sp-options" style={{ color: '#e53e3e' }} onClick={() => handleDeletePost(post._id)} title="Delete Post">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                    <button className="sp-options"><MoreHorizontal size={20} /></button>
                                                </div>
                                            )}
                                        </div>

                                        {post.image && (
                                            <div className="sp-image-container">
                                                <img src={post.image} alt="Crop" className="sp-image" />
                                            </div>
                                        )}

                                        <div className="sp-actions">
                                            <div className="action-buttons-left">
                                                <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
                                                    <Heart size={24} fill={isLiked ? '#e63946' : 'none'} color={isLiked ? '#e63946' : '#1a202c'} />
                                                </button>
                                                <button className="action-btn"><MessageCircle size={24} color="#1a202c" /></button>
                                                <button className="action-btn"><Send size={24} color="#1a202c" /></button>
                                            </div>
                                        </div>

                                        <div className="sp-likes-count">
                                            {post.likes?.length || 0} likes
                                        </div>

                                        <div className="sp-content">
                                            <span className="sp-caption-username">{post.userName}</span>
                                            <span className="sp-caption">{post.content}</span>
                                        </div>

                                        {(post.cropName || post.price) && (
                                            <div className="sp-tags-row">
                                                {post.cropName && <span className="p-tag"><Tag size={14}/> {post.cropName}</span>}
                                                {post.cropType && <span className="p-tag"><Sprout size={14}/> {post.cropType}</span>}
                                                {post.soilType && <span className="p-tag"><Leaf size={14}/> {post.soilType}</span>}
                                                {post.price && <span className="p-tag p-price"><IndianRupee size={14}/> {post.price}</span>}
                                            </div>
                                        )}

                                        <div className="sp-add-comment">
                                            <input type="text" placeholder="Add a comment..." />
                                            <button>Post</button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="empty-feed">
                                <ImageIcon size={48} color="#cbd5e0" />
                                <h3>No posts yet.</h3>
                                <p>Be the first to share your farm's journey.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Sidebar - Discovery */}
                <aside className="discovery-sidebar">
                    {portalMode === 'farmer' && (
                        <button className="create-post-btn-sidebar" onClick={() => setShowPostModal(true)}>
                            <PlusSquare size={20} />
                            <span>Create New Post</span>
                        </button>
                    )}

                    <div className="dev-profile-summary">
                        <div className="sp-avatar my-avatar">{userName.charAt(0).toUpperCase()}</div>
                        <div className="sp-meta">
                            <span className="sp-username">{userName}</span>
                            <span className="sp-name">{portalMode === 'farmer' ? 'Farmer' : 'Customer'}</span>
                        </div>
                        <div className="follower-stats">
                            <div className="stat"><span>{currentUserInfo?.following?.length || 0}</span> Following</div>
                            {portalMode === 'farmer' && <div className="stat"><span>{currentUserInfo?.followers?.length || 0}</span> Followers</div>}
                        </div>
                    </div>

                    <div className="search-users-box">
                        <div className="sidebar-header-title">Discover Farmers</div>
                        <form onSubmit={handleSearch} className="search-form">
                            <input 
                                type="text" 
                                placeholder="Search Name or Phone..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <button type="submit"><Search size={16} /></button>
                        </form>
                        
                        <div className="search-results">
                            {searching && <p className="smsg">Searching...</p>}
                            {!searching && searchResults.length === 0 && searchQuery && <p className="smsg">No farmers found.</p>}
                            
                            {searchResults.map(user => {
                                const following = isFollowing(user._id);
                                return (
                                    <div key={user._id} className="user-result-item">
                                        <div className="sp-user-info" style={{ gap: '10px' }}>
                                            <div className="sp-avatar sm">{user.name.charAt(0).toUpperCase()}</div>
                                            <div className="sp-meta">
                                                <span className="sp-username" style={{ fontSize: '0.85rem' }}>{user.name}</span>
                                            </div>
                                        </div>
                                        <button 
                                            className={`follow-sm-btn ${following ? 'following' : ''}`}
                                            onClick={() => handleFollow(user._id)}
                                        >
                                            {following ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .social-forum-page { display: flex; justify-content: center; padding: 10px 0 40px; }
                .social-layout { display: flex; gap: 40px; width: 100%; max-width: 900px; padding: 0 15px; }
                
                .feed-column { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 15px; }

                @media (max-width: 768px) {
                    .social-layout { flex-direction: column; gap: 20px; padding: 0 10px; }
                    .discovery-sidebar { width: 100% !important; position: static !important; order: -1; } /* Profile/Follow above on mobile */
                    .feed-column { width: 100%; }
                    .social-post-card { border-radius: 0; border-left: none; border-right: none; }
                }
                
                .feed-tabs { display: flex; border-bottom: 1px solid #edf2f7; margin-bottom: 10px; }
                .feed-tabs button { flex: 1; background: none; border: none; padding: 12px; font-weight: 700; color: #a0aec0; cursor: pointer; font-size: 0.95rem; border-bottom: 2px solid transparent; transition: all 0.2s; }
                .feed-tabs button.active { color: #1a202c; border-bottom-color: #2d6a4f; }

                .feed-posts { display: flex; flex-direction: column; gap: 20px; }
                .social-post-card { background: white; border: 1px solid #edf2f7; borderRadius: 4px; padding-bottom: 15px; border-radius: 8px; }
                .sp-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; }
                .sp-user-info { display: flex; align-items: center; gap: 12px; }
                .sp-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #FF9933, #fb8500); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; }
                .sp-avatar.sm { width: 32px; height: 32px; font-size: 0.85rem; }
                .sp-avatar.my-avatar { width: 50px; height: 50px; font-size: 1.4rem; background: #2d6a4f; }
                .sp-meta { display: flex; flex-direction: column; }
                .sp-username { font-weight: 700; color: #1a202c; font-size: 0.9rem; }
                .sp-time { font-size: 0.75rem; color: #a0aec0; }
                .sp-options { background: none; border: none; cursor: pointer; color: #4a5568; }

                .farmer-hover-card {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 240px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
                    padding: 16px;
                    z-index: 100;
                    margin-top: 10px;
                }
                .hc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
                .hc-name { font-weight: 800; color: #1e293b; font-size: 1rem; }
                .hc-stats { display: flex; gap: 15px; margin-bottom: 15px; padding: 10px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
                .hc-stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
                .hc-stat strong { font-size: 0.95rem; color: #1e293b; }
                .hc-stat span { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }
                .hc-follow-btn { width: 100%; padding: 8px; border-radius: 8px; border: none; background: #2d6a4f; color: white; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .hc-follow-btn:hover { background: #1b4332; }
                .hc-follow-btn.following { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

                .sp-image-container { width: 100%; max-height: 500px; background: #f7fafc; display: flex; align-items: center; justify-content: center; border-top: 1px solid #edf2f7; border-bottom: 1px solid #edf2f7; overflow: hidden; }
                .sp-image { width: 100%; height: auto; max-height: 500px; object-fit: cover; }

                .sp-actions { display: flex; padding: 10px 15px 5px; }
                .action-buttons-left { display: flex; gap: 16px; }
                .action-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; transition: transform 0.1s; }
                .action-btn:hover { transform: scale(1.1); }
                .action-btn.liked { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }

                .sp-likes-count { padding: 0 15px; font-weight: 700; font-size: 0.9rem; color: #1a202c; margin-bottom: 6px; }
                
                .sp-content { padding: 0 15px; margin-bottom: 10px; font-size: 0.9rem; color: #2d3748; line-height: 1.4; }
                .sp-caption-username { font-weight: 700; margin-right: 6px; }

                .sp-tags-row { padding: 0 15px; display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
                .p-tag { background: #f0fff4; color: #2f855a; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 4px; }
                .p-tag.p-price { background: #fffaf0; color: #dd6b20; border: 1px solid #feebc8; }

                .sp-add-comment { display: flex; padding: 10px 15px 0; border-top: 1px solid #edf2f7; gap: 10px; }
                .sp-add-comment input { flex: 1; border: none; outline: none; font-size: 0.9rem; }
                .sp-add-comment button { background: none; border: none; color: #3182ce; font-weight: 700; cursor: pointer; font-size: 0.9rem; }

                /* Sidebar */
                .discovery-sidebar { width: 320px; position: sticky; top: 20px; display: flex; flex-direction: column; gap: 20px; }
                
                .create-post-btn-sidebar { width: 100%; background: #2d6a4f; color: white; border: none; padding: 14px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(45,106,79,0.2); font-size: 1rem; }
                .create-post-btn-sidebar:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(45,106,79,0.3); background: #1b4332; }

                .dev-profile-summary { display: flex; flex-direction: column; align-items: center; background: white; padding: 25px 20px; border-radius: 16px; border: 1px solid #edf2f7; text-align: center; }
                .dev-profile-summary .sp-meta { margin-top: 12px; margin-bottom: 15px; }
                .dev-profile-summary .sp-username { font-size: 1.1rem; }
                .sp-name { color: #718096; font-size: 0.85rem; }
                .follower-stats { display: flex; gap: 24px; width: 100%; justify-content: center; padding-top: 15px; border-top: 1px solid #edf2f7; }
                .stat { display: flex; flex-direction: column; font-size: 0.75rem; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
                .stat span { font-size: 1.2rem; color: #1a202c; font-weight: 800; }

                .search-users-box { background: white; padding: 20px; border-radius: 16px; border: 1px solid #edf2f7; }
                .sidebar-header-title { font-weight: 700; color: #a0aec0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 15px; }
                .search-form { display: flex; background: #f7fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 15px; }
                .search-form input { flex: 1; border: none; background: transparent; padding: 10px 12px; outline: none; font-size: 0.85rem; }
                .search-form button { background: transparent; border: none; padding: 0 12px; cursor: pointer; color: #718096; }
                
                .search-results { display: flex; flex-direction: column; gap: 12px; max-height: 300px; overflow-y: auto; }
                .smsg { font-size: 0.85rem; color: #a0aec0; text-align: center; margin: 10px 0; }
                .user-result-item { display: flex; justify-content: space-between; align-items: center; }
                .follow-sm-btn { background: #3182ce; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: background 0.2s; }
                .follow-sm-btn:hover { background: #2b6cb0; }
                .follow-sm-btn.following { background: #edf2f7; color: #1a202c; }

                /* Create Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
                .create-post-modal { background: white; border-radius: 20px; width: 850px; max-width: 95vw; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; border-bottom: 1px solid #edf2f7; }
                .modal-header h2 { margin: 0; font-size: 1.25rem; }
                .modal-close { background: none; border: none; cursor: pointer; color: #4a5568; }
                
                .post-form-layout { display: flex; height: 500px; }
                .image-upload-section { flex: 1.2; background: #f8fafc; border-right: 1px solid #edf2f7; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
                .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; color: #4a5568; font-weight: 600; }
                .image-preview { width: 100%; height: 100%; background-size: cover; background-position: center; position: relative; }
                .remove-img-btn { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }

                .post-details-section { flex: 1; padding: 20px; display: flex; flex-direction: column; overflow-y: auto; }
                .desc-input { width: 100%; border: none; border-bottom: 1px solid #e2e8f0; resize: none; outline: none; font-family: inherit; font-size: 0.95rem; margin-bottom: 20px; box-sizing: border-box; }
                .desc-input:focus { border-color: #3182ce; }
                
                .input-grid { display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px; }
                .input-group { display: flex; align-items: center; gap: 10px; background: #f7fafc; padding: 10px 15px; border-radius: 12px; color: #4a5568; }
                .input-group input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.9rem; color: #1a202c; font-family: inherit; }
                
                .publish-btn { margin-top: auto; width: 100%; padding: 16px; background: #3182ce; color: white; border: none; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
                .publish-btn:hover { background: #2b6cb0; }
            `}</style>
        </div>
    );
};

export default FarmerForum;
