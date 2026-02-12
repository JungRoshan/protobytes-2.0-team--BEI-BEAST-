from django.contrib import admin
from .models import Complaint

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    """Admin interface for Complaint model"""
    
    list_display = ['complaint_id', 'title', 'category', 'status', 'location', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['complaint_id', 'title', 'description', 'location']
    readonly_fields = ['complaint_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Complaint Information', {
            'fields': ('complaint_id', 'title', 'category', 'description')
        }),
        ('Location & Status', {
            'fields': ('location', 'status', 'image')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset for admin list view"""
        return super().get_queryset(request).select_related()
