from django.apps import AppConfig


class RfidConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rfid'

    def ready(self) -> None:
        from . import signals
        from . import settings
