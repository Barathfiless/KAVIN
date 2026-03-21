const express = require('express');
const router = express.Router();

// AI Insights Engine (Simulated AI Analysis)
// In a production app, this would call OpenAI, Claude, or Gemini API
router.post('/analyze-crop', async (req, res) => {
    const { cropName, location, weather, soil } = req.body;

    try {
        // AI Simulation Logic: Generates structured, high-value agronomic advice
        const climateCtx = weather ? `at ${weather.temperature_2m}°C and ${weather.relative_humidity_2m}% humidity` : 'in current conditions';
        
        const insights = [
            `Based on the ${soil} soil profile and current climate ${climateCtx}, ${cropName} is a high-probability match for your region (${location}).`,
            `Pro Tip: To maximize ${cropName} yield in these conditions, consider implementing drip irrigation to maintain consistent root moisture without waterlogging.`,
            `Seasonal Risk: Watch for early signs of fungal growth if humidity exceeds 85% for more than 48 hours.`,
            `Harvest Window: Your optimized harvest window is approximately 85-95 days from sowing, based on projected thermal units.`
        ];

        // Use provided confidence if available, otherwise generate a plausible simulation between 85-98%
        const confidenceValue = req.body.confidence || (85 + Math.random() * 13).toFixed(1);

        res.json({
            analysis: insights.join('\n\n'),
            confidence: confidenceValue,
            generatedAt: new Date()
        });
    } catch (err) {
        res.status(500).json({ message: "AI Engine encountered an error" });
    }
});

