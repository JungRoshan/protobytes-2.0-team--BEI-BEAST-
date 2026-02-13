from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.conf import settings
from django.shortcuts import redirect
from .serializers import UserSerializer

import requests
from urllib.parse import urlencode


GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
FRONTEND_URL = 'http://localhost:5173'


class GoogleOAuthRedirectView(APIView):
    """
    Redirects the user to Google's OAuth consent screen.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        params = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'online',
            'prompt': 'select_account',
        }
        auth_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
        return redirect(auth_url)


class GoogleOAuthCallbackView(APIView):
    """
    Handles the OAuth callback from Google.
    Exchanges the auth code for tokens, fetches user info,
    creates/finds the user, and redirects to frontend with JWT tokens.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        error = request.query_params.get('error')

        if error:
            return redirect(f"{FRONTEND_URL}/login?error=google_denied")

        if not code:
            return redirect(f"{FRONTEND_URL}/login?error=no_code")

        try:
            # Exchange authorization code for tokens
            token_response = requests.post(GOOGLE_TOKEN_URL, data={
                'code': code,
                'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
                'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
                'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
                'grant_type': 'authorization_code',
            })

            if token_response.status_code != 200:
                return redirect(f"{FRONTEND_URL}/login?error=token_exchange_failed")

            token_data = token_response.json()
            access_token = token_data.get('access_token')

            # Fetch user info from Google
            userinfo_response = requests.get(
                GOOGLE_USERINFO_URL,
                headers={'Authorization': f'Bearer {access_token}'},
            )

            if userinfo_response.status_code != 200:
                return redirect(f"{FRONTEND_URL}/login?error=userinfo_failed")

            userinfo = userinfo_response.json()
            email = userinfo.get('email')
            first_name = userinfo.get('given_name', '')
            last_name = userinfo.get('family_name', '')

            if not email:
                return redirect(f"{FRONTEND_URL}/login?error=no_email")

            # Find or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': first_name,
                    'last_name': last_name,
                },
            )

            # Handle username collision
            if created:
                base_username = email.split('@')[0]
                if User.objects.filter(username=base_username).exclude(id=user.id).exists():
                    user.username = f"{base_username}_{user.id}"
                    user.save()

            # Update name if changed
            if not created:
                changed = False
                if first_name and user.first_name != first_name:
                    user.first_name = first_name
                    changed = True
                if last_name and user.last_name != last_name:
                    user.last_name = last_name
                    changed = True
                if changed:
                    user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            jwt_access = str(refresh.access_token)
            jwt_refresh = str(refresh)

            # Redirect to frontend with tokens
            params = urlencode({
                'access': jwt_access,
                'refresh': jwt_refresh,
            })
            return redirect(f"{FRONTEND_URL}/auth/google/callback?{params}")

        except Exception as e:
            return redirect(f"{FRONTEND_URL}/login?error=google_auth_failed")
