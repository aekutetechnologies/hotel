import 'dart:convert';
import 'package:hsquare/models/blog.dart';
import 'package:hsquare/services/api_client.dart';

class BlogService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Blog>> getBlogs({
    String? category,
    String? tag,
    String? search,
    bool? highlighted,
  }) async {
    final queryParams = <String, String>{};
    if (category != null) queryParams['category'] = category;
    if (tag != null) queryParams['tag'] = tag;
    if (search != null) queryParams['search'] = search;
    if (highlighted != null) queryParams['highlighted'] = highlighted.toString();

    String endpoint = '/blog/blogs/';
    if (queryParams.isNotEmpty) {
      final queryString = queryParams.entries
          .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
          .join('&');
      endpoint += '?$queryString';
    }

    final response = await _apiClient.get(endpoint, requiresAuth: false);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Blog.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch blogs: ${response.body}');
  }

  Future<Blog> getBlogBySlug(String slug) async {
    final response = await _apiClient.get(
      '/blog/blogs/$slug/',
      requiresAuth: false,
    );

    if (response.statusCode == 200) {
      return Blog.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to fetch blog: ${response.body}');
  }

  Future<List<Blog>> getRelatedBlogs(String slug) async {
    final response = await _apiClient.get(
      '/blog/blogs/$slug/related/',
      requiresAuth: false,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Blog.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch related blogs: ${response.body}');
  }
}

