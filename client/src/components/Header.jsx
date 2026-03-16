import React from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

const Header = () => {
    return (
        <header className="header">
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search crops, prices, or producers..." />
            </div>

            <div className="header-actions">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-badge"></span>
                </button>
                
                <div className="user-profile">
                    <div className="avatar">
                        <User size={20} color="#1b4332" />
                    </div>
                    <div className="user-info">
                        <span className="user-role">Farmer</span>
                    </div>
                    <ChevronDown size={16} />
                </div>
            </div>

            <style>
                {`
                .header {
                    height: 70px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 30px;
                    position: sticky;
                    top: 0;
                    z-index: 90;
                    border-bottom: 1px solid #edf2f7;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    background: #f7fafc;
                    padding: 8px 16px;
                    border-radius: 10px;
                    width: 400px;
                    border: 1px solid #edf2f7;
                }
                .search-icon {
                    color: #a0aec0;
                    margin-right: 10px;
                }
                .search-bar input {
                    background: transparent;
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 0.9rem;
                    color: #4a5568;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .icon-btn {
                    background: #f7fafc;
                    border: 1px solid #edf2f7;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #4a5568;
                    position: relative;
                }
                .notification-badge {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 8px;
                    height: 8px;
                    background: #e63946;
                    border-radius: 50%;
                    border: 2px solid white;
                }
                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 6px 12px;
                    background: #f7fafc;
                    border-radius: 12px;
                    cursor: pointer;
                    border: 1px solid #edf2f7;
                }
                .avatar {
                    width: 32px;
                    height: 32px;
                    background: var(--secondary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .user-info {
                    display: flex;
                    flex-direction: column;
                }
                .user-role {
                    font-size: 0.75rem;
                    color: #718096;
                    font-weight: 500;
                    text-transform: uppercase;
                }
                `}
            </style>
        </header>
    );
};

export default Header;
