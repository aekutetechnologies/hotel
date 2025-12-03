import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class AppColors {
  static const Color primaryRed = Color(0xFFA31C44);
  static const Color primaryGrey = Color(0xFF454F61);
  static const Color background = Color(0xFFF5F5F5);
  static const Color textMain = Colors.black;
  static const Color textSecondary = Colors.grey;
}

class AppConstants {
  // Use localhost for web, 10.0.2.2 for Android Emulator, localhost for iOS Simulator
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000/api';
    }
    return 'http://10.0.2.2:8000/api';
  }
}
