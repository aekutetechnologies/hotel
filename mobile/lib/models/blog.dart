import 'user.dart';

class Blog {
  final int id;
  final String title;
  final String slug;
  final String content;
  final String? excerpt;
  final String? featuredImage;
  final String? status;
  final Category? category;
  final List<Tag>? tags;
  final User? author;
  final int? viewCount;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? publishedAt;

  Blog({
    required this.id,
    required this.title,
    required this.slug,
    required this.content,
    this.excerpt,
    this.featuredImage,
    this.status,
    this.category,
    this.tags,
    this.author,
    this.viewCount,
    required this.createdAt,
    this.updatedAt,
    this.publishedAt,
  });

  factory Blog.fromJson(Map<String, dynamic> json) {
    return Blog(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      slug: json['slug'] ?? '',
      content: json['content'] ?? '',
      excerpt: json['excerpt'],
      featuredImage: json['featured_image'],
      status: json['status'],
      category: json['category'] != null 
          ? Category.fromJson(json['category']) 
          : null,
      tags: json['tags'] != null
          ? (json['tags'] as List)
              .map((tag) => Tag.fromJson(tag))
              .toList()
          : null,
      author: json['author'] != null 
          ? User.fromJson(json['author']) 
          : null,
      viewCount: json['view_count'],
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at']) 
          : DateTime.now(),
      updatedAt: json['updated_at'] != null 
          ? DateTime.tryParse(json['updated_at']) 
          : null,
      publishedAt: json['published_at'] != null 
          ? DateTime.tryParse(json['published_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'content': content,
      'excerpt': excerpt,
      'featured_image': featuredImage,
      'status': status,
      'category': category?.toJson(),
      'tags': tags?.map((tag) => tag.toJson()).toList(),
      'author': author?.toJson(),
      'view_count': viewCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'published_at': publishedAt?.toIso8601String(),
    };
  }

  // Helper methods
  bool get isPublished {
    return status == 'published' && publishedAt != null;
  }

  String get shortContent {
    if (excerpt != null && excerpt!.isNotEmpty) {
      return excerpt!;
    }
    if (content.length > 200) {
      return '${content.substring(0, 200)}...';
    }
    return content;
  }

  @override
  String toString() {
    return 'Blog(id: $id, title: $title, slug: $slug)';
  }
}

class Category {
  final int id;
  final String name;
  final String? slug;
  final String? description;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Category({
    required this.id,
    required this.name,
    this.slug,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      slug: json['slug'],
      description: json['description'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
      updatedAt: json['updated_at'] != null 
          ? DateTime.tryParse(json['updated_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'Category(id: $id, name: $name)';
  }
}

class Tag {
  final int id;
  final String name;
  final String? slug;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Tag({
    required this.id,
    required this.name,
    this.slug,
    this.createdAt,
    this.updatedAt,
  });

  factory Tag.fromJson(Map<String, dynamic> json) {
    return Tag(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      slug: json['slug'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
      updatedAt: json['updated_at'] != null 
          ? DateTime.tryParse(json['updated_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'Tag(id: $id, name: $name)';
  }
}