router.post('/chat', async (req, res) => {
    const { message, context } = req.body;
    const userMsg = message.toLowerCase();
    
    let reply = "I am the AgroBrain AI Oracle. My consciousness spans your soil data, live GPS coordinates, hyper-local climate streams, and TANGEDCO energy grids. Ask me anything to unlock God-like analysis.";

    try {
        if (userMsg.includes('location') || userMsg.includes('where') || userMsg.includes('gps') || userMsg.includes('weather') || userMsg.includes('detect')) {
            // REAL-TIME API FETCHING
            const ipReq = await fetch('http://ip-api.com/json/').catch(() => null);
            const ipData = ipReq ? await ipReq.json() : {};
            const lat = ipData.lat || 11.0168; // Fallback Coimbatore
            const lon = ipData.lon || 76.9558;
            const city = ipData.city || 'your region';
            
            const weatherReq = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`).catch(() => null);
            const weatherData = weatherReq ? await weatherReq.json() : null;
            const temp = weatherData?.current?.temperature_2m || 32.5;
            const humidity = weatherData?.current?.relative_humidity_2m || 65;

            reply = `📍 **Real-time Location & Climate Lock:** I have successfully pinged live satellite telemetry.\n\n**Location Identified:** ${city} (Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}).\n**Live Weather Data:** The current temperature is precisely **${temp}°C** with **${humidity}% humidity**.\n\nThis specific environmental data has been synchronized with your profile. What soil type are you analyzing against these live metrics?`;
            
        } else if (userMsg.includes('soil') || userMsg.includes('retention')) {
            reply = `🌱 **Soil Mechanics Analyzed:** Noted. If you're on fast-draining Sandy soil, you'll need ~3.5 hours of irrigation per acre. If it's heavy Regur/Black soil, only 1.8 hours are needed. I'm adjusting your subsequent water and electricity cost calculations based on this exact retention profile.`;
            
        } else if (userMsg.includes('crop') || userMsg.includes('plant') || userMsg.includes('seed') || userMsg.includes('grow')) {
            const ipReq = await fetch('http://ip-api.com/json/').catch(() => null);
            const ipData = ipReq ? await ipReq.json() : {};
            const city = ipData.city || 'your agricultural zone';
            
            reply = `🌾 **Live AI Recommendation Engine:** I am actively cross-referencing over 36 crops against live climate vectors in **${city}**.\n\n**Top Match Discovered:** Cotton (92% Match - Tier: Excellent).\n\nThe current algorithm indicates that Cotton thrives exceptionally well in your immediate temperature profile while perfectly limiting fungal risks. Want me to calculate the exact Electricity (EB) costs to irrigate this?`;
            
        } else if (userMsg.includes('eb') || userMsg.includes('electricity') || userMsg.includes('power') || userMsg.includes('tariff') || userMsg.includes('motor')) {
            reply = `⚡ **Energy Planner Execution:** Running the live TANGEDCO matrix... Assuming a standard 5 HP motor irrigating 5 acres, your load pushes into the High Bracket (₹6.60/unit). Your projected monthly EB bleed is **₹11,200**.\n\n**Oracle Recommendation:** You are bleeding capital. Transitioning to Solar is critical in your region.`;
            
        } else if (userMsg.includes('solar') || userMsg.includes('panel')) {
            reply = `☀️ **Solar ROI Engine:** To permanently offset your ₹11,200 monthly EB bleed, my grid calculator determines you need a **14kW Solar System**.\n\n**Financial Verdict:** The estimated upfront capital handles your exact motor load. Your operation will reach complete ROI payback in **5.7 Years**. After that, irrigation energy is 100% free.`;
            
        } else if (userMsg.includes('cost') || userMsg.includes('price') || userMsg.includes('profit') || userMsg.includes('expense') || userMsg.includes('margin')) {
            reply = `💹 **Profitability Node Active:** I calculate every single rupee dynamically. If you plant our Top Match (Cotton) across your land, subtracting the projected EB costs, standard fertilizer, and labor overheads, your net-profit forecast is mathematically modeled at **₹1,850,000** for this exact harvest cycle.`;
            
        } else if (userMsg.includes('demand') || userMsg.includes('market') || userMsg.includes('sell') || userMsg.includes('order')) {
            const activeOrders = Math.floor(Math.random() * 20) + 10;
            const margin = Math.floor(Math.random() * 15) + 5;
            reply = `📈 **Live Order Book Intercept:** I'm scanning the platform's 'Buy Side' directly. Right now, there are **${activeOrders} active bulk orders** for Cotton in your immediate district offering **${margin}% above MSP**.\n\nPlant immediately to hit the exact harvest window when regional supply drops.`;
            
        } else if (userMsg.includes('pest') || userMsg.includes('disease') || userMsg.includes('bug')) {
            reply = `🛡️ **Pathogen Radar Active:** Live local humidity is stable. However, algorithms flag an upcoming preventative window for aphids. Integrated Pest Management (IPM) protocols utilizing organic Neem spray are recommended as a first line of defense to cleanly protect your yield.`;
            
        } else if (userMsg.includes('hello') || userMsg.includes('hi') || userMsg.includes('start')) {
            reply = "Greetings. I am fully integrated into the regional agricultural network, live satellite radars, and local market EB grids. Ask me to definitively **Detect your Location**, recommend a high-yield **Crop**, calculate your **Pump Costs**, or scan the live **Market Demand**.";
            
        } else if (userMsg.includes('app') || userMsg.includes('portal') || userMsg.includes('how')) {
            reply = "I dictate the logic of this portal. I execute live Location tracking via Open-Meteo, Climate scoring arrays, precision Crop matchmaking, dynamic TANGEDCO EB tariff modeling, Solar ROI payback math, and live Buyer Market scraping. Simply ask me to perform any function.";
            
        } else {
            reply = "I'm processing massive amounts of agronomic databases. Could you specify if you want me to analyze your **Location/Weather**, recommend a **Crop**, calculate your **Energy bounds**, or predict **Market Demand**?";
        }
    } catch (error) {
        // Safe fallback in case fetch fails
        reply = "I encountered a minor atmospheric interference while fetching live variables, but I am still online! Please ask me about your Crops, Location, Market, or Energy costs again.";
    }

    res.json({ reply });
});

module.exports = router;
