import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CloudSun, MapPin, Wind, Droplets, Thermometer, CheckCircle2, AlertTriangle, Sprout, RefreshCw, Leaf, Info, Search, X, Navigation, ChevronDown, ChevronUp, TrendingUp, ShoppingBag, Sparkles, Map as MapIcon, ArrowRight, Plus, Package } from 'lucide-react';

// ─── Comprehensive India Crop Engine ───────────────────────────────────────────
const CROP_DB = [
    { name: 'Rice', minTemp: 20, maxTemp: 38, minHumidity: 60, maxHumidity: 100, soils: ['alluvial', 'clay', 'peaty'], seasons: ['Kharif'], notes: 'Requires high humidity and standing water.', waterNeeds: 'High', duration: '90–120 days' },
    { name: 'Wheat', minTemp: 10, maxTemp: 24, minHumidity: 40, maxHumidity: 70, soils: ['alluvial', 'clay', 'loamy'], seasons: ['Rabi'], notes: 'Needs cool dry climate at maturity.', waterNeeds: 'Moderate', duration: '100–150 days' },
    { name: 'Maize', minTemp: 18, maxTemp: 35, minHumidity: 45, maxHumidity: 85, soils: ['alluvial', 'loamy', 'sandy'], seasons: ['Kharif', 'Zaid'], notes: 'Versatile crop, well-drained fertile soil.', waterNeeds: 'Moderate', duration: '70–90 days' },
    { name: 'Cotton', minTemp: 21, maxTemp: 34, minHumidity: 30, maxHumidity: 65, soils: ['black', 'alluvial'], seasons: ['Kharif'], notes: 'Hot dry climate needed, black soil is ideal.', waterNeeds: 'Moderate', duration: '150–180 days' },
    { name: 'Sugarcane', minTemp: 20, maxTemp: 38, minHumidity: 70, maxHumidity: 100, soils: ['alluvial', 'black', 'clay'], seasons: ['Kharif', 'Rabi'], notes: 'Long rainy season required.', waterNeeds: 'Very High', duration: '12–18 months' },
    { name: 'Groundnut', minTemp: 22, maxTemp: 36, minHumidity: 40, maxHumidity: 70, soils: ['red', 'sandy', 'alluvial', 'laterite'], seasons: ['Kharif', 'Zaid'], notes: 'Well-drained light soil preferred.', waterNeeds: 'Low', duration: '90–130 days' },
    { name: 'Soybean', minTemp: 18, maxTemp: 35, minHumidity: 55, maxHumidity: 80, soils: ['black', 'alluvial', 'clay'], seasons: ['Kharif'], notes: 'Good for enriching soil nitrogen.', waterNeeds: 'Moderate', duration: '90–100 days' },
    { name: 'Bajra (Pearl Millet)', minTemp: 25, maxTemp: 42, minHumidity: 20, maxHumidity: 60, soils: ['sandy', 'red', 'alluvial'], seasons: ['Kharif'], notes: 'Extremely drought resilient.', waterNeeds: 'Very Low', duration: '60–90 days' },
    { name: 'Jowar (Sorghum)', minTemp: 26, maxTemp: 40, minHumidity: 25, maxHumidity: 65, soils: ['black', 'red', 'alluvial'], seasons: ['Kharif', 'Rabi'], notes: 'Drought tolerant, high temperature crop.', waterNeeds: 'Low', duration: '90–120 days' },
    { name: 'Mustard', minTemp: 10, maxTemp: 22, minHumidity: 30, maxHumidity: 65, soils: ['alluvial', 'loamy', 'sandy'], seasons: ['Rabi'], notes: 'Cool season, tolerates light frost.', waterNeeds: 'Low', duration: '90–110 days' },
    { name: 'Gram (Chickpea)', minTemp: 10, maxTemp: 22, minHumidity: 25, maxHumidity: 60, soils: ['alluvial', 'loamy', 'black'], seasons: ['Rabi'], notes: 'Prefers cool dry conditions.', waterNeeds: 'Low', duration: '90–110 days' },
    { name: 'Lentil', minTemp: 10, maxTemp: 22, minHumidity: 30, maxHumidity: 65, soils: ['loamy', 'alluvial', 'sandy'], seasons: ['Rabi'], notes: 'Cool tolerant, moderate rainfall.', waterNeeds: 'Low', duration: '80–110 days' },
    { name: 'Watermelon', minTemp: 24, maxTemp: 40, minHumidity: 30, maxHumidity: 70, soils: ['sandy', 'alluvial', 'loamy'], seasons: ['Zaid'], notes: 'Warm soil and high temperatures needed.', waterNeeds: 'Moderate', duration: '60–90 days' },
    { name: 'Cucumber', minTemp: 20, maxTemp: 38, minHumidity: 55, maxHumidity: 85, soils: ['loamy', 'alluvial', 'sandy'], seasons: ['Zaid'], notes: 'Requires warm weather and irrigation.', waterNeeds: 'Moderate', duration: '45–65 days' },
    { name: 'Muskmelon', minTemp: 25, maxTemp: 40, minHumidity: 30, maxHumidity: 65, soils: ['sandy', 'alluvial'], seasons: ['Zaid'], notes: 'Long hot dry summers ideal.', waterNeeds: 'Low', duration: '60–85 days' },
    { name: 'Sunflower', minTemp: 18, maxTemp: 35, minHumidity: 30, maxHumidity: 70, soils: ['black', 'alluvial', 'red'], seasons: ['Kharif', 'Rabi'], notes: 'Day-neutral, grow-anywhere crop.', waterNeeds: 'Low', duration: '80–100 days' },
    { name: 'Jute', minTemp: 24, maxTemp: 38, minHumidity: 75, maxHumidity: 100, soils: ['alluvial', 'clay'], seasons: ['Kharif'], notes: 'High humidity, warm delta regions.', waterNeeds: 'High', duration: '100–110 days' },
    { name: 'Tea', minTemp: 13, maxTemp: 30, minHumidity: 70, maxHumidity: 100, soils: ['laterite', 'peaty'], seasons: ['Kharif', 'Rabi'], notes: 'High alt, acidic soil, heavy rainfall.', waterNeeds: 'High', duration: 'Perennial' },
    { name: 'Coffee', minTemp: 15, maxTemp: 28, minHumidity: 70, maxHumidity: 100, soils: ['laterite', 'alluvial'], seasons: ['Kharif'], notes: 'Shade required, highland tropical.', waterNeeds: 'High', duration: 'Perennial' },
    { name: 'Cashew', minTemp: 20, maxTemp: 38, minHumidity: 50, maxHumidity: 85, soils: ['laterite', 'red'], seasons: ['Kharif'], notes: 'Coastal tropics, sandy/laterite soils.', waterNeeds: 'Low', duration: 'Perennial' },
    { name: 'Coconut', minTemp: 22, maxTemp: 35, minHumidity: 70, maxHumidity: 100, soils: ['sandy', 'alluvial', 'clay'], seasons: ['Kharif', 'Rabi'], notes: 'Coastal tropical regions.', waterNeeds: 'High', duration: 'Perennial' },
    { name: 'Banana', minTemp: 18, maxTemp: 38, minHumidity: 75, maxHumidity: 100, soils: ['alluvial', 'clay', 'loamy'], seasons: ['Kharif', 'Zaid'], notes: 'Tropical climate, rich moist soil.', waterNeeds: 'Very High', duration: '9–12 months' },
    { name: 'Potato', minTemp: 10, maxTemp: 22, minHumidity: 60, maxHumidity: 85, soils: ['loamy', 'alluvial', 'sandy'], seasons: ['Rabi'], notes: 'Cool climate, loose fertile soil.', waterNeeds: 'Moderate', duration: '70–120 days' },
    { name: 'Tomato', minTemp: 18, maxTemp: 35, minHumidity: 50, maxHumidity: 80, soils: ['loamy', 'alluvial', 'clay'], seasons: ['Kharif', 'Rabi', 'Zaid'], notes: 'Warm climate, versatile soil.', waterNeeds: 'Moderate', duration: '60–80 days' },
    { name: 'Onion', minTemp: 13, maxTemp: 32, minHumidity: 40, maxHumidity: 75, soils: ['loamy', 'alluvial'], seasons: ['Rabi', 'Kharif'], notes: 'Well-drained loamy soil preferred.', waterNeeds: 'Moderate', duration: '90–120 days' },
    { name: 'Turmeric', minTemp: 20, maxTemp: 36, minHumidity: 70, maxHumidity: 100, soils: ['alluvial', 'clay', 'red'], seasons: ['Kharif'], notes: 'Hot humid tropics, red/clay soil.', waterNeeds: 'High', duration: '8–9 months' },
    { name: 'Rubber', minTemp: 22, maxTemp: 35, minHumidity: 75, maxHumidity: 100, soils: ['laterite', 'clay'], seasons: ['Kharif'], notes: 'Equatorial humid climate required.', waterNeeds: 'High', duration: 'Perennial' },
    { name: 'Barley', minTemp: 7, maxTemp: 22, minHumidity: 25, maxHumidity: 60, soils: ['alluvial', 'loamy', 'sandy'], seasons: ['Rabi'], notes: 'Most cold-tolerant cereal crop.', waterNeeds: 'Very Low', duration: '70–90 days' },
];

