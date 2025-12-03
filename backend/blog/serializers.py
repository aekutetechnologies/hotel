from rest_framework import serializers
from .models import Blog, BlogCategory, BlogTag, BlogImage
from users.serializers import UserSerializer
from django.conf import settings


class BlogCategorySerializer(serializers.ModelSerializer):
    blog_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'created_at', 'updated_at', 'is_active', 'blog_count']
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_blog_count(self, obj):
        return obj.blogs.filter(is_published=True).count()


class BlogTagSerializer(serializers.ModelSerializer):
    blog_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug', 'created_at', 'updated_at', 'blog_count']
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_blog_count(self, obj):
        return obj.blogs.filter(is_published=True).count()


class BlogImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogImage
        fields = ['id', 'image', 'alt_text', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['created_at', 'updated_at']


class BlogImageViewSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogImage
        fields = ['id', 'image_url', 'alt_text', 'created_at', 'updated_at', 'is_active']
    
    def get_image_url(self, obj):
        if obj.image:
            return f"{settings.WEBSITE_URL}{settings.MEDIA_URL}{obj.image}"
        return None


class BlogListSerializer(serializers.ModelSerializer):
    """Serializer for blog list view with minimal data"""
    author = UserSerializer(read_only=True)
    category = BlogCategorySerializer(read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    featured_image = BlogImageViewSerializer(read_only=True)
    images = BlogImageViewSerializer(many=True, read_only=True)
    read_time = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'author', 'featured_image', 'images',
            'category', 'tags', 'is_highlighted', 'is_published',
            'published_at', 'views_count', 'created_at', 'updated_at',
            'read_time', 'content'
        ]


class BlogDetailSerializer(serializers.ModelSerializer):
    """Serializer for blog detail view with full content"""
    author = UserSerializer(read_only=True)
    category = BlogCategorySerializer(read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    featured_image = BlogImageViewSerializer(read_only=True)
    images = BlogImageViewSerializer(many=True, read_only=True)
    read_time = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'author', 'featured_image', 'images', 'content',
            'category', 'tags', 'is_highlighted', 'is_published',
            'published_at', 'views_count', 'created_at', 'updated_at',
            'read_time'
        ]


class BlogCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating blogs"""
    category_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    featured_image_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    image_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Blog
        fields = [
            'title', 'slug', 'content', 'category_id',
            'featured_image_id', 'image_ids', 'tag_ids', 'is_highlighted',
            'is_published'
        ]
        extra_kwargs = {
            'slug': {'required': False}
        }
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        featured_image_id = validated_data.pop('featured_image_id', None)
        image_ids = validated_data.pop('image_ids', [])
        tag_ids = validated_data.pop('tag_ids', [])
        
        # Get the author from request context
        author = self.context['request'].user
        
        # Handle category
        if category_id:
            try:
                category = BlogCategory.objects.get(id=category_id)
                validated_data['category'] = category
            except BlogCategory.DoesNotExist:
                pass
        
        # Handle featured image
        if featured_image_id:
            try:
                featured_image = BlogImage.objects.get(id=featured_image_id)
                validated_data['featured_image'] = featured_image
            except BlogImage.DoesNotExist:
                pass
        
        # Create blog
        blog = Blog.objects.create(author=author, **validated_data)
        
        # Handle additional images
        if image_ids:
            images = BlogImage.objects.filter(id__in=image_ids)
            blog.images.set(images)
        
        # Handle tags
        if tag_ids:
            tags = BlogTag.objects.filter(id__in=tag_ids)
            blog.tags.set(tags)
        
        return blog
    
    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)
        featured_image_id = validated_data.pop('featured_image_id', None)
        image_ids = validated_data.pop('image_ids', None)
        tag_ids = validated_data.pop('tag_ids', None)
        
        # Handle category
        if category_id is not None:
            if category_id:
                try:
                    category = BlogCategory.objects.get(id=category_id)
                    instance.category = category
                except BlogCategory.DoesNotExist:
                    pass
            else:
                instance.category = None
        
        # Handle featured image
        if featured_image_id is not None:
            if featured_image_id:
                try:
                    featured_image = BlogImage.objects.get(id=featured_image_id)
                    instance.featured_image = featured_image
                except BlogImage.DoesNotExist:
                    pass
            else:
                instance.featured_image = None
        
        # Handle additional images
        if image_ids is not None:
            images = BlogImage.objects.filter(id__in=image_ids)
            instance.images.set(images)
        
        # Handle tags
        if tag_ids is not None:
            tags = BlogTag.objects.filter(id__in=tag_ids)
            instance.tags.set(tags)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

