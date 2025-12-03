import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:hsquare/services/auth_service.dart';

class ApiClient {
  final String _baseUrl = AppConstants.baseUrl;
  final AuthService _authService = AuthService();

  Future<Map<String, String>> _getHeaders({bool requiresAuth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      final token = await _authService.getAccessToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<http.Response> _handleResponse(http.Response response, {String? requestBody}) async {
    if (response.statusCode == 401) {
      // Try to refresh token
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Retry original request
        final originalRequest = response.request;
        if (originalRequest != null) {
          final headers = await _getHeaders(requiresAuth: true);
          if (originalRequest.method == 'GET') {
            return await http.get(originalRequest.url, headers: headers);
          } else if (originalRequest.method == 'POST') {
            return await http.post(
              originalRequest.url,
              headers: headers,
              body: requestBody,
            );
          } else if (originalRequest.method == 'PUT') {
            return await http.put(
              originalRequest.url,
              headers: headers,
              body: requestBody,
            );
          } else if (originalRequest.method == 'PATCH') {
            return await http.patch(
              originalRequest.url,
              headers: headers,
              body: requestBody,
            );
          } else if (originalRequest.method == 'DELETE') {
            return await http.delete(originalRequest.url, headers: headers);
          }
        }
      }
    }
    return response;
  }

  Future<bool> _refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString('refresh_token');
      
      if (refreshToken == null) return false;

      final response = await http.post(
        Uri.parse('$_baseUrl/users/refresh-token/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh_token': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await prefs.setString('access_token', data['access_token']);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<http.Response> get(String endpoint, {bool requiresAuth = false}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final response = await http.get(
      Uri.parse('$_baseUrl$endpoint'),
      headers: headers,
    );
    return await _handleResponse(response, requestBody: null);
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> body, {bool requiresAuth = false}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final bodyString = jsonEncode(body);
    final response = await http.post(
      Uri.parse('$_baseUrl$endpoint'),
      headers: headers,
      body: bodyString,
    );
    return await _handleResponse(response, requestBody: bodyString);
  }

  Future<http.Response> put(String endpoint, Map<String, dynamic> body, {bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final bodyString = jsonEncode(body);
    final response = await http.put(
      Uri.parse('$_baseUrl$endpoint'),
      headers: headers,
      body: bodyString,
    );
    return await _handleResponse(response, requestBody: bodyString);
  }

  Future<http.Response> patch(String endpoint, Map<String, dynamic> body, {bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final bodyString = jsonEncode(body);
    final response = await http.patch(
      Uri.parse('$_baseUrl$endpoint'),
      headers: headers,
      body: bodyString,
    );
    return await _handleResponse(response, requestBody: bodyString);
  }

  Future<http.Response> delete(String endpoint, {bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final response = await http.delete(
      Uri.parse('$_baseUrl$endpoint'),
      headers: headers,
    );
    return await _handleResponse(response);
  }
}

