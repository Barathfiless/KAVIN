import React, { useState, useEffect, useCallback } from 'react';
import { Bell, User, ChevronDown, LogOut, Check, Info, BellOff, Trash2, X, Globe, RefreshCw, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { languages } from '../utils/translations';

const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentLang, setCurrentLang, t } = useLanguage();
    
    // Portal mode based on URL for tab independence
    const portalMode = location.pathname.startsWith('/customer') ? 'customer' : 'farmer';
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLang, setShowLang] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);

    const userId = localStorage.getItem('userId');

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        setNotifLoading(true);
        try {
            const res = await fetch(
                `http://localhost:5000/api/notifications/${userId}?portal=${portalMode}`
            );
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setNotifLoading(false);
        }
    }, [userId, portalMode]);

    // Fetch on mount and every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Re-fetch when notification panel opens
    useEffect(() => {
        if (showNotifications) fetchNotifications();
    }, [showNotifications, fetchNotifications]);

    const user = {
        name: localStorage.getItem('userName') || (portalMode === 'farmer' ? 'Farmer' : 'Customer'),
        role: portalMode, // Derived from URL
        phone: localStorage.getItem('userPhone') || '+91 00000 00000'
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const markAllRead = async () => {
        if (!userId) return;
        try {
            await fetch(
                `http://localhost:5000/api/notifications/read-all/${userId}?portal=${portalMode}`,
                { method: 'PATCH' }
            );
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Mark all read failed:', err);
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Delete notification failed:', err);
        }
    };

    return (
        <header className="header">
            <button className="mobile-menu-toggle" onClick={onMenuClick}>
                <Menu size={24} />
            </button>

            <div className="header-actions">
                <div className="lang-wrapper">
                    <button 
                        className={`icon-btn ${showLang ? 'active' : ''}`}
                        onClick={() => { setShowLang(!showLang); setShowNotifications(false); setShowProfile(false); }}
                    >
                        <Globe size={20} />
                        <span className="lang-code-tag">{currentLang.toUpperCase()}</span>
                    </button>
                    <AnimatePresence>
                        {showLang && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="lang-dropdown dropdown-card"
                            >
                                <div className="dropdown-header">
                                    <h4>{t.selectLanguage}</h4>
                                </div>
                                <div className="lang-list">
                                    {languages.map(lang => (
                                        <button 
                                            key={lang.code}
                                            className={`lang-item ${currentLang === lang.code ? 'active' : ''}`}
                                            onClick={() => { setCurrentLang(lang.code); setShowLang(false); }}
                                        >
                                            <span className="lang-name">{lang.name}</span>
                                            {currentLang === lang.code && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="notif-wrapper">
                    <button 
                        className={`icon-btn ${showNotifications ? 'active' : ''}`}
                        onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="notif-dropdown dropdown-card"
                            >
                                <div className="dropdown-header">
                                    <h4>{t.notifications}</h4>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button
                                            onClick={fetchNotifications}
                                            title="Refresh"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', display: 'flex', alignItems: 'center' }}
                                        >
                                            <RefreshCw size={14} className={notifLoading ? 'spin-slow' : ''} />
                                        </button>
                                        {notifications.length > 0 && (
                                            <button onClick={markAllRead}>{t.markAllRead}</button>
                                        )}
                                    </div>
                                </div>
                                <div className="notif-list">
                                    {notifLoading && notifications.length === 0 ? (
                                        <div className="empty-notif">
                                            <RefreshCw size={24} className="spin-slow" />
                                            <p>Loading...</p>
                                        </div>
                                    ) : notifications.length > 0 ? notifications.map(n => (
                                        <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                                            <div className="notif-icon-box">
                                                {n.type === 'success' ? <Check size={14} /> : <Info size={14} />}
                                            </div>
                                            <div className="notif-content">
                                                <div className="notif-title-row">
                                                    <p className="notif-title">{n.title}</p>
                                                    <div className="notif-actions">
                                                        {!n.read && <div className="unread-dot-static"></div>}
                                                        <button
                                                            className="delete-notif-btn"
                                                            onClick={(e) => deleteNotification(e, n._id)}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="notif-msg">{n.message}</p>
                                                <div className="notif-footer">
                                                    <span className="notif-time">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' · '}
                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="empty-notif">
                                            <BellOff size={24} />
                                            <p>{t.allCaughtUp || 'No notifications yet'}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="profile-wrapper">
                    <div 
                        className={`user-profile ${showProfile ? 'active' : ''}`}
                        onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                    >
                        <div className="avatar">
                            <User size={20} color="#1b4332" />
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">{user.role === 'farmer' ? t.farmer : t.customer}</span>
                        </div>
                        <ChevronDown size={16} className={showProfile ? 'rotate' : ''} />
                    </div>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="profile-dropdown dropdown-card"
                            >
                                <div className="p-header">
                                    <div className="p-avatar">
                                        <User size={24} color="#1b4332" />
                                    </div>
                                    <div className="p-info">
                                        <h5>{user.name}</h5>
                                        <p>{user.phone}</p>
                                    </div>
                                </div>
                                <div className="p-menu">
                                    <button className="menu-link"><User size={16} /> {t.myProfile}</button>
                                    <button className="menu-link logout" onClick={handleLogout}>
                                        <LogOut size={16} /> {t.logout}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>
                {`
                .header {
                    height: 70px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 0 30px;
                    position: sticky;
                    top: 0;
                    z-index: 90;
                    border-bottom: 1px solid #edf2f7;
                }
                .mobile-menu-toggle {
                    display: none;
                    background: none;
                    border: none;
                    color: #4a5568;
                    cursor: pointer;
                    margin-right: auto;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .lang-wrapper, .notif-wrapper, .profile-wrapper { position: relative; }
                .lang-code-tag {
                    font-size: 0.65rem;
                    font-weight: 800;
                    background: var(--primary);
                    color: white;
                    padding: 2px 4px;
                    border-radius: 4px;
                    margin-left: 4px;
                }
                .lang-dropdown { width: 200px; }
                .lang-list { padding: 8px; max-height: 300px; overflow-y: auto; }
                .lang-item {
                    width: 100%;
                    padding: 10px 16px;
                    border: none;
                    background: none;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    color: #4a5568;
                    transition: all 0.2s;
                }
                .lang-item:hover { background: #f8fafc; color: var(--primary); }
                .lang-item.active { background: #f0f7f4; color: var(--primary); }
                .icon-btn {
                    background: #f7fafc;
                    border: 1px solid #edf2f7;
                    padding: 10px;
                    border-radius: 12px;
                    cursor: pointer;
                    color: #4a5568;
                    position: relative;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                }
                .icon-btn:hover, .icon-btn.active {
                    background: white;
                    border-color: var(--primary);
                    color: var(--primary);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    min-width: 18px;
                    height: 18px;
                    background: #e63946;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 700;
                    border: 2px solid white;
                }
                .dropdown-card {
                    position: absolute;
                    top: 60px;
                    right: 0;
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #edf2f7;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    width: 320px;
                    overflow: hidden;
                }
                /* Notifications */
                .dropdown-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #edf2f7;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dropdown-header h4 { font-size: 0.95rem; color: #1a202c; }
                .dropdown-header button { 
                    font-size: 0.75rem; 
                    background: none; 
                    border: none; 
                    color: var(--primary); 
                    font-weight: 700; 
                    cursor: pointer; 
                }
                .notif-list { max-height: 350px; overflow-y: auto; }
                .notif-item {
                    display: flex;
                    padding: 16px 20px;
                    gap: 12px;
                    border-bottom: 1px solid #f8fafc;
                    cursor: pointer;
                    position: relative;
                    transition: background 0.2s;
                }
                .notif-item:hover { background: #f8fafc; }
                .notif-item.unread { background: #f0f7f4; }
                .notif-icon-box {
                    width: 36px;
                    height: 36px;
                    min-width: 36px;
                    background: white;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    border: 1px solid #edf2f7;
                }
                .notif-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .notif-title { font-size: 0.85rem; font-weight: 700; color: #1a202c; margin: 0; }
                .notif-title-row { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start; 
                    margin-bottom: 2px;
                    width: 100%;
                }
                .notif-actions { display: flex; align-items: center; gap: 8px; }
                .delete-notif-btn {
                    background: none;
                    border: none;
                    color: #a0aec0;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .delete-notif-btn:hover { background: #fee2e2; color: #ef4444; }
                .notif-msg { 
                    font-size: 0.8rem; 
                    color: #4a5568; 
                    line-height: 1.4; 
                    margin-bottom: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .notif-footer { display: flex; justify-content: space-between; align-items: center; }
                .notif-time { font-size: 0.75rem; color: #a0aec0; }
                .unread-dot-static {
                    width: 8px;
                    height: 8px;
                    min-width: 8px;
                    background: var(--primary);
                    border-radius: 50%;
                }
                .empty-notif {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    gap: 12px;
                    color: #a0aec0;
                }
                .empty-notif p {
                    font-size: 0.9rem;
                    font-weight: 500;
                    margin: 0;
                }
                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 6px 16px 6px 6px;
                    background: #f7fafc;
                    border-radius: 16px;
                    cursor: pointer;
                    border: 1px solid #edf2f7;
                    transition: all 0.2s;
                }
                .user-profile:hover, .user-profile.active {
                    background: white;
                    border-color: var(--primary);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .avatar {
                    width: 36px;
                    height: 36px;
                    background: var(--secondary);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .user-info { display: flex; flex-direction: column; }
                .user-name { font-size: 0.85rem; font-weight: 700; color: #1a202c; }
                .user-role { font-size: 0.7rem; color: #718096; font-weight: 600; text-transform: uppercase; }
                .rotate { transform: rotate(180deg); }
 
                .profile-dropdown { width: 220px; }
                .p-header { padding: 20px; border-bottom: 1px solid #edf2f7; display: flex; gap: 12px; align-items: center; }
                .p-avatar { width: 40px; height: 40px; background: #f0f7f4; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .p-info h5 { font-size: 0.9rem; margin-bottom: 2px; }
                .p-info p { font-size: 0.75rem; color: #a0aec0; }
                .p-menu { padding: 8px; }
                .menu-link {
                    width: 100%;
                    padding: 10px 12px;
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #4a5568;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .menu-link:hover { background: #f8fafc; color: var(--primary); }
                .menu-link.logout { color: #e63946; }
                .menu-link.logout:hover { background: #fff5f5; }
 
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-slow { animation: spin 1s linear infinite; }

                @media (max-width: 1024px) {
                    .header {
                        padding: 0 16px;
                        justify-content: space-between;
                    }
                    .header-actions {
                        gap: 8px;
                    }
                    .icon-btn {
                        padding: 8px;
                    }
                    .mobile-menu-toggle {
                        display: block;
                    }
                    .user-info {
                        display: none;
                    }
                    .user-profile {
                        padding: 4px;
                        gap: 0;
                    }
                    .user-profile svg:last-child {
                        display: none;
                    }
                    .dropdown-card {
                        width: 280px;
                        right: -10px;
                    }
                }
                `}
            </style>
        </header>
    );
};

export default Header;
