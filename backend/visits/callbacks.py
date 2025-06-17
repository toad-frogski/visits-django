from django.contrib.auth.models import User
from datetime import date
from typing import Callable, Generic, List, TypeVar, TypedDict

T = TypeVar("T")


class StatisticsExtraDataResult(TypedDict, Generic[T]):
    type: str
    data: T


StatisticsExtraDataCallback = Callable[[User, date], StatisticsExtraDataResult[T]]

_registered_statistics_extra_callbacks: List[StatisticsExtraDataCallback] = []


def register_statistics_extra(callback: StatisticsExtraDataCallback):
    _registered_statistics_extra_callbacks.append(callback)

    return callback


def statistics_extra_callbacks() -> List[StatisticsExtraDataCallback]:
    return _registered_statistics_extra_callbacks.copy()
