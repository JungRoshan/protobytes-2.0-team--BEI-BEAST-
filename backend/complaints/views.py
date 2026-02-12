from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintListSerializer

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