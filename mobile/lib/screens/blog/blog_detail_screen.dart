import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/theme_config.dart';
import '../../models/blog.dart';
import '../../services/blog_service.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_widget.dart';

class BlogDetailScreen extends StatefulWidget {
  final Blog blog;

  const BlogDetailScreen({
    super.key,
    required this.blog,
  });

  @override
  State<BlogDetailScreen> createState() => _BlogDetailScreenState();
}

class _BlogDetailScreenState extends State<BlogDetailScreen> {
  Blog? _blog;
  List<Blog> _relatedBlogs = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBlogDetails();
  }

  Future<void> _loadBlogDetails() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load full blog details
      final blog = await BlogService.getBlogBySlug(widget.blog.slug);
      
      // Load related blogs
      final relatedBlogs = await BlogService.getRelatedBlogs(widget.blog.slug);
      
      if (mounted) {
        setState(() {
          _blog = blog;
          _relatedBlogs = relatedBlogs;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Blog'),
          backgroundColor: AppTheme.surface,
          elevation: 0,
        ),
        body: const FullScreenLoading(
          message: 'Loading blog details...',
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Blog'),
          backgroundColor: AppTheme.surface,
          elevation: 0,
        ),
        body: CustomErrorWidget(
          message: _error!,
          onRetry: _loadBlogDetails,
        ),
      );
    }

    if (_blog == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Blog'),
          backgroundColor: AppTheme.surface,
          elevation: 0,
        ),
        body: const EmptyStateWidget(
          title: 'Blog not found',
          message: 'The blog you are looking for does not exist',
          icon: Icons.search_off,
        ),
      );
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context),
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildBlogHeader(context),
                _buildBlogContent(context),
                if (_relatedBlogs.isNotEmpty) _buildRelatedBlogs(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 0,
      floating: true,
      pinned: true,
      backgroundColor: AppTheme.surface,
      foregroundColor: AppTheme.textPrimary,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: () => Navigator.pop(context),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.share),
          onPressed: () {
            // Share blog
          },
        ),
      ],
    );
  }

  Widget _buildBlogHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_blog!.category != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.hotelPrimary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                _blog!.category!.name,
                style: const TextStyle(
                  color: AppTheme.hotelPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          if (_blog!.category != null) const SizedBox(height: 12),
          Text(
            _blog!.title,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          if (_blog!.excerpt != null && _blog!.excerpt!.isNotEmpty)
            Text(
              _blog!.excerpt!,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppTheme.textSecondary,
              ),
            ),
          const SizedBox(height: 16),
          Row(
            children: [
              if (_blog!.author != null) ...[
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppTheme.hotelPrimary,
                  child: Text(
                    _blog!.author!.name.substring(0, 1).toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _blog!.author!.name,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        _formatDate(_blog!.createdAt),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              if (_blog!.viewCount != null)
                Row(
                  children: [
                    const Icon(
                      Icons.visibility,
                      size: 16,
                      color: AppTheme.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${_blog!.viewCount} views',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBlogContent(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_blog!.featuredImage != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(
                imageUrl: _blog!.featuredImage!,
                fit: BoxFit.cover,
                width: double.infinity,
                height: 200,
                placeholder: (context, url) => Container(
                  height: 200,
                  color: AppTheme.borderLight,
                  child: const Center(
                    child: CircularProgressIndicator(),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  height: 200,
                  color: AppTheme.borderLight,
                  child: const Icon(
                    Icons.image_not_supported,
                    color: AppTheme.textTertiary,
                    size: 48,
                  ),
                ),
              ),
            ),
          if (_blog!.featuredImage != null) const SizedBox(height: 16),
          Text(
            _blog!.content,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppTheme.textPrimary,
              height: 1.6,
            ),
          ),
          if (_blog!.tags != null && _blog!.tags!.isNotEmpty) ...[
            const SizedBox(height: 24),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _blog!.tags!.map((tag) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.borderLight,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    '#${tag.name}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRelatedBlogs(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Related Articles',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _relatedBlogs.length,
            itemBuilder: (context, index) {
              final blog = _relatedBlogs[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BlogDetailScreen(blog: blog),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        if (blog.featuredImage != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: CachedNetworkImage(
                              imageUrl: blog.featuredImage!,
                              width: 80,
                              height: 60,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                width: 80,
                                height: 60,
                                color: AppTheme.borderLight,
                              ),
                              errorWidget: (context, url, error) => Container(
                                width: 80,
                                height: 60,
                                color: AppTheme.borderLight,
                                child: const Icon(
                                  Icons.image_not_supported,
                                  color: AppTheme.textTertiary,
                                ),
                              ),
                            ),
                          ),
                        if (blog.featuredImage != null) const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                blog.title,
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textPrimary,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _formatDate(blog.createdAt),
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 7) {
      return '${date.day}/${date.month}/${date.year}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours ago';
    } else {
      return 'Just now';
    }
  }
}
