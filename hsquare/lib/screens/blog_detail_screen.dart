import 'package:flutter/material.dart';
import 'package:hsquare/models/blog.dart';
import 'package:hsquare/services/blog_service.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:intl/intl.dart';

class BlogDetailScreen extends StatefulWidget {
  final Blog blog;

  const BlogDetailScreen({super.key, required this.blog});

  @override
  State<BlogDetailScreen> createState() => _BlogDetailScreenState();
}

class _BlogDetailScreenState extends State<BlogDetailScreen> {
  final BlogService _blogService = BlogService();
  Blog? _blog;
  List<Blog> _relatedBlogs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBlog();
  }

  Future<void> _loadBlog() async {
    try {
      final blog = await _blogService.getBlogBySlug(widget.blog.slug);
      final related = await _blogService.getRelatedBlogs(widget.blog.slug);
      setState(() {
        _blog = blog;
        _relatedBlogs = related;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load blog: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final blog = _blog ?? widget.blog;
    final dateFormat = DateFormat('MMM dd, yyyy');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Blog'),
        backgroundColor: AppColors.primaryRed,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Featured Image
                  if (blog.featuredImage != null)
                    Image.network(
                      blog.featuredImage!,
                      width: double.infinity,
                      height: 250,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        height: 250,
                        color: Colors.grey[300],
                      ),
                    ),
                  
                  // Content
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category
                        if (blog.category != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primaryRed.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              blog.category!.name,
                              style: const TextStyle(
                                color: AppColors.primaryRed,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        if (blog.category != null) const SizedBox(height: 16),
                        
                        // Title
                        Text(
                          blog.title,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Meta Info
                        Row(
                          children: [
                            Icon(Icons.person, size: 18, color: Colors.grey[600]),
                            const SizedBox(width: 4),
                            Text(
                              blog.author,
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                            const SizedBox(width: 16),
                            Icon(Icons.calendar_today, size: 18, color: Colors.grey[600]),
                            const SizedBox(width: 4),
                            Text(
                              dateFormat.format(blog.publishedAt),
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                            const Spacer(),
                            Icon(Icons.visibility, size: 18, color: Colors.grey[600]),
                            const SizedBox(width: 4),
                            Text(
                              '${blog.viewsCount} views',
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        
                        // Tags
                        if (blog.tags.isNotEmpty) ...[
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: blog.tags.map((tag) {
                              return Chip(
                                label: Text(tag.name),
                                backgroundColor: Colors.grey[200],
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 24),
                        ],
                        
                        // Content
                        Text(
                          blog.content,
                          style: const TextStyle(
                            fontSize: 16,
                            height: 1.6,
                          ),
                        ),
                        
                        // Related Blogs
                        if (_relatedBlogs.isNotEmpty) ...[
                          const SizedBox(height: 48),
                          const Text(
                            'Related Articles',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          ..._relatedBlogs.map((relatedBlog) {
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: relatedBlog.featuredImage != null
                                    ? Image.network(
                                        relatedBlog.featuredImage!,
                                        width: 60,
                                        height: 60,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) =>
                                            Container(
                                          width: 60,
                                          height: 60,
                                          color: Colors.grey[300],
                                        ),
                                      )
                                    : Container(
                                        width: 60,
                                        height: 60,
                                        color: Colors.grey[300],
                                      ),
                                title: Text(relatedBlog.title),
                                subtitle: Text(
                                  relatedBlog.excerpt,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                onTap: () {
                                  Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => BlogDetailScreen(blog: relatedBlog),
                                    ),
                                  );
                                },
                              ),
                            );
                          }),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

