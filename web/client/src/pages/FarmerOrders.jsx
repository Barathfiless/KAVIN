import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Clock, CheckCircle, Truck, 
    XCircle, Phone, MapPin, Search, Filter 
} from 'lucide-react';

const statusColors = {
    'Pending': { bg: '#fffaf0', text: '#dd6b20', icon: <Clock size={16} /> },
    'Confirmed': { bg: '#e6fffa', text: '#2c7a7b', icon: <CheckCircle size={16} /> },
    'Shipped': { bg: '#ebf8ff', text: '#2b6cb0', icon: <Truck size={16} /> },
    'Delivered': { bg: '#f0fff4', text: '#2f855a', icon: <CheckCircle size={16} /> },
    'Cancelled': { bg: '#fff5f5', text: '#c53030', icon: <XCircle size={16} /> },
};

const FarmerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const farmerId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/orders/farmer/${farmerId}`);
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching farmer orders:', err);
            } finally {
                setLoading(false);
            }
        };
        if (farmerId) fetchOrders();
    }, [farmerId]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
        }
    };

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="farmer-orders-page" style={{ padding: '24px' }}>
            <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', margin: 0 }}>Incoming Orders</h1>
                    <p style={{ color: '#718096', margin: '4px 0 0' }}>Manage your active sales and shipment tracking.</p>
                </div>
                <div className="filter-pills" style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map(s => (
                        <button 
                            key={s} 
                            onClick={() => setFilter(s)}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '20px', 
                                border: 'none',
                                background: filter === s ? 'var(--primary)' : '#edf2f7',
                                color: filter === s ? 'white' : '#4a5568',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </header>

            <div className="orders-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                    [1,2,3].map(i => <div key={i} style={{ height: '120px', background: 'white', borderRadius: '20px', border: '1px solid #edf2f7' }} className="shimmer-order" />)
                ) : filteredOrders.length > 0 ? filteredOrders.map((order, index) => {
                    const status = statusColors[order.status] || statusColors['Pending'];
                    return (
                        <motion.div 
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="order-card"
                        >
                            <div className="order-main">
                                <div className="p-header">
                                    <div className="p-icon">
                                        <Package size={20} />
                                    </div>
                                    <h3>{order.cropName}</h3>
                                </div>
                                <div className="p-details">
                                    <p>Qty: <strong>{order.quantity} units</strong></p>
                                    <p className="order-date">Ordered {new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                </div>
                            </div>

                            <div className="order-customer">
                                <span className="label">Customer</span>
                                <h4>{order.customerName}</h4>
                                <p className="addr">
                                    <MapPin size={14} /> {order.address || 'No address provided'}
                                </p>
                            </div>

                            <div className="order-actions-col">
                                <div className="status-badge" style={{ background: status.bg, color: status.text }}>
                                    {status.icon} {order.status}
                                </div>
                                <div className="action-row">
                                    {order.status === 'Pending' && <button onClick={() => updateStatus(order._id, 'Confirmed')} className="action-btn accept">Accept</button>}
                                    {order.status === 'Confirmed' && <button onClick={() => updateStatus(order._id, 'Shipped')} className="action-btn ship">Ship Order</button>}
                                    {order.status === 'Shipped' && <button onClick={() => updateStatus(order._id, 'Delivered')} className="action-btn deliver">Complete</button>}
                                    {['Pending', 'Confirmed'].includes(order.status) && <button onClick={() => updateStatus(order._id, 'Cancelled')} className="action-btn cancel">Cancel</button>}
                                </div>
                            </div>

                            <div className="order-total-col">
                                <span className="label">Total Value</span>
                                <div className="total-val">
                                    {order.totalPrice ? `₹${order.totalPrice.toLocaleString()}` : (order.pricePerUnit || 'Market')}
                                </div>
                            </div>
                        </motion.div>
                    );
                }) : (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '32px', border: '1px solid #edf2f7' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>📉</div>
                        <h2 style={{ color: '#1a202c' }}>No {filter !== 'All' ? filter : ''} Orders</h2>
                        <p style={{ color: '#718096' }}>{filter === 'All' ? 'When customers order your listed crops, they will appear here.' : 'No orders currently match this status filter.'}</p>
                    </div>
                )}
            </div>

            <style>{`
                .shimmer-order { animation: pulseO 1.5s infinite; height: 120px; background: #f7fafc; border-radius: 20px; }
                @keyframes pulseO { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

                .order-card {
                    background: white;
                    border-radius: 24px;
                    padding: 24px 32px;
                    border: 1px solid #edf2f7;
                    display: grid;
                    grid-template-columns: 1fr 1.4fr 1fr auto;
                    gap: 32px;
                    align-items: center;
                    transition: all 0.3s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .order-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-color: #e2e8f0; }
                
                .p-header { display: flex; alignItems: center; gap: 12px; margin-bottom: 8px; }
                .p-icon { padding: 10px; background: #f0fff4; border-radius: 12px; color: #2d6a4f; }
                .p-header h3 { margin: 0; font-size: 1.15rem; color: #1a202c; }
                .p-details p { margin: 0; font-size: 0.88rem; color: #4a5568; }
                .p-details .order-date { font-size: 0.78rem; color: #a0aec0; margin-top: 4px; }
                
                .order-customer h4 { margin: 0 0 6px 0; font-size: 1.1rem; color: #1a202c; }
                .order-customer .label, .order-total-col .label { display: block; font-size: 0.72rem; color: #a0aec0; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 8px; }
                .addr { margin: 0; font-size: 0.82rem; color: #718096; display: flex; align-items: flex-start; gap: 6px; line-height: 1.4; }
                
                .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; fontSize: 0.82rem; font-weight: 700; margin-bottom: 15px; }
                .action-row { display: flex; gap: 8px; }

                .action-btn { 
                    padding: 9px 18px; 
                    border-radius: 12px; 
                    border: none; 
                    font-size: 0.82rem; 
                    font-weight: 700; 
                    cursor: pointer; 
                    transition: all 0.3s;
                }
                .action-btn.accept { background: #2d6a4f; color: white; }
                .action-btn.ship { background: #2b6cb0; color: white; }
                .action-btn.deliver { background: #2d3748; color: white; }
                .action-btn.cancel { background: #fff5f5; color: #e53e3e; border: 1px solid #fed7d7; }
                .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                
                .order-total-col { text-align: right; border-left: 1px solid #f1f5f9; padding-left: 32px; }
                .total-val { font-size: 1.8rem; font-weight: 800; color: #2d6a4f; }
            `}</style>
        </div>
    );
};

export default FarmerOrders;
