from django.apps import AppConfig


class HolidaysConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "plugins.holidays"

    def ready(self) -> None:
        from . import callbacks
