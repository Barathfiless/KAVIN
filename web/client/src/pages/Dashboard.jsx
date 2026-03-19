import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, TrendingUp, DollarSign, Package, AlertCircle, ShoppingCart, Info, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, ComposedChart, Line, Legend 
} from 'recharts';

const Dashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [crops, setCrops] = React.useState([]);
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);
    const [showYearDropdown, setShowYearDropdown] = React.useState(false);
    const [selectedMonth, setSelectedMonth] = React.useState('March');
    const [selectedYear, setSelectedYear] = React.useState('2025');
    const [marketTrends, setMarketTrends] = React.useState([]);
    const [location, setLocation] = React.useState('Coimbatore, Tamil Nadu');

    const monthRef = React.useRef(null);
    const yearRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthRef.current && !monthRef.current.contains(event.target)) setShowMonthDropdown(false);
            if (yearRef.current && !yearRef.current.contains(event.target)) setShowYearDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = ['2024', '2025', '2026'];

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId || userId === 'null') return;
                const [cropRes, orderRes, demandRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/crops/${userId}`),
                    fetch(`http://localhost:5000/api/orders/farmer/${userId}`),
                    fetch(`http://localhost:5000/api/orders/demand/regional`)
                ]);
                const cropsData = await cropRes.json();
                const ordersData = await orderRes.json();
                const demandData = await demandRes.json();
                setCrops(Array.isArray(cropsData) ? cropsData : []);
                setOrders(Array.isArray(ordersData) ? ordersData : []);
                setMarketTrends(demandData.slice(0, 3));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateStats = () => {
        const totalYield = crops.reduce((sum, crop) => {
            const val = parseFloat(crop.quantity?.toString().replace(/[^\d.]/g, '') || 0);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const deliveredOrders = orders.filter(o => o.status === 'Delivered');
        const totalRevenue = deliveredOrders.reduce((sum, o) => {
            const price = parseFloat(o.pricePerUnit?.toString().replace(/[^\d.]/g, '') || 0);
            return sum + (isNaN(price * o.quantity) ? 0 : price * o.quantity);
        }, 0);

        const unitsSold = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + (o.quantity || 1), 0);

        return [
            { label: t.totalYield || 'Total Yield', value: `${totalYield.toLocaleString()} kg`, icon: <Sprout size={20} />, color: '#2d6a4f', trend: 'Live' },
            { label: t.revenue || 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#3182ce', trend: 'Live' },
            { label: t.unitsSold || 'Units Sold', value: unitsSold.toString(), icon: <Package size={20} />, color: '#dd6b20', trend: `${orders.length} total` },
            { label: t.activeListings || 'Active Listings', value: crops.filter(c => c.status === 'Ready').length.toString(), icon: <TrendingUp size={20} />, color: '#805ad5', trend: 'Live' },
        ];
    };

    const stats = calculateStats();
    
    const recentActivity = orders.slice(0, 3).map(o => ({
        name: o.cropName,
        type: `Order by ${o.customerName}`,
        amount: o.pricePerUnit || 'Market',
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: o.status
    }));
    
    const generateMonthlyData = () => {
        const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthsShort.map((month, index) => {
            const monthCrops = crops.filter(c => new Date(c.createdAt).getMonth() === index);
            const monthOrders = orders.filter(o => new Date(o.createdAt).getMonth() === index && o.status !== 'Cancelled');
            
            // Calculate total stock units added in this month
            const stocksAdded = monthCrops.reduce((sum, c) => {
                const val = parseFloat(c.quantity?.toString().replace(/[^\d.]/g, '') || 0);
                return sum + (isNaN(val) ? 0 : val);
            }, 0);

            // Calculate units sold in this month
            const salesMade = monthOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);

            return {
                name: month,
                stocks: stocksAdded || 0,
                sales: salesMade || 0
            };
        });
    };

    const monthlyData = generateMonthlyData();

    return (
        <div className="dashboard-content">
            <header className="dashboard-welcome">
                <h1>{localStorage.getItem('role') === 'farmer' ? `${t.welcome}, ${localStorage.getItem('userName')}` : 'Customer Dashboard'}</h1>
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

            {/* Inventory & Sales Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="chart-section"
            >
                <div className="chart-header">
                    <div className="chart-title">
                        <h2>Inventory</h2>
                    </div>
                    <div className="chart-filters">
                        <div className="custom-dropdown" ref={monthRef}>
                            <div className="dropdown-trigger" onClick={() => setShowMonthDropdown(!showMonthDropdown)}>
                                <span>{selectedMonth}</span>
                                <ChevronDown size={14} className={showMonthDropdown ? 'rotate-180' : ''} />
                            </div>
                            <AnimatePresence>
                                {showMonthDropdown && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="dropdown-list"
                                    >
                                        {months.map(m => (
                                            <div 
                                                key={m} 
                                                className={`dropdown-item ${selectedMonth === m ? 'selected' : ''}`}
                                                onClick={() => { setSelectedMonth(m); setShowMonthDropdown(false); }}
                                            >
                                                {m}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="custom-dropdown" ref={yearRef}>
                            <div className="dropdown-trigger" onClick={() => setShowYearDropdown(!showYearDropdown)}>
                                <span>{selectedYear}</span>
                                <ChevronDown size={14} className={showYearDropdown ? 'rotate-180' : ''} />
                            </div>
                            <AnimatePresence>
                                {showYearDropdown && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="dropdown-list"
                                    >
                                        {years.map(y => (
                                            <div 
                                                key={y} 
                                                className={`dropdown-item ${selectedYear === y ? 'selected' : ''}`}
                                                onClick={() => { setSelectedYear(y); setShowYearDropdown(false); }}
                                            >
                                                {y}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorStocks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#718096', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#718096', fontSize: 12 }}
                                dx={-10}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(5px)'
                                }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Area 
                                type="monotone" 
                                dataKey="stocks" 
                                name="No. of Stocks"
                                stroke="#2d6a4f" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorStocks)" 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="sales" 
                                name="Completed Sales"
                                stroke="#dd6b20" 
                                strokeWidth={3}
                                dot={{ fill: '#dd6b20', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <div className="dashboard-sections">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="section-card"
                >
                    <div className="section-header">
                        <h2>{t.recentActivity || 'Recent Activity'}</h2>
                        <button className="view-all">{t.viewAll || 'View All'}</button>
                    </div>
                    <div className="activity-list">
                        {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon-container">
                                    <div className="activity-dot"></div>
                                </div>
                                <div className="activity-info">
                                    <span className="activity-item-name">{activity.name}</span>
                                    <span className="activity-type">{activity.type}</span>
                                </div>
                                <div className="activity-meta">
                                    <span className={`activity-amount ${activity.amount.startsWith('+') ? 'text-green' : 'text-red'}`}>
                                        {activity.amount}
                                    </span>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="empty-msg">No recent activity detected.</p>
                        )}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="section-card weather-widget"
                >
                    <div className="section-header">
                        <h2>{t.farmConditions || 'Market Trends'}</h2>
                        <TrendingUp size={16} color="#48bb78" />
                    </div>
                    
                    <div className="market-trends-list">
                        {marketTrends.length > 0 ? marketTrends.map((trend, i) => (
                            <div key={i} className="trend-row" onClick={() => navigate('/farmer/seasonal')}>
                                <div className="trend-name">
                                    <span className="crop-label">{trend.crop}</span>
                                    <span className="loc-label">{trend.primaryLocation}</span>
                                </div>
                                <div className="trend-value">
                                    <span className="q-val">+{trend.quantity}</span>
                                    <ArrowRight size={12} />
                                </div>
                            </div>
                        )) : (
                            <div className="empty-trends">
                                <Info size={24} />
                                <p>No market trends available yet.</p>
                            </div>
                        )}
                    </div>

                    <div className="advisor-promo" onClick={() => navigate('/farmer/seasonal')}>
                        <Sparkles size={16} />
                        <span>AI Suggestion: Plant {marketTrends[0]?.crop || 'Onion'} for max profit</span>
                    </div>
                </motion.div>
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
                .empty-msg { color: #a0aec0; text-align: center; padding: 20px; font-style: italic; }

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

                .chart-section {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    border: 1px solid #edf2f7;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    margin-bottom: 30px;
                }
                .chart-header {
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .chart-filters {
                    display: flex;
                    gap: 10px;
                }
                .chart-title h2 { font-size: 1.25rem; color: #1a202c; margin-bottom: 4px; font-weight: 700; }
                .chart-title p { color: #718096; font-size: 0.9rem; }
                .chart-container {
                    width: 100%;
                }
                .custom-dropdown {
                    position: relative;
                    min-width: 120px;
                }
                .dropdown-trigger {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 9px 16px;
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #4a5568;
                    transition: all 0.2s;
                }
                .dropdown-trigger:hover {
                    border-color: var(--primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .dropdown-trigger .rotate-180 {
                    transform: rotate(180deg);
                }
                .dropdown-trigger svg {
                    transition: transform 0.2s;
                    margin-left: 8px;
                }
                .dropdown-list {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 100%;
                    min-width: 140px;
                    background: white;
                    border-radius: 14px;
                    border: 1px solid #edf2f7;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    padding: 8px;
                    z-index: 100;
                    max-height: 250px;
                    overflow-y: auto;
                }
                .dropdown-item {
                    padding: 10px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.88rem;
                    color: #4a5568;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .dropdown-item:hover {
                    background: #f1f5f9;
                    color: var(--primary);
                }
                .dropdown-item.selected {
                    background: var(--primary-dark);
                    color: white;
                }
                /* Custom scrollbar for dropdown */
                .dropdown-list::-webkit-scrollbar { width: 5px; }
                .dropdown-list::-webkit-scrollbar-track { background: transparent; }
                .dropdown-list::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }

                .recharts-cartesian-grid-horizontal line {
                    stroke: #f1f5f9;
                }
                .recharts-tooltip-cursor {
                    fill: #f8fafc;
                }
                
                .market-trends-list { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
                .trend-row { 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding: 12px; background: #f8fafc; border-radius: 12px; cursor: pointer; transition: all 0.2s;
                }
                .trend-row:hover { background: #f0fff4; transform: translateX(5px); }
                .trend-name { display: flex; flex-direction: column; text-align: left; }
                .crop-label { font-weight: 700; color: #2d3748; font-size: 0.9rem; }
                .loc-label { font-size: 0.72rem; color: #a0aec0; }
                .trend-value { display: flex; align-items: center; gap: 8px; color: var(--primary); font-weight: 800; }
                .q-val { font-size: 0.85rem; }
                
                .advisor-promo { 
                    margin-top: 24px; padding: 14px; background: #2d6a4f; color: white; 
                    border-radius: 12px; font-size: 0.8rem; font-weight: 700; 
                    display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;
                }
                .advisor-promo:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(45,106,79,0.3); }
                .empty-trends { padding: 20px; text-align: center; color: #a0aec0; font-size: 0.85rem; }
                `}
            </style>
        </div>
    );
};

export default Dashboard;
