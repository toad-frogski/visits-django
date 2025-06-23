import os
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import RFIDSettings
from .settings import settings


class RFIDAuthentication(BaseAuthentication):

    def authenticate(self, request):
        rfid_token = request.headers.get(settings.RFID_TOKEN_HEADER_NAME)
        service_key = request.headers.get(settings.RFID_SERVICE_TOKEN_HEADER_NAME)

        if not service_key:
            raise AuthenticationFailed(
                f"Missing {settings.RFID_SERVICE_TOKEN_HEADER_NAME}"
            )

        if service_key != settings.RFID_SERVICE_TOKEN:
            raise AuthenticationFailed(
                f"Invalid {settings.RFID_SERVICE_TOKEN_HEADER_NAME}"
            )

        if not rfid_token:
            return AuthenticationFailed(f"Missing {settings.RFID_TOKEN_HEADER_NAME}")

        try:
            rfid_settings = RFIDSettings.objects.get(rfid_token=rfid_token)
        except RFIDSettings.DoesNotExist:
            raise AuthenticationFailed(f"Invalid {settings.RFID_TOKEN_HEADER_NAME}")

        return (rfid_settings.user, None)
