import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/reviews/all');
                const data = await response.json();
                setReviews(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="reviews-page" style={{ padding: '24px' }}>
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '32px' }}
            >
                <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>Community Reviews</h1>
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>Real feedback from local shoppers connecting with real farmers.</p>
            </motion.div>

            <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {loading ? (
                    [1,2,3].map(i => <div key={i} style={{ height: '140px', background: 'white', borderRadius: '24px', border: '1px solid #edf2f7' }} className="shimmer-review" />)
                ) : reviews.length > 0 ? reviews.map((review, index) => (
                    <motion.div 
                        key={review._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '24px', borderRadius: '24px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary)', border: '1px solid #d8f3dc' }}>
                                    {getInitials(review.customerName)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1a202c' }}>{review.customerName}</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#a0aec0' }}>Posted {new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < review.rating ? '#ffb703' : 'none'} color={i < review.rating ? '#ffb703' : '#cbd5e0'} />
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568', lineHeight: 1.6 }}>"{review.comment}"</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#718096', cursor: 'pointer' }}>
                                    <ThumbsUp size={16} /> {review.likes || 0} Helpful
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#718096', cursor: 'pointer' }}>
                                    <MessageSquare size={16} /> Reply
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                                {review.verifiedPurchase ? '✅ Verified Purchase' : ''}
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '32px', border: '1px solid #edf2f7' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>⭐</div>
                        <h2 style={{ color: '#1a202c' }}>No Reviews Yet</h2>
                        <p style={{ color: '#718096', maxWidth: '350px', margin: '0 auto' }}>Help our community grow! Be the first to share your experience with local harvest.</p>
                    </div>
                )}
            </div>
            <style>{`
                .shimmer-review { animation: pulseRev 1.5s infinite; }
                @keyframes pulseRev { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            `}</style>
        </div>
    );
};

export default Reviews;

