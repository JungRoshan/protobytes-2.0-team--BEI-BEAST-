from django.contrib import admin
from .models import Complaint, ComplaintImage, Department, AdminProfile


class ComplaintImageInline(admin.TabularInline):
    model = ComplaintImage
    extra = 1
    readonly_fields = ['uploaded_at']


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    """Admin interface for Complaint model"""

    list_display = ['complaint_id', 'title', 'category', 'status', 'location', 'assigned_department', 'assigned_to', 'user', 'created_at']
    list_filter = ['status', 'category', 'assigned_department', 'created_at']
    search_fields = ['complaint_id', 'title', 'description', 'location', 'user__username']
    readonly_fields = ['complaint_id', 'created_at', 'updated_at']
    inlines = [ComplaintImageInline]

    fieldsets = (
        ('Complaint Information', {
            'fields': ('complaint_id', 'user', 'title', 'category', 'description')
        }),
        ('Location & Status', {
            'fields': ('location', 'latitude', 'longitude', 'status', 'image')
        }),
        ('Assignment', {
            'fields': ('assigned_department', 'assigned_to')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        """Optimize queryset for admin list view"""
        return super().get_queryset(request).select_related('assigned_department', 'assigned_to')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'categories']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'role']
    list_filter = ['department', 'role']
