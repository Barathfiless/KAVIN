import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Sprout, ShoppingCart, Settings, LogOut, ChevronRight, CloudSun, Tag, Package, Zap, X } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    
    // Determine portal mode from URL to support independent tabs
    const portalMode = location.pathname.startsWith('/customer') ? 'customer' : 'farmer';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const farmerMenu = [
        { icon: <LayoutDashboard size={20} />, label: t.farmOverview, path: '/farmer/dashboard' },
        { icon: <CloudSun size={20} />, label: t.seasonal || 'Seasonal Insights', path: '/farmer/seasonal' },
        { icon: <Zap size={20} />, label: 'AI Energy Planner', path: '/farmer/planner' },
        { icon: <Sprout size={20} />, label: t.cropManagement || 'Inventory Management', path: '/farmer/crops' },
        { icon: <Tag size={20} />, label: 'My Listings', path: '/farmer/listings' },
        { icon: <Package size={20} />, label: 'Incoming Orders', path: '/farmer/orders' },
        { icon: <Users size={20} />, label: t.farmerForum || 'Community Forum', path: '/farmer/community' },
        { icon: <Settings size={20} />, label: t.settings, path: '/farmer/settings' },
    ];

    const customerMenu = [
        { icon: <LayoutDashboard size={20} />, label: 'Market Feed', path: '/customer/dashboard' },
        { icon: <ShoppingCart size={20} />, label: 'My Orders', path: '/customer/orders' },
        { icon: <Sprout size={20} />, label: 'Favorite Farms', path: '/customer/favorites' },
        { icon: <Users size={20} />, label: 'Reviews', path: '/customer/reviews' },
        { icon: <Settings size={20} />, label: 'Preferences', path: '/customer/settings' },
    ];

    const menuItems = portalMode === 'farmer' ? farmerMenu : customerMenu;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-icon" style={{ background: portalMode === 'farmer' ? 'var(--primary)' : '#ffb703' }}>
                    <Sprout size={24} color="#fff" />
                </div>
                <h3>{portalMode === 'farmer' ? 'Farmer Central' : 'Harvest Hub'}</h3>
                
                <button className="mobile-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <NavLink 
                        key={index} 
                        to={item.path} 
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                        onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                    >
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-label">{item.label}</span>
                        <ChevronRight className="item-arrow" size={16} />
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} />
                    <span>{t.logout}</span>
                </button>
            </div>

            <style>
                {`
                .sidebar {
                    width: 260px;
                    background: var(--primary-dark);
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    color: white;
                    position: fixed;
                    left: 0;
                    top: 0;
                    z-index: 2000;
                    box-shadow: 4px 0 10px rgba(0,0,0,0.1);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .mobile-close-btn {
                    display: none;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    cursor: pointer;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                    margin-left: auto;
                }
                .mobile-close-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                .sidebar-header {
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .logo-icon {
                    background: var(--primary);
                    padding: 8px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .sidebar-header h3 {
                    margin: 0;
                    font-size: 1.15rem;
                    letter-spacing: -0.5px;
                    font-weight: 700;
                }
                .sidebar-nav {
                    padding: 16px;
                    flex: 1;
                    overflow-y: auto;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    color: rgba(255,255,255,0.65);
                    text-decoration: none;
                    border-radius: 12px;
                    margin-bottom: 6px;
                    transition: all 0.3s ease;
                    position: relative;
                }
                .nav-item:hover {
                    background: rgba(251, 133, 0, 0.15);
                    color: white;
                }
                .nav-item.active {
                    background: #fb8500;
                    color: white;
                    box-shadow: 0 4px 15px rgba(251, 133, 0, 0.3);
                }
                .item-icon {
                    margin-right: 12px;
                    display: flex;
                    align-items: center;
                }
                .item-label {
                    font-weight: 500;
                    flex: 1;
                    font-size: 0.95rem;
                }
                .item-arrow {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .nav-item.active .item-arrow {
                    opacity: 1;
                }
                .sidebar-footer {
                    padding: 16px 24px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(230, 57, 70, 0.1);
                    border: 1px solid rgba(230, 57, 70, 0.2);
                    color: #e63946;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .logout-btn:hover {
                    background: #e63946;
                    color: white;
                }

                @media (max-width: 1024px) {
                    .sidebar {
                        transform: translateX(-100%);
                        z-index: 3000;
                        width: 280px; /* Slightly wider on mobile */
                    }
                    .sidebar.open {
                        transform: translateX(0);
                    }
                    .mobile-close-btn {
                        display: flex;
                    }
                }
                `}
            </style>
        </aside>
    );
};

export default Sidebar;
