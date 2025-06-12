from rest_framework import views
from rest_framework import generics
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from visits.models import Session
from visits.services import SessionService

from .serializers import (
    AvatarModelSerializer,
    UserSessionSerializer,
)
from .models import Avatar


@extend_schema(tags=["users"])
class UsersTodayView(views.APIView):
    permission_classes = [AllowAny]

    @extend_schema("today", responses={
        status.HTTP_200_OK: UserSessionSerializer(many=True)
    })
    def get(self, request: Request):
        users = User.objects.filter(is_active=True).select_related("profile")
        session_service = SessionService()

        data = []
        for user in users:
            session = session_service.get_current_session(user)
            session_status = session_service.get_session_status(user, session)
            data.append({"user": user, "session_status": session_status})

        serializer = UserSessionSerializer(data, many=True)

        return Response(serializer.data)


@extend_schema(tags=["avatar"])
class AvatarView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvatarModelSerializer

    def get_object(self):
        return get_object_or_404(Avatar, user=self.request.user)
