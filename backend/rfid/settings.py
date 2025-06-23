from django.conf import settings
import secrets
import os


class RFIDSettings:
    RFID_SERVICE_TOKEN: str
    RFID_TOKEN_HEADER_NAME: str
    RFID_SERVICE_TOKEN_HEADER_NAME: str

    DEFAULTS = {
        "RFID_SERVICE_TOKEN": os.getenv(
            "RFID_SERVICE_TOKEN", secrets.token_urlsafe(32)
        ),
        "RFID_TOKEN_HEADER_NAME": "X-RFID-Key",
        "RFID_SERVICE_TOKEN_HEADER_NAME": "X-Service-Key",
    }

    def __getattr__(self, name):
        if hasattr(settings, name):
            return getattr(settings, name)
        if name in self.DEFAULTS:
            return self.DEFAULTS[name]
        raise AttributeError(f"RFID setting '{name}' not found.")


settings = RFIDSettings()
