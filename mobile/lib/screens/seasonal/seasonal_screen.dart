import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../../constants/colors.dart';
import '../../providers/language_provider.dart';

// ─── Crop Data Model ────────────────────────────────────────────────────────────
class CropInfo {
  final String name, waterNeeds, duration, notes;
  final double minTemp, maxTemp, minHumidity, maxHumidity;
  final List<String> soils, seasons;

  const CropInfo({
    required this.name,
    required this.minTemp, required this.maxTemp,
    required this.minHumidity, required this.maxHumidity,
    required this.soils, required this.seasons,
    required this.waterNeeds, required this.duration, required this.notes,
  });
}

// ─── Comprehensive Crop Database ────────────────────────────────────────────────
const List<CropInfo> CROPS = [
  CropInfo(name:'Rice', minTemp:20, maxTemp:38, minHumidity:60, maxHumidity:100, soils:['alluvial','clay','peaty'], seasons:['Kharif'], waterNeeds:'High', duration:'90–120 days', notes:'High humidity and standing water required.'),
  CropInfo(name:'Wheat', minTemp:10, maxTemp:24, minHumidity:40, maxHumidity:70, soils:['alluvial','clay','loamy'], seasons:['Rabi'], waterNeeds:'Moderate', duration:'100–150 days', notes:'Needs cool dry climate at maturity.'),
  CropInfo(name:'Maize', minTemp:18, maxTemp:35, minHumidity:45, maxHumidity:85, soils:['alluvial','loamy','sandy'], seasons:['Kharif','Zaid'], waterNeeds:'Moderate', duration:'70–90 days', notes:'Versatile crop, well-drained fertile soil.'),
  CropInfo(name:'Cotton', minTemp:21, maxTemp:34, minHumidity:30, maxHumidity:65, soils:['black','alluvial'], seasons:['Kharif'], waterNeeds:'Moderate', duration:'150–180 days', notes:'Hot dry climate, black soil is ideal.'),
  CropInfo(name:'Sugarcane', minTemp:20, maxTemp:38, minHumidity:70, maxHumidity:100, soils:['alluvial','black','clay'], seasons:['Kharif','Rabi'], waterNeeds:'Very High', duration:'12–18 months', notes:'Long rainy season required.'),
  CropInfo(name:'Groundnut', minTemp:22, maxTemp:36, minHumidity:40, maxHumidity:70, soils:['red','sandy','alluvial','laterite'], seasons:['Kharif','Zaid'], waterNeeds:'Low', duration:'90–130 days', notes:'Well-drained light soil preferred.'),
  CropInfo(name:'Soybean', minTemp:18, maxTemp:35, minHumidity:55, maxHumidity:80, soils:['black','alluvial','clay'], seasons:['Kharif'], waterNeeds:'Moderate', duration:'90–100 days', notes:'Good for nitrogen enrichment.'),
  CropInfo(name:'Bajra', minTemp:25, maxTemp:42, minHumidity:20, maxHumidity:60, soils:['sandy','red','alluvial'], seasons:['Kharif'], waterNeeds:'Very Low', duration:'60–90 days', notes:'Extremely drought resilient.'),
  CropInfo(name:'Jowar', minTemp:26, maxTemp:40, minHumidity:25, maxHumidity:65, soils:['black','red','alluvial'], seasons:['Kharif','Rabi'], waterNeeds:'Low', duration:'90–120 days', notes:'Drought tolerant, high temperature crop.'),
  CropInfo(name:'Mustard', minTemp:10, maxTemp:22, minHumidity:30, maxHumidity:65, soils:['alluvial','loamy','sandy'], seasons:['Rabi'], waterNeeds:'Low', duration:'90–110 days', notes:'Cool season, tolerates light frost.'),
  CropInfo(name:'Gram', minTemp:10, maxTemp:22, minHumidity:25, maxHumidity:60, soils:['alluvial','loamy','black'], seasons:['Rabi'], waterNeeds:'Low', duration:'90–110 days', notes:'Cool dry conditions preferred.'),
  CropInfo(name:'Lentil', minTemp:10, maxTemp:22, minHumidity:30, maxHumidity:65, soils:['loamy','alluvial','sandy'], seasons:['Rabi'], waterNeeds:'Low', duration:'80–110 days', notes:'Cool tolerant, moderate rainfall.'),
  CropInfo(name:'Watermelon', minTemp:24, maxTemp:40, minHumidity:30, maxHumidity:70, soils:['sandy','alluvial','loamy'], seasons:['Zaid'], waterNeeds:'Moderate', duration:'60–90 days', notes:'Warm soil and high temperatures needed.'),
  CropInfo(name:'Cucumber', minTemp:20, maxTemp:38, minHumidity:55, maxHumidity:85, soils:['loamy','alluvial','sandy'], seasons:['Zaid'], waterNeeds:'Moderate', duration:'45–65 days', notes:'Warm weather and irrigation.'),
  CropInfo(name:'Muskmelon', minTemp:25, maxTemp:40, minHumidity:30, maxHumidity:65, soils:['sandy','alluvial'], seasons:['Zaid'], waterNeeds:'Low', duration:'60–85 days', notes:'Long hot dry summers ideal.'),
  CropInfo(name:'Sunflower', minTemp:18, maxTemp:35, minHumidity:30, maxHumidity:70, soils:['black','alluvial','red'], seasons:['Kharif','Rabi'], waterNeeds:'Low', duration:'80–100 days', notes:'Day-neutral; grow-anywhere crop.'),
  CropInfo(name:'Tomato', minTemp:18, maxTemp:35, minHumidity:50, maxHumidity:80, soils:['loamy','alluvial','clay'], seasons:['Kharif','Rabi','Zaid'], waterNeeds:'Moderate', duration:'60–80 days', notes:'Warm climate, versatile soil.'),
  CropInfo(name:'Onion', minTemp:13, maxTemp:32, minHumidity:40, maxHumidity:75, soils:['loamy','alluvial'], seasons:['Rabi','Kharif'], waterNeeds:'Moderate', duration:'90–120 days', notes:'Well-drained loamy soil preferred.'),
  CropInfo(name:'Potato', minTemp:10, maxTemp:22, minHumidity:60, maxHumidity:85, soils:['loamy','alluvial','sandy'], seasons:['Rabi'], waterNeeds:'Moderate', duration:'70–120 days', notes:'Cool climate, loose fertile soil.'),
  CropInfo(name:'Tea', minTemp:13, maxTemp:30, minHumidity:70, maxHumidity:100, soils:['laterite','peaty'], seasons:['Kharif','Rabi'], waterNeeds:'High', duration:'Perennial', notes:'High altitude, acidic, heavy rainfall.'),
  CropInfo(name:'Coffee', minTemp:15, maxTemp:28, minHumidity:70, maxHumidity:100, soils:['laterite','alluvial'], seasons:['Kharif'], waterNeeds:'High', duration:'Perennial', notes:'Shade required, highland tropical.'),
  CropInfo(name:'Cashew', minTemp:20, maxTemp:38, minHumidity:50, maxHumidity:85, soils:['laterite','red'], seasons:['Kharif'], waterNeeds:'Low', duration:'Perennial', notes:'Coastal tropics, sandy/laterite soils.'),
  CropInfo(name:'Coconut', minTemp:22, maxTemp:35, minHumidity:70, maxHumidity:100, soils:['sandy','alluvial','clay'], seasons:['Kharif','Rabi'], waterNeeds:'High', duration:'Perennial', notes:'Coastal tropical regions.'),
  CropInfo(name:'Banana', minTemp:18, maxTemp:38, minHumidity:75, maxHumidity:100, soils:['alluvial','clay','loamy'], seasons:['Kharif','Zaid'], waterNeeds:'Very High', duration:'9–12 months', notes:'Tropical climate, rich moist soil.'),
  CropInfo(name:'Turmeric', minTemp:20, maxTemp:36, minHumidity:70, maxHumidity:100, soils:['alluvial','clay','red'], seasons:['Kharif'], waterNeeds:'High', duration:'8–9 months', notes:'Hot humid tropics, red/clay soil.'),
  CropInfo(name:'Barley', minTemp:7, maxTemp:22, minHumidity:25, maxHumidity:60, soils:['alluvial','loamy','sandy'], seasons:['Rabi'], waterNeeds:'Very Low', duration:'70–90 days', notes:'Most cold-tolerant cereal crop.'),
  CropInfo(name:'Rubber', minTemp:22, maxTemp:35, minHumidity:75, maxHumidity:100, soils:['laterite','clay'], seasons:['Kharif'], waterNeeds:'High', duration:'Perennial', notes:'Equatorial humid climate required.'),
  CropInfo(name:'Jute', minTemp:24, maxTemp:38, minHumidity:75, maxHumidity:100, soils:['alluvial','clay'], seasons:['Kharif'], waterNeeds:'High', duration:'100–110 days', notes:'High humidity, warm delta regions.'),
];

