import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Calendar, MapPin, Truck, CheckCircle, Package, Star, X, Send } from 'lucide-react';

const statusConfig = {
    'Delivered': { color: '#2f855a', bg: '#f0fff4', icon: <CheckCircle size={14} /> },
    'Shipped':   { color: '#2b6cb0', bg: '#ebf8ff', icon: <Truck size={14} /> },
    'Confirmed': { color: '#2c7a7b', bg: '#e6fffa', icon: <Package size={14} /> },
    'Pending':   { color: '#dd6b20', bg: '#fffaf0', icon: <ShoppingBag size={14} /> },
    'Cancelled': { color: '#c53030', bg: '#fff5f5', icon: null },
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'Customer';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/customer/${userId}`);
                const data = await response.json();
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching customer orders:', err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchOrders();
    }, [userId]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/reviews/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: reviewOrder._id,
                    customerId: userId,
                    customerName: userName,
                    farmerId: reviewOrder.farmerId,
                    cropId: reviewOrder.cropId,
                    rating,
                    comment,
                    verifiedPurchase: true
                })
            });
            if (res.ok) {
                setReviewOrder(null);
                setRating(5);
                setComment('');
                alert('Review submitted successfully!');
            }
        } catch (err) {
            console.error('Review failed:', err);
        }
    };

    return (
        <div className="orders-page" style={{ padding: '24px' }}>
            <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', marginBottom: '24px' }}
            >
                My Orders
            </motion.h1>

            <AnimatePresence>
                {reviewOrder && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" onClick={() => setReviewOrder(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="review-modal" onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Review {reviewOrder.cropName}</h2>
                                <button onClick={() => setReviewOrder(null)} className="modal-close"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleReviewSubmit}>
                                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                    <p style={{ color: '#718096', marginBottom: '12px' }}>How was your purchase?</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        {[1,2,3,4,5].map(star => (
                                            <button 
                                                key={star} type="button" 
                                                onClick={() => setRating(star)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <Star size={32} fill={star <= rating ? '#ffb703' : 'none'} color={star <= rating ? '#ffb703' : '#cbd5e0'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Your Feedback</label>
                                    <textarea 
                                        required placeholder="Share your experience with this harvest..." 
                                        rows={5} value={comment} onChange={e => setComment(e.target.value)}
                                    ></textarea>
                                </div>
                                <button type="submit" className="submit-review-btn">
                                    <Send size={18} /> Submit Review
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                    <div className="loading-shimmer-list">
                        {[1,2,3].map(i => <div key={i} className="shimmer-order" />)}
                    </div>
                ) : orders.length > 0 ? orders.map((order, index) => {
                    const cfg = statusConfig[order.status] || statusConfig['Pending'];
                    return (
                        <motion.div 
                            key={order._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card"
                            style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a202c' }}>{order.cropName}</h3>
                                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#718096' }}>from <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Local Producer</span></p>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#a0aec0' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={12} /> #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>
                                    {order.status === 'Delivered' && (
                                        <button 
                                            onClick={() => setReviewOrder(order)}
                                            style={{ marginTop: '12px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                                        >
                                            Rate & Review
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{order.pricePerUnit || 'Market'}</div>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700, 
                                    padding: '4px 12px', 
                                    borderRadius: '20px',
                                    background: cfg.bg,
                                    color: cfg.color,
                                    marginTop: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {cfg.icon} {order.status}
                                </span>
                            </div>
                        </motion.div>
                    );
                }) : (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '1px solid #edf2f7' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><ShoppingBag size={64} color="var(--primary)" /></div>
                        <h2 style={{ color: '#1a202c' }}>No orders yet</h2>
                        <p style={{ color: '#718096', maxWidth: '300px', margin: '0 auto 24px' }}>Your purchase history will appear here once you place your first order.</p>
                        <button className="btn-primary" onClick={() => window.location.hash = '/dashboard'}>Explore Marketplace</button>
                    </div>
                )}
            </div>

            <style>{`
                .loading-shimmer-list { display: flex; flex-direction: column; gap: 16px; }
                .shimmer-order { height: 100px; background: #f8fbf9; border-radius: 16px; border: 1px solid #edf2f7; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
                .review-modal { background: white; border-radius: 32px; width: 500px; max-width: 95vw; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .modal-header h2 { margin: 0; font-size: 1.4rem; color: #1a202c; }
                .modal-close { background: #f7fafc; border: none; padding: 8px; border-radius: 50%; cursor: pointer; color: #718096; }
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 700; color: #2d3748; font-size: 0.9rem; }
                .form-group textarea { width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
                .form-group textarea:focus { border-color: var(--primary); }
                .submit-review-btn { width: 100%; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 14px; font-weight: 800; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; }
                .submit-review-btn:hover { background: var(--primary-dark); transform: translateY(-2px); }
            `}</style>
        </div>
    );
};

export default MyOrders;

