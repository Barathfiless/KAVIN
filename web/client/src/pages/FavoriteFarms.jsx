import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Phone, Sprout, ChevronRight } from 'lucide-react';

const FavoriteFarms = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/favorites/${userId}`);
                const data = await response.json();
                setFavorites(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching favorites:', err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchFavorites();
    }, [userId]);

    return (
        <div style={{ padding: '24px' }}>
            <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: '1.8rem', color: '#1b4332', marginBottom: '24px' }}
            >
                Favorite Farms
            </motion.h1>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {[1,2,3].map(i => <div key={i} style={{ height: '300px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #edf2f7' }} className="shimmer" />)}
                </div>
            ) : favorites.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {favorites.map((fav, index) => (
                        <motion.div 
                            key={fav._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card"
                            style={{ borderRadius: '20px', overflow: 'hidden', background: 'white', border: '1px solid #edf2f7' }}
                        >
                            <div style={{ height: '140px', background: 'linear-gradient(135deg, #d8f3dc, #b7e4c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sprout size={48} color="#2d6a4f" />
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, color: '#1a202c' }}>{fav.farmName}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#744210' }}>
                                        <Star size={14} fill="#f6e05e" color="#f6e05e" /> {fav.farmRating || 4.5}
                                    </div>
                                </div>
                                <p style={{ color: '#718096', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', margin: '8px 0' }}>
                                    <MapPin size={14} /> {fav.farmLocation || 'Local Area'}
                                </p>
                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <button className="btn-primary" style={{ flex: 1, padding: '10px' }}>Visit Farm</button>
                                    <button style={{ padding: '10px', borderRadius: '8px', border: '1px solid #edf2f7', background: '#fff5f5', color: '#e53e3e' }}>
                                        <Heart size={20} fill="#e53e3e" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', border: '1px solid #edf2f7' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><Heart size={64} fill="#e53e3e" color="#e53e3e" /></div>
                    <h2 style={{ color: '#1a202c' }}>Your Heart List is Empty</h2>
                    <p style={{ color: '#718096', maxWidth: '350px', margin: '0 auto 30px', lineHeight: 1.6 }}>Discover amazing local farms on the map and heart them to see them here for quick access later.</p>
                    <button className="btn-primary" onClick={() => window.location.hash = '/dashboard'}>Discover Farms</button>
                </div>
            )}
            <style>{`
                .shimmer { animation: pulseFav 1.5s infinite; }
                @keyframes pulseFav { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            `}</style>
        </div>
    );
};

export default FavoriteFarms;

