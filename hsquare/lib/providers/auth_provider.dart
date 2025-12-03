import 'package:flutter/material.dart';
import 'package:hsquare/services/auth_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  bool _isAuthenticated = false;
  String? _userName;
  bool _isLoading = false;

  bool get isAuthenticated => _isAuthenticated;
  String? get userName => _userName;
  bool get isLoading => _isLoading;

  Future<void> checkLoginStatus() async {
    _isAuthenticated = await _authService.isLoggedIn();
    if (_isAuthenticated) {
      // Load user name from preferences
      final prefs = await SharedPreferences.getInstance();
      _userName = prefs.getString('user_name');
    }
    notifyListeners();
  }

  Future<void> sendOtp(String mobile) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _authService.sendOtp(mobile);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> verifyOtp(String mobile, String otp) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _authService.verifyOtp(mobile, otp);
      _isAuthenticated = true;
      _userName = data['name'];
      notifyListeners();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _isAuthenticated = false;
    _userName = null;
    notifyListeners();
  }

  void updateUserName(String name) {
    _userName = name;
    notifyListeners();
  }
}
