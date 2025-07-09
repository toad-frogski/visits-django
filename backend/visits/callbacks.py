from datetime import date
from typing import Callable, Generic, TypeVar, TypedDict
from django.contrib.auth import get_user_model
from django.contrib.admin.options import InlineModelAdmin

User = get_user_model()

T = TypeVar("T")


class StatisticsExtraDataResult(TypedDict, Generic[T]):
    type: str
    payload: T


StatisticsExtraDataCallback = Callable[[User, date], T]

_statistics_extra_registry: list[StatisticsExtraDataCallback] = []
_user_admin_inline_registry: list[type[InlineModelAdmin]] = []


def statistics_extra_callbacks() -> list[StatisticsExtraDataCallback]:
    return _statistics_extra_registry.copy()


def get_user_admin_inline() -> list[type[InlineModelAdmin]]:
    return _user_admin_inline_registry.copy()
