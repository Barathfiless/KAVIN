import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/language_provider.dart';
import 'screens/auth/auth_screen.dart';
import 'screens/home/main_layout.dart';
import 'constants/colors.dart';

void main() {
  debugPrint("App starting...");
  WidgetsFlutterBinding.ensureInitialized();
  debugPrint("Binding initialized");
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) {
          debugPrint("Creating LanguageProvider");
          return LanguageProvider();
        }),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Farmer Platform',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
        ),
        scaffoldBackgroundColor: AppColors.background,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const AuthScreen(),
        '/main': (context) => const MainLayout(),
      },
    );
  }
}