// ─── Season detection ───────────────────────────────────────────────────────────
String detectSeason(int month) {
  if (month >= 5 && month <= 9) return 'Kharif';
  if (month == 10 || month == 11 || month <= 2) return 'Rabi';
  return 'Zaid';
}

// ─── Crop scoring engine ────────────────────────────────────────────────────────
class ScoredCrop {
  final CropInfo crop;
  final int score;
  const ScoredCrop(this.crop, this.score);
}

List<ScoredCrop> scoreCrops(double temp, double humidity, String soil, String season) {
  List<ScoredCrop> results = [];
  for (final c in CROPS) {
    if (!c.soils.contains(soil) || !c.seasons.contains(season)) continue;
    int score = 100;
    if (temp < c.minTemp) score -= ((c.minTemp - temp) * 4).toInt();
    else if (temp > c.maxTemp) score -= ((temp - c.maxTemp) * 4).toInt();
    if (humidity < c.minHumidity) score -= ((c.minHumidity - humidity) * 1.5).toInt();
    else if (humidity > c.maxHumidity) score -= ((humidity - c.maxHumidity) * 1.5).toInt();
    score = score.clamp(0, 100);
    if (score >= 40) results.add(ScoredCrop(c, score));
  }
  results.sort((a, b) => b.score.compareTo(a.score));
  return results;
}