// ─── Season detection (Indian seasons) ─────────────────────────────────────────
function detectSeason(month) {
    if (month >= 6 && month <= 10) return 'Kharif';  // Jun–Oct
    if (month >= 11 || month <= 2) return 'Rabi';    // Nov–Feb
    return 'Zaid';                                   // Mar–May
}

// ─── Smart scoring engine ────────────────────────────────────────────────────────
function scoreCrops(temp, humidity, soil, season) {
    return CROP_DB
        .map(crop => {
            if (!crop.seasons.includes(season)) return null;

            let soilScore = 0;
            const soilIdx = crop.soils.indexOf(soil);
            if (soilIdx === -1) return null;
            if (soilIdx === 0) soilScore = 25;
            else if (soilIdx === 1) soilScore = 18;
            else soilScore = 12;

            const idealTemp = (crop.minTemp + crop.maxTemp) / 2;
            const tempRange = (crop.maxTemp - crop.minTemp) / 2;
            let tempScore;
            if (temp < crop.minTemp) {
                const deficit = crop.minTemp - temp;
                tempScore = Math.max(0, 40 - (deficit / tempRange) * 40);
            } else if (temp > crop.maxTemp) {
                const excess = temp - crop.maxTemp;
                tempScore = Math.max(0, 40 - (excess / tempRange) * 40);
            } else {
                const deviation = Math.abs(temp - idealTemp) / tempRange;
                tempScore = 40 * (1 - deviation * 0.5);
            }

            const idealHum = (crop.minHumidity + crop.maxHumidity) / 2;
            const humRange = (crop.maxHumidity - crop.minHumidity) / 2;
            let humScore;
            if (humidity < crop.minHumidity) {
                const deficit = crop.minHumidity - humidity;
                humScore = Math.max(0, 30 - (deficit / Math.max(humRange, 1)) * 30);
            } else if (humidity > crop.maxHumidity) {
                const excess = humidity - crop.maxHumidity;
                humScore = Math.max(0, 30 - (excess / Math.max(humRange, 1)) * 30);
            } else {
                const deviation = Math.abs(humidity - idealHum) / Math.max(humRange, 1);
                humScore = 30 * (1 - deviation * 0.4);
            }

            const seasonBonus = crop.seasons[0] === season ? 5 : 0;
            const total = Math.round(soilScore + tempScore + humScore + seasonBonus);
            const score = Math.min(100, Math.max(0, total));
            const tier = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair';

            return { ...crop, score, tier };
        })
        .filter(c => c !== null && c.score >= 45)
        .sort((a, b) => b.score - a.score);
}

