import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './components/AuthPage'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import Crops from './pages/Crops'
import MyListings from './pages/MyListings'
import FarmerForum from './pages/FarmerForum'
import Settings from './pages/Settings'
import Seasonal from './pages/Seasonal'
import Orders from './pages/Orders'
import FavoriteFarms from './pages/FavoriteFarms'
import Reviews from './pages/Reviews'
import FarmerOrders from './pages/FarmerOrders'
import EnergyPlanner from './pages/EnergyPlanner'
import { LanguageProvider } from './context/LanguageContext'

const TabRedirect = ({ element }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return element;
};

const RoleBasedRedirect = ({ farmerPath, customerPath }) => {
  const role = localStorage.getItem('role') || 'farmer';
  return <Navigate to={role === 'farmer' ? farmerPath : customerPath} replace />;
};

import AIChatAssistant from './components/AIChatAssistant'

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          
          <Route element={<MainLayout />}>
            <Route path="/farmer/dashboard" element={<Dashboard />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            
            {/* Farmer Specific Routes */}
            <Route path="/farmer/crops" element={<TabRedirect element={<Crops />} />} />
            <Route path="/farmer/listings" element={<TabRedirect element={<MyListings />} />} />
            <Route path="/farmer/orders" element={<TabRedirect element={<FarmerOrders />} />} />
            <Route path="/farmer/community" element={<TabRedirect element={<FarmerForum />} />} />
            <Route path="/farmer/seasonal" element={<TabRedirect element={<Seasonal />} />} />
            <Route path="/farmer/planner" element={<TabRedirect element={<EnergyPlanner />} />} />
            
            {/* Customer Specific Routes */}
            <Route path="/customer/orders" element={<TabRedirect element={<Orders />} />} />
            <Route path="/customer/favorites" element={<TabRedirect element={<FavoriteFarms />} />} />
            <Route path="/customer/reviews" element={<TabRedirect element={<Reviews />} />} />
            
            <Route path="/farmer/settings" element={<TabRedirect element={<Settings />} />} />
            <Route path="/customer/settings" element={<TabRedirect element={<Settings />} />} />
            
            {/* Redirect other non-existent routes to role-specific dashboard if logged in */}
            <Route path="*" element={<RoleBasedRedirect farmerPath="/farmer/dashboard" customerPath="/customer/dashboard" />} />
          </Route>
        </Routes>
        <AIChatAssistant />
      </div>
    </Router>
  </LanguageProvider>
  )
}

export default App
