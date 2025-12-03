import 'dart:convert';
import 'package:hsquare/models/profile.dart';
import 'package:hsquare/services/api_client.dart';

class ProfileService {
  final ApiClient _apiClient = ApiClient();

  Future<UserProfile> getProfile() async {
    final response = await _apiClient.get(
      '/users/profile/',
      requiresAuth: true,
    );

    if (response.statusCode == 200) {
      return UserProfile.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to fetch profile: ${response.body}');
  }

  Future<UserProfile> updateProfile(String name, String email) async {
    final response = await _apiClient.put(
      '/users/profile/',
      {
        'name': name,
        'email': email,
      },
      requiresAuth: true,
    );

    if (response.statusCode == 200) {
      return UserProfile.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to update profile: ${response.body}');
  }
}

