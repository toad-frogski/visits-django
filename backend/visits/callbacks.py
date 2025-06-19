from rest_framework.serializers import Serializer
from django.contrib.auth.models import User
from datetime import date
from typing import Callable, Generic, List, TypeVar, TypedDict


T = TypeVar("T")


class StatisticsExtraDataResult(TypedDict, Generic[T]):
    type: str
    payload: T


StatisticsExtraDataCallback = Callable[[User, date], T]

_registered_statistics_extra_callbacks: List[StatisticsExtraDataCallback] = []


def register_statistics_extra(*, type: str, serializer_class: type[Serializer]):
    def decorator(callback: StatisticsExtraDataCallback[T]):
        setattr(callback, "_type", type)
        setattr(callback, "_serializer_class", serializer_class)
        _registered_statistics_extra_callbacks.append(callback)

        return callback

    return decorator


def statistics_extra_callbacks() -> List[StatisticsExtraDataCallback]:
    return _registered_statistics_extra_callbacks.copy()
