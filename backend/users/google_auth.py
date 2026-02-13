from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .serializers import UserSerializer


class GoogleLoginView(APIView):
    """
    Accepts a Google ID token (credential) from the frontend,
    verifies it with Google, creates/finds the user, returns JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get('credential')
        if not credential:
            return Response(
                {'detail': 'Google credential is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Verify the Google ID token
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )

            # Extract user info
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            if not email:
                return Response(
                    {'detail': 'Email not provided by Google.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Find or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': first_name,
                    'last_name': last_name,
                },
            )

            # Handle username collision for new users
            if created and User.objects.filter(username=user.username).count() > 1:
                user.username = f"{email.split('@')[0]}_{user.id}"
                user.save()

            # Update name if changed on Google side
            if not created:
                if first_name and user.first_name != first_name:
                    user.first_name = first_name
                if last_name and user.last_name != last_name:
                    user.last_name = last_name
                user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'message': 'Google login successful',
            })

        except ValueError as e:
            return Response(
                {'detail': f'Invalid Google token: {str(e)}'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            return Response(
                {'detail': f'Google authentication failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