// ─── Screen Widget ──────────────────────────────────────────────────────────────
class SeasonalScreen extends StatefulWidget {
  const SeasonalScreen({super.key});

  @override
  State<SeasonalScreen> createState() => _SeasonalScreenState();
}

class _SeasonalScreenState extends State<SeasonalScreen> {
  String _status = 'idle'; // idle | loading | done | error
  double? _temperature, _humidity, _windSpeed;
  String _locationName = '';
  String _soilType = 'alluvial';
  String _season = '';
  List<ScoredCrop> _recommendations = [];

  final Map<String, Map<String, String>> _soilInfo = {
    'alluvial': {'name': 'Alluvial', 'color': 'c6a55c', 'desc': ''},
    'black':    {'name': 'Black (Regur)', 'color': '4a4a4a', 'desc': 'Excellent moisture retention. Ideal for cotton, soybean.'},
    'red':      {'name': 'Red / Yellow', 'color': 'c0392b', 'desc': 'High iron oxide. Suited for millets, pulses, oilseeds.'},
    'laterite': {'name': 'Laterite', 'color': '8b4513', 'desc': 'Highly leached, acidic. Best for tea, coffee, cashew.'},
    'clay':     {'name': 'Clay', 'color': '6e4b3a', 'desc': 'Heavy, holds water. Good for rice, sugarcane.'},
    'sandy':    {'name': 'Sandy', 'color': 'e4c878', 'desc': 'Fast draining. Good for groundnut, root vegetables.'},
    'loamy':    {'name': 'Loamy', 'color': '8b7355', 'desc': 'Balanced. Ideal for most crops with excellent drainage.'},
    'peaty':    {'name': 'Peaty / Marshy', 'color': '3d6b35', 'desc': 'Rich in organic matter. Best for paddy, coconut.'},
  };

  Color _soilColor(String id) {
    try { return Color(int.parse('FF${_soilInfo[id]!['color']!}', radix: 16)); }
    catch (_) { return AppColors.primary; }
  }

