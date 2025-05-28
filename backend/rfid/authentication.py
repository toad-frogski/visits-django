from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import RFIDSettings


class RFIDAuthentication(BaseAuthentication):

    def authenticate(self, request):
        rfid_token = request.headers.get("X-RFID-Token")

        if not rfid_token:
            return None

        try:
            rfid_settings = RFIDSettings.objects.get(rfid_token=rfid_token)
        except RFIDSettings.DoesNotExist:
            raise AuthenticationFailed("Invalid RFID token")

        return (rfid_settings.user, None)
