import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:hsquare/utils/constants.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  final String _baseUrl = AppConstants.baseUrl;

  Future<Map<String, dynamic>> sendOtp(String mobile) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/users/send-otp/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'mobile': mobile}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to send OTP: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String mobile, String otp) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/users/verify-otp/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'mobile': mobile, 'otp': otp}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _saveSession(data);
      return data;
    } else {
      throw Exception('Failed to verify OTP: ${response.body}');
    }
  }

  Future<void> _saveSession(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', data['access_token']);
    await prefs.setString('refresh_token', data['refresh_token']);
    await prefs.setString('user_role', data['user_role']);
    await prefs.setString('user_name', data['name'] ?? '');
    await prefs.setInt('user_id', data['id']);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('access_token');
  }
  
  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }
}