  // ── Fetch weather for confirmed coords ──────────────────────────────────────
  Future<void> _fetchWeatherAndAnalyze(double lat, double lon, String locLabel) async {
    setState(() { _status = 'loading'; _locationName = locLabel; });
    try {
      final weatherRes = await http.get(Uri.parse(
        'https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon'
        '&current=temperature_2m,relative_humidity_2m,wind_speed_10m'
      ));
      if (weatherRes.statusCode == 200) {
        final data = json.decode(weatherRes.body);
        final current = data['current'];
        final temp = (current['temperature_2m'] as num).toDouble();
        final humidity = (current['relative_humidity_2m'] as num).toDouble();
        final wind = (current['wind_speed_10m'] as num).toDouble();
        final month = DateTime.now().month - 1;
        final season = detectSeason(month);
        setState(() {
          _temperature = temp;
          _humidity = humidity;
          _windSpeed = wind;
          _season = season;
          _recommendations = scoreCrops(temp, humidity, _soilType, season);
          _status = 'done';
        });
      } else {
        setState(() => _status = 'error');
      }
    } catch (_) {
      setState(() => _status = 'error');
    }
  }

  // ── Open the location picker bottom sheet ────────────────────────────────────
  void _openLocationPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _LocationPickerSheet(
        onLocationSelected: (lat, lon, label) {
          Navigator.pop(context);
          _fetchWeatherAndAnalyze(lat, lon, label);
        },
      ),
    );
  }

  void _onSoilChanged(String id) {
    setState(() => _soilType = id);
    if (_temperature != null) {
      final month = DateTime.now().month - 1;
      final season = detectSeason(month);
      setState(() { _recommendations = scoreCrops(_temperature!, _humidity!, id, season); });
    }
  }

  @override
  Widget build(BuildContext context) {
    final lp = context.watch<LanguageProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(lp.translate('seasonal'), style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row for Soil and Analysis
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Soil Selection Card
                Expanded(
                  flex: 1,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    height: 140,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.grey.shade100),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(LucideIcons.sprout, size: 16, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Text(lp.translate('selectSoilType') == 'selectSoilType' ? 'Soil Selection' : lp.translate('selectSoilType'), 
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primaryDark)),
                          ],
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              value: _soilType,
                              onChanged: (val) => _onSoilChanged(val!),
                              items: _soilInfo.entries.map((e) => DropdownMenuItem(
                                value: e.key,
                                child: Text(e.value['name']!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              )).toList(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                // Analyze Card
                Expanded(
                  flex: 1,
                  child: GestureDetector(
                    onTap: _status == 'loading' ? null : _openLocationPicker,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      height: 140,
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [BoxShadow(color: AppColors.primaryDark.withOpacity(0.2), blurRadius: 10)],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _status == 'loading'
                              ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                              : const Icon(LucideIcons.leaf, color: Colors.white, size: 32),
                          const SizedBox(height: 12),
                          Text(
                            _status == 'loading' ? 'Analyzing...' : 'Analyze My Land',
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Soil Description if it exists
            if (_soilInfo[_soilType]!['desc']!.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border(left: BorderSide(color: Colors.orange.shade300, width: 4)),
                ),
                child: Text(_soilInfo[_soilType]!['desc']!, style: TextStyle(color: Colors.orange.shade800, fontSize: 11)),
              ),
              const SizedBox(height: 16),
            ],

            // Analysis Results Section
            if (_status == 'done' && _recommendations.isNotEmpty) ...[
              // Climate Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.grey.shade100),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _statChip(LucideIcons.thermometer, '${_temperature!.toStringAsFixed(1)}°C', 'Temp', Colors.orange),
                    _statChip(LucideIcons.droplets, '${_humidity!.toInt()}%', 'Humidity', Colors.blue),
                    _statChip(LucideIcons.cloudSun, _season, 'Season', Colors.green),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              Text(lp.translate('topCrops') == 'topCrops' ? 'Top Crop Recommendations' : lp.translate('topCrops'), 
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primaryDark)),
              const SizedBox(height: 12),
              ..._recommendations.take(6).map((sc) {
                final scoreColor = sc.score > 80 ? Colors.green : sc.score > 60 ? Colors.amber : Colors.orange;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.grey.shade100)),
                  child: Row(children: [
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(color: scoreColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: Center(child: Text(sc.crop.name[0], style: TextStyle(fontWeight: FontWeight.bold, color: scoreColor, fontSize: 18))),
                    ),
                    const SizedBox(width: 14),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(sc.crop.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text('${sc.crop.duration} • ${sc.crop.waterNeeds} Water', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    ])),
                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                      Text('${sc.score}%', style: TextStyle(fontWeight: FontWeight.bold, color: scoreColor, fontSize: 15)),
                      Text('Match', style: TextStyle(color: scoreColor.withOpacity(0.7), fontSize: 10, fontWeight: FontWeight.bold)),
                    ]),
                  ]),
                );
              }),
            ] else if (_status == 'idle') ...[
              // Placeholder for when results are not yet available - matching the image's "Analysis Results" box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(40),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey.shade200, style: BorderStyle.solid),
                ),
                child: Column(
                  children: [
                    Icon(LucideIcons.sprout, size: 48, color: Colors.grey[200]),
                    const SizedBox(height: 20),
                    const Text('Analysis Results', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
                    const SizedBox(height: 8),
                    Text(
                      'Adjust your details above and click "Analyze My Land" to see suggestions here.', 
                      textAlign: TextAlign.center, 
                      style: TextStyle(color: Colors.grey[400], fontSize: 13)
                    ),
                  ],
                ),
              ),
            ] else if (_status == 'loading') ...[
              const Center(child: Padding(padding: EdgeInsets.all(40.0), child: CircularProgressIndicator()))
            ],

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _statChip(IconData icon, String val, String label, Color color) {
    return Column(children: [
      Icon(icon, size: 20, color: color),
      const SizedBox(height: 4),
      Text(val, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 13)),
      Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
    ]);
  }
}

// ─── Location Picker Bottom Sheet ───────────────────────────────────────────────
class _LocationPickerSheet extends StatefulWidget {
  final void Function(double lat, double lon, String label) onLocationSelected;
  const _LocationPickerSheet({required this.onLocationSelected});

  @override
  State<_LocationPickerSheet> createState() => _LocationPickerSheetState();
}

class _LocationPickerSheetState extends State<_LocationPickerSheet> {
  final TextEditingController _ctrl = TextEditingController();
  Timer? _debounce;
  String _searchStatus = 'idle'; // idle | searching | done | error
  String _gpsStatus = 'idle';    // idle | detecting | error
  List<dynamic> _results = [];

  @override
  void dispose() {
    _ctrl.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String val) {
    _debounce?.cancel();
    if (val.trim().length < 3) {
      setState(() { _searchStatus = 'idle'; _results = []; });
      return;
    }
    setState(() => _searchStatus = 'searching');
    _debounce = Timer(const Duration(milliseconds: 500), () => _doSearch(val));
  }

  Future<void> _doSearch(String query) async {
    try {
      final res = await http.get(
        Uri.parse('https://nominatim.openstreetmap.org/search?q=${Uri.encodeComponent(query)}&format=json&addressdetails=1&countrycodes=in&limit=6&accept-language=en'),
        headers: {'User-Agent': 'FarmerPlatformApp/1.0'},
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body) as List;
        setState(() {
          _results = data;
          _searchStatus = data.isEmpty ? 'error' : 'done';
        });
      } else {
        setState(() => _searchStatus = 'error');
      }
    } catch (_) {
      setState(() => _searchStatus = 'error');
    }
  }

  void _selectResult(Map<String, dynamic> r) {
    final addr = r['address'] as Map<String, dynamic>? ?? {};
    final primary = addr['city'] ?? addr['town'] ?? addr['village'] ?? addr['state_district'] ?? (r['display_name'] as String).split(',').first;
    final state = addr['state'] ?? '';
    final label = state.isNotEmpty ? '$primary, $state' : primary as String;
    final lat = double.parse(r['lat']);
    final lon = double.parse(r['lon']);
    widget.onLocationSelected(lat, lon, label);
  }

  Future<void> _detectGPS() async {
    setState(() => _gpsStatus = 'detecting');
    // For Flutter Web, Geolocation API is available via dart:html
    // We use a fallback approach – show error and instruct manual search
    // On a real device, use the geolocator package
    await Future.delayed(const Duration(seconds: 2));
    // Since geolocator package is not added, fall back gracefully
    setState(() => _gpsStatus = 'error');
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      padding: EdgeInsets.only(left: 20, right: 20, top: 20, bottom: 20 + bottomInset),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Handle
        Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
        const SizedBox(height: 20),

        // Header
        const Text('Choose Location', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
        const SizedBox(height: 4),
        const Text('Search your village, town, or city in India', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
        const SizedBox(height: 20),

        // GPS Button
        GestureDetector(
          onTap: _gpsStatus == 'detecting' ? null : _detectGPS,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _gpsStatus == 'error' ? Colors.red.shade50 : Colors.green.shade50,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _gpsStatus == 'error' ? Colors.red.shade200 : Colors.green.shade200, width: 2),
            ),
            child: Row(children: [
              _gpsStatus == 'detecting'
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                  : Icon(_gpsStatus == 'error' ? LucideIcons.wifiOff : LucideIcons.navigation,
                      size: 22, color: _gpsStatus == 'error' ? Colors.red : AppColors.primary),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(
                  _gpsStatus == 'detecting' ? 'Detecting location…'
                      : _gpsStatus == 'error' ? 'GPS unavailable — use manual search below'
                      : 'Detect Live Location (GPS)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14,
                    color: _gpsStatus == 'error' ? Colors.red.shade700 : AppColors.primaryDark),
                ),
              ])),
            ]),
          ),
        ),

        // Divider
        const SizedBox(height: 18),
        Row(children: [
          Expanded(child: Divider(color: Colors.grey.shade200)),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text('or enter manually', style: TextStyle(fontSize: 12, color: Colors.grey.shade400))),
          Expanded(child: Divider(color: Colors.grey.shade200)),
        ]),
        const SizedBox(height: 14),

        // Search Input
        TextField(
          controller: _ctrl,
          onChanged: _onSearchChanged,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'e.g. Coimbatore, Tamil Nadu…',
            hintStyle: TextStyle(color: Colors.grey.shade400),
            prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppColors.textMuted),
            suffixIcon: _searchStatus == 'searching'
                ? const Padding(padding: EdgeInsets.all(12), child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)))
                : null,
            filled: true, fillColor: Colors.grey.shade50,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
          ),
        ),

        // Hint
        if (_ctrl.text.isNotEmpty && _ctrl.text.length < 3) ...[
          const SizedBox(height: 10),
          const Center(child: Text('Type at least 3 characters to search…', style: TextStyle(fontSize: 12, color: AppColors.textMuted))),
        ],

        // Results
        if (_searchStatus == 'done' && _results.isNotEmpty) ...[
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey.shade200)),
            child: Column(
              children: _results.asMap().entries.map((entry) {
                final i = entry.key;
                final r = entry.value as Map<String, dynamic>;
                final addr = r['address'] as Map<String, dynamic>? ?? {};
                final primary = addr['city'] ?? addr['town'] ?? addr['village'] ?? addr['state_district'] ?? (r['display_name'] as String).split(',').first;
                final secondary = [addr['state'], addr['country']].whereType<String>().join(', ');
                return Column(children: [
                  if (i > 0) Divider(height: 1, color: Colors.grey.shade200),
                  InkWell(
                    onTap: () => _selectResult(r),
                    borderRadius: BorderRadius.circular(14),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(children: [
                        const Icon(LucideIcons.mapPin, size: 16, color: AppColors.primary),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(primary.toString(), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          if (secondary.isNotEmpty)
                            Text(secondary, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        ])),
                        const Icon(LucideIcons.chevronRight, size: 16, color: AppColors.textMuted),
                      ]),
                    ),
                  ),
                ]);
              }).toList(),
            ),
          ),
        ],

        // No results
        if (_searchStatus == 'error') ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(12)),
            child: Row(children: [
              Icon(LucideIcons.info, size: 16, color: Colors.orange.shade700),
              const SizedBox(width: 10),
              Expanded(child: Text('No locations found in India. Try a nearby city or district name.',
                style: TextStyle(fontSize: 12, color: Colors.orange.shade800))),
            ]),
          ),
        ],

        const SizedBox(height: 10),
      ])),
    );
  }
}
