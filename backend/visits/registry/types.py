from datetime import date
from typing import Callable, Generic, TypeVar, TypedDict
from django.contrib.auth import get_user_model

T = TypeVar("T")

User = get_user_model()

class StatisticsExtraDataResult(TypedDict, Generic[T]):
    type: str
    payload: T


StatisticsExtraDataCallback = Callable[[User, date], T]
