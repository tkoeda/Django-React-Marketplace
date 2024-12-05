from django.contrib import admin
from .models import FurnitureListing, ListingImage, Comment

class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ('user', 'content', 'created_at')

@admin.register(FurnitureListing)
class FurnitureListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_user', 'price', 'condition', 'status', 'created_at')
    list_filter = ('condition', 'status', 'created_at')
    search_fields = ('title', 'description', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ListingImageInline, CommentInline]

    fieldsets = (
        (None, {
            'fields': ('seller', 'title', 'description', 'price')
        }),
        ('Details', {
            'fields': ('condition', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_user(self, obj):
        return obj.seller.username
    get_user.short_description = 'User'

@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ('listing', 'image', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('listing__title',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'listing__title', 'content')

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Comment Preview'
