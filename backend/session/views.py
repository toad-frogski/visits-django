from rest_framework import views
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.contrib.auth import login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404

from .models import Avatar
from .serializers import LoginSerializer, UserModelSerializer, AvatarModelSerializer


@extend_schema(tags=["session"])
class LoginView(views.APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        "login",
        request=LoginSerializer,
        responses={status.HTTP_200_OK: UserModelSerializer},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data.get("user")
        login(request, user)

        serializer = UserModelSerializer(user)
        return Response(serializer.data)


@extend_schema(tags=["session"])
class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema("logout")
    def post(self, request):
        logout(request)

        return Response()


@extend_schema_view(get=extend_schema("me", tags=["session"]))
@method_decorator(ensure_csrf_cookie, name="dispatch")
class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserModelSerializer

    def get_object(self):
        return self.request.user


@extend_schema(tags=["avatar"])
class AvatarView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvatarModelSerializer

    def get_object(self):
        return get_object_or_404(Avatar, user=self.request.user)
