import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Sprout, ShoppingCart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role') || 'farmer';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const farmerMenu = [
        { icon: <LayoutDashboard size={20} />, label: 'Farm Overview', path: '/dashboard' },
        { icon: <Sprout size={20} />, label: 'Crop Management', path: '/crops' },
        { icon: <ShoppingCart size={20} />, label: 'My Listings', path: '/listings' },
        { icon: <Users size={20} />, label: 'Farmer Forum', path: '/community' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
    ];

    const customerMenu = [
        { icon: <LayoutDashboard size={20} />, label: 'Market Feed', path: '/dashboard' },
        { icon: <ShoppingCart size={20} />, label: 'My Orders', path: '/orders' },
        { icon: <Sprout size={20} />, label: 'Favorite Farms', path: '/favorites' },
        { icon: <Users size={20} />, label: 'Reviews', path: '/reviews' },
        { icon: <Settings size={20} />, label: 'Preferences', path: '/settings' },
    ];

    const menuItems = role === 'farmer' ? farmerMenu : customerMenu;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon" style={{ background: role === 'farmer' ? 'var(--primary)' : '#ffb703' }}>
                    <Sprout size={24} color="#fff" />
                </div>
                <h3>{role === 'farmer' ? 'Farmer Central' : 'Harvest Hub'}</h3>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <NavLink 
                        key={index} 
                        to={item.path} 
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
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
                    <span>Logout</span>
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
                    z-index: 100;
                    box-shadow: 4px 0 10px rgba(0,0,0,0.1);
                }
                .sidebar-header {
                    padding: 30px 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
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
                    font-size: 1.25rem;
                    letter-spacing: -0.5px;
                }
                .sidebar-nav {
                    padding: 0 16px;
                    flex: 1;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 14px 16px;
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    border-radius: 12px;
                    margin-bottom: 4px;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .nav-item:hover {
                    background: rgba(255,255,255,0.05);
                    color: white;
                }
                .nav-item.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .item-icon {
                    margin-right: 12px;
                    display: flex;
                    align-items: center;
                }
                .item-label {
                    font-weight: 500;
                    flex: 1;
                }
                .item-arrow {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .nav-item.active .item-arrow {
                    opacity: 1;
                }
                .sidebar-footer {
                    padding: 24px;
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
                `}
            </style>
        </aside>
    );
};

export default Sidebar;
