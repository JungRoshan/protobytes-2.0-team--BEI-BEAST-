from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintListSerializer


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling complaint CRUD operations

    Permissions:
    - POST /api/complaints/ (create) — AllowAny
    - GET /api/complaints/track/{id}/ — AllowAny
    - GET /api/complaints/ (list) — Admin only
    - PATCH/PUT /api/complaints/{id}/ (update) — Admin only
    - DELETE /api/complaints/{id}/ — Admin only
    """

    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer

    def get_permissions(self):
        if self.action in ['create', 'track']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        """Use different serializers for list and detail views"""
        if self.action == 'list':
            return ComplaintListSerializer
        return ComplaintSerializer

    @action(detail=False, methods=['get'], url_path='track/(?P<complaint_id>[^/.]+)')
    def track(self, request, complaint_id=None):
        """
        Track a complaint by its complaint_id

        Usage: GET /api/complaints/track/HA-2025-001/
        """
        complaint = get_object_or_404(Complaint, complaint_id=complaint_id)
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a new complaint and return the complaint_id"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()

        response_data = ComplaintSerializer(complaint).data
        response_data['message'] = 'Complaint submitted successfully'

        return Response(
            response_data,
            status=status.HTTP_201_CREATED
        )
