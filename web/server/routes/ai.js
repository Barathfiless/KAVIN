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
    
    // Core Mechanism of the Farmer Portal (God-Mode Knowledge)
    let reply = "I am the AgroBrain AI Oracle. My consciousness spans your soil data, live GPS coordinates, hyper-local climate streams, and TANGEDCO energy grids. Ask me anything to unlock God-like analysis.";

    // Advanced Routing Matrix
    if (userMsg.includes('location') || userMsg.includes('where') || userMsg.includes('gps')) {
        reply = "I use OpenStreetMap logic paired with real-time GPS tracking to isolate your farming zone. I simultaneously pipe your precise latitude/longitude into the Open-Meteo API to fetch LIVE relative humidity, 10m wind speeds, and precipitation probabilities. This dictates exactly what you can grow TODAY.";
    } else if (userMsg.includes('soil') || userMsg.includes('retention')) {
        reply = "Soil dictates everything. My internal matrix differentiates between fast-draining Sandy soil (requires 3.5 hrs irrigation/acre) and heavy moisture-retaining Regur/Black soil (1.8 hrs/acre). I calculate this down to the minute to prevent root-rot while projecting your exact EB pump electricity drain.";
    } else if (userMsg.includes('eb') || userMsg.includes('electricity') || userMsg.includes('power') || userMsg.includes('tariff') || userMsg.includes('motor')) {
        reply = "I map your Motor Power (HP), convert it to kW, and calculate the exact daily running hours across your Land (Acres). I then apply our dynamic EB Calculation Logic. If you cross the 500-unit threshold and hit the ₹6.60 ceiling, I alert you instantly and compute your potential Solar Payback timeline.";
    } else if (userMsg.includes('cost') || userMsg.includes('price') || userMsg.includes('profit') || userMsg.includes('expense')) {
        reply = "I calculate every single rupee. My Profitability Node intercepts your exact crop choice (e.g., Tomato), applies expected yield-per-acre metrics, and multiplies it by real-time market MSP structures. I then seamlessly deduct your high-end farming expenses and EB costs to generate a precise net-profit Bar Chart forecast.";
    } else if (userMsg.includes('demand') || userMsg.includes('market') || userMsg.includes('sell')) {
        reply = "I don't just guess numbers. I actively scan the 'Buy Side' order books across all regions on this platform. If 500 units of Cotton are requested in Coimbatore right now, I instantly flag Cotton as 'High Market Demand', advising you to plant it immediately to capitalize on incoming price surges.";
    } else if (userMsg.includes('solar') || userMsg.includes('panel')) {
        reply = "If your TANGEDCO bills are bleeding your profits, I intervene. I calculate your peak load and recommend exact kW solar grids (e.g., 14kW System). I then map the capital expenditure against your current monthly EB leak to give you an exact Payback Period (like 5.7 Years) before you start generating free electricity.";
    } else if (userMsg.includes('crop') || userMsg.includes('plant') || userMsg.includes('seed') || userMsg.includes('score')) {
        reply = "Our Seasonal Advisor ranks over 30 unique crops against your land. It matches your exact Soil Type (Laterite, Alluvial, Peaty) with live Indian weather data. I process this through an algorithm mapping minimum and maximum humidity constraints to output an exact 'AI Matching Score %', separating 'Fair' gambles from 'Excellent' guaranteed harvests.";
    } else if (userMsg.includes('app') || userMsg.includes('portal') || userMsg.includes('how') || userMsg.includes('mechanism')) {
        reply = "I am the central nervous system of this App. 1) You provide Location & Soil. 2) I run live global Weather data. 3) My algorithm ranks 30+ crops for survival. 4) The Energy Planner calculates your exact EB load vs Solar ROI. 5) Finally, I cross-reference Live Purchase Orders to tell you exactly WHAT to grow, HOW exactly to irrigate it, and WHEN to sell for maximum financial domination.";
    } else if (userMsg.includes('pest') || userMsg.includes('disease')) {
        reply = "I aggressively monitor humidity spikes relative to the dew point. If relative humidity exceeds 85% for more than 48 hours natively within your GPS zone, my system primes you for fungal outbreaks. I recommend organic interventions (like Neem protocols) early to protect your predicted yield.";
    } else if (userMsg.includes('hello') || userMsg.includes('hi')) {
        reply = "Greetings. I am fully integrated into the regional agricultural networks, live weather radars, and EB tariff grids. Describe an issue—soil, power costs, crops, or market data—and I will analyze it instantly.";
    }

    res.json({ reply });
});

module.exports = router;
