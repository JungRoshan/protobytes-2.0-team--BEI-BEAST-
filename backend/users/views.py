from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing users.
    Provides `me` endpoint to get current user details.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the currently logged-in user"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class AuthViewSet(viewsets.ViewSet):
    """
    Simple ViewSet for authentication checking
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Placeholder for login logic if using Token auth later.
        For now, we rely on Django Session auth or external auth.
        """
        return Response({'message': 'Use Django implementation or JWT for auth'}, status=status.HTTP_501_NOT_IMPLEMENTED)
