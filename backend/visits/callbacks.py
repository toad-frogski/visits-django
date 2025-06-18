from functools import wraps
from django.contrib.auth.models import User
from datetime import date
from typing import Callable, Generic, List, TypeVar, TypedDict

T = TypeVar("T")


class StatisticsExtraDataResult(TypedDict, Generic[T]):
    type: str
    data: T


StatisticsExtraDataCallback = Callable[[User, date], T]

_registered_statistics_extra_callbacks: List[StatisticsExtraDataCallback] = []


def register_statistics_extra(*, type: str | None = None):
    def decorator(callback: StatisticsExtraDataCallback[T]):
        callback._type = type or callback.__name__
        _registered_statistics_extra_callbacks.append(callback)

        return callback

    return decorator


def statistics_extra_callbacks() -> List[StatisticsExtraDataCallback]:
    return _registered_statistics_extra_callbacks.copy()
