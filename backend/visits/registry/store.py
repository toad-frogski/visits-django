from typing import Sequence, Union
from django.contrib.admin.options import InlineModelAdmin
from django.urls import URLPattern, URLResolver, include, path
from .types import StatisticsExtraDataCallback

# Internal mutable registries
_statistics_extra_registry: list[StatisticsExtraDataCallback] = []
_user_admin_inline_registry: list[type[InlineModelAdmin]] = []
_urlpatterns_registry: dict[str, Sequence[Union[URLPattern, URLResolver]]] = {}


# Registration methods
def register_statistics_extra_callback(callback: StatisticsExtraDataCallback) -> None:
    _statistics_extra_registry.append(callback)


def register_user_admin_inline(inline: type[InlineModelAdmin]) -> None:
    _user_admin_inline_registry.append(inline)


def register_urlpatterns(prefix: str, urlpatterns: Sequence[Union[URLPattern, URLResolver]] = []) -> None:
    _urlpatterns_registry.setdefault(prefix, urlpatterns)


# Accessors
def get_statistics_extra_callbacks() -> list[StatisticsExtraDataCallback]:
    return _statistics_extra_registry.copy()


def get_user_admin_inlines() -> list[type[InlineModelAdmin]]:
    return _user_admin_inline_registry.copy()


def get_registered_urlpatterns() -> list[URLPattern | URLResolver]:
    result = []
    for prefix, patterns in _urlpatterns_registry.copy().items():
        result.append(path(f"plugins/{prefix}/", include((patterns, prefix))))

    return result
