import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const stats = [
        { label: 'Total Crops', value: '12', icon: <Sprout />, color: '#40916c', trend: '+2 this month' },
        { label: 'Active Orders', value: '48', icon: <Package />, color: '#2d6a4f', trend: '8 pending' },
        { label: 'Total Revenue', value: '$12,450', icon: <DollarSign />, color: '#ffb703', trend: '+15% from last month' },
        { label: 'Market Index', value: 'Stable', icon: <TrendingUp />, color: '#1b4332', trend: 'Prices rising' },
    ];

    const recentActivity = [
        { id: 1, type: 'Sale', item: 'Organic Tomatoes', amount: '+$450', time: '2 hours ago' },
        { id: 2, type: 'Planting', item: 'Winter Wheat', amount: '20 Acres', time: '5 hours ago' },
        { id: 3, type: 'Utility', item: 'Irrigation System', amount: '-$120', time: 'Yesterday' },
        { id: 4, type: 'Alert', item: 'Soil Moisture Low', amount: 'Zone B', time: 'Ongoing' },
    ];

    return (
        <div className="dashboard-content">
            <header className="dashboard-welcome">
                <h1>{localStorage.getItem('role') === 'farmer' ? 'Farmer Dashboard' : 'Customer Dashboard'}</h1>
                <p>Monitor your {localStorage.getItem('role') === 'farmer' ? 'harvest' : 'orders'} and market performance in real-time.</p>
            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="stat-card"
                    >
                        <div className="stat-header">
                            <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                                {stat.icon}
                            </div>
                            <span className="stat-trend">{stat.trend}</span>
                        </div>
                        <div className="stat-body">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="dashboard-sections">
                <section className="recent-activity section-card">
                    <div className="section-header">
                        <h2>Recent Activity</h2>
                        <button className="view-all">View All</button>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon-container">
                                    <div className="activity-dot shadow-sm"></div>
                                </div>
                                <div className="activity-info">
                                    <span className="activity-item-name">{activity.item}</span>
                                    <span className="activity-type">{activity.type}</span>
                                </div>
                                <div className="activity-meta">
                                    <span className={`activity-amount ${activity.amount.startsWith('+') ? 'text-green' : 'text-red'}`}>
                                        {activity.amount}
                                    </span>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="crop-yield section-card">
                    <div className="section-header">
                        <h2>Weather & Soil Health</h2>
                    </div>
                    <div className="weather-widget">
                        <div className="weather-main">
                            <span className="temp">24°C</span>
                            <span className="condition">Partly Cloudy</span>
                        </div>
                        <div className="soil-stats">
                            <div className="soil-stat">
                                <span>Moisture</span>
                                <div className="progress-bar"><div className="progress" style={{ width: '68%' }}></div></div>
                            </div>
                            <div className="soil-stat">
                                <span>PH Level</span>
                                <span className="ph-value">6.4 (Good)</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <style>
                {`
                .dashboard-welcome { margin-bottom: 30px; }
                .dashboard-welcome h1 { font-size: 2rem; color: var(--primary-dark); margin-bottom: 4px; }
                .dashboard-welcome p { color: var(--text-muted); }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    border: 1px solid #edf2f7;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }
                .stat-icon {
                    padding: 10px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-trend {
                    font-size: 0.75rem;
                    color: var(--primary);
                    background: var(--secondary);
                    padding: 4px 8px;
                    border-radius: 20px;
                    font-weight: 600;
                }
                .stat-body h3 { font-size: 1.75rem; color: #1a202c;  margin-bottom: 4px; }
                .stat-body p { color: #718096; font-size: 0.9rem; font-weight: 500; }

                .dashboard-sections {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 30px;
                }
                .section-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    border: 1px solid #edf2f7;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .section-header h2 { font-size: 1.25rem; color: var(--primary-dark); }
                .view-all {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.9rem;
                }

                .activity-list { display: flex; flex-direction: column; gap: 16px; }
                .activity-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-radius: 12px;
                    transition: background 0.2s;
                }
                .activity-item:hover { background: #f8fafc; }
                .activity-icon-container { padding-right: 16px; }
                .activity-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--primary);
                    border-radius: 50%;
                }
                .activity-info { flex: 1; display: flex; flex-direction: column; }
                .activity-item-name { font-weight: 600; color: #2d3748; }
                .activity-type { font-size: 0.8rem; color: #718096; }
                .activity-meta { text-align: right; display: flex; flex-direction: column; }
                .activity-amount { font-weight: 700; font-size: 0.95rem; }
                .activity-time { font-size: 0.75rem; color: #a0aec0; }
                .text-green { color: #2f855a; }
                .text-red { color: #c53030; }

                .weather-widget { text-align: center; }
                .weather-main { display: flex; flex-direction: column; margin-bottom: 24px; }
                .temp { font-size: 2.5rem; font-weight: 800; color: var(--primary-dark); }
                .condition { color: #718096; font-weight: 500; }
                .soil-stats { text-align: left; display: flex; flex-direction: column; gap: 16px; }
                .soil-stat { display: flex; flex-direction: column; gap: 6px; }
                .soil-stat span { font-size: 0.85rem; color: #4a5568; font-weight: 600; }
                .progress-bar { height: 8px; background: #edf2f7; border-radius: 4px; overflow: hidden; }
                .progress { height: 100%; background: var(--primary); border-radius: 4px; }
                .ph-value { font-weight: 700; color: var(--primary); }
                `}
            </style>
        </div>
    );
};

export default Dashboard;
