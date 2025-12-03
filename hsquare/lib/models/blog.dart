class Blog {
  final int id;
  final String title;
  final String slug;
  final String excerpt;
  final String content;
  final String? featuredImage;
  final BlogCategory? category;
  final List<BlogTag> tags;
  final String author;
  final DateTime publishedAt;
  final int viewsCount;
  final bool isPublished;
  final bool isHighlighted;

  Blog({
    required this.id,
    required this.title,
    required this.slug,
    required this.excerpt,
    required this.content,
    this.featuredImage,
    this.category,
    required this.tags,
    required this.author,
    required this.publishedAt,
    required this.viewsCount,
    required this.isPublished,
    required this.isHighlighted,
  });

  factory Blog.fromJson(Map<String, dynamic> json) {
    return Blog(
      id: json['id'],
      title: json['title'],
      slug: json['slug'],
      excerpt: json['excerpt'] ?? '',
      content: json['content'] ?? '',
      featuredImage: json['featured_image'],
      category: json['category'] != null
          ? BlogCategory.fromJson(json['category'])
          : null,
      tags: (json['tags'] as List?)
          ?.map((tag) => BlogTag.fromJson(tag))
          .toList() ?? [],
      author: json['author'] ?? 'Admin',
      publishedAt: DateTime.parse(json['published_at']),
      viewsCount: json['views_count'] ?? 0,
      isPublished: json['is_published'] ?? true,
      isHighlighted: json['is_highlighted'] ?? false,
    );
  }
}

class BlogCategory {
  final int id;
  final String name;
  final String slug;

  BlogCategory({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory BlogCategory.fromJson(Map<String, dynamic> json) {
    return BlogCategory(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
    );
  }
}

class BlogTag {
  final int id;
  final String name;
  final String slug;

  BlogTag({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory BlogTag.fromJson(Map<String, dynamic> json) {
    return BlogTag(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
    );
  }
}

