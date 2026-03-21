import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Sun, TrendingUp, BrainCircuit, Droplets, MapPin, Monitor, Leaf, ArrowRight, IndianRupee, Locate, Search, Loader2, Maximize } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EnergyPlanner = () => {
    const [formData, setFormData] = useState({
        district: '',
        crop: '',
        landSize: 2,
        motorHP: 5,
        soilType: ''
    });

    const [soilDropdownOpen, setSoilDropdownOpen] = useState(false);
    const soilTypes = [
        "Alluvial Soil",
        "Black Soil (Regur)",
        "Red / Yellow Soil",
        "Laterite Soil",
        "Clay Soil",
        "Sandy Soil",
        "Loamy Soil",
        "Peaty / Marshy Soil"
    ];

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [detecting, setDetecting] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/energy/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error('Failed to run AI Planner', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSearch = async (query) => {
        setFormData({ ...formData, district: query });
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setSearching(false);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        setDetecting(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                if (data.address) {
                    const place = data.address.city || data.address.town || data.address.district || data.address.state;
                    setFormData({ ...formData, district: place });
                }
            } catch (err) {
                console.error('Reverse geo error:', err);
            } finally {
                setDetecting(false);
            }
        }, () => {
            alert('Could not detect location');
            setDetecting(false);
        });
    };

    const profitData = result ? [
        {
            name: 'Economics',
            Revenue: result.decisionEngine.profitEstimation.revenue,
            Expenses: result.decisionEngine.profitEstimation.totalExpenses,
            Profit: result.decisionEngine.profitEstimation.finalProfit
        }
    ] : [];

    return (
        <div className="energy-planner-container">

            <div className="planner-layout">
                {/* Input Panel */}
                <motion.div 
                    className="input-panel card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="panel-header">
                        <Monitor size={20} className="icon-blue" />
                        <h2>Data Collection Module</h2>
                    </div>
                    
                    <form onSubmit={handleAnalyze} className="planner-form">
                        <div className="form-group group-rel">
                            <label>
                                <MapPin size={16} /> District (Location)
                                <button type="button" className="detect-btn-inline" onClick={detectLocation} disabled={detecting}>
                                    {detecting ? <Loader2 size={12} className="spin-icon" /> : <Locate size={12} />}
                                    <span>Detect</span>
                                </button>
                            </label>
                            <div className="input-with-icon">
                                <input 
                                    type="text" 
                                    name="district" 
                                    value={formData.district} 
                                    onChange={(e) => handleLocationSearch(e.target.value)} 
                                    placeholder="e.g. Coimbatore" 
                                    required 
                                    autoComplete="off"
                                />
                                {searching && <Loader2 size={16} className="input-loader spin-icon" />}
                            </div>
                            
                            {suggestions.length > 0 && (
                                <div className="location-suggestions">
                                    {suggestions.map((s, idx) => (
                                        <button 
                                            key={idx} 
                                            type="button" 
                                            className="suggestion-item"
                                            onClick={() => {
                                                const place = s.display_name.split(',')[0];
                                                setFormData({ ...formData, district: place });
                                                setSuggestions([]);
                                            }}
                                        >
                                            <Search size={12} />
                                            <span>{s.display_name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label><Leaf size={16} /> Crop Type</label>
                            <input type="text" name="crop" value={formData.crop} onChange={handleInputChange} placeholder="e.g. Cotton, Paddy" required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Maximize size={16} /> Land (Acres)</label>
                                <input type="number" name="landSize" value={formData.landSize} onChange={handleInputChange} min="1" step="0.5" required />
                            </div>
                            <div className="form-group">
                                <label><Zap size={16} /> Motor Power (HP)</label>
                                <input type="number" name="motorHP" value={formData.motorHP} onChange={handleInputChange} min="0.5" step="0.5" placeholder="e.g. 5" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label><Droplets size={16} /> Soil Type</label>
                            <div className="custom-dropdown">
                                <button 
                                    type="button" 
                                    className={`dropdown-selected ${formData.soilType ? '' : 'placeholder'}`}
                                    onClick={() => setSoilDropdownOpen(!soilDropdownOpen)}
                                >
                                    {formData.soilType || "Select dominant soil type"}
                                    <div className={`dropdown-arrow ${soilDropdownOpen ? 'open' : ''}`}>▼</div>
                                </button>
                                
                                {soilDropdownOpen && (
                                    <motion.div 
                                        className="dropdown-options"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {soilTypes.map((type, idx) => (
                                            <button 
                                                key={idx} 
                                                type="button" 
                                                className={`option-item ${formData.soilType === type ? 'active' : ''}`}
                                                onClick={() => {
                                                    setFormData({ ...formData, soilType: type });
                                                    setSoilDropdownOpen(false);
                                                }}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <button className="analyze-btn" type="submit" disabled={loading}>
                            {loading ? 'AI Engine Running...' : 'Generate Smart Plan'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </motion.div>

                {/* Dashboard Results Panel */}
                <motion.div 
                    className="results-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {!result && !loading && (
                        <div className="empty-state">
                            <BrainCircuit size={64} className="icon-pulse" />
                            <h3>Intelligence Engine Standing By</h3>
                            <p>Enter your farm parameters on the left to activate the AI modules.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Calculating EEE Load & Running Python Models...</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="dashboard-grid">
                            {/* EEE / Power */}
                            <div className="dash-card power-card">
                                <div className="card-top">
                                    <Zap size={20} color="#3b82f6" />
                                    <h3>EEE Power System</h3>
                                </div>
                                <div className="metrics">
                                    <div className="metric">
                                        <span className="label">Motor Load</span>
                                        <span className="value">{result.powerConsumption.motorPowerKW} kW</span>
                                    </div>
                                    <div className="metric">
                                        <span className="label">Est. EB Cost</span>
                                        <span className="value highlight">₹{result.powerConsumption.monthlyCost}/mo</span>
                                    </div>
                                </div>
                                <div className="suggestion-box">
                                    <strong>Smart Suggestion:</strong> {result.powerConsumption.suggestion}
                                </div>
                            </div>

                            {/* Solar WOW factor */}
                            <div className="dash-card solar-card">
                                <div className="card-top">
                                    <Sun size={20} color="#3b82f6" />
                                    <h3>Solar Intelligence</h3>
                                </div>
                                <div className="metrics">
                                    <div className="metric">
                                        <span className="label">System Required</span>
                                        <span className="value">{result.solarIntelligence.solarRequiredKW} kW</span>
                                    </div>
                                    <div className="metric">
                                        <span className="label">Payback Period</span>
                                        <span className="value highlight-green">{result.solarIntelligence.paybackYears} Yrs</span>
                                    </div>
                                </div>
                                <div className="suggestion-box solar-box">
                                    Save ₹{result.solarIntelligence.monthlySaving}/mo. One-time install est: ₹{result.solarIntelligence.installCost.toLocaleString()}
                                </div>
                            </div>

                            {/* Smart Decision Engine */}
                            <div className="dash-card engine-card full-width">
                                <div className="card-top">
                                    <BrainCircuit size={20} color="#3b82f6" />
                                    <h3>Smart Decision Engine</h3>
                                </div>
                                
                                <ul className="ai-rules">
                                    {result.decisionEngine.recommendations.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                    ))}
                                </ul>

                                <div className="market-prediction">
                                    <TrendingUp size={20} color="#3b82f6" style={{flexShrink: 0}} />
                                    <div>
                                        <h4>AI Market Prediction</h4>
                                        <p>{result.aiPrediction.priceTrend}</p>
                                        <small>Best local market to target: <strong>{result.aiPrediction.bestMarket}</strong></small>
                                    </div>
                                </div>
                            </div>

                            {/* Profit Chart */}
                            <div className="dash-card chart-card full-width">
                                <div className="card-top">
                                    <IndianRupee size={20} color="#3b82f6" />
                                    <h3>Profitability Projection (Current Market)</h3>
                                </div>
                                <div style={{ width: '100%', height: 250, marginTop: '10px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={profitData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                                            <Legend />
                                            <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            <style>
                {`
                .energy-planner-container {
                    padding: 24px;
                    max-width: 1400px;
                    margin: 0 auto;
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .planner-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 24px;
                    margin-top: 10px;
                }
                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
                    border: 1px solid #e2e8f0;
                }
                .panel-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 16px;
                }
                .panel-header h2 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0;
                }
                .icon-blue {
                    color: #3b82f6;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 8px;
                }
                .form-group label svg {
                    opacity: 0.7;
                }
                .form-group input, .form-group select, .dropdown-selected {
                    width: 100%;
                    padding: 10px 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.2s;
                }
                .form-group input:focus, .dropdown-selected:focus {
                    background: #ffffff;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    outline: none;
                }
                .custom-dropdown { position: relative; width: 100%; }
                .dropdown-selected { 
                    display: flex; justify-content: space-between; align-items: center; cursor: pointer;
                }
                .dropdown-selected.placeholder { color: #94a3b8; }
                .dropdown-arrow { font-size: 0.7rem; transition: transform 0.2s; color: #94a3b8; }
                .dropdown-arrow.open { transform: rotate(180deg); }
                .dropdown-options { 
                    position: absolute; bottom: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; 
                    border-radius: 8px; z-index: 20; margin-bottom: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); 
                    padding: 4px; max-height: 200px; overflow-y: auto;
                }
                .dropdown-options::-webkit-scrollbar { width: 6px; }
                .dropdown-options::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
                .option-item { 
                    width: 100%; padding: 10px 12px; border: none; background: transparent; text-align: left; 
                    font-size: 0.9rem; border-radius: 6px; cursor: pointer; color: #475569; transition: all 0.2s;
                }
                .option-item:hover, .option-item.active { background: #eff6ff; color: #2563eb; }
                .option-item.active { font-weight: 600; }
                
                .group-rel { position: relative; }
                .detect-btn-inline { 
                    margin-left: auto; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; 
                    padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; display: flex; align-items: center; gap: 4px; cursor: pointer;
                    transition: all 0.2s;
                }
                .detect-btn-inline:hover { background: #e2e8f0; color: #0f172a; }
                .input-with-icon { position: relative; }
                .input-loader { position: absolute; right: 12px; top: 12px; color: #3b82f6; opacity: 0.8; }
                .location-suggestions { 
                    position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; 
                    border-radius: 8px; z-index: 10; margin-top: 4px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 4px;
                }
                .suggestion-item { 
                    width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px; border: none; background: transparent; 
                    text-align: left; font-size: 0.85rem; color: #475569; cursor: pointer; border-radius: 4px;
                }
                .suggestion-item:hover { background: #f8fafc; color: #2563eb; }
                .spin-icon { animation: spin 1.5s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .analyze-btn {
                    width: 100%;
                    padding: 12px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    transition: background 0.2s, box-shadow 0.2s;
                }
                .analyze-btn:hover {
                    background: #1d4ed8;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }
                .analyze-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .results-panel { min-height: 500px; }
                .empty-state {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    border: 1px dashed #cbd5e1;
                    border-radius: 12px;
                    color: #64748b;
                }
                .icon-pulse { color: #94a3b8; margin-bottom: 16px; }
                .loading-state {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                    font-weight: 500;
                }
                .spinner {
                    width: 36px;
                    height: 36px;
                    border: 3px solid rgba(59, 130, 246, 0.2);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 16px;
                }
                
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .dash-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
                    border: 1px solid #e2e8f0;
                }
                .full-width { grid-column: 1 / -1; }
                .card-top {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .card-top h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                }
                .metrics {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .metric {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 12px;
                    border-bottom: 1px dashed #e2e8f0;
                }
                .metric:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .metric .label {
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .metric .value {
                    font-weight: 600;
                    font-size: 1rem;
                    color: #1e293b;
                }
                .highlight { color: #ef4444 !important; }
                .highlight-green { color: #10b981 !important; }
                
                .suggestion-box {
                    margin-top: 20px;
                    background: #f8fafc;
                    padding: 12px 16px;
                    border-radius: 8px;
                    color: #475569;
                    font-size: 0.85rem;
                    border: 1px solid #e2e8f0;
                    border-left: 3px solid #3b82f6;
                    line-height: 1.5;
                }
                .solar-box { border-left-color: #10b981; }

                .ai-rules {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 24px 0;
                    display: grid;
                    gap: 12px;
                }
                .ai-rules li {
                    padding: 12px 16px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: #334155;
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    line-height: 1.5;
                }
                .ai-rules li::before {
                    content: '✓';
                    color: #10b981;
                    font-weight: bold;
                }

                .market-prediction {
                    display: flex;
                    gap: 16px;
                    background: #f8fafc;
                    padding: 16px 20px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    align-items: flex-start;
                }
                .market-prediction h4 {
                    margin: 0 0 6px 0;
                    color: #0f172a;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .market-prediction p {
                    margin: 0 0 4px 0;
                    color: #334155;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }
                .market-prediction small {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                @media (max-width: 900px) {
                    .planner-layout, .dashboard-grid { grid-template-columns: 1fr; }
                }
                `}
            </style>
        </div>
    );
};

export default EnergyPlanner;
