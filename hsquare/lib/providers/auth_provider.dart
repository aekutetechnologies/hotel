import 'package:flutter/material.dart';
import 'package:hsquare/services/auth_service.dart';

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
      // Ideally fetch user profile here or load from prefs
      // For now, we assume session is valid if token exists
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
}
