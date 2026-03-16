import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, MapPin, Search, Heart, Clock } from 'lucide-react';

const CustomerDashboard = () => {
    const featuredFarms = [
        { id: 1, name: 'Green Valley Organic', distance: '5.2 km', rating: 4.8, tags: ['Eco-friendly', 'Vegetables'] },
        { id: 2, name: 'Sunshine Orchards', distance: '12.0 km', rating: 4.9, tags: ['Fruits', 'Fresh'] },
        { id: 3, name: 'Riverdale Dairy', distance: '8.5 km', rating: 4.7, tags: ['Milk', 'Cheese'] },
    ];

    const currentOrders = [
        { id: '#ORD-992', item: 'Fresh Strawberries (2kg)', status: 'Out for Delivery', date: 'Today' },
        { id: '#ORD-881', item: 'Organic Brown Rice (5kg)', status: 'Processing', date: 'Yesterday' },
    ];

    return (
        <div className="customer-dashboard">
            <header className="dashboard-welcome">
                <h1>Welcome to Harvest Hub</h1>
                <p>Find the freshest produce directly from local farms around you.</p>
            </header>

            <div className="search-section">
                <div className="search-box">
                    <Search size={20} />
                    <input type="text" placeholder="I'm looking for... (e.g. Tomatoes, Fresh Milk)" />
                </div>
            </div>

            <div className="dashboard-grid">
                <section className="featured-section">
                    <div className="section-header">
                        <h2>Top Rated Farms Near You</h2>
                        <button className="text-btn">Explore Map</button>
                    </div>
                    <div className="farm-cards">
                        {featuredFarms.map((farm, index) => (
                            <motion.div 
                                key={farm.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="farm-card"
                            >
                                <div className="card-image-placeholder">
                                    <MapPin size={24} color="#ffb703" />
                                    <span>{farm.distance}</span>
                                </div>
                                <div className="card-info">
                                    <h3>{farm.name}</h3>
                                    <div className="card-meta">
                                        <div className="rating">
                                            <Star size={16} fill="#ffb703" color="#ffb703" />
                                            <span>{farm.rating}</span>
                                        </div>
                                        <button className="fav-btn"><Heart size={18} /></button>
                                    </div>
                                    <div className="tags">
                                        {farm.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <aside className="orders-sidebar">
                    <div className="section-header">
                        <h2>My Orders</h2>
                    </div>
                    <div className="orders-list">
                        {currentOrders.map(order => (
                            <div key={order.id} className="order-item">
                                <div className="order-header">
                                    <span className="order-id">{order.id}</span>
                                    <span className="order-date">{order.date}</span>
                                </div>
                                <p className="order-item-name">{order.item}</p>
                                <div className="order-footer">
                                    <span className="order-status">{order.status}</span>
                                    <Clock size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="view-all-btn">View Order History</button>
                </aside>
            </div>

            <style>
                {`
                .customer-dashboard { display: flex; flex-direction: column; gap: 30px; }
                .dashboard-welcome h1 { font-size: 2.2rem; color: #1a202c; font-family: 'Outfit', sans-serif; }
                .dashboard-welcome p { color: #718096; }

                .search-section {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: #f7fafc;
                    padding: 12px 20px;
                    border-radius: 12px;
                    border: 1px solid #edf2f7;
                }
                .search-box input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 1rem;
                }

                .dashboard-grid { display: grid; grid-template-columns: 1fr 320px; gap: 30px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .section-header h2 { font-size: 1.4rem; color: #1a202c; }
                .text-btn { background: none; border: none; color: #ffb703; font-weight: 700; cursor: pointer; }

                .farm-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
                .farm-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #edf2f7; transition: transform 0.3s ease; }
                .farm-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                .card-image-placeholder { height: 160px; background: #fffcf2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-weight: 600; color: #718096; }
                .card-info { padding: 20px; }
                .card-info h3 { font-size: 1.15rem; margin-bottom: 10px; color: #2d3748; }
                .card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .rating { display: flex; align-items: center; gap: 5px; font-weight: 700; color: #1a202c; }
                .fav-btn { background: none; border: none; color: #cbd5e0; cursor: pointer; transition: color 0.3s; }
                .fav-btn:hover { color: #e53e3e; }
                .tags { display: flex; gap: 8px; flex-wrap: wrap; }
                .tag { font-size: 0.75rem; background: #f7fafc; padding: 4px 8px; border-radius: 6px; color: #718096; font-weight: 500; }

                .orders-sidebar { background: white; padding: 25px; border-radius: 20px; border: 1px solid #edf2f7; height: fit-content; }
                .orders-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; }
                .order-item { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #edf2f7; }
                .order-header { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 8px; }
                .order-id { font-weight: 700; color: #ffb703; }
                .order-date { color: #a0aec0; }
                .order-item-name { font-weight: 600; color: #2d3748; margin-bottom: 12px; }
                .order-footer { display: flex; justify-content: space-between; align-items: center; color: var(--primary); }
                .order-status { font-size: 0.85rem; font-weight: 700; }
                .view-all-btn { width: 100%; padding: 12px; background: #ffb703; border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; }
                `}
            </style>
        </div>
    );
};

export default CustomerDashboard;
