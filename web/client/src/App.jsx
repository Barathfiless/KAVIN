import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
  return <Navigate to={role === 'customer' ? customerPath : farmerPath} replace />;
};

const SessionProtector = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  
  if (!token) return <Navigate to="/" replace />;
  
  // Tab Independence: 
  // We allow each tab to function independently based on its URL path.
  // As long as the user is logged in, we let the portal mode (Header/Sidebar)
  // be decided by the location.pathname, not a global role state.
  return children;
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
            <Route path="/farmer/dashboard" element={<SessionProtector requiredRole="farmer"><Dashboard /></SessionProtector>} />
            <Route path="/customer/dashboard" element={<SessionProtector requiredRole="customer"><CustomerDashboard /></SessionProtector>} />
            
            {/* Farmer Specific Routes */}
            <Route path="/farmer/crops" element={<SessionProtector requiredRole="farmer"><Crops /></SessionProtector>} />
            <Route path="/farmer/listings" element={<SessionProtector requiredRole="farmer"><MyListings /></SessionProtector>} />
            <Route path="/farmer/orders" element={<SessionProtector requiredRole="farmer"><FarmerOrders /></SessionProtector>} />
            <Route path="/farmer/community" element={<SessionProtector requiredRole="farmer"><FarmerForum /></SessionProtector>} />
            <Route path="/farmer/seasonal" element={<SessionProtector requiredRole="farmer"><Seasonal /></SessionProtector>} />
            <Route path="/farmer/planner" element={<SessionProtector requiredRole="farmer"><EnergyPlanner /></SessionProtector>} />
            
            {/* Customer Specific Routes */}
            <Route path="/customer/orders" element={<SessionProtector requiredRole="customer"><Orders /></SessionProtector>} />
            <Route path="/customer/favorites" element={<SessionProtector requiredRole="customer"><FavoriteFarms /></SessionProtector>} />
            <Route path="/customer/reviews" element={<SessionProtector requiredRole="customer"><Reviews /></SessionProtector>} />
            <Route path="/customer/community" element={<SessionProtector requiredRole="customer"><FarmerForum /></SessionProtector>} />
            
            <Route path="/farmer/settings" element={<SessionProtector requiredRole="farmer"><Settings /></SessionProtector>} />
            <Route path="/customer/settings" element={<SessionProtector requiredRole="customer"><Settings /></SessionProtector>} />
          </Route>  
            {/* Redirect other non-existent routes to role-specific dashboard if logged in */}
            <Route path="*" element={<RoleBasedRedirect farmerPath="/farmer/dashboard" customerPath="/customer/dashboard" />} />
        </Routes>
        <AIChatAssistant />
      </div>
    </Router>
  </LanguageProvider>
  )
}

export default App
