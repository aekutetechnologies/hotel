import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;

  // Getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _isAuthenticated;

  // Initialize authentication state
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      _isAuthenticated = StorageService.isLoggedIn;
      
      if (_isAuthenticated) {
        // Try to get user profile
        _user = await AuthService.getProfile();
      }
    } catch (e) {
      _error = e.toString();
      _isAuthenticated = false;
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Send OTP
  Future<bool> sendOtp(String mobileNumber) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final success = await AuthService.sendOtp(mobileNumber);
      return success;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Verify OTP
  Future<bool> verifyOtp({
    required String mobileNumber,
    required String otp,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await AuthService.verifyOtp(
        mobileNumber: mobileNumber,
        otp: otp,
      );

      // Get user profile
      _user = await AuthService.getProfile();
      _isAuthenticated = true;
      
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update profile
  Future<bool> updateProfile({
    required String name,
    required String email,
    String? mobile,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await AuthService.updateProfile(
        name: name,
        email: email,
        mobile: mobile,
      );
      
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await AuthService.logout();
      _user = null;
      _isAuthenticated = false;
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Get current user data from storage
  Map<String, String?> get currentUserData {
    return AuthService.currentUser;
  }

  // Check if user has specific permission
  bool hasPermission(String permission) {
    if (!_isAuthenticated || _user == null) return false;
    
    final permissions = StorageService.getUserPermissions();
    if (permissions == null) return false;
    
    return permissions.contains(permission);
  }

  // Check if user is admin
  bool get isAdmin {
    return _user?.role == 'admin' || hasPermission('admin');
  }

  // Check if user is customer
  bool get isCustomer {
    return _user?.role == 'customer';
  }
}
