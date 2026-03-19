import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import '../../constants/colors.dart';
import '../../services/api_service.dart';
import '../../providers/language_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _userName = '';
  String _phone = '';
  String _role = 'farmer';
  bool _notificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userName = prefs.getString('userName') ?? 'Farmer';
      _phone = prefs.getString('userPhone') ?? '';
      _role = prefs.getString('role') ?? 'farmer';
    });
  }

  Future<void> _logout() async {
    await ApiService.logout();
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/', (_) => false);
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
        title: Text(lp.translate('settings'), style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey[100]!),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
              ),
              child: Row(
                children: [
                   Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      color: AppColors.secondary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(LucideIcons.user, color: AppColors.primary, size: 32),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_userName,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primaryDark)),
                        const SizedBox(height: 2),
                        Text(_phone, style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.secondary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _role[0].toUpperCase() + _role.substring(1),
                            style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(lp.translate('editProfile'), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),
            Text(lp.translate('settings'),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.primaryDark)),
            const SizedBox(height: 12),

            _buildSettingTile(
              icon: LucideIcons.bell,
              label: lp.translate('notifications'),
              subtitle: 'Manage alerts and updates',
              trailing: Switch(
                value: _notificationsEnabled,
                onChanged: (v) => setState(() => _notificationsEnabled = v),
                activeColor: AppColors.primary,
              ),
            ),
            _buildSettingTile(
              icon: LucideIcons.shield,
              label: 'Privacy & Security',
              subtitle: 'Change password, manage 2FA',
              onTap: () {},
            ),
            _buildSettingTile(
              icon: LucideIcons.globe,
              label: lp.translate('selectLanguage'),
              subtitle: lp.translate('selectLanguage'),
              onTap: () => _showLanguageSheet(lp),
            ),
            _buildSettingTile(
              icon: LucideIcons.creditCard,
              label: 'Payment Methods',
              subtitle: 'Add bank details for payouts',
              onTap: () {},
            ),
            _buildSettingTile(
              icon: LucideIcons.smartphone,
              label: 'App Version',
              subtitle: 'v1.0.0 — Farmer Platform',
            ),

            const SizedBox(height: 28),
            Text(lp.translate('accountProfile'),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.primaryDark)),
            const SizedBox(height: 12),

            // Logout
            GestureDetector(
              onTap: () => _confirmLogout(lp),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.red.shade100),
                ),
                child: Row(
                  children: [
                    Icon(LucideIcons.logOut, color: Colors.red.shade400, size: 22),
                    const SizedBox(width: 14),
                    Text(lp.translate('logout'),
                        style: TextStyle(color: Colors.red.shade400, fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String label,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[100]!),
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: AppColors.textMuted, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                ],
              ),
            ),
            trailing ?? (onTap != null
                ? const Icon(LucideIcons.chevronRight, color: AppColors.textMuted, size: 18)
                : const SizedBox()),
          ],
        ),
      ),
    );
  }

  void _confirmLogout(LanguageProvider lp) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(lp.translate('logout'), style: const TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () { Navigator.pop(ctx); _logout(); },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text(lp.translate('logout'), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showLanguageSheet(LanguageProvider lp) {
    final languages = [
      {'code': 'en', 'name': 'English'},
      {'code': 'hi', 'name': 'हिंदी'},
      {'code': 'ta', 'name': 'தமிழ்'},
      {'code': 'te', 'name': 'తెలుగు'},
      {'code': 'mr', 'name': 'मराठी'},
      {'code': 'bn', 'name': 'বাংলা'},
      {'code': 'kn', 'name': 'ಕನ್ನಡ'},
      {'code': 'ml', 'name': 'മലയാളം'},
      {'code': 'gu', 'name': 'ગુજરાતી'},
      {'code': 'pa', 'name': 'ਪੰਜਾਬੀ'},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4,
                decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 20),
            Text(lp.translate('selectLanguage'),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: languages.length,
                itemBuilder: (context, index) {
                  final lang = languages[index];
                  final isSelected = lp.currentLocale == lang['code'];
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(lang['name']!, 
                      style: TextStyle(
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? AppColors.primary : AppColors.primaryDark,
                      )
                    ),
                    onTap: () {
                      lp.setLocale(lang['code']!);
                      Navigator.pop(context);
                    },
                    trailing: isSelected 
                      ? const Icon(LucideIcons.check, color: AppColors.primary, size: 20)
                      : const Icon(LucideIcons.chevronRight, size: 16, color: Colors.grey),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
