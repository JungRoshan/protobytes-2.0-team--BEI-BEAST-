from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintListSerializer

class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling complaint CRUD operations
    
    Endpoints:
    - GET /api/complaints/ - List all complaints
    - POST /api/complaints/ - Create new complaint
    - GET /api/complaints/{id}/ - Retrieve specific complaint
    - PUT/PATCH /api/complaints/{id}/ - Update complaint
    - DELETE /api/complaints/{id}/ - Delete complaint
    - GET /api/complaints/track/{complaint_id}/ - Track complaint by ID
    """
    
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    
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
        try:
            complaint = get_object_or_404(Complaint, complaint_id=complaint_id)
            serializer = self.get_serializer(complaint)
            return Response(serializer.data)
        except Complaint.DoesNotExist:
            return Response(
                {'error': 'Complaint not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request, *args, **kwargs):
        """Create a new complaint and return the complaint_id"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        
        response_data = serializer.data
        response_data['message'] = 'Complaint submitted successfully'
        
        return Response(
            response_data,
            status=status.HTTP_201_CREATED
        )
