from django.apps import AppConfig


class VisitsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "visits"

    def ready(self) -> None:
        from . import signals  # noqa: F401
        from . import registry

        registry.register_plugins()