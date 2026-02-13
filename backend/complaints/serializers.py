from rest_framework import serializers
from .models import Complaint, Upvote


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for the Complaint model"""
    
    date = serializers.SerializerMethodField()
    submitted_by = serializers.SerializerMethodField()
    
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
            'updated_at',
            'submitted_by',
        ]
        read_only_fields = ['complaint_id', 'created_at', 'updated_at']
    
    def get_date(self, obj):
        """Format date for frontend compatibility"""
        return obj.created_at.strftime('%Y-%m-%d')
    
    def get_submitted_by(self, obj):
        """Return the username of the user who submitted the complaint"""
        if obj.user:
            return obj.user.username
        return None
    
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


class PublicComplaintSerializer(serializers.ModelSerializer):
    """Serializer for public complaints feed with upvote info"""
    
    date = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    submitted_by = serializers.SerializerMethodField()
    upvote_count = serializers.SerializerMethodField()
    is_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_id',
            'title',
            'category',
            'category_display',
            'description',
            'location',
            'status',
            'image',
            'date',
            'upvote_count',
            'is_upvoted',
            'submitted_by',
        ]

    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')

    def get_category_display(self, obj):
        return obj.get_category_display()

    def get_submitted_by(self, obj):
        if obj.user:
            return obj.user.username
        return None

    def get_upvote_count(self, obj):
        return obj.upvotes.count()

    def get_is_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.upvotes.filter(user=request.user).exists()
        return False
