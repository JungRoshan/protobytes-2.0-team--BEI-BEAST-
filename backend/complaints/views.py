from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.db.models import Count
from django.contrib.auth.models import User
from .models import Complaint, ComplaintImage, Upvote, Department, AdminProfile
from .serializers import (
    ComplaintSerializer,
    ComplaintListSerializer,
    PublicComplaintSerializer,
    DepartmentSerializer,
)


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing complaints.
    """
    permission_classes = [IsAuthenticated]
    queryset = Complaint.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return ComplaintListSerializer
        return ComplaintSerializer

    def get_queryset(self):
        qs = Complaint.objects.select_related('assigned_department', 'assigned_to').all()
        return qs

    def perform_create(self, serializer):
        """Associate the complaint with the authenticated user and save additional images."""
        complaint = serializer.save(user=self.request.user)
        # Handle multiple image uploads
        images = self.request.FILES.getlist('images')
        for img in images:
            ComplaintImage.objects.create(complaint=complaint, image=img)

    @action(detail=False, methods=['get'], url_path='track/(?P<complaint_id>[^/.]+)', permission_classes=[AllowAny])
    def track_complaint(self, request, complaint_id=None):
        """
        Custom action to track a complaint by its complaint_id (e.g., HA-2025-001).
        URL: /api/complaints/track/<complaint_id>/
        """
        try:
            complaint = Complaint.objects.get(complaint_id=complaint_id)
            serializer = self.get_serializer(complaint)
            return Response(serializer.data)
        except Complaint.DoesNotExist:
            return Response(
                {"detail": "No complaint found with this ID."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='public', permission_classes=[AllowAny])
    def public_list(self, request):
        """
        Public endpoint listing all complaints with filtering and sorting.
        Query params: category, date_from, date_to, sort (recent|oldest|most_upvoted)
        """
        queryset = Complaint.objects.all()

        # Filter by category
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Filter by date range
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Sort
        sort = request.query_params.get('sort', 'recent')
        if sort == 'oldest':
            queryset = queryset.order_by('created_at')
        elif sort == 'most_upvoted':
            queryset = queryset.annotate(upvote_count=Count('upvotes')).order_by('-upvote_count', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        serializer = PublicComplaintSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upvote', permission_classes=[IsAuthenticated])
    def toggle_upvote(self, request, pk=None):
        """Toggle upvote on a complaint. Creates upvote if not exists, deletes if exists."""
        complaint = self.get_object()
        upvote, created = Upvote.objects.get_or_create(user=request.user, complaint=complaint)
        if not created:
            upvote.delete()
            return Response({'upvoted': False, 'upvote_count': complaint.upvotes.count()})
        return Response({'upvoted': True, 'upvote_count': complaint.upvotes.count()}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='assign', permission_classes=[IsAdminUser])
    def assign(self, request, pk=None):
        """Assign a complaint to a department and/or a specific admin user."""
        complaint = self.get_object()
        department_id = request.data.get('assigned_department')
        assigned_to_id = request.data.get('assigned_to')

        if department_id:
            try:
                dept = Department.objects.get(id=department_id)
                complaint.assigned_department = dept
            except Department.DoesNotExist:
                return Response({'detail': 'Department not found.'}, status=status.HTTP_400_BAD_REQUEST)
        elif department_id is None and 'assigned_department' in request.data:
            complaint.assigned_department = None

        if assigned_to_id:
            try:
                user = User.objects.get(id=assigned_to_id, is_staff=True)
                complaint.assigned_to = user
            except User.DoesNotExist:
                return Response({'detail': 'Admin user not found.'}, status=status.HTTP_400_BAD_REQUEST)
        elif assigned_to_id is None and 'assigned_to' in request.data:
            complaint.assigned_to = None

        # Auto-set status to Assigned if not already
        if complaint.status == 'Submitted' and (complaint.assigned_department or complaint.assigned_to):
            complaint.status = 'Assigned'

        complaint.save()
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only ViewSet for departments."""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='admins')
    def list_admins(self, request, pk=None):
        """List admin users belonging to this department."""
        department = self.get_object()
        profiles = AdminProfile.objects.filter(department=department).select_related('user')
        data = [
            {
                'id': p.user.id,
                'username': p.user.username,
                'first_name': p.user.first_name,
                'last_name': p.user.last_name,
                'role': p.get_role_display(),
            }
            for p in profiles
        ]
        return Response(data)