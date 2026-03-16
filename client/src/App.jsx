import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './components/AuthPage'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import Crops from './pages/Crops'

const DashboardRouter = () => {
  const role = localStorage.getItem('role') || 'farmer';
  return role === 'farmer' ? <Dashboard /> : <CustomerDashboard />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/crops" element={<Crops />} />
            {/* Redirect other non-existent routes to dashboard if logged in */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
