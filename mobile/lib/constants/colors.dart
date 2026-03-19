import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF2D6A4F);
  static const Color primaryDark = Color(0xFF1B4332);
  static const Color primaryLight = Color(0xFF40916C);
  static const Color secondary = Color(0xFFD8F3DC);
  
  static const Color background = Color(0xFFF0F2F0);
  static const Color surface = Colors.white;
  
  static const Color textMain = Color(0xFF1A202C);
  static const Color textMuted = Color(0xFF718096);
  
  static const Color success = Color(0xFF2D6A4F);
  static const Color error = Color(0xFFE63946);
  static const Color warning = Color(0xFFF6AD55);
  
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryDark, primary],
  );
}
