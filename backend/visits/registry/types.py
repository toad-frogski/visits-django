from datetime import date
from typing import Callable, Generic, TypeVar, TypedDict
from django.contrib.auth.models import AbstractUser

T = TypeVar("T")


class StatisticsExtraDataResult(TypedDict, Generic[T]):
    type: str
    payload: T


StatisticsExtraDataCallback = Callable[[AbstractUser, date], T]
