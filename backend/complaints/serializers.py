from rest_framework import serializers
from .models import Complaint, ComplaintImage, Upvote, Department, AdminProfile


class ComplaintImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class DepartmentSerializer(serializers.ModelSerializer):
    categories_list = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'slug', 'description', 'categories', 'categories_list']

    def get_categories_list(self, obj):
        return obj.get_categories_list()


class AdminProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)

    class Meta:
        model = AdminProfile
        fields = ['id', 'username', 'department_name', 'role']


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for the Complaint model"""

    date = serializers.SerializerMethodField()
    submitted_by = serializers.SerializerMethodField()
    images = ComplaintImageSerializer(many=True, read_only=True)
    assigned_department_name = serializers.CharField(
        source='assigned_department.name', read_only=True, default=None
    )
    assigned_to_name = serializers.CharField(
        source='assigned_to.username', read_only=True, default=None
    )

    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_id',
            'title',
            'category',
            'description',
            'location',
            'latitude',
            'longitude',
            'status',
            'image',
            'images',
            'date',
            'created_at',
            'updated_at',
            'submitted_by',
            'assigned_department',
            'assigned_department_name',
            'assigned_to',
            'assigned_to_name',
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
    assigned_department_name = serializers.CharField(
        source='assigned_department.name', read_only=True, default=None
    )
    assigned_to_name = serializers.CharField(
        source='assigned_to.username', read_only=True, default=None
    )

    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_id',
            'title',
            'category',
            'category_display',
            'location',
            'latitude',
            'longitude',
            'status',
            'date',
            'assigned_department',
            'assigned_department_name',
            'assigned_to',
            'assigned_to_name',
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
    images = ComplaintImageSerializer(many=True, read_only=True)

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
            'latitude',
            'longitude',
            'status',
            'image',
            'images',
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
