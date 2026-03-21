import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Tag, ShoppingBag, Clock, TrendingUp, 
    Filter, Search, CheckCircle, Package, AlertTriangle
} from 'lucide-react';

const statusConfig = {
    'Ready':        { color: '#2f855a', bg: '#f0fff4' },
    'Growing':      { color: '#d69e2e', bg: '#fffff0' },
    'Pending':      { color: '#718096', bg: '#f7fafc' },
    'Out of Stock': { color: '#c53030', bg: '#fff5f5' },
};

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cropRes, orderRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/crops/${userId}`),
                    fetch(`http://localhost:5000/api/orders/farmer/${userId}`)
                ]);
                const crops = await cropRes.json();
                const ordersData = await orderRes.json();
                setListings(Array.isArray(crops) ? crops : []);
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            } catch (err) {
                console.error('Error fetching listings:', err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchData();
    }, [userId]);

    const handleStatusChange = async (cropId, newStatus) => {
        setUpdatingId(cropId);
        try {
            const res = await fetch(`http://localhost:5000/api/crops/${cropId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setListings(prev => prev.map(c => c._id === cropId ? { ...c, status: newStatus } : c));
            }
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const getOrderCount = (cropId) => orders.filter(o => o.cropId === cropId).length;

    const filtered = listings.filter(l =>
        l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.variety?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = listings.filter(l => l.status === 'Ready').length;

    return (
        <div className="listings-page">
            <header className="page-header">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search your listings..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="header-stats">
                    <div className="h-stat">
                        <span className="h-label">Active</span>
                        <span className="h-value">{activeCount}</span>
                    </div>
                    <div className="h-stat">
                        <span className="h-label">Total Orders</span>
                        <span className="h-value">{orders.length}</span>
                    </div>
                    <div className="h-stat">
                        <span className="h-label">Listings</span>
                        <span className="h-value">{listings.length}</span>
                    </div>
                </div>
            </header>

            <main className="listings-grid">
                {loading ? (
                    <div className="shimmer-grid">
                        {[1,2,3,4].map(i => <div key={i} className="shimmer-listing" />)}
                    </div>
                ) : filtered.length > 0 ? filtered.map((item, index) => {
                    const cfg = statusConfig[item.status] || statusConfig['Pending'];
                    const orderCount = getOrderCount(item._id);
                    const statuses = ['Ready', 'Growing', 'Out of Stock'];
                    return (
                        <motion.div 
                            key={item._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="listing-card"
                        >
                            <div className="listing-icon-area">
                                <div className="listing-icon-placeholder"><Tag size={24} color="var(--primary)" /></div>
                                <span className="listing-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                                    {item.status}
                                </span>
                            </div>
                            <div className="listing-body">
                                <div className="listing-top">
                                    <h3>{item.name}</h3>
                                    {item.variety && <span className="variety-tag">{item.variety}</span>}
                                </div>
                                <div className="listing-meta">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14} /> {item.price || 'No price set'}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Package size={14} /> {item.quantity || 'N/A'}</span>
                                    <span className="order-pill">{orderCount} order{orderCount !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="listing-actions">
                                    <select 
                                        className="status-select"
                                        value={item.status}
                                        disabled={updatingId === item._id}
                                        onChange={e => handleStatusChange(item._id, e.target.value)}
                                    >
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    );
                }) : (
                    <div className="empty-state-large">
                        <div className="empty-icon-circle">
                            <ShoppingBag size={48} color="var(--primary)" />
                        </div>
                        <h2>{searchQuery ? `No results for "${searchQuery}"` : 'No Listings Yet'}</h2>
                        <p>Go to Crop Management to add your produce and mark items as <strong>Ready</strong> to list them on the marketplace.</p>
                    </div>
                )}
            </main>

            <style>{`
                .listings-page { display: flex; flex-direction: column; gap: 25px; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }

                .header-stats { display: flex; gap: 16px; }
                .h-stat { background: white; padding: 12px 24px; border-radius: 14px; border: 1px solid #edf2f7; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .h-label { font-size: 0.72rem; color: #718096; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
                .h-value { font-size: 1.5rem; font-weight: 800; color: var(--primary); }

                .search-box { flex: 1; max-width: 450px; display: flex; align-items: center; gap: 12px; background: white; padding: 12px 20px; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: all 0.3s; }
                .search-box:focus-within { border-color: var(--primary); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-width: 1.5px; }
                .search-box input { background: transparent; border: none; outline: none; width: 100%; font-size: 1rem; color: #1a202c; }
                .search-box input::placeholder { color: #a0aec0; }
                .search-box svg { color: #718096; }

                .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .shimmer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .shimmer-listing { height: 180px; border-radius: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

                .listing-card { background: white; border-radius: 20px; border: 1px solid #edf2f7; overflow: hidden; transition: all 0.3s; display: flex; flex-direction: column; }
                .listing-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }

                .listing-icon-area { background: #f8fafc; padding: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
                .listing-emoji { font-size: 2.5rem; }
                .listing-status-badge { font-size: 0.8rem; font-weight: 700; padding: 6px 14px; border-radius: 20px; }

                .listing-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
                .listing-top { display: flex; flex-direction: column; gap: 4px; }
                .listing-top h3 { margin: 0; font-size: 1.2rem; color: #1a202c; }
                .variety-tag { font-size: 0.78rem; color: #718096; background: #edf2f7; padding: 2px 10px; border-radius: 6px; width: fit-content; }
                .listing-meta { display: flex; gap: 12px; font-size: 0.85rem; color: #4a5568; flex-wrap: wrap; }
                .order-pill { background: #ebf8ff; color: #2b6cb0; font-weight: 700; padding: 2px 10px; border-radius: 10px; }

                .listing-actions { margin-top: auto; display: flex; gap: 10px; }
                .status-select { flex: 1; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: white; font-weight: 600; color: #4a5568; cursor: pointer; outline: none; }
                .status-select:focus { border-color: var(--primary); }

                .empty-state-large { grid-column: 1 / -1; background: white; border-radius: 24px; padding: 80px 40px; display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px solid #edf2f7; }
                .empty-icon-circle { width: 100px; height: 100px; background: var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
                .empty-state-large h2 { color: #1a202c; margin-bottom: 12px; }
                .empty-state-large p { color: #718096; max-width: 400px; line-height: 1.6; }
            `}</style>
        </div>
    );
};

export default MyListings;

