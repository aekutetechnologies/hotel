import '../config/api_config.dart';
import '../models/blog.dart';
import 'api_service.dart';

class BlogService {
  // Get all blogs
  static Future<List<Blog>> getBlogs({
    int? page,
    int? limit,
    String? category,
    String? tag,
    String? search,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (page != null) queryParams['page'] = page.toString();
      if (limit != null) queryParams['limit'] = limit.toString();
      if (category != null) queryParams['category'] = category;
      if (tag != null) queryParams['tag'] = tag;
      if (search != null) queryParams['search'] = search;
      
      final response = await ApiService.get(
        ApiConfig.blogs,
        queryParams: queryParams,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Blog.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get blogs: ${e.toString()}');
    }
  }
  
  // Get highlighted blogs
  static Future<List<Blog>> getHighlightedBlogs() async {
    try {
      final response = await ApiService.get(
        ApiConfig.highlightedBlogs,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Blog.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get highlighted blogs: ${e.toString()}');
    }
  }
  
  // Get blog by slug
  static Future<Blog> getBlogBySlug(String slug) async {
    try {
      final response = await ApiService.get(
        '${ApiConfig.blogDetail}$slug/',
        includeAuth: false,
      );
      
      if (response == null) {
        throw Exception('Blog not found');
      }
      
      return Blog.fromJson(response);
    } catch (e) {
      throw Exception('Failed to get blog: ${e.toString()}');
    }
  }
  
  // Get related blogs
  static Future<List<Blog>> getRelatedBlogs(String slug) async {
    try {
      final response = await ApiService.get(
        '${ApiConfig.blogDetail}$slug/related/',
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Blog.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get related blogs: ${e.toString()}');
    }
  }
  
  // Get categories
  static Future<List<Category>> getCategories() async {
    try {
      final response = await ApiService.get(
        ApiConfig.categories,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Category.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get categories: ${e.toString()}');
    }
  }
  
  // Get tags
  static Future<List<Tag>> getTags() async {
    try {
      final response = await ApiService.get(
        ApiConfig.tags,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Tag.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get tags: ${e.toString()}');
    }
  }
  
  // Create blog (admin function)
  static Future<Blog> createBlog({
    required String title,
    required String content,
    String? excerpt,
    String? featuredImage,
    int? categoryId,
    List<int>? tagIds,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConfig.blogs,
        body: {
          'title': title,
          'content': content,
          if (excerpt != null) 'excerpt': excerpt,
          if (featuredImage != null) 'featured_image': featuredImage,
          if (categoryId != null) 'category': categoryId,
          if (tagIds != null) 'tags': tagIds,
        },
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Failed to create blog');
      }
      
      return Blog.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create blog: ${e.toString()}');
    }
  }
  
  // Update blog (admin function)
  static Future<Blog> updateBlog({
    required int id,
    String? title,
    String? content,
    String? excerpt,
    String? featuredImage,
    int? categoryId,
    List<int>? tagIds,
    String? status,
  }) async {
    try {
      final response = await ApiService.put(
        '${ApiConfig.blogDetail}$id/',
        body: {
          if (title != null) 'title': title,
          if (content != null) 'content': content,
          if (excerpt != null) 'excerpt': excerpt,
          if (featuredImage != null) 'featured_image': featuredImage,
          if (categoryId != null) 'category': categoryId,
          if (tagIds != null) 'tags': tagIds,
          if (status != null) 'status': status,
        },
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Failed to update blog');
      }
      
      return Blog.fromJson(response);
    } catch (e) {
      throw Exception('Failed to update blog: ${e.toString()}');
    }
  }
  
  // Delete blog (admin function)
  static Future<bool> deleteBlog(int id) async {
    try {
      await ApiService.delete(
        '${ApiConfig.blogDetail}$id/',
        includeAuth: true,
      );
      
      return true;
    } catch (e) {
      throw Exception('Failed to delete blog: ${e.toString()}');
    }
  }
  
  // Upload blog image
  static Future<BlogImage> uploadBlogImage(String filePath) async {
    try {
      final response = await ApiService.uploadFile(
        '${ApiConfig.blogs}images/upload/',
        filePath,
        fieldName: 'image',
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Failed to upload image');
      }
      
      return BlogImage.fromJson(response);
    } catch (e) {
      throw Exception('Failed to upload image: ${e.toString()}');
    }
  }
}

// Blog image model
class BlogImage {
  final int id;
  final String image;
  final DateTime? createdAt;
  
  BlogImage({
    required this.id,
    required this.image,
    this.createdAt,
  });
  
  factory BlogImage.fromJson(Map<String, dynamic> json) {
    return BlogImage(
      id: json['id'] ?? 0,
      image: json['image'] ?? '',
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'image': image,
      'created_at': createdAt?.toIso8601String(),
    };
  }
  
  @override
  String toString() {
    return 'BlogImage(id: $id, image: $image)';
  }
}
