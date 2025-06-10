from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.contrib.auth import login, logout
from rest_framework import status

from .serializers import LoginSerializer
from users.serializers import UserModelSerializer


@extend_schema(tags=["auth"])
class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        "login",
        request=LoginSerializer,
        responses={
            status.HTTP_200_OK : UserModelSerializer
    })
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data.get("user")
        login(request, user)

        serializer = UserModelSerializer(user)
        return Response(serializer.data)


@extend_schema(tags=["auth"])
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema("logout")
    def post(self, request):
        logout(request)

        return Response()
