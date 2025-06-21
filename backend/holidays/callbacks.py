from os import getenv
import calendar
import requests
from datetime import date
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework import status
from visits.callbacks import register_statistics_extra
from .serializers import HolidaysExtraFieldPayloadSerializer


@register_statistics_extra(
    type="holidays", serializer_class=HolidaysExtraFieldPayloadSerializer
)
def holidays_statistics_extra(user: User, date: date):
    holidays = _get_holidays(month=date)
    holiday = holidays.get(date.strftime("%Y-%m-%d"))

    return {"type": holiday} if holiday else None


def _get_holidays(month: date) -> dict:
    cache_key = f"holidays_{month.year}_{month.month}"
    holidays = cache.get(cache_key)
    if holidays is None:
        if not (url := getenv("HOLIDAYS_URL")):
            return {}
        days_in_month = calendar.monthrange(month.year, month.month)[1]
        start_date = month.replace(day=1).strftime("%Y-%m-%d")
        end_date = month.replace(day=days_in_month).strftime("%Y-%m-%d")

        response = requests.get(url, {"start_date": start_date, "end_date": end_date})
        if response.status_code != status.HTTP_200_OK:
            return {}
        holidays = (response.json() or {}).get("holidays", {})
        holidays_map = {h["date"]: h["type"] for h in holidays}
        cache.set(cache_key, holidays_map, 60 * 60 * 24)

    return holidays
