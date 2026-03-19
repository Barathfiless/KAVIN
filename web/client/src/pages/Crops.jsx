import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Filter, 
    Edit2, Trash2, Eye, Sprout, 
    CheckCircle, AlertCircle, Clock, X, ChevronDown, LayoutList, LayoutGrid
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const STATUS_OPTIONS = ['All', 'Ready', 'Growing', 'Pending', 'Out of Stock'];

const Crops = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [showFilter, setShowFilter] = useState(false);
    const filterRef = useRef(null);

    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [newCrop, setNewCrop] = useState({
        name: '', variety: '', quantity: '', price: '', status: 'Ready'
    });

    useEffect(() => {
        fetchCrops();
    }, []);

    // Close filter dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilter(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchCrops = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const res = await axios.get(`http://localhost:5000/api/crops/${userId}`);
                setCrops(res.data);
            }
        } catch (err) {
            console.error("Error fetching crops:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCrop = async (e) => {
        e.preventDefault();
        try {
            const userId = localStorage.getItem('userId');
            if (editingId) {
                // UPDATE
                await axios.put(`http://localhost:5000/api/crops/${editingId}`, newCrop);
            } else {
                // CREATE
                await axios.post('http://localhost:5000/api/crops/add', {
                    ...newCrop,
                    userId,
                    icon: '🌱'
                });
            }
            closeModal();
            fetchCrops();
        } catch (err) {
            console.error("Error saving crop:", err);
            alert("Failed to save crop. Please try again.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this crop?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/crops/${id}`);
            fetchCrops();
        } catch (err) {
            console.error("Error deleting crop:", err);
            alert("Failed to delete crop.");
        }
    };

    const openEditModal = (crop) => {
        setEditingId(crop._id);
        setIsViewOnly(false);
        setNewCrop({
            name: crop.name,
            variety: crop.variety || '',
            quantity: crop.quantity,
            price: crop.price,
            status: crop.status
        });
        setShowModal(true);
    };

    const openViewModal = (crop) => {
        setEditingId(null);
        setIsViewOnly(true);
        setNewCrop({
            name: crop.name,
            variety: crop.variety || '',
            quantity: crop.quantity,
            price: crop.price,
            status: crop.status
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingId(null);
        setIsViewOnly(false);
        setNewCrop({ name: '', variety: '', quantity: '', price: '', status: 'Ready' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setIsViewOnly(false);
        setNewCrop({ name: '', variety: '', quantity: '', price: '', status: 'Ready' });
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Ready': return { bg: '#d8f3dc', text: '#2d6a4f', icon: <CheckCircle size={14} /> };
            case 'Growing': return { bg: '#e9ecef', text: '#495057', icon: <Clock size={14} /> };
            case 'Pending': return { bg: '#fff3cd', text: '#856404', icon: <AlertCircle size={14} /> };
            case 'Out of Stock': return { bg: '#f8d7da', text: '#721c24', icon: <AlertCircle size={14} /> };
            default: return { bg: '#eee', text: '#333', icon: null };
        }
    };

    // Filtered crops: search by name or variety, then filter by status
    const filteredCrops = crops.filter(c => {
        const matchSearch = 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.variety && c.variety.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchStatus = selectedStatus === 'All' || c.status === selectedStatus;
        return matchSearch && matchStatus;
    });

    const activeFilters = selectedStatus !== 'All' ? 1 : 0;

    return (
        <div className="crops-page">
            {/* ── Header row: Search + Filter + View Toggle + Add ── */}
            <header className="page-header">
                {/* Search box */}
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t.searchCrops || 'Search crops or varieties...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Right-side controls */}
                <div className="header-controls">
                    {/* Filter dropdown */}
                    <div className="filter-wrapper" ref={filterRef}>
                        <button
                            className={`btn-secondary ${activeFilters > 0 ? 'filter-active' : ''}`}
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <Filter size={18} />
                            <span>Filter</span>
                            {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
                            <ChevronDown size={14} className={showFilter ? 'rotate-180' : ''} />
                        </button>
                        <AnimatePresence>
                            {showFilter && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="filter-dropdown"
                                >
                                    <p className="filter-label">Filter by Status</p>
                                    {STATUS_OPTIONS.map(s => (
                                        <button
                                            key={s}
                                            className={`filter-option ${selectedStatus === s ? 'active' : ''}`}
                                            onClick={() => { setSelectedStatus(s); setShowFilter(false); }}
                                        >
                                            {s !== 'All' && (
                                                <span
                                                    className="dot"
                                                    style={{ background: getStatusStyle(s).text }}
                                                />
                                            )}
                                            {s}
                                            {selectedStatus === s && <CheckCircle size={14} />}
                                        </button>
                                    ))}
                                    {activeFilters > 0 && (
                                        <button
                                            className="clear-filter"
                                            onClick={() => { setSelectedStatus('All'); setShowFilter(false); }}
                                        >
                                            Clear filter
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* List / Grid toggle */}
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                            title="List view"
                        >
                            <LayoutList size={16} />
                            List
                        </button>
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                            title="Grid view"
                        >
                            <LayoutGrid size={16} />
                            Grid
                        </button>
                    </div>

                    {/* Add New Crop */}
                    <button className="btn-primary add-btn" onClick={openAddModal}>
                        <Plus size={20} />
                        <span>{t.addCrop || 'Add New Crop'}</span>
                    </button>
                </div>
            </header>

            {/* ── Active filter chip ── */}
            {selectedStatus !== 'All' && (
                <div className="active-filter-chips">
                    <span className="chip">
                        Status: {selectedStatus}
                        <button onClick={() => setSelectedStatus('All')}><X size={12} /></button>
                    </span>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{isViewOnly ? 'Crop Details' : (editingId ? 'Edit Crop' : 'Add New Crop')}</h2>
                        <form onSubmit={handleAddCrop}>
                            <div className="form-group">
                                <label>Crop Name</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isViewOnly}
                                    value={newCrop.name}
                                    onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                                    placeholder="e.g. Tomato"
                                />
                            </div>
                            <div className="form-group">
                                <label>Variety</label>
                                <input
                                    type="text"
                                    disabled={isViewOnly}
                                    value={newCrop.variety}
                                    onChange={(e) => setNewCrop({...newCrop, variety: e.target.value})}
                                    placeholder="e.g. Roma"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        disabled={isViewOnly}
                                        value={newCrop.quantity}
                                        onChange={(e) => setNewCrop({...newCrop, quantity: e.target.value})}
                                        placeholder="e.g. 50"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        disabled={isViewOnly}
                                        value={newCrop.price}
                                        onChange={(e) => setNewCrop({...newCrop, price: e.target.value})}
                                        placeholder="e.g. 40"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select 
                                    className="status-select"
                                    disabled={isViewOnly}
                                    value={newCrop.status}
                                    onChange={(e) => setNewCrop({...newCrop, status: e.target.value})}
                                >
                                    {STATUS_OPTIONS.filter(s => s !== 'All').map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    {isViewOnly ? 'Close' : 'Cancel'}
                                </button>
                                {!isViewOnly && (
                                    <button type="submit" className="btn-primary">
                                        {editingId ? 'Update Crop' : 'Add Crop'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── List View ── */}
            {viewMode === 'list' && (
                <div className="list-container">
                    <div className="list-header">
                        <div className="col crop">Crop Details</div>
                        <div className="col quantity">Quantity</div>
                        <div className="col price">Market Price</div>
                        <div className="col status">Status</div>
                        <div className="col actions">Actions</div>
                    </div>

                    <AnimatePresence>
                        {loading ? (
                            <div className="empty-state">
                                <Clock className="spin-icon" size={48} />
                                <p>Loading your harvest...</p>
                            </div>
                        ) : filteredCrops.length > 0 ? filteredCrops.map((crop, index) => (
                            <motion.div
                                key={crop._id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ delay: index * 0.04 }}
                                className="crop-item"
                            >
                                <div className="col crop">
                                    <div className="crop-icon">{crop.icon || '🌱'}</div>
                                    <div className="crop-info">
                                        <span className="crop-name">{crop.name}</span>
                                        <span className="crop-variety">{crop.variety}</span>
                                    </div>
                                </div>
                                <div className="col quantity"><span className="value">{crop.quantity}</span></div>
                                <div className="col price"><span className="value">{crop.price}</span></div>
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
                                        <button className="action-btn" title="View" onClick={() => openViewModal(crop)}><Eye size={18} /></button>
                                        <button className="action-btn" title="Edit" onClick={() => openEditModal(crop)}><Edit2 size={18} /></button>
                                        <button className="action-btn delete" title="Delete" onClick={() => handleDelete(crop._id)}><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="empty-state">
                                <Sprout size={48} />
                                <p>
                                    {searchTerm || selectedStatus !== 'All'
                                        ? `No crops match your search or filter.`
                                        : t.noCrops || 'No crops listed yet. Start by adding your first harvest!'}
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ── Grid View ── */}
            {viewMode === 'grid' && (
                <div className="grid-container">
                    {loading ? (
                        <div className="empty-state">
                            <Clock size={48} />
                            <p>Loading your harvest...</p>
                        </div>
                    ) : filteredCrops.length > 0 ? filteredCrops.map((crop, index) => (
                        <motion.div
                            key={crop._id || index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="grid-card"
                        >
                            <div className="grid-crop-icon">{crop.icon || '🌱'}</div>
                            <div className="grid-crop-name">{crop.name}</div>
                            <div className="grid-crop-variety">{crop.variety}</div>
                            <div className="grid-meta">
                                <span>{crop.quantity}</span>
                                <span>{crop.price}</span>
                            </div>
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
                            <div className="action-buttons" style={{ marginTop: '12px' }}>
                                <button className="action-btn" title="View" onClick={() => openViewModal(crop)}><Eye size={18} /></button>
                                <button className="action-btn" title="Edit" onClick={() => openEditModal(crop)}><Edit2 size={18} /></button>
                                <button className="action-btn delete" title="Delete" onClick={() => handleDelete(crop._id)}><Trash2 size={18} /></button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <Sprout size={48} />
                            <p>
                                {searchTerm || selectedStatus !== 'All'
                                    ? 'No crops match your search or filter.'
                                    : t.noCrops || 'No crops listed yet. Start by adding your first harvest!'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .crops-page { display: flex; flex-direction: column; gap: 20px; }

                /* ── Header ── */
                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: white;
                    padding: 10px 16px;
                    border-radius: 12px;
                    flex: 1;
                    min-width: 200px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                    transition: border-color 0.2s;
                }
                .search-box:focus-within { border-color: var(--primary); }
                .search-box svg { color: #a0aec0; flex-shrink: 0; }
                .search-box input {
                    background: transparent;
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 0.95rem;
                    color: #2d3748;
                }
                .clear-search {
                    background: none; border: none; color: #a0aec0;
                    cursor: pointer; display: flex; align-items: center;
                    padding: 2px;
                    border-radius: 50%;
                }
                .clear-search:hover { color: #e53e3e; background: #fff5f5; }

                .header-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                }

                /* ── Filter ── */
                .filter-wrapper { position: relative; }
                .btn-secondary {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 16px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #4a5568;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .btn-secondary:hover { background: #f8fafc; border-color: var(--primary); color: var(--primary); }
                .btn-secondary.filter-active { border-color: var(--primary); color: var(--primary); background: #f0fff4; }
                .filter-badge {
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    width: 18px; height: 18px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.7rem;
                }
                .rotate-180 { transform: rotate(180deg); transition: transform 0.2s; }

                .filter-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                    padding: 10px;
                    min-width: 180px;
                    z-index: 200;
                }
                .filter-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #a0aec0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 4px 8px 8px;
                }
                .filter-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 9px 12px;
                    border: none;
                    background: none;
                    border-radius: 9px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #4a5568;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .filter-option:hover { background: #f8fafc; }
                .filter-option.active { background: #f0fff4; color: var(--primary); font-weight: 700; }
                .dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .clear-filter {
                    display: block;
                    width: 100%;
                    margin-top: 6px;
                    padding: 8px 12px;
                    border: none;
                    background: #fff5f5;
                    color: #e53e3e;
                    border-radius: 9px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .clear-filter:hover { background: #fed7d7; }

                /* ── View Toggle ── */
                .view-toggle {
                    display: flex;
                    background: #f1f3f1;
                    padding: 4px;
                    border-radius: 10px;
                    gap: 2px;
                }
                .view-toggle button {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 6px 12px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: #718096;
                    transition: all 0.2s;
                }
                .view-toggle button.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.06);
                }

                /* ── Active filter chips ── */
                .active-filter-chips { display: flex; gap: 8px; }
                .chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #f0fff4;
                    color: var(--primary);
                    border: 1px solid #c6f6d5;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .chip button {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                /* ── List View ── */
                .list-container {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #edf2f7;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }
                .list-header {
                    display: flex;
                    background: #f8fafc;
                    padding: 16px 24px;
                    border-bottom: 1px solid #edf2f7;
                    color: #718096;
                    font-size: 0.82rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .col { flex: 1; display: flex; align-items: center; }
                .col.crop { flex: 2.5; }
                .col.quantity, .col.price, .col.status { justify-content: center; }
                .col.actions { justify-content: flex-end; }
                .crop-item {
                    display: flex;
                    padding: 18px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.15s;
                    align-items: center;
                }
                .crop-item:last-child { border-bottom: none; }
                .crop-item:hover { background: #fbfcfd; }
                .crop-icon {
                    width: 46px; height: 46px;
                    background: #f1f5f9;
                    border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.4rem;
                    margin-right: 14px;
                }
                .crop-info { display: flex; flex-direction: column; }
                .crop-name { font-weight: 700; color: #1a202c; }
                .crop-variety { font-size: 0.83rem; color: #718096; }
                .value { font-weight: 600; color: #2d3748; }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 700;
                }
                .action-buttons { display: flex; gap: 6px; }
                .action-btn {
                    padding: 7px;
                    border: none;
                    background: #f8fafc;
                    color: #718096;
                    border-radius: 9px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                }
                .action-btn:hover { background: #edf2f7; color: var(--primary); }
                .action-btn.delete:hover { background: #fff5f5; color: #e53e3e; }

                /* ── Grid View ── */
                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 18px;
                }
                .grid-card {
                    background: white;
                    border-radius: 18px;
                    border: 1px solid #edf2f7;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: box-shadow 0.2s, transform 0.2s;
                }
                .grid-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
                .grid-crop-icon {
                    width: 60px; height: 60px;
                    background: #f0fff4;
                    border-radius: 18px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.8rem;
                }
                .grid-crop-name { font-weight: 800; color: #1a202c; font-size: 1rem; }
                .grid-crop-variety { font-size: 0.82rem; color: #718096; }
                .grid-meta {
                    display: flex; gap: 10px;
                    font-size: 0.82rem; font-weight: 600; color: #4a5568;
                }

                /* ── Empty State ── */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    color: #a0aec0;
                    gap: 14px;
                }
                .empty-state p { font-weight: 500; font-style: italic; font-size: 0.95rem; }

                /* ── Modal ── */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white;
                    padding: 32px;
                    border-radius: 24px;
                    width: 460px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
                }
                .modal-content h2 { color: var(--primary-dark); margin-bottom: 24px; font-size: 1.4rem; }
                .form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
                .form-group label { font-weight: 600; color: #4a5568; font-size: 0.88rem; }
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 11px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 11px;
                    outline: none;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                    background: white;
                }
                .form-group input:focus, .form-group select:focus { border-color: var(--primary); }
                .form-row { display: flex; gap: 14px; }
                .form-row .form-group { flex: 1; margin-bottom: 0; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
                .add-btn { box-shadow: 0 4px 12px rgba(45,106,79,0.2); white-space: nowrap; }
            `}</style>
        </div>
    );
};

export default Crops;
