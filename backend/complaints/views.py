from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count
from .models import Complaint, Upvote
from .serializers import ComplaintSerializer, ComplaintListSerializer, PublicComplaintSerializer


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

    def perform_create(self, serializer):
        """Associate the complaint with the authenticated user."""
        serializer.save(user=self.request.user)

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