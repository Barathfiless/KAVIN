import 'package:provider/provider.dart';
import '../../constants/colors.dart';
import '../../models/crop.dart';
import '../../services/api_service.dart';
import '../../providers/language_provider.dart';

class CropsScreen extends StatefulWidget {
  const CropsScreen({super.key});

  @override
  State<CropsScreen> createState() => _CropsScreenState();
}

class _CropsScreenState extends State<CropsScreen> {
  List<Crop> _allCrops = [];
  List<Crop> _filteredCrops = [];
  String _searchQuery = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCrops();
  }

  Future<void> _loadCrops() async {
    setState(() => _isLoading = true);
    final data = await ApiService.getCrops();
    setState(() {
      _allCrops = data.map((json) => Crop(
        id: json['_id'],
        name: json['name'],
        variety: json['variety'] ?? '',
        quantity: json['quantity'] ?? '',
        price: json['price'] ?? '',
        status: json['status'] ?? 'Growing',
        icon: json['icon'] ?? '🌱',
      )).toList();
      _filteredCrops = _allCrops;
      _isLoading = false;
    });
  }

  void _filterCrops(String query) {
    setState(() {
      _searchQuery = query;
      _filteredCrops = _allCrops
          .where((crop) => crop.name.toLowerCase().contains(query.toLowerCase()) || 
                           crop.variety.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Ready': return Colors.green;
      case 'Growing': return Colors.blue;
      case 'Pending': return Colors.orange;
      case 'Out of Stock': return Colors.red;
      default: return Colors.grey;
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
        title: Text(lp.translate('cropManagement'), style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              backgroundColor: AppColors.primary,
              child: IconButton(
                onPressed: () => _showAddCropSheet(lp),
                icon: const Icon(LucideIcons.plus, color: Colors.white, size: 20),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[200]!),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
              ),
              child: TextField(
                onChanged: _filterCrops,
                decoration: InputDecoration(
                  hintText: lp.translate('searchCrops'),
                  icon: const Icon(LucideIcons.search, size: 18, color: AppColors.textMuted),
                  border: InputBorder.none,
                ),
              ),
            ),
          ),
          
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _filteredCrops.isEmpty 
                  ? _buildEmptyState(lp)
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: _filteredCrops.length,
                      itemBuilder: (context, index) {
                        final crop = _filteredCrops[index];
                        return _buildCropCard(crop);
                      },
                    ),
          ),
        ],
      ),
    );
  }

  void _showAddCropSheet(LanguageProvider lp) {
    final nameController = TextEditingController();
    final varietyController = TextEditingController();
    final quantityController = TextEditingController();
    final priceController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          top: 20,
          left: 20,
          right: 20,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                lp.translate('addCrop'),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryDark,
                ),
              ),
              const SizedBox(height: 24),
              _buildFormInput(lp.translate('cropName'), "e.g. Tomato", nameController),
              _buildFormInput(lp.translate('variety'), "e.g. Roma", varietyController),
              Row(
                children: [
                  Expanded(child: _buildFormInput(lp.translate('quantity'), "e.g. 50kg", quantityController)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildFormInput(lp.translate('price'), "e.g. ₹40/kg", priceController)),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () async {
                    if (nameController.text.isNotEmpty) {
                      await ApiService.addCrop({
                        'name': nameController.text,
                        'variety': varietyController.text,
                        'quantity': quantityController.text,
                        'price': priceController.text,
                        'status': 'Ready',
                        'icon': '🌱',
                      });
                      Navigator.pop(context);
                      _loadCrops();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(lp.translate('addCrop'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFormInput(String label, String hint, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 8),
          TextField(
            controller: controller,
            decoration: InputDecoration(
              hintText: hint,
              filled: true,
              fillColor: Colors.grey[50],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey[200]!),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCropCard(Crop crop) {
    Color statusColor = _getStatusColor(crop.status);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(child: Text(crop.icon, style: const TextStyle(fontSize: 24))),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(crop.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(crop.variety, style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(crop.price, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  crop.status,
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(LanguageProvider lp) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.sprout, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isEmpty ? "No crops listed yet." : "No matching crops found.",
            style: TextStyle(color: Colors.grey[500], fontWeight: FontWeight.bold),
          ),
          if (_searchQuery.isEmpty)
            Text(
              "Start by adding your first harvest!",
              style: TextStyle(color: Colors.grey[400]),
            ),
        ],
      ),
    );
  }
}
