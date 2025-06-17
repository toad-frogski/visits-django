from django.contrib.auth.models import User
from datetime import date
from typing import Any, Callable, Dict, List, TypedDict


class StatisticsExtraDataResult(TypedDict):
    name: str
    data: Dict[str, Any]


StatisticsExtraDataCallback = Callable[[User, date], StatisticsExtraDataResult]

_registered_statistics_extra_callbacks: List[StatisticsExtraDataCallback] = []


def register_statistics_extra(callback: StatisticsExtraDataCallback):
    _registered_statistics_extra_callbacks.append(callback)

    return callback


def statistics_extra_callbacks() -> List[StatisticsExtraDataCallback]:
    return _registered_statistics_extra_callbacks.copy()
