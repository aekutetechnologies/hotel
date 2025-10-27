import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'storage_service.dart';

class ApiService {
  static const Duration _timeout = Duration(seconds: 30);
  
  // Get headers with authentication
  static Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = Map<String, String>.from(ApiConfig.defaultHeaders);
    
    if (includeAuth) {
      final token = StorageService.getAccessToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    
    return headers;
  }
  
  // Handle API response
  static dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        return {};
      }
      return json.decode(response.body);
    } else {
      throw ApiException(
        statusCode: response.statusCode,
        message: _getErrorMessage(response),
        response: response.body,
      );
    }
  }
  
  // Extract error message from response
  static String _getErrorMessage(http.Response response) {
    try {
      final errorData = json.decode(response.body);
      return errorData['message'] ?? 
             errorData['detail'] ?? 
             errorData['error'] ?? 
             'Request failed with status ${response.statusCode}';
    } catch (e) {
      return 'Request failed with status ${response.statusCode}';
    }
  }
  
  // GET request
  static Future<dynamic> get(
    String endpoint, {
    Map<String, String>? queryParams,
    bool includeAuth = true,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
      final finalUri = queryParams != null 
          ? uri.replace(queryParameters: queryParams)
          : uri;
      
      final response = await http.get(
        finalUri,
        headers: await _getHeaders(includeAuth: includeAuth),
      ).timeout(_timeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        statusCode: 0,
        message: 'No internet connection',
      );
    } on HttpException {
      throw ApiException(
        statusCode: 0,
        message: 'Network error occurred',
      );
    } catch (e) {
      throw ApiException(
        statusCode: 0,
        message: e.toString(),
      );
    }
  }
  
  // POST request
  static Future<dynamic> post(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
      
      final response = await http.post(
        uri,
        headers: await _getHeaders(includeAuth: includeAuth),
        body: body != null ? json.encode(body) : null,
      ).timeout(_timeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        statusCode: 0,
        message: 'No internet connection',
      );
    } on HttpException {
      throw ApiException(
        statusCode: 0,
        message: 'Network error occurred',
      );
    } catch (e) {
      throw ApiException(
        statusCode: 0,
        message: e.toString(),
      );
    }
  }
  
  // PUT request
  static Future<dynamic> put(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
      
      final response = await http.put(
        uri,
        headers: await _getHeaders(includeAuth: includeAuth),
        body: body != null ? json.encode(body) : null,
      ).timeout(_timeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        statusCode: 0,
        message: 'No internet connection',
      );
    } on HttpException {
      throw ApiException(
        statusCode: 0,
        message: 'Network error occurred',
      );
    } catch (e) {
      throw ApiException(
        statusCode: 0,
        message: e.toString(),
      );
    }
  }
  
  // PATCH request
  static Future<dynamic> patch(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
      
      final response = await http.patch(
        uri,
        headers: await _getHeaders(includeAuth: includeAuth),
        body: body != null ? json.encode(body) : null,
      ).timeout(_timeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        statusCode: 0,
        message: 'No internet connection',
      );
    } on HttpException {
      throw ApiException(
        statusCode: 0,
        message: 'Network error occurred',
      );
    } catch (e) {
      throw ApiException(
        statusCode: 0,
        message: e.toString(),
      );
    }
  }
  
  // DELETE request
  static Future<dynamic> delete(
    String endpoint, {
    bool includeAuth = true,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
      
      final response = await http.delete(
        uri,
        headers: await _getHeaders(includeAuth: includeAuth),
      ).timeout(_timeout);
      
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        statusCode: 0,
        message: 'No internet connection',
      );
    } on HttpException {
      throw ApiException(
        statusCode: 0,
        message: 'Network error occurred',
      );
    } catch (e) {
      throw ApiException(
        statusCode: 0,
        message: e.toString(),
      );
    }
  }
  
  // Upload file
  static Future<dynamic> uploadFile(
    String endpoint,
    String filePath, {
    String fieldName = 'file',
    Map<String, String>? additionalFields,
    bool includeAuth = true,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
      final request = http.MultipartRequest('POST', uri);
      
      // Add headers
      final headers = await _getHeaders(includeAuth: includeAuth);
      request.headers.addAll(headers);
      
      // Add file
      request.files.add(await http.MultipartFile.fromPath(fieldName, filePath));
      
      // Add additional fields
      if (additionalFields != null) {
        request.fields.addAll(additionalFields);
      }
      
      final streamedResponse = await request.send().timeout(_timeout);
      final response = await http.Response.fromStream(streamedResponse);
      
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        statusCode: 0,
        message: 'No internet connection',
      );
    } on HttpException {
      throw ApiException(
        statusCode: 0,
        message: 'Network error occurred',
      );
    } catch (e) {
      throw ApiException(
        statusCode: 0,
        message: e.toString(),
      );
    }
  }
}

// Custom exception class for API errors
class ApiException implements Exception {
  final int statusCode;
  final String message;
  final String? response;
  
  ApiException({
    required this.statusCode,
    required this.message,
    this.response,
  });
  
  @override
  String toString() {
    return 'ApiException: $message (Status: $statusCode)';
  }
  
  // Check if it's an authentication error
  bool get isAuthError {
    return statusCode == 401 || statusCode == 403;
  }
  
  // Check if it's a network error
  bool get isNetworkError {
    return statusCode == 0;
  }
}