const SOIL_INFO = {
    alluvial: { name: 'Alluvial Soil', color: '#c6a55c', desc: '' },
    black: { name: 'Black Soil (Regur)', color: '#4a4a4a', desc: '' },
    red: { name: 'Red / Yellow Soil', color: '#c0392b', desc: '' },
    laterite: { name: 'Laterite Soil', color: '#8b4513', desc: '' },
    clay: { name: 'Clay Soil', color: '#6e4b3a', desc: '' },
    sandy: { name: 'Sandy Soil', color: '#e4c878', desc: '' },
    loamy: { name: 'Loamy Soil', color: '#8b7355', desc: '' },
    peaty: { name: 'Peaty / Marshy Soil', color: '#3d6b35', desc: '' },
};

const Seasonal = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('idle');
    const [locationName, setLocationName] = useState('');
    const [weather, setWeather] = useState(null);
    const [soilType, setSoilType] = useState('alluvial');
    const [recommendations, setRecommendations] = useState([]);
    const [season, setSeason] = useState('');
    const [marketDemand, setMarketDemand] = useState([]);
    const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'demand'

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchStatus, setSearchStatus] = useState('idle');
    const [gpsStatus, setGpsStatus] = useState('idle');
    const [isSoilDropdownOpen, setIsSoilDropdownOpen] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [analyzingCrop, setAnalyzingCrop] = useState(null);
    const debounceRef = useRef(null);

    const soilTypes = Object.entries(SOIL_INFO);

    useEffect(() => {
        fetchMarketDemand();
    }, []);

    const fetchMarketDemand = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/orders/demand/regional');
            const data = await res.json();
            setMarketDemand(data);
        } catch (err) {
            console.error("Failed to fetch demand:", err);
        }
    };

    const handleSearchInput = (val) => {
        setSearchQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (!val.trim() || val.trim().length < 3) {
                setSearchResults([]);
                setSearchStatus('idle');
                return;
            }
            setSearchStatus('searching');
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&countrycodes=in&limit=6&accept-language=en`);
                const data = await res.json();
                if (data.length === 0) {
                    setSearchResults([]);
                    setSearchStatus('error');
                } else {
                    setSearchResults(data);
                    setSearchStatus('done');
                }
            } catch {
                setSearchStatus('error');
            }
        }, 500);
    };

    const handleSelectResult = (r) => {
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        const label = r.address.city || r.address.town || r.address.village || r.display_name.split(',')[0];
        const fullLabel = `${label}, ${r.address.state}`;
        fetchWeatherAndAnalyze(lat, lon, fullLabel);
    };

    const fetchWeatherAndAnalyze = async (lat, lon, locLabel) => {
        setShowModal(false);
        setLocationName(locLabel);
        setStep('fetching');
        try {
            const now = new Date();
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(6)}&longitude=${lon.toFixed(6)}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=precipitation_probability&timezone=Asia%2FKolkata&forecast_days=1`);
            const data = await res.json();
            const w = data.current;
            const hour = now.getHours();
            const enriched = { ...w, precipitation_probability: data.hourly.precipitation_probability[hour] };
            
            setWeather(enriched);
            const s = detectSeason(now.getMonth() + 1);
            setSeason(s);
            setRecommendations(scoreCrops(w.temperature_2m, w.relative_humidity_2m, soilType, s));
            setStep('done');
        } catch {
            setStep('error');
        }
    };

    const handleDetectGPS = () => {
        setGpsStatus('detecting');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
                    const data = await res.json();
                    const label = [data.address?.village || data.address?.town || data.address?.city, data.address?.state].filter(Boolean).join(', ');
                    setGpsStatus('done');
                    fetchWeatherAndAnalyze(latitude, longitude, label);
                } catch {
                    setGpsStatus('error');
                }
            }, () => setGpsStatus('error'));
        } else setGpsStatus('error');
    };

    const handleSoilChange = (id) => {
        setSoilType(id);
        setIsSoilDropdownOpen(false);
        if (weather && season) {
            // Use already-detected season (stored in state), re-score with new soil
            const recs = scoreCrops(weather.temperature_2m, weather.relative_humidity_2m, id, season);
            setRecommendations(recs);
        }
    };

    const handleGetAIAnalysis = async (crop) => {
        setAnalyzingCrop(crop.name);
        try {
            const res = await fetch('http://localhost:5000/api/ai/analyze-crop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropName: crop.name,
                    location: locationName || 'Current Location',
                    weather: weather,
                    soil: SOIL_INFO[soilType].name
                })
            });
            const data = await res.json();
            setSelectedAnalysis({ ...data, cropName: crop.name });
        } catch (error) {
            console.error("AI analysis failed:", error);
        } finally {
            setAnalyzingCrop(null);
        }
    };

    const handlePlantThis = (crop) => {
        // Navigate to Crops page with pre-filled state (via localStorage or state management)
        // For simplicity, we'll store it in localStorage and use it in Crops.jsx
        localStorage.setItem('prefillCrop', JSON.stringify({
            name: crop.name,
            variety: 'Standard',
            status: 'Growing'
        }));
        navigate('/farmer/crops'); // SPA redirect
    };

    return (
        <div className="seasonal-page">
            <AnimatePresence>
                {showModal && (
                    <motion.div className="loc-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                        <motion.div className="loc-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
                            <div className="loc-modal-header">
                                <div><h2>Choose Location</h2><p>Search for your village or city in India</p></div>
                                <button className="loc-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>
                            <button className={`gps-btn ${gpsStatus === 'detecting' ? 'gps-loading' : ''}`} onClick={handleDetectGPS} disabled={gpsStatus === 'detecting'}>
                                {gpsStatus === 'detecting' ? <RefreshCw size={18} className="spin-icon" /> : <Navigation size={18} />}
                                <span>{gpsStatus === 'detecting' ? 'Detecting…' : 'Detect Live Location (GPS)'}</span>
                            </button>
                            <div className="loc-divider"><span>or search manually</span></div>
                            <div className="loc-search-wrap">
                                <Search size={16} className="loc-search-icon" />
                                <input className="loc-search-input" type="text" placeholder="e.g. Coimbatore, Tamil Nadu…" value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)} autoFocus />
                            </div>
                            <div className="loc-results">
                                {searchStatus === 'done' && searchResults.map((r, i) => (
                                    <button key={i} className="loc-result-item" onClick={() => handleSelectResult(r)}>
                                        <MapPin size={14} className="loc-result-icon" />
                                        <div>
                                            <div className="loc-result-primary">{r.address.city || r.address.town || r.address.village || r.display_name.split(',')[0]}</div>
                                            <div className="loc-result-secondary">{r.address.state}, India</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="seasonal-top-controls">
                <div className="horizontal-control-block">
                    <div className="soil-label-box">
                        <Leaf size={18} />
                        <span>Soil Type</span>
                    </div>
                    <div className="custom-dropdown-container">
                        <button 
                            className={`dropdown-trigger ${isSoilDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsSoilDropdownOpen(!isSoilDropdownOpen)}
                        >
                            <div className="trigger-content">
                                <div className="soil-dot" style={{ background: SOIL_INFO[soilType].color }}></div>
                                <span>{SOIL_INFO[soilType].name}</span>
                            </div>
                            {isSoilDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        <AnimatePresence>
                            {isSoilDropdownOpen && (
                                <motion.div 
                                    className="dropdown-list"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    {soilTypes.map(([id, info]) => (
                                        <button 
                                            key={id} 
                                            className={`dropdown-item ${soilType === id ? 'selected' : ''}`}
                                            onClick={() => handleSoilChange(id)}
                                        >
                                            <div className="soil-dot" style={{ background: info.color }}></div>
                                            <span>{info.name}</span>
                                            {soilType === id && <CheckCircle2 size={14} className="selected-icon" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="action-group" style={{ display: 'flex', gap: '12px' }}>
                    <div className="tab-switcher">
                        <button className={`tab-btn ${activeTab === 'advisor' ? 'active' : ''}`} onClick={() => setActiveTab('advisor')}>
                            <Sprout size={16} /> Advisor
                        </button>
                        <button className={`tab-btn ${activeTab === 'demand' ? 'active' : ''}`} onClick={() => setActiveTab('demand')}>
                            <TrendingUp size={16} /> Market Demand
                        </button>
                    </div>
                    <button className={`btn-primary ${step === 'fetching' ? 'btn-loading' : ''} analyze-btn`} onClick={() => setShowModal(true)}>
                        {step === 'fetching' ? <RefreshCw className="spin-icon" size={20} /> : <Search size={20} />}
                        <span>{step === 'fetching' ? 'Fetching…' : 'Check Climate'}</span>
                    </button>
                </div>

                {step === 'done' && weather && (
                    <motion.div className="header-climate-status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="h-climate-main">
                            <span className="h-temp">{weather.temperature_2m}°C</span>
                            <div className="h-loc-box"><MapPin size={12} /><span>{locationName}</span></div>
                        </div>
                        <div className="h-climate-details">
                            <div className="h-stat"><Droplets size={14} /><span>{weather.relative_humidity_2m}%</span></div>
                            <div className="h-stat"><Wind size={14} /><span>{weather.wind_speed_10m}km/h</span></div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="seasonal-main-layout">

                <div className="results-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    {activeTab === 'advisor' ? (
                        <>
                            {step === 'done' && recommendations.length > 0 ? (() => {
                                const hasDemand = recommendations.some(crop => marketDemand.some(d => d.crop.toLowerCase() === crop.name.toLowerCase()));
                                return (
                                    <motion.div 
                                        className={`advisor-results-split ${!hasDemand ? 'no-demand' : ''}`} 
                                        initial={{ opacity: 0, y: 20 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {/* Sub-section 1: High Demand Items */}
                                        {hasDemand && (
                                            <section className="section-block results-section demand-highlights">
                                            <div className="results-header">
                                                <h3 className="section-title"><TrendingUp size={18} style={{ color: '#e53e3e' }} /> High Market Demand</h3>
                                            </div>
                                            <div className="crop-results-scroll">
                                                {recommendations
                                                    .filter(crop => marketDemand.some(d => d.crop.toLowerCase() === crop.name.toLowerCase()))
                                                    .map((crop, i) => (
                                                        <div key={crop.name + '-demand'} className="crop-row-card demand-highlight-card">
                                                            <div className="crop-row-rank">{i + 1}</div>
                                                            <div className="crop-row-info">
                                                                <div className="crop-row-name-row">
                                                                    <div className="crop-row-name">{crop.name}</div>
                                                                    <span className={`tier-badge tier-${crop.tier?.toLowerCase()}`}>{crop.tier}</span>
                                                                    <span className="hot-badge"><TrendingUp size={10} /> High Demand</span>
                                                                </div>
                                                                <div className="crop-row-meta"><span>{crop.waterNeeds} Water</span><span className="dot"></span><span>{crop.duration}</span></div>
                                                            </div>
                                                            <div className="crop-row-score">
                                                                <div className="score-label">{crop.score}% Match</div>
                                                                <div className="score-bar-mini">
                                                                    <div className="score-fill-mini" style={{ width: `${crop.score}%`, background: crop.tier === 'Excellent' ? '#2f855a' : crop.tier === 'Good' ? '#d69e2e' : '#dd6b20' }}></div>
                                                                </div>
                                                            </div>
                                                            <div className="crop-row-actions">
                                                                <button className="ai-insight-btn" onClick={() => handlePlantThis(crop)} title="Add to my listings"><Plus size={14} /> <span>Plant This</span></button>
                                                                <button className="ai-insight-btn secondary" onClick={() => handleGetAIAnalysis(crop)} disabled={analyzingCrop === crop.name}>
                                                                    {analyzingCrop === crop.name ? <RefreshCw size={14} className="spin-icon" /> : <Sparkles size={14} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </section>
                                    )}

                                    {/* Sub-section 2: All matches */}
                                    <section className="section-block results-section all-matches">
                                        <div className="results-header">
                                            <h3 className="section-title"><CheckCircle2 size={18} /> All Climate Matches</h3>
                                        </div>
                                        <div className="crop-results-scroll">
                                            {recommendations
                                                .filter(crop => !marketDemand.some(d => d.crop.toLowerCase() === crop.name.toLowerCase()))
                                                .map((crop, i) => {
                                                    return (
                                                        <div key={crop.name} className="crop-row-card">
                                                        <div className="crop-row-rank">{i + 1}</div>
                                                        <div className="crop-row-info">
                                                            <div className="crop-row-name-row">
                                                                <div className="crop-row-name">{crop.name}</div>
                                                                <span className={`tier-badge tier-${crop.tier?.toLowerCase()}`}>{crop.tier}</span>
                                                            </div>
                                                            <div className="crop-row-meta"><span>{crop.waterNeeds} Water</span><span className="dot"></span><span>{crop.duration}</span></div>
                                                        </div>
                                                        <div className="crop-row-score">
                                                            <div className="score-label">{crop.score}% Match</div>
                                                            <div className="score-bar-mini">
                                                                <div className="score-fill-mini" style={{ width: `${crop.score}%`, background: crop.tier === 'Excellent' ? '#2f855a' : crop.tier === 'Good' ? '#d69e2e' : '#dd6b20' }}></div>
                                                            </div>
                                                        </div>
                                                        <div className="crop-row-actions">
                                                            <button className="ai-insight-btn" onClick={() => handlePlantThis(crop)} title="Add to my listings"><Plus size={14} /> <span>Plant This</span></button>
                                                            <button className="ai-insight-btn secondary" onClick={() => handleGetAIAnalysis(crop)} disabled={analyzingCrop === crop.name}>
                                                                    {analyzingCrop === crop.name ? <RefreshCw size={14} className="spin-icon" /> : <Sparkles size={14} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </motion.div>
                            );
                        })() : null}
                        </>
                    ) : (
                        <motion.section className="section-block demand-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="results-header">
                                <h3 className="section-title"><ShoppingBag size={18} /> Real-time Market Demand</h3>
                                <p style={{ fontSize: '0.8rem', color: '#718096' }}>Derived from current customer orders across regions</p>
                            </div>
                            <div className="demand-grid">
                                {marketDemand.length > 0 ? marketDemand.map((item, idx) => (
                                    <div key={idx} className="demand-card">
                                        <div className="demand-card-header">
                                            <h4>{item.crop}</h4>
                                            <span className="orders-pill">{item.orders} Orders</span>
                                        </div>
                                        <div className="demand-stats">
                                            <div className="d-stat">
                                                <Package size={14} />
                                                <span>{item.quantity} units requested</span>
                                            </div>
                                            <div className="d-stat">
                                                <MapPin size={14} />
                                                <span className="loc-text">{item.primaryLocation}</span>
                                            </div>
                                        </div>
                                        <div className="demand-footer">
                                            <button className="go-btn" onClick={() => { setSearchQuery(item.crop); setActiveTab('advisor'); }}>
                                                Check Cultivation <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="results-empty-centered">
                                        <ShoppingBag size={48} className="idle-icon" />
                                        <h3>No Demand Data Yet</h3>
                                        <p>Market demand will appear here once customers start placing orders.</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )}

                    <AnimatePresence>
                        {selectedAnalysis && (
                            <motion.div 
                                className="ai-analysis-modal-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedAnalysis(null)}
                            >
                                <motion.div 
                                    className="ai-analysis-modal"
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="ai-modal-header">
                                        <div className="ai-badge"><Sparkles size={14} /> AI Analysis</div>
                                        <button className="ai-close" onClick={() => setSelectedAnalysis(null)}><X size={20} /></button>
                                    </div>
                                    <div className="ai-modal-body">
                                        <h2>Optimized Strategy for {selectedAnalysis.cropName}</h2>
                                        <div className="ai-analysis-content">
                                            {selectedAnalysis.analysis.split('\n\n').map((para, idx) => (
                                                <p key={idx}>{para}</p>
                                            ))}
                                        </div>
                                        <div className="ai-confidence">
                                            <span>AI Confidence Score</span>
                                            <div className="confidence-pill">{selectedAnalysis.confidence}%</div>
                                        </div>
                                    </div>
                                    <div className="ai-modal-footer">
                                        <p>Recommendation based on real-time soil and climate vectors.</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                .seasonal-page { display: flex; flex-direction: column; gap: 24px; padding-bottom: 40px; }
                .seasonal-top-controls { 
                    display: flex; 
                    align-items: center; 
                    gap: 32px; 
                    background: white; 
                    padding: 16px 32px; 
                    border-radius: 24px; 
                    border: 1px solid #edf2f7;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    position: sticky;
                    top: 75px;
                    z-index: 1000;
                    background: #ffffff;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                }
                
                .horizontal-control-block { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
                .soil-label-box { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--primary-dark); font-size: 0.95rem; white-space: nowrap; }
                .soil-label-box svg { color: var(--primary); }
                .custom-dropdown-container { width: 220px; }

                .action-group { flex-shrink: 0; }
                .analyze-btn { height: 48px; padding: 0 28px; border-radius: 14px; font-weight: 700; display: flex; gap: 10px; align-items: center; }
                
                .header-climate-status { 
                    display: flex; 
                    align-items: center; 
                    gap: 32px; 
                    padding-left: 32px; 
                    border-left: 2px solid #f7fafc;
                    margin-left: auto;
                    height: 48px;
                }
                .h-climate-main { display: flex; flex-direction: column; justify-content: center; }
                .h-temp { font-size: 1.6rem; font-weight: 800; color: var(--primary-dark); line-height: 1; text-align: right; }
                .h-loc-box { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #718096; margin-top: 4px; justify-content: flex-end; }
                .h-climate-details { display: flex; flex-direction: column; gap: 4px; justify-content: center; }
                .h-stat { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; color: #4a5568; }
                .h-stat svg { color: var(--primary); }

                /* Action Buttons Alignment */
                .crop-row-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; width: 180px; }
                .ai-insight-btn { 
                    display: flex; align-items: center; gap: 8px; 
                    background: #f0fff4; color: #2d6a4f; border: 1.5px solid #c6f6d5;
                    padding: 8px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                    height: 38px;
                }
                .ai-insight-btn:hover:not(:disabled) { background: #2d6a4f; color: white; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(45,106,79,0.2); }
                .ai-insight-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ai-insight-btn.secondary { background: white; border: 1px solid #edf2f7; color: #718096; width: 38px; display: flex; align-items: center; justify-content: center; padding: 0; flex-shrink: 0; }
                .ai-insight-btn.secondary:hover { background: #f8fafc; color: var(--primary); border-color: var(--primary); }

                /* AI Modal */
                .ai-analysis-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 3000; padding: 20px; }
                .ai-analysis-modal { background: white; border-radius: 28px; width: 500px; max-width: 95vw; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.3); }
                .ai-modal-header { padding: 24px 30px; background: #f8fafc; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center; }
                .ai-badge { display: flex; align-items: center; gap: 6px; background: #2d6a4f; color: white; padding: 4px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
                .ai-close { background: none; border: none; color: #718096; cursor: pointer; }
                .ai-modal-body { padding: 30px; }
                .ai-modal-body h2 { font-size: 1.4rem; color: #1a202c; margin-bottom: 20px; }
                .ai-analysis-content { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
                .ai-analysis-content p { font-size: 0.95rem; color: #4a5568; line-height: 1.6; }
                .ai-confidence { display: flex; justify-content: space-between; align-items: center; background: #f0fff4; padding: 16px 20px; border-radius: 16px; border: 1px solid #c6f6d5; }
                .ai-confidence span { font-weight: 700; color: #2d6a4f; font-size: 0.9rem; }
                .confidence-pill { background: #2d6a4f; color: white; padding: 4px 12px; border-radius: 10px; font-weight: 800; }
                .ai-modal-footer { padding: 20px 30px; background: #f8fafc; border-top: 1px solid #edf2f7; font-size: 0.75rem; color: #a0aec0; text-align: center; }

                .tab-switcher { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; gap: 4px; }
                .tab-btn { 
                    display: flex; align-items: center; gap: 8px; padding: 8px 16px; 
                    border: none; background: transparent; border-radius: 9px; 
                    font-size: 0.85rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s;
                }
                .tab-btn.active { background: white; color: var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

                .hot-badge { background: #fff5f5; color: #e53e3e; font-size: 0.65rem; padding: 4px 10px; border-radius: 20px; font-weight: 800; display: flex; align-items: center; gap: 4px; border: 1px solid #fed7d7; white-space: nowrap; flex-shrink: 0; }

                /* Demand UI */
                .demand-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 10px; }
                .demand-card { background: white; border: 1px solid #edf2f7; border-radius: 20px; padding: 20px; transition: all 0.3s; }
                .demand-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-color: var(--primary); }
                .demand-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .demand-card-header h4 { margin: 0; font-size: 1.1rem; color: #1a202c; }
                .orders-pill { background: #ebf8ff; color: #2b6cb0; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 800; }
                .demand-stats { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
                .d-stat { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #4a5568; }
                .d-stat svg { color: #a0aec0; }
                .section-subtitle { font-size: 0.8rem; color: #718096; margin-top: 4px; }
                .demand-footer { border-top: 1px solid #f1f5f9; padding-top: 15px; }
                .go-btn { width: 100%; padding: 10px; border-radius: 10px; border: none; background: #f0fff4; color: #2d6a4f; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
                .go-btn:hover { background: #2d6a4f; color: white; }
                .advisor-results-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; max-width: 1550px; margin: 0 auto; width: 100%; }
                .advisor-results-split.no-demand { grid-template-columns: 1fr; max-width: 850px; margin: 0 auto; width: 100%; }
                
                @media (max-width: 1450px) {
                    .advisor-results-split { grid-template-columns: 1fr; max-width: 850px; }
                }

                .section-block { background: white; border-radius: 20px; border: 1px solid #edf2f7; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
                .results-header { margin-bottom: 20px; min-height: 32px; display: flex; align-items: center; }
                .results-section { min-height: 100%; display: flex; flex-direction: column; height: 100%; }
                .crop-results-scroll { 
                    flex: 1; 
                    max-height: 520px; 
                    overflow-y: auto; 
                    padding-right: 8px;
                }
                .crop-results-scroll::-webkit-scrollbar { width: 6px; }
                .crop-results-scroll::-webkit-scrollbar-track { background: transparent; }
                .crop-results-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .crop-results-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e0; }

                .demand-highlights { border-top: 4px solid #e53e3e; }
                .demand-highlight-card { border-color: #fed7e2; background: #fffafb; }
                .demand-highlight-card:hover { border-color: #f687b3; }
                .all-matches { border-top: 4px solid var(--primary); }

                .seasonal-main-layout { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }

                .crop-row-card { 
                    display: grid;
                    grid-template-columns: 24px 1fr 85px 125px 38px;
                    align-items: center; 
                    gap: 14px; 
                    padding: 12px 16px; 
                    border-radius: 14px; border: 1px solid #edf2f7; margin-bottom: 10px;
                    transition: all 0.2s;
                }
                .crop-row-card:hover { transform: translateY(-2px); border-color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .crop-row-rank { font-weight: 800; color: #cbd5e0; text-align: center; font-size: 0.95rem; }
                .crop-row-info { min-width: 0; }
                .crop-row-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
                .crop-row-name { font-weight: 700; color: #2d3748; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .tier-badge { font-size: 0.6rem; padding: 2px 7px; border-radius: 8px; font-weight: 800; white-space: nowrap; }
                .tier-excellent { background: #c6f6d5; color: #22543d; }
                .tier-good { background: #fefcbf; color: #744210; }
                .tier-fair { background: #fed7aa; color: #7b341e; }
                .crop-row-meta { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #718096; white-space: nowrap; overflow: hidden; }
                .dot { width: 3px; height: 3px; background: #cbd5e0; border-radius: 50%; flex-shrink: 0; }
                .crop-row-score { text-align: right; }
                .score-label { font-size: 0.8rem; font-weight: 800; margin-bottom: 4px; white-space: nowrap; color: var(--primary-dark); }
                .score-bar-mini { height: 4px; background: #edf2f7; border-radius: 2px; overflow: hidden; width: 100%; }
                .score-fill-mini { height: 100%; transition: width 0.5s; }
                .crop-row-actions { display: flex; justify-content: flex-end; }
                .ai-insight-btn { 
                    display: flex; align-items: center; gap: 6px; 
                    background: #f0fff4; color: #2d6a4f; border: 1.5px solid #c6f6d5;
                    padding: 0 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                    height: 36px;
                    width: 100%; justify-content: center;
                }
                .ai-insight-btn:hover:not(:disabled) { background: #2d6a4f; color: white; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(45,106,79,0.2); }
                .ai-insight-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ai-insight-btn.secondary { background: white; border: 1px solid #edf2f7; color: #718096; width: 36px; display: flex; align-items: center; justify-content: center; padding: 0; flex-shrink: 0; }
                .ai-insight-btn.secondary:hover { background: #f8fafc; color: var(--primary); border-color: var(--primary); }

                .results-panel { min-height: 400px; }
                .results-empty-centered {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #a0aec0;
                    border: 2px dashed #edf2f7;
                    border-radius: 20px;
                    padding: 40px;
                    min-height: 350px;
                    background: #fafbfc;
                }
                .results-empty-centered h3 { color: var(--primary-dark); margin: 12px 0 8px; font-size: 1.1rem; }
                .results-empty-centered p { font-size: 0.85rem; line-height: 1.6; max-width: 280px; }
                .results-idle { 
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 60px; 
                    border: 2px dashed #edf2f7; 
                    border-radius: 24px; 
                    color: #a0aec0;
                    min-height: 350px;
                }
                .spin-icon { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* Dropdown */
                .custom-dropdown-container { position: relative; }
                .dropdown-trigger { 
                    width: 100%; display: flex; justify-content: space-between; align-items: center;
                    padding: 10px 16px; border-radius: 12px; border: 2px solid #edf2f7; background: white; cursor: pointer;
                }
                .dropdown-trigger.active { border-color: var(--primary); }
                .trigger-content { display: flex; align-items: center; gap: 8px; }
                .soil-dot { width: 10px; height: 10px; border-radius: 50%; }
                .dropdown-list { 
                    position: absolute; top: 100%; left: 0; right: 0; background: white; 
                    border: 1px solid #edf2f7; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    z-index: 100; padding: 8px; margin-top: 8px;
                }
                .dropdown-item { 
                    width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px;
                    border: none; background: none; cursor: pointer; border-radius: 8px; text-align: left;
                }
                .dropdown-item:hover { background: #f0fff4; }
                .dropdown-item.selected { background: #f0fff4; color: var(--primary); }

                /* Modal */
                .loc-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .loc-modal { background: white; padding: 32px; border-radius: 28px; width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border: 1px solid #edf2f7; }
                
                .loc-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                .loc-modal-header h2 { font-size: 1.6rem; color: var(--primary-dark); font-weight: 800; margin-bottom: 4px; }
                .loc-modal-header p { font-size: 0.9rem; color: #718096; }
                
                .loc-close-btn { 
                    background: #f8fafc; border: 1px solid #edf2f7; border-radius: 10px; width: 36px; height: 36px; 
                    display: flex; align-items: center; justify-content: center; color: #718096; cursor: pointer; transition: all 0.2s; 
                }
                .loc-close-btn:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

                .gps-btn { 
                    width: 100%; padding: 18px; border-radius: 16px; border: 2px solid #c6f6d5; 
                    background: #f0fff4; color: #22543d; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.2s;
                }
                .gps-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(34, 84, 61, 0.1); border-color: #48bb78; }
                
                .loc-divider { margin: 24px 0; text-align: center; color: #a0aec0; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 16px; }
                .loc-divider::before, .loc-divider::after { content: ''; flex: 1; height: 1px; background: #edf2f7; }

                .loc-search-wrap { position: relative; margin-bottom: 12px; }
                .loc-search-icon { position: absolute; left: 16px; top: 18px; color: #a0aec0; }
                .loc-search-input { 
                    width: 100%; padding: 16px 16px 16px 48px; border-radius: 14px; 
                    border: 2px solid #edf2f7; outline: none; transition: all 0.2s; font-size: 0.95rem; 
                }
                .loc-search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(45, 106, 79, 0.05); }

                .loc-results { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; padding-right: 4px; }
                .loc-result-item { 
                    display: flex; align-items: center; gap: 12px; padding: 14px; 
                    border-radius: 12px; border: none; background: transparent; cursor: pointer; 
                    text-align: left; transition: all 0.15s; 
                }
                .loc-result-item:hover { background: #f0fff4; padding-left: 18px; }
                .loc-result-icon { color: var(--primary); }
                .loc-result-primary { font-weight: 700; font-size: 0.9rem; color: #2d3748; }
                .loc-result-secondary { font-size: 0.75rem; color: #718096; margin-top: 2px; }
            `}</style>
        </div>
    );
};

export default Seasonal;
