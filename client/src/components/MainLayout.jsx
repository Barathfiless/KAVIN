import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const token = localStorage.getItem('token');

    // Simple auth check
    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <main className="main-content">
                <Header />
                <div className="page-container">
                    <Outlet />
                </div>
            </main>

            <style>
                {`
                .layout-wrapper {
                    display: flex;
                    min-height: 100vh;
                    background: #f8fafc;
                }
                .main-content {
                    flex: 1;
                    margin-left: 260px; /* Width of Sidebar */
                    display: flex;
                    flex-direction: column;
                }
                .page-container {
                    padding: 30px;
                    flex: 1;
                }
                `}
            </style>
        </div>
    );
};

export default MainLayout;
