import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const token = localStorage.getItem('token');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Token is permanent — only cleared on logout
    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="layout-wrapper">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <main className="main-content">
                <div className="header-wrapper-fixed">
                    <Header onMenuClick={() => setIsSidebarOpen(true)} />
                </div>
                <div className="page-container">
                    <Outlet />
                </div>
            </main>

            <style>
                {`
                .layout-wrapper {
                    min-height: 100vh;
                    background: #f8fafc;
                    display: flex;
                    width: 100%;
                    overflow-x: hidden;
                    position: relative;
                }
                .main-content {
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    transition: padding 0.3s ease;
                }
                .header-wrapper-fixed {
                    position: fixed;
                    top: 0;
                    right: 0;
                    left: 0;
                    z-index: 1000;
                    background: white;
                    transition: left 0.3s ease;
                }
                .page-container {
                    padding: 16px;
                    padding-top: 86px;
                    flex: 1;
                    width: 100%;
                }
                .sidebar-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    z-index: 2500;
                }

                @media (min-width: 1025px) {
                    .main-content {
                        padding-left: 260px;
                    }
                    .header-wrapper-fixed {
                        left: 260px;
                    }
                    .page-container {
                        padding: 30px;
                        padding-top: 100px;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default MainLayout;
