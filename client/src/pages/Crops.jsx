import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Filter, MoreVertical, 
    Edit2, Trash2, Eye, Sprout, 
    CheckCircle, AlertCircle, Clock 
} from 'lucide-react';

const Crops = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [crops, setCrops] = useState([
        { id: 1, name: 'Organic Tomatoes', variety: 'Roma', quantity: '500 kg', price: '₹40/kg', status: 'Ready', image: '🍅' },
        { id: 2, name: 'Basmati Rice', variety: 'Long Grain', quantity: '2000 kg', price: '₹85/kg', status: 'Pending', image: '🌾' },
        { id: 3, name: 'Golden Wheat', variety: 'Sharbati', quantity: '1500 kg', price: '₹25/kg', status: 'Growing', image: '🚜' },
        { id: 4, name: 'Green Chillies', variety: 'G4', quantity: '100 kg', price: '₹60/kg', status: 'Ready', image: '🌶️' },
        { id: 5, name: 'Red Onions', variety: 'Nasik', quantity: '800 kg', price: '₹30/kg', status: 'Out of Stock', image: '🧅' },
    ]);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Ready': return { bg: '#d8f3dc', text: '#2d6a4f', icon: <CheckCircle size={14} /> };
            case 'Growing': return { bg: '#e9ecef', text: '#495057', icon: <Clock size={14} /> };
            case 'Pending': return { bg: '#fff3cd', text: '#856404', icon: <AlertCircle size={14} /> };
            case 'Out of Stock': return { bg: '#f8d7da', text: '#721c24', icon: <AlertCircle size={14} /> };
            default: return { bg: '#eee', text: '#333' };
        }
    };

    return (
        <div className="crops-page">
            <header className="page-header">
                <div className="title-area">
                    <h1>Crop Management</h1>
                    <p>Manage your harvest listings and inventory in one place.</p>
                </div>
                <button className="btn-primary add-btn">
                    <Plus size={20} />
                    <span>Add New Crop</span>
                </button>
            </header>

            <div className="filter-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search crops or varieties..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="actions">
                    <button className="btn-secondary">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <div className="view-toggle">
                        <button className="active">List</button>
                        <button>Grid</button>
                    </div>
                </div>
            </div>

            <div className="list-container">
                <div className="list-header">
                    <div className="col crop">Crop Details</div>
                    <div className="col quantity">Quantity</div>
                    <div className="col price">Market Price</div>
                    <div className="col status">Status</div>
                    <div className="col actions">Actions</div>
                </div>

                <AnimatePresence>
                    {crops.map((crop, index) => (
                        <motion.div 
                            key={crop.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="crop-item"
                        >
                            <div className="col crop">
                                <div className="crop-icon">{crop.image}</div>
                                <div className="crop-info">
                                    <span className="crop-name">{crop.name}</span>
                                    <span className="crop-variety">{crop.variety}</span>
                                </div>
                            </div>
                            <div className="col quantity">
                                <span className="value">{crop.quantity}</span>
                            </div>
                            <div className="col price">
                                <span className="value">{crop.price}</span>
                            </div>
                            <div className="col status">
                                <span 
                                    className="status-badge" 
                                    style={{ 
                                        backgroundColor: getStatusStyle(crop.status).bg,
                                        color: getStatusStyle(crop.status).text
                                    }}
                                >
                                    {getStatusStyle(crop.status).icon}
                                    {crop.status}
                                </span>
                            </div>
                            <div className="col actions">
                                <div className="action-buttons">
                                    <button className="action-btn" title="View"><Eye size={18} /></button>
                                    <button className="action-btn" title="Edit"><Edit2 size={18} /></button>
                                    <button className="action-btn delete" title="Delete"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <style>
                {`
                .crops-page { display: flex; flex-direction: column; gap: 25px; }
                .page-header { display: flex; justify-content: space-between; align-items: center; }
                .title-area h1 { font-size: 2rem; color: var(--primary-dark); margin-bottom: 4px; }
                .title-area p { color: var(--text-muted); }
                
                .add-btn { box-shadow: 0 4px 15px rgba(45, 106, 79, 0.2); }

                .filter-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    padding: 16px 20px;
                    border-radius: 16px;
                    border: 1px solid #edf2f7;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
                }
                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f8fafc;
                    padding: 10px 16px;
                    border-radius: 12px;
                    width: 350px;
                    border: 1px solid #e2e8f0;
                }
                .search-box input {
                    background: transparent;
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 0.95rem;
                }
                .search-box svg { color: #a0aec0; }
                
                .actions { display: flex; gap: 15px; align-items: center; }
                .btn-secondary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 12px;
                    font-weight: 600;
                    color: #4a5568;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e0; }
                
                .view-toggle {
                    display: flex;
                    background: #f1f3f1;
                    padding: 4px;
                    border-radius: 10px;
                }
                .view-toggle button {
                    padding: 6px 16px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: #718096;
                }
                .view-toggle button.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .list-container {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #edf2f7;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .list-header {
                    display: flex;
                    background: #f8fafc;
                    padding: 16px 24px;
                    border-bottom: 1px solid #edf2f7;
                    color: #718096;
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .col { flex: 1; display: flex; align-items: center; }
                .col.crop { flex: 2; }
                .col.actions { justify-content: flex-end; }

                .crop-item {
                    display: flex;
                    padding: 20px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.2s;
                    align-items: center;
                }
                .crop-item:last-child { border-bottom: none; }
                .crop-item:hover { background: #fbfcfd; }

                .crop-icon {
                    width: 48px;
                    height: 48px;
                    background: #f1f5f9;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    margin-right: 16px;
                }
                .crop-info { display: flex; flex-direction: column; }
                .crop-name { font-weight: 700; color: #1a202c; font-size: 1rem; }
                .crop-variety { font-size: 0.85rem; color: #718096; }

                .value { font-weight: 600; color: #2d3748; }
                
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .action-buttons { display: flex; gap: 8px; }
                .action-btn {
                    padding: 8px;
                    border: none;
                    background: #f8fafc;
                    color: #718096;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:hover { background: #edf2f7; color: var(--primary); }
                .action-btn.delete:hover { background: #fff5f5; color: #e53e3e; }
                `}
            </style>
        </div>
    );
};

export default Crops;
