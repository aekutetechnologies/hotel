import '../config/api_config.dart';
import '../models/user.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  // Send OTP to mobile number
  static Future<bool> sendOtp(String mobileNumber) async {
    try {
      final response = await ApiService.post(
        ApiConfig.sendOtp,
        body: {
          'mobile': mobileNumber,
        },
        includeAuth: false,
      );
      
      return response != null;
    } catch (e) {
      throw Exception('Failed to send OTP: ${e.toString()}');
    }
  }
  
  // Verify OTP and get authentication token
  static Future<AuthResponse> verifyOtp({
    required String mobileNumber,
    required String otp,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConfig.verifyOtp,
        body: {
          'mobile': mobileNumber,
          'otp': otp,
        },
        includeAuth: false,
      );
      
      if (response == null) {
        throw Exception('Invalid response from server');
      }
      
      final authResponse = AuthResponse.fromJson(response);
      
      // Store authentication data
      await StorageService.setUserData({
        'accessToken': authResponse.accessToken,
        'userId': authResponse.id.toString(),
        'name': authResponse.name,
        'role': authResponse.userRole,
        'permissions': authResponse.permissions.toString(),
      });
      
      return authResponse;
    } catch (e) {
      throw Exception('Failed to verify OTP: ${e.toString()}');
    }
  }
  
  // Get user profile
  static Future<User> getProfile() async {
    try {
      final response = await ApiService.get(
        ApiConfig.profile,
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Invalid response from server');
      }
      
      return User.fromJson(response);
    } catch (e) {
      throw Exception('Failed to get profile: ${e.toString()}');
    }
  }
  
  // Update user profile
  static Future<User> updateProfile({
    required String name,
    required String email,
    String? mobile,
  }) async {
    try {
      final response = await ApiService.put(
        ApiConfig.profile,
        body: {
          'name': name,
          'email': email,
          if (mobile != null) 'mobile': mobile,
        },
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Invalid response from server');
      }
      
      final user = User.fromJson(response);
      
      // Update stored user data
      await StorageService.setUserName(user.name);
      await StorageService.setUserEmail(user.email);
      if (user.mobile.isNotEmpty) {
        await StorageService.setUserMobile(user.mobile);
      }
      
      return user;
    } catch (e) {
      throw Exception('Failed to update profile: ${e.toString()}');
    }
  }
  
  // Check if user is authenticated
  static bool get isAuthenticated {
    return StorageService.isLoggedIn;
  }
  
  // Get current user data from storage
  static Map<String, String?> get currentUser {
    return StorageService.getUserData();
  }
  
  // Logout user
  static Future<void> logout() async {
    await StorageService.clearUserData();
  }
  
  // Get stored access token
  static String? get accessToken {
    return StorageService.getAccessToken();
  }
}

// Authentication response model
class AuthResponse {
  final String accessToken;
  final int id;
  final String name;
  final String userRole;
  final Set<String> permissions;
  
  AuthResponse({
    required this.accessToken,
    required this.id,
    required this.name,
    required this.userRole,
    required this.permissions,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['access_token'] ?? '',
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      userRole: json['user_role'] ?? 'customer',
      permissions: json['permissions'] != null 
          ? Set<String>.from(json['permissions'])
          : <String>{},
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'id': id,
      'name': name,
      'user_role': userRole,
      'permissions': permissions.toList(),
    };
  }
  
  @override
  String toString() {
    return 'AuthResponse(id: $id, name: $name, role: $userRole)';
  }
}