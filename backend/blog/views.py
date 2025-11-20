from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import logging
from django.shortcuts import get_object_or_404
from django.db.models import Q
from users.decorators import custom_authentication_and_permissions
from backend.settings import WEBSITE_URL
from .models import Blog, BlogCategory, BlogTag, BlogImage
from .serializers import (
    BlogListSerializer,
    BlogDetailSerializer,
    BlogCreateUpdateSerializer,
    BlogCategorySerializer,
    BlogTagSerializer,
    BlogImageSerializer,
    BlogImageViewSerializer
)

logger = logging.getLogger("blog")


# Blog CRUD Operations

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(
    required_permissions=['blog:create'],
    exempt_get_views=[r'^/api/blog/blogs/$']
)
def blog_list(request):
    """
    GET: List all published blogs (public)
    POST: Create a new blog (requires blog:create permission)
    """
    logger.info(f"blog_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        # Get query parameters
        category_slug = request.GET.get('category', None)
        tag_slug = request.GET.get('tag', None)
        search = request.GET.get('search', None)
        is_highlighted = request.GET.get('highlighted', None)
        show_all = request.GET.get('all', None)
        
        # Start with all blogs or just published (for admin vs public)
        if show_all and show_all.lower() == 'true':
            blogs = Blog.objects.all()
        else:
            blogs = Blog.objects.filter(is_published=True)
        
        # Apply filters
        if category_slug:
            blogs = blogs.filter(category__slug=category_slug)
        
        if tag_slug:
            blogs = blogs.filter(tags__slug=tag_slug)
        
        if search:
            blogs = blogs.filter(
                Q(title__icontains=search) |
                Q(excerpt__icontains=search) |
                Q(content__icontains=search)
            )
        
        if is_highlighted and is_highlighted.lower() == 'true':
            blogs = blogs.filter(is_highlighted=True)
        
        # Remove duplicates and order
        blogs = blogs.distinct().order_by('-published_at', '-created_at')
        
        serializer = BlogListSerializer(blogs, many=True)
        logger.info(f"Retrieved {len(serializer.data)} blogs", extra={"request_method": request.method, "count": len(serializer.data), "category": request.GET.get('category'), "tag": request.GET.get('tag'), "search": request.GET.get('search')})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = BlogCreateUpdateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            blog = serializer.save()
            detail_serializer = BlogDetailSerializer(blog)
            logger.info(f"Blog created successfully with slug {blog.slug}", extra={"request_method": request.method, "blog_slug": blog.slug, "blog_id": blog.id})
            return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create blog: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@custom_authentication_and_permissions(
    exempt_get_views=[r'^/api/blog/blogs/highlighted/$']
)
def highlighted_blogs(request):
    """Get highlighted blogs (public)"""
    logger.info("highlighted_blogs called", extra={"request_method": request.method})
    blogs = Blog.objects.filter(is_published=True, is_highlighted=True)[:3]
    serializer = BlogListSerializer(blogs, many=True)
    logger.info(f"Retrieved {len(serializer.data)} highlighted blogs", extra={"request_method": request.method, "count": len(serializer.data)})
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(
    required_permissions=['blog:edit', 'blog:delete'],
    exempt_get_views=[r'^/api/blog/blogs/[a-zA-Z0-9-]+/$']
)
def blog_detail(request, slug):
    """
    GET: Get single blog by slug (public, increments view count)
    PUT: Update blog (requires blog:edit permission)
    DELETE: Delete blog (requires blog:delete permission)
    """
    logger.info(f"blog_detail called with method {request.method} for slug {slug}", extra={"request_method": request.method, "slug": slug})
    blog = get_object_or_404(Blog, slug=slug)
    
    if request.method == 'GET':
        # Only show published blogs to public
        if not blog.is_published and not hasattr(request, 'user'):
            return Response(
                {'error': 'Blog not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Increment view count
        blog.views_count += 1
        blog.save(update_fields=['views_count'])
        
        serializer = BlogDetailSerializer(blog)
        logger.info(f"Retrieved blog {slug}, view count: {blog.views_count}", extra={"request_method": request.method, "slug": slug, "views_count": blog.views_count})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = BlogCreateUpdateSerializer(
            blog,
            data=request.data,
            context={'request': request},
            partial=True
        )
        if serializer.is_valid():
            updated_blog = serializer.save()
            detail_serializer = BlogDetailSerializer(updated_blog)
            logger.info(f"Blog {slug} updated successfully", extra={"request_method": request.method, "slug": slug})
            return Response(detail_serializer.data)
        logger.warning(f"Failed to update blog {slug}: {serializer.errors}", extra={"request_method": request.method, "slug": slug, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        blog.delete()
        logger.info(f"Blog {slug} deleted successfully", extra={"request_method": request.method, "slug": slug})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@custom_authentication_and_permissions(
    exempt_get_views=[r'^/api/blog/blogs/[a-zA-Z0-9-]+/related/$']
)
def related_blogs(request, slug):
    """Get related blogs based on category and tags"""
    logger.info(f"related_blogs called for blog {slug}", extra={"request_method": request.method, "slug": slug})
    blog = get_object_or_404(Blog, slug=slug, is_published=True)
    
    # Get blogs with same category or tags, excluding current blog
    related = Blog.objects.filter(is_published=True).exclude(id=blog.id)
    
    if blog.category:
        related = related.filter(
            Q(category=blog.category) | Q(tags__in=blog.tags.all())
        )
    else:
        related = related.filter(tags__in=blog.tags.all())
    
    related = related.distinct().order_by('-published_at')[:3]
    
    serializer = BlogListSerializer(related, many=True)
    logger.info(f"Retrieved {len(serializer.data)} related blogs for blog {slug}", extra={"request_method": request.method, "slug": slug, "count": len(serializer.data)})
    return Response(serializer.data)


# Category Operations

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(
    required_permissions=['blog:create'],
    exempt_get_views=[r'^/api/blog/categories/$']
)
def category_list(request):
    """
    GET: List all active categories (public)
    POST: Create a new category (requires blog:create permission)
    """
    logger.info(f"category_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        categories = BlogCategory.objects.filter(is_active=True)
        serializer = BlogCategorySerializer(categories, many=True)
        logger.info(f"Retrieved {len(serializer.data)} blog categories", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = BlogCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Blog category created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "category_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create blog category: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(
    required_permissions=['blog:edit', 'blog:delete'],
    exempt_get_views=[r'^/api/blog/categories/[0-9]+/$']
)
def category_detail(request, pk):
    """
    GET: Get single category (public)
    PUT: Update category (requires blog:edit permission)
    DELETE: Delete category (requires blog:delete permission)
    """
    logger.info(f"category_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    category = get_object_or_404(BlogCategory, pk=pk)
    
    if request.method == 'GET':
        serializer = BlogCategorySerializer(category)
        logger.info(f"Retrieved blog category {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = BlogCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Blog category {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update blog category {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        category.delete()
        logger.info(f"Blog category {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


# Tag Operations

@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(
    required_permissions=['blog:create'],
    exempt_get_views=[r'^/api/blog/tags/$']
)
def tag_list(request):
    """
    GET: List all tags (public)
    POST: Create a new tag (requires blog:create permission)
    """
    logger.info(f"tag_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        tags = BlogTag.objects.all()
        serializer = BlogTagSerializer(tags, many=True)
        logger.info(f"Retrieved {len(serializer.data)} blog tags", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = BlogTagSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Blog tag created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "tag_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create blog tag: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(
    required_permissions=['blog:edit', 'blog:delete'],
    exempt_get_views=[r'^/api/blog/tags/[0-9]+/$']
)
def tag_detail(request, pk):
    """
    GET: Get single tag (public)
    PUT: Update tag (requires blog:edit permission)
    DELETE: Delete tag (requires blog:delete permission)
    """
    logger.info(f"tag_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    tag = get_object_or_404(BlogTag, pk=pk)
    
    if request.method == 'GET':
        serializer = BlogTagSerializer(tag)
        logger.info(f"Retrieved blog tag {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = BlogTagSerializer(tag, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Blog tag {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update blog tag {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        tag.delete()
        logger.info(f"Blog tag {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)


# Image Operations

@api_view(['POST'])
@custom_authentication_and_permissions(required_permissions=['blog:create'])
@parser_classes([MultiPartParser, FormParser])
def image_upload(request):
    """
    Upload a blog image and return its ID and URL
    Requires blog:create permission
    """
    logger.info("image_upload called for blog", extra={"request_method": request.method})
    serializer = BlogImageSerializer(data=request.data)
    if serializer.is_valid():
        image_instance = serializer.save()
        logger.info(f"Blog image uploaded successfully with id {image_instance.id}", extra={"request_method": request.method, "image_id": image_instance.id})
        return Response(
            {
                'id': image_instance.id,
                'image_url': WEBSITE_URL + image_instance.image.url,
                'alt_text': image_instance.alt_text
            },
            status=status.HTTP_201_CREATED
        )
    logger.warning(f"Failed to upload blog image: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE'])
@custom_authentication_and_permissions(
    required_permissions=['blog:delete'],
    exempt_get_views=[r'^/api/blog/images/[0-9]+/$']
)
def image_detail(request, pk):
    """
    GET: Retrieve a specific blog image (public)
    DELETE: Delete a specific blog image (requires blog:delete permission)
    """
    logger.info(f"image_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    image = get_object_or_404(BlogImage, pk=pk)
    
    if request.method == 'GET':
        serializer = BlogImageViewSerializer(image)
        logger.info(f"Retrieved blog image {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        image.delete()
        logger.info(f"Blog image {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)

