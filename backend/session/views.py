from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.contrib.auth import login, logout

from .serializers import LoginSerializer


@extend_schema(tags=["auth"])
class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema("login", request=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data.get("user")
        login(request, user)

        return Response()


@extend_schema(tags=["auth"])
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)

        return Response()
