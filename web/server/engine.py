import sys
import json

def calculate_plan(district, crop, land_size, motor_hp, soil_type):
    try:
        hp = float(motor_hp)
        land = float(land_size)
    except ValueError:
        hp = 5.0
        land = 2.0

    # A) Power Calculation
    kw = hp * 0.746
    irrigation_hours = 6
    daily_units = kw * irrigation_hours
    monthly_units = daily_units * 30
    tariff = 6
    monthly_cost = monthly_units * tariff

    # B) Solar Module
    solar_required_kw = int(kw * 1.2 + 0.99) # Ceil logic
    cost_saving = monthly_cost
    solar_install_cost = solar_required_kw * 50000
    payback_years = round(solar_install_cost / (cost_saving * 12) if cost_saving > 0 else 0, 1)

    # C) AI Prediction
    price_trend = f"Sell after 5 days — price for {crop} may increase by 12% due to upcoming market demand."

    # D) Rule-based Engine
    rules = []
    soil_lower = soil_type.lower()
    dist_lower = district.lower()

    if soil_lower == 'loamy' or dist_lower == 'madurai':
        rules.append("Soil is Loamy: Paddy and Sugarcane are highly recommended.")
    elif soil_lower == 'black' or dist_lower == 'coimbatore':
        rules.append("Soil is Black Cotton: Best for Cotton, Millets, and Turmeric.")
    elif soil_lower == 'alluvial' or dist_lower == 'thanjavur':
        rules.append("Soil is Alluvial: Perfect for Paddy and Banana cultivation.")
    else:
        rules.append(f"Based on {soil_type} soil, Maize or Groundnut are good resilient choices.")

    if tariff >= 6:
        rules.append("Electricity tariff is high: Operate pumps at off-peak hours (10 PM to 5 AM) or switch to Solar.")

    # E) Profit Estimation
    yield_per_acre = 15
    price_per_ton = 15000
    revenue = land * yield_per_acre * price_per_ton
    expenses = (land * 40000) + (monthly_cost * 4)
    profit = revenue - expenses

    result = {
        "powerConsumption": {
            "motorPowerKW": round(kw, 2),
            "dailyUnits": round(daily_units, 2),
            "monthlyCost": round(monthly_cost, 2),
            "suggestion": "Run motor at night (10 PM to 5 AM) to save EB cost up to 30% off-peak."
        },
        "solarIntelligence": {
            "solarRequiredKW": solar_required_kw,
            "monthlySaving": round(cost_saving, 2),
            "paybackYears": payback_years,
            "installCost": solar_install_cost
        },
        "aiPrediction": {
            "priceTrend": price_trend,
            "bestMarket": f"{district} Central Market",
            "harvestTime": "Harvest early morning to preserve moisture. Optimal window is 90-110 days."
        },
        "decisionEngine": {
            "recommendations": rules,
            "profitEstimation": {
                "revenue": revenue,
                "totalExpenses": expenses,
                "finalProfit": profit
            }
        }
    }
    return result

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Expected arguments: district crop land_size motor_hp soil_type
        args = sys.argv[1:]
        district = args[0] if len(args) > 0 else 'Unknown'
        crop = args[1] if len(args) > 1 else 'Unknown'
        land_size = args[2] if len(args) > 2 else '2'
        motor_hp = args[3] if len(args) > 3 else '5'
        soil_type = args[4] if len(args) > 4 else 'Alluvial'
        
        output = calculate_plan(district, crop, land_size, motor_hp, soil_type)
        print(json.dumps(output))
    else:
        print(json.dumps({"error": "No arguments provided"}))
