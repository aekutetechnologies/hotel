from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from users.models import HsUser


class BlogCategory(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Blog Categories"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogTag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, max_length=50)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogImage(models.Model):
    id = models.AutoField(primary_key=True)
    image = models.ImageField(upload_to='blog_images/')
    alt_text = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Blog Image ID: {self.id}"


class Blog(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    author = models.ForeignKey(HsUser, on_delete=models.CASCADE, related_name='blogs')
    featured_image = models.ForeignKey(
        BlogImage, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='featured_in_blogs'
    )
    images = models.ManyToManyField(BlogImage, blank=True, related_name='blogs')
    content = models.TextField()  # JSON string from Lexical editor
    category = models.ForeignKey(
        BlogCategory, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='blogs'
    )
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='blogs')
    is_highlighted = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['slug']),
            models.Index(fields=['is_published', 'is_highlighted']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Auto-set published_at when publishing
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        elif not self.is_published:
            self.published_at = None
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def read_time(self):
        """Estimate reading time in minutes based on content length"""
        words_per_minute = 200
        word_count = len(self.content.split())
        minutes = word_count // words_per_minute
        return max(1, minutes)  # Minimum 1 minute

