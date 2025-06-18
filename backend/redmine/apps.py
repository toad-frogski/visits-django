from django.apps import AppConfig


class RedmineConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "redmine"

    def ready(self) -> None:
        from . import callbacks
