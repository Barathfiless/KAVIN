import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Sprout, ShoppingBag, Star, MapPin, Search, Heart, Clock, ChevronLeft, Map as MapIcon, Locate, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Sub-component to handle map movement
const MapController = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

const CustomerDashboard = () => {
    const [viewMode, setViewMode] = React.useState('list');
    const [userLocation, setUserLocation] = React.useState(null);
    const [featuredCrops, setFeaturedCrops] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCrop, setSelectedCrop] = React.useState(null);
    const [orderSuccess, setOrderSuccess] = React.useState(null);
    const [orderForm, setOrderForm] = React.useState({ quantity: 1, address: '' });
    const [placing, setPlacing] = React.useState(false);
    const [detectingLocation, setDetectingLocation] = React.useState(false);
    const [farmerInfo, setFarmerInfo] = React.useState(null);
    const [farmerCrops, setFarmerCrops] = React.useState([]);
    const [loadingFarmer, setLoadingFarmer] = React.useState(false);
    const currentOrders = [];

    React.useEffect(() => {
        const fetchFarmerDetails = async () => {
            if (!selectedCrop) return;
            setLoadingFarmer(true);
            try {
                const id = selectedCrop.userId;
                const [userRes, cropsRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/auth/user/${id}`),
                    fetch(`http://localhost:5000/api/crops/${id}`)
                ]);
                const userData = await userRes.json();
                const cropData = await cropsRes.json();
                setFarmerInfo(userData);
                setFarmerCrops(Array.isArray(cropData) ? cropData : []);
            } catch (err) {
                console.error('Error fetching farmer details:', err);
            } finally {
                setLoadingFarmer(false);
            }
        };
        fetchFarmerDetails();
    }, [selectedCrop]);

    React.useEffect(() => {
        const fetchReadyCrops = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/crops/ready');
                const data = await response.json();
                
                // Add some pseudo-randomized local positions so they appear on the map for demo
                const localizedCrops = (Array.isArray(data) ? data : []).map((crop, idx) => ({
                    ...crop,
                    id: crop._id || idx,
                    distance: `${(2 + Math.random() * 5).toFixed(1)} km`,
                    rating: (4 + Math.random()).toFixed(1),
                    position: [
                        13.0827 + (Math.random() - 0.5) * 0.1, 
                        80.2707 + (Math.random() - 0.5) * 0.1
                    ],
                    farm: 'Local Farm' // In a full app, we'd join with the User/Farmer object
                }));

                setFeaturedCrops(localizedCrops);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching market crops: ", error);
                setLoading(false);
            }
        };
        fetchReadyCrops();
    }, []);

    const handleLocateUser = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    alert("Could not get your location. Please check browser permissions.");
                }
            );
        }
    };

    const detectAddress = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        
        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        setOrderForm(f => ({ ...f, address: data.display_name }));
                    } else {
                        alert('Could not find an address for this location.');
                    }
                } catch (err) {
                    console.error('Reverse geocoding error:', err);
                    alert('Error detecting address.');
                } finally {
                    setDetectingLocation(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                alert('Could not get your location. Please check browser permissions.');
                setDetectingLocation(false);
            }
        );
    };

    const getNumericPrice = (p) => {
        if (typeof p === 'number') return p;
        if (!p) return 0;
        return parseFloat(p.toString().replace(/[^\d.]/g, '')) || 0;
    };

    const handlePlaceOrder = async () => {
        if (!orderForm.address.trim()) { alert('Please enter your delivery address.'); return; }
        
        const unitPrice = getNumericPrice(selectedCrop.price);
        const totalPrice = unitPrice * orderForm.quantity;

        setPlacing(true);
        try {
            const payload = {
                customerId: localStorage.getItem('userId'),
                customerName: localStorage.getItem('userName') || 'Customer',
                customerPhone: '',
                farmerId: selectedCrop.userId,
                cropId: selectedCrop._id || selectedCrop.id,
                cropName: selectedCrop.name,
                quantity: orderForm.quantity,
                pricePerUnit: selectedCrop.price,
                totalPrice: totalPrice,
                address: orderForm.address,
            };
            const res = await fetch('http://localhost:5000/api/orders/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setOrderSuccess(data);
                setSelectedCrop(null);
                setOrderForm({ quantity: 1, address: '' });
            } else {
                alert(data.message || 'Order failed. Try again.');
            }
        } catch (err) {
            alert('Network error. Please try again.');
        }
        setPlacing(false);
    };

    const filteredCrops = featuredCrops.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.variety?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Custom Leaflet Marker Icon with MapPin
    const farmIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="color: #ffb703; transform: translate(-50%, -100%)">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2">
                       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                       <circle cx="12" cy="10" r="3" fill="white"></circle>
                   </svg>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="color: #3182ce; transform: translate(-50%, -50%)">
                   <div class="user-dot"></div>
                   <div class="user-pulse"></div>
               </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

    return (
        <div className="customer-dashboard">
            {/* Checkout Modal */}
            <AnimatePresence>
                {selectedCrop && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay" onClick={() => setSelectedCrop(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="checkout-modal" onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div>
                                    <div className="modal-icon-wrap"><Sprout size={32} color="var(--primary)" /></div>
                                    <h2>{selectedCrop.name}</h2>
                                    <p>{selectedCrop.variety && `${selectedCrop.variety} · `}{selectedCrop.price}</p>
                                </div>
                                <button className="modal-close" onClick={() => setSelectedCrop(null)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-grid-body">
                                    {/* Left: Farmer Details */}
                                    <div className="farmer-details-col">
                                        <div className="col-header">
                                            <MapPin size={18} color="var(--primary)" />
                                            <h3>Farmer Details</h3>
                                        </div>
                                        {loadingFarmer ? (
                                            <div className="loading-farmer-shimmer">
                                                <div className="shimmer-line"></div>
                                                <div className="shimmer-line w-75"></div>
                                                <div className="shimmer-line w-50"></div>
                                            </div>
                                        ) : (
                                            <div className="farmer-info-content">
                                                <div className="farmer-data-row">
                                                    <div className="f-data-label"><User size={14} /> Farmer Name</div>
                                                    <div className="f-data-value">{farmerInfo?.name || 'Farmer'}</div>
                                                </div>
                                                <div className="farmer-data-row">
                                                    <div className="f-data-label"><Phone size={14} /> Phone Number</div>
                                                    <div className="f-data-value">{farmerInfo?.phone || '+91 00000 00000'}</div>
                                                </div>
                                                <div className="farmer-data-row">
                                                    <div className="f-data-label"><MapPin size={14} /> Farmer Location</div>
                                                    <div className="f-data-value">{selectedCrop.location || 'Local Farm, Tamil Nadu'}</div>
                                                </div>
                                                <div className="farmer-crops-section">
                                                    <div className="f-data-label"><Sprout size={14} /> Currently Cultivating</div>
                                                    <div className="cultivating-tags">
                                                        {farmerCrops.map((c, i) => (
                                                            <span key={i} className="cultiv-tag">
                                                                <Sprout size={14} /> {c.name}
                                                            </span>
                                                        ))}
                                                        {farmerCrops.length === 0 && <span className="empty-sm">No other crops listed.</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Order details */}
                                    <div className="order-details-col">
                                        <div className="col-header">
                                            <ShoppingBag size={18} color="var(--primary)" />
                                            <h3>Order / Price Details</h3>
                                        </div>
                                        <label>Quantity</label>
                                        <div className="qty-control">
                                            <button onClick={() => orderForm.quantity > 1 && setOrderForm(f => ({...f, quantity: f.quantity - 1}))}>−</button>
                                            <span>{orderForm.quantity}</span>
                                            <button onClick={() => setOrderForm(f => ({...f, quantity: f.quantity + 1}))}>+</button>
                                        </div>
                                        
                                        <div className="label-with-action">
                                            <label>Delivery Address *</label>
                                            <button 
                                                type="button"
                                                className="detect-location-btn"
                                                onClick={detectAddress}
                                                disabled={detectingLocation}
                                            >
                                                <MapPin size={14} />
                                                {detectingLocation ? 'Detecting...' : 'Detect location'}
                                            </button>
                                        </div>
                                        <textarea 
                                            placeholder="Enter your full delivery address..."
                                            value={orderForm.address}
                                            onChange={e => setOrderForm(f => ({...f, address: e.target.value}))}
                                            rows={2}
                                        />

                                        <div className="price-summary">
                                            <div className="price-row">
                                                <span>Unit Price</span>
                                                <span>{selectedCrop.price}</span>
                                            </div>
                                            <div className="price-row">
                                                <span>Quantity</span>
                                                <span>x {orderForm.quantity}</span>
                                            </div>
                                            <div className="price-row total">
                                                <span>Total Amount</span>
                                                <span>₹{(getNumericPrice(selectedCrop.price) * orderForm.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                className="place-order-btn" 
                                onClick={handlePlaceOrder}
                                disabled={placing}
                            >
                                {placing ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Success Modal */}
            <AnimatePresence>
                {orderSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="modal-overlay"
                    >
                        <motion.div 
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                            className="success-modal"
                        >
                            <div className="success-icon"><CheckCircle size={64} color="#2d6a4f" /></div>
                            <h2>Order Placed!</h2>
                            <p>Your order for <strong>{orderSuccess.cropName}</strong> has been placed successfully. The farmer will confirm it shortly.</p>
                            <p className="order-id-tag">Order ID: #{orderSuccess._id?.slice(-8).toUpperCase()}</p>
                            <button className="place-order-btn" onClick={() => setOrderSuccess(null)}>Continue Shopping</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="dashboard-welcome">
                <div className="welcome-text">
                    <h1>Welcome to Harvest Hub</h1>
                </div>
                <div className="search-box" style={{ width: '450px' }}>
                    <Search size={20} color="#718096" />
                    <input 
                        type="text" 
                        placeholder="I'm looking for... (e.g. Tomatoes, Fresh Milk)" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="dashboard-grid">
                <section className="featured-section">
                    <div className="section-header">
                        <h2>{viewMode === 'list' ? 'Fresh Produce Near You' : 'Crop Locations'}</h2>
                        <button 
                            className="text-btn" 
                            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                        >
                            {viewMode === 'list' ? 'Explore Map' : 'Back to List'}
                        </button>
                    </div>
                    
                    <AnimatePresence mode="wait">
                        {viewMode === 'list' ? (
                            <motion.div 
                                key="list"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="farm-cards"
                            >
                                {loading ? (
                                    <div className="loading-shimmer">
                                        {[1,2,3].map(i => <div key={i} className="shimmer-card"></div>)}
                                    </div>
                                ) : filteredCrops.length > 0 ? filteredCrops.map((crop, index) => (
                                    <motion.div 
                                        key={crop.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="farm-card"
                                    >
                                        <div className="card-image-placeholder">
                                            <Sprout size={48} color="#2d6a4f" opacity={0.2} />
                                            <span className="crop-price-tag">{crop.price || 'Market Price'}</span>
                                        </div>
                                        <div className="card-info">
                                            <div className="card-top">
                                                <h3>{crop.name}</h3>
                                                <span className="distance-badge">{crop.distance}</span>
                                            </div>
                                            <p className="farm-origin">Qty: {crop.quantity} · {crop.variety || crop.type || 'Fresh Produce'}</p>
                                            <div className="card-meta">
                                                <div className="rating">
                                                    <Star size={16} fill="#ffb703" color="#ffb703" />
                                                    <span>{crop.rating}</span>
                                                </div>
                                                <button className="order-now-btn" onClick={() => { setSelectedCrop(crop); setOrderForm({ quantity: 1, address: '', notes: '' }); }}>Order Now</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <p className="empty-msg">{searchQuery ? `No results for "${searchQuery}"` : 'No fresh produce listed yet. Check back soon!'}</p>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="map"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="map-view-container"
                            >
                                <MapContainer 
                                    center={[13.0827, 80.2707]} 
                                    zoom={13} 
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                    attributionControl={false}
                                    zoomControl={true}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapController center={userLocation} />
                                    
                                    {userLocation && (
                                        <Marker position={userLocation} icon={userIcon}>
                                            <Popup>You are here</Popup>
                                        </Marker>
                                    )}

                                    {featuredCrops.map(crop => (
                                        <Marker 
                                            key={crop.id} 
                                            position={crop.position}
                                            icon={farmIcon}
                                        >
                                            <Popup>
                                                <div className="popup-card">
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{crop.name}</h4>
                                                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#718096' }}>from {crop.farm}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                        <span style={{ fontWeight: '700', color: '#ffb703' }}>{crop.price}</span>
                                                        <button 
                                                            style={{ background: '#ffb703', border: 'none', borderRadius: '6px', color: 'white', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCrop(crop);
                                                                setOrderForm({ quantity: 1, address: '' });
                                                            }}
                                                        >
                                                            Buy
                                                        </button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>

                                <button 
                                    className="locate-btn" 
                                    onClick={handleLocateUser}
                                    title="Go to my location"
                                >
                                    <Locate size={20} />
                                </button>

                                <div className="map-controls">
                                    <span>{userLocation ? 'Showing produce near you' : `Showing ${featuredCrops.length} live crop locations`}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <aside className="orders-sidebar">
                    <div className="section-header">
                        <h2>My Orders</h2>
                    </div>
                    <div className="orders-list">
                        {currentOrders.length > 0 ? currentOrders.map(order => (
                            <div key={order.id} className="order-item">
                                <div className="order-header">
                                    <span className="order-id">{order.id}</span>
                                    <span className="order-date">{order.date}</span>
                                </div>
                                <p className="order-item-name">{order.item}</p>
                                <div className="order-footer">
                                    <span className="order-status">{order.status}</span>
                                    <Clock size={16} />
                                </div>
                            </div>
                        )) : (
                            <p className="empty-msg">No active orders.</p>
                        )}
                    </div>
                    <button className="view-all-btn">View Order History</button>
                </aside>
            </div>

            <style>
                {`
                .customer-dashboard { display: flex; flex-direction: column; gap: 30px; }
                .dashboard-welcome {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .dashboard-welcome h1 { font-size: 2.2rem; color: #1a202c; font-family: 'Outfit', sans-serif; margin-bottom: 4px; }
                .dashboard-welcome p { color: #718096; font-size: 1rem; }

                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: white;
                    padding: 14px 24px;
                    border-radius: 16px;
                    border: 1.5px solid #edf2f7;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    width: 450px;
                    transition: all 0.3s;
                }
                .search-box:focus-within {
                    border-color: #ffb703;
                    box-shadow: 0 4px 20px rgba(255,183,3,0.15);
                }
                .search-box input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 1rem;
                    color: #2d3748;
                }

                .dashboard-grid { display: grid; grid-template-columns: 1fr 320px; gap: 30px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .section-header h2 { font-size: 1.4rem; color: #1a202c; }
                .text-btn { background: none; border: none; color: #ffb703; font-weight: 700; cursor: pointer; }

                .farm-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
                .farm-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #edf2f7; transition: transform 0.3s ease; }
                .farm-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                .card-image-placeholder { height: 160px; background: #fffcf2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-weight: 600; color: #718096; position: relative; }
                .crop-price-tag {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: white;
                    color: var(--primary-dark);
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 800;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .card-info { padding: 20px; }
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
                .card-info h3 { font-size: 1.15rem; color: #1a202c; margin: 0; }
                .distance-badge { font-size: 0.75rem; color: #718096; font-weight: 600; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; }
                .farm-origin { font-size: 0.85rem; color: #718096; margin-bottom: 15px; }
                .card-meta { display: flex; justify-content: space-between; align-items: center; }
                .rating { display: flex; align-items: center; gap: 5px; font-weight: 700; color: #1a202c; }
                .order-now-btn { 
                    background: #ffb703; 
                    border: none; 
                    color: white; 
                    padding: 8px 16px; 
                    border-radius: 10px; 
                    font-weight: 700; 
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .order-now-btn:hover { background: #e6a600; transform: scale(1.05); }

                .orders-sidebar { background: white; padding: 25px; border-radius: 20px; border: 1px solid #edf2f7; height: fit-content; }
                .orders-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; }
                .order-item { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #edf2f7; }
                .order-header { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 8px; }
                .order-id { font-weight: 700; color: #ffb703; }
                .order-date { color: #a0aec0; }
                .order-item-name { font-weight: 600; color: #2d3748; margin-bottom: 12px; }
                .order-footer { display: flex; justify-content: space-between; align-items: center; color: var(--primary); }
                .order-status { font-size: 0.85rem; font-weight: 700; }
                .empty-msg { color: #a0aec0; text-align: center; padding: 20px; font-style: italic; font-size: 0.9rem; }
                .view-all-btn { width: 100%; padding: 12px; background: #ffb703; border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; }

                /* Loading shimmer */
                .loading-shimmer { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; width: 100%; }
                .shimmer-card { height: 280px; border-radius: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

                /* Checkout Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
                .checkout-modal { background: white; border-radius: 28px; width: 750px; max-width: 95vw; padding: 28px; box-shadow: 0 30px 80px rgba(0,0,0,0.2); }
                .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid #edf2f7; padding-bottom: 15px; }
                .modal-icon-wrap { background: #f0fff4; width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
                .modal-header h2 { margin: 0; font-size: 1.5rem; color: #1a202c; }
                .modal-header p { margin: 4px 0 0; color: #718096; }
                .modal-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; color: #4a5568; }
                
                .modal-body { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
                .modal-grid-body { display: grid; grid-template-columns: 1fr 1.1fr; gap: 24px; }
                
                .col-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
                .col-header h3 { font-size: 1rem; color: #4a5568; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; }
                
                .farmer-info-content { display: flex; flex-direction: column; gap: 15px; margin-top: 5px; }
                .farmer-data-row { display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
                .farmer-data-row:last-of-type { border-bottom: none; }
                
                .f-data-label { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #a0aec0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
                .f-data-value { font-size: 1.05rem; font-weight: 700; color: #1a202c; padding-left: 22px; }
                
                .farmer-crops-section { margin-top: 5px; }
                .cultivating-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; padding-left: 22px; }
                .cultiv-tag { background: #f0fff4; color: #2d6a4f; padding: 5px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; border: 1px solid #c6f6d5; box-shadow: 0 2px 4px rgba(45,106,79,0.05); }
                .empty-sm { font-size: 0.8rem; color: #a0aec0; font-style: italic; }

                .farmer-details-col { background: white; padding: 22px; border-radius: 20px; border: 1.5px solid #edf2f7; }
                
                .modal-body label { font-weight: 700; color: #2d3748; font-size: 0.85rem; }
                .modal-body textarea, .modal-body input[type=text] { width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 1rem; outline: none; font-family: inherit; resize: none; box-sizing: border-box; }
                .modal-body textarea:focus, .modal-body input[type=text]:focus { border-color: #ffb703; box-shadow: 0 0 0 3px rgba(255,183,3,0.15); }
                .qty-control { display: flex; align-items: center; gap: 0; background: #f7fafc; border-radius: 12px; overflow: hidden; width: fit-content; border: 1.5px solid #e2e8f0; }
                .qty-control button { background: none; border: none; padding: 10px 18px; font-size: 1.4rem; cursor: pointer; color: #2d6a4f; font-weight: bold; }
                .qty-control span { font-size: 1.2rem; font-weight: 800; padding: 0 20px; color: #1a202c; }
                .place-order-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #2d6a4f, #40916c); border: none; border-radius: 16px; color: white; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: all 0.3s; }
                .place-order-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(45,106,79,0.4); }
                .place-order-btn:disabled { background: #a0aec0; cursor: not-allowed; transform: none; }

                /* Success Modal */
                .success-modal { background: white; border-radius: 28px; width: 400px; max-width: 95vw; padding: 48px 36px; text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.2); }
                .success-icon { font-size: 4rem; margin-bottom: 16px; }
                .success-modal h2 { font-size: 2rem; color: #2d6a4f; margin-bottom: 12px; }
                .success-modal p { color: #4a5568; line-height: 1.6; margin-bottom: 8px; }
                .order-id-tag { background: #f0fff4; color: #2d6a4f; padding: 8px 20px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; display: inline-block; margin: 12px 0 24px; }

                .label-with-action { display: flex; justify-content: space-between; align-items: center; }
                .label-with-action label { margin-bottom: 0; }
                .detect-location-btn { 
                    display: flex; 
                    align-items: center; 
                    gap: 6px; 
                    border: none; 
                    background: #ebf8ff; 
                    color: #2b6cb0; 
                    font-size: 0.72rem; 
                    font-weight: 700; 
                    padding: 4px 10px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }
                .detect-location-btn:hover { background: #bee3f8; transform: translateY(-1px); }
                .detect-location-btn:active { transform: translateY(0); }
                .detect-location-btn:disabled { background: #edf2f7; color: #a0aec0; cursor: wait; }

                .price-summary {
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 10px;
                    border: 1px dashed #e2e8f0;
                }
                .price-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: #718096;
                    font-weight: 500;
                }
                .price-row.total {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #e2e8f0;
                    color: #1a202c;
                    font-weight: 800;
                    font-size: 1.1rem;
                }
                .price-row.total span:last-child {
                    color: #2d6a4f;
                }

                .loading-farmer-shimmer { display: flex; flex-direction: column; gap: 12px; }
                .shimmer-line { height: 16px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
                .w-75 { width: 75%; }
                .w-50 { width: 50%; }

                .map-view-container {
                    position: relative;
                    width: 100%;
                    height: 500px;
                    background: #f1f5f9;
                    border-radius: 24px;
                    overflow: hidden;
                    border: 1px solid #edf2f7;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
                }
                .map-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .map-marker {
                    position: absolute;
                    transform: translate(-50%, -100%);
                    cursor: pointer;
                    z-index: 10;
                }
                .marker-content {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .marker-tooltip {
                    position: absolute;
                    bottom: 100%;
                    white-space: nowrap;
                    background: rgba(26, 32, 44, 0.9);
                    color: white;
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s;
                    pointer-events: none;
                }
                .map-marker:hover .marker-tooltip {
                    opacity: 1;
                    transform: translateY(0);
                }
                .map-controls {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    background: white;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #4a5568;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    z-index: 1000;
                }
                .locate-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: white;
                    border: 1px solid #edf2f7;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #4a5568;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    z-index: 1000;
                    transition: all 0.2s;
                }
                .locate-btn:hover {
                    color: #3182ce;
                    transform: scale(1.05);
                }
                .user-dot {
                    width: 14px;
                    height: 14px;
                    background: #3182ce;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.2);
                }
                .user-pulse {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: rgba(49, 130, 206, 0.4);
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
                `}
            </style>
        </div>
    );
};

export default CustomerDashboard;
