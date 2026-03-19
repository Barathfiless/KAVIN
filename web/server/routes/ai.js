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
            `💡 Pro Tip: To maximize ${cropName} yield in these conditions, consider implementing drip irrigation to maintain consistent root moisture without waterlogging.`,
            `⚠️ Seasonal Risk: Watch for early signs of fungal growth if humidity exceeds 85% for more than 48 hours.`,
            `📅 Harvest Window: Your optimized harvest window is approximately 85-95 days from sowing, based on projected thermal units.`
        ];

        res.json({
            analysis: insights.join('\n\n'),
            confidence: 94,
            generatedAt: new Date()
        });
    } catch (err) {
        res.status(500).json({ message: "AI Engine encountered an error" });
    }
});

router.post('/chat', async (req, res) => {
    const { message, context } = req.body;
    
    // Knowledge Base for the AI Assistant
    const keywords = {
        'pest': 'For common pests like aphids, consider Neem oil spray as an organic first line of defense.',
        'fertilizer': 'Based on your recent soil report, N-P-K (10-10-10) is recommended for your current growth phase.',
        'market': 'Market trends show a 12% price increase for organic wheat in your neighboring districts.',
        'weather': 'Heavy rainfall is expected in 3 days. Ensure your drainage systems are clear to prevent root rot.'
    };

    let reply = "I'm Harvest Hub AI. How can I help with your farming today? I can analyze soil, predict yields, and track market trends.";
    
    for (const [key, val] of Object.entries(keywords)) {
        if (message.toLowerCase().includes(key)) {
            reply = val;
            break;
        }
    }

    res.json({ reply });
});

module.exports = router;
