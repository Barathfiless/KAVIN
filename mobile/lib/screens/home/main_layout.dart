import 'package:provider/provider.dart';
import '../../constants/colors.dart';
import '../../providers/language_provider.dart';
import '../dashboard_screen.dart';
import '../crops/crops_screen.dart';
import '../listings/my_listings_screen.dart';
import '../community/community_screen.dart';
import '../settings/settings_screen.dart';
import '../seasonal/seasonal_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const DashboardScreen(),
    const SeasonalScreen(),
    const CropsScreen(),
    const MyListingsScreen(),
    const CommunityScreen(),
    const SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final lp = context.watch<LanguageProvider>();

    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            )
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) => setState(() => _selectedIndex = index),
          selectedItemColor: AppColors.primary,
          unselectedItemColor: Colors.grey,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          items: [
            BottomNavigationBarItem(icon: const Icon(LucideIcons.home), label: lp.translate('farmOverview')),
            BottomNavigationBarItem(icon: const Icon(LucideIcons.cloudSun), label: lp.translate('seasonal')),
            BottomNavigationBarItem(icon: const Icon(LucideIcons.sprout), label: lp.translate('cropManagement')),
            BottomNavigationBarItem(icon: const Icon(LucideIcons.shoppingBag), label: lp.translate('myListings')),
            BottomNavigationBarItem(icon: const Icon(LucideIcons.users), label: lp.translate('farmerForum')),
            BottomNavigationBarItem(icon: const Icon(LucideIcons.settings), label: lp.translate('settings')),
          ],
        ),
      ),
    );
  }
}
