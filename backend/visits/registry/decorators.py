from typing import Callable
from rest_framework.serializers import Serializer
from django.contrib.admin.options import InlineModelAdmin

from .types import StatisticsExtraDataCallback
from .store import _statistics_extra_registry, _user_admin_inline_registry


def register_statistics_extra(
    *, type: str, serializer_class: type[Serializer]
) -> Callable[[StatisticsExtraDataCallback], StatisticsExtraDataCallback]:
    """
    Registers handlers that provide extra parameters to statistics.

    Args:
        stat_type: A string identifier for the type of extra statistics.
        serializer_class: DRF Serializer class used for validating extra data.

    Returns:
        A decorator that registers a callback.
    """

    def decorator(callback: StatisticsExtraDataCallback) -> StatisticsExtraDataCallback:
        setattr(callback, "_type", type)
        setattr(callback, "_serializer_class", serializer_class)
        _statistics_extra_registry.append(callback)
        return callback

    return decorator


def register_user_admin_inline(cls: type[InlineModelAdmin]) -> type[InlineModelAdmin]:
    """
    Registers a Django admin inline class.
    """

    _user_admin_inline_registry.append(cls)

    return cls
