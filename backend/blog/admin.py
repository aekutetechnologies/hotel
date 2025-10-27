from django.contrib import admin
from .models import Blog, BlogCategory, BlogTag, BlogImage


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(BlogImage)
class BlogImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'alt_text', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['alt_text']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'is_published', 'is_highlighted', 'views_count', 'published_at', 'created_at']
    list_filter = ['is_published', 'is_highlighted', 'category', 'created_at', 'published_at']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'created_at', 'updated_at', 'read_time']
    filter_horizontal = ['tags']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'author', 'category', 'tags')
        }),
        ('Content', {
            'fields': ('featured_image', 'content')
        }),
        ('Publishing', {
            'fields': ('is_published', 'is_highlighted', 'published_at')
        }),
        ('Statistics', {
            'fields': ('views_count', 'read_time', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new blog
            obj.author = request.user
        super().save_model(request, obj, form, change)

