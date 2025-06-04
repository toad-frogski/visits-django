from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.settings import api_settings
from rest_framework.response import Response
from rest_framework import status


class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        res = Response(status=status.HTTP_200_OK)

        access_token = data.get("access")
        refresh_token = data.get("refresh")

        if access_token:
            access_max_age = int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds())
            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
                max_age=access_max_age,
            )

        if refresh_token:
            refresh_max_age = int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds())
            res.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
                max_age=refresh_max_age,
            )

        return res


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        if not request.data.get("refresh") and request.COOKIES.get("refresh_token"):
            request.data["refresh"] = request.COOKIES["refresh_token"]

        response = super().post(request, *args, **kwargs)
        data = response.data

        res = Response(status=status.HTTP_200_OK)

        access_token = data.get("access")
        refresh_token = data.get("refresh")

        if access_token:
            access_max_age = int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds())
            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
                max_age=access_max_age,
            )

        if refresh_token:
            refresh_max_age = int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds())
            res.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/",
                max_age=refresh_max_age,
            )

        return res
