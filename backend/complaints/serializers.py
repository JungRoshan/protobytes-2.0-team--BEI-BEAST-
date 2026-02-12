from rest_framework import serializers
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for the Complaint model"""
    
    date = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_id',
            'title',
            'category',
            'description',
            'location',
            'status',
            'image',
            'date',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['complaint_id', 'created_at', 'updated_at']
    
    def get_date(self, obj):
        """Format date for frontend compatibility"""
        return obj.created_at.strftime('%Y-%m-%d')
    
    def to_representation(self, instance):
        """Customize output to match frontend expectations"""
        data = super().to_representation(instance)
        # Map category code to label for display
        category_map = dict(Complaint.CATEGORY_CHOICES)
        data['category_display'] = category_map.get(data['category'], data['category'])
        return data


class ComplaintListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing complaints"""
    
    date = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_id',
            'title',
            'category',
            'category_display',
            'location',
            'status',
            'date'
        ]
    
    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    
    def get_category_display(self, obj):
        return obj.get_category_display()
