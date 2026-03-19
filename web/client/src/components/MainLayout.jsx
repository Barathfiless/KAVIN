import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const token = localStorage.getItem('token');

    // Token is permanent — only cleared on logout
    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <main className="main-content">
                <div className="header-wrapper-fixed">
                    <Header />
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
                }
                .main-content {
                    padding-left: 260px; /* Width of Sidebar */
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                .header-wrapper-fixed {
                    position: fixed;
                    top: 0;
                    right: 0;
                    left: 260px;
                    z-index: 1100;
                    background: white;
                }
                .page-container {
                    padding: 30px;
                    padding-top: 100px; /* Header height + gap */
                    flex: 1;
                }
                `}
            </style>
        </div>
    );
};

export default MainLayout;
