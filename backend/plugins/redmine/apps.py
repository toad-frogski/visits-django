from django.apps import AppConfig


class RedmineConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "plugins.redmine"

    def ready(self) -> None:
        from . import callbacks
        from visits.registry.store import register_urlpatterns
        from .urls import urlpatterns

        register_urlpatterns("redmine", urlpatterns)
