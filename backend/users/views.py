from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from visits.services.session_service import SessionService
from .serializers import UserProfileModelSerializer, UserSessionSerializer


class UsersTodayView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request):
        users = User.objects.filter(is_active=True).select_related("profile")
        session_service = SessionService()

        data = []
        for user in users:
            session = session_service.get_current_session(user)
            data.append({"user": user, "session": session})

        serializer = UserSessionSerializer(data, many=True)

        return Response(serializer.data)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request: Request):
        profile = User.objects.filter(user=request.user).first()

        if profile is None:
            raise NotFound(detail="Profile not found")

        serializer = UserProfileModelSerializer(profile)

        return Response(serializer.data)

    def post(self, request: Request):
        serializer = UserProfileModelSerializer(request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
