import calendar

from django.core.cache import cache
from datetime import date
from typing import Any
from django.conf import settings
import requests

from plugins.holidays.serializers import HolidaysStatisticsPluginSerializer


class StatisticsPlugin:
    _type = "holidays"
    _serializer_class = HolidaysStatisticsPluginSerializer

    def __call__(self, user, date: date) -> Any:
        holidays = get_holidays(month=date)
        holiday = holidays.get(date.strftime("%Y-%m-%d"))

        return {"type": holiday} if holiday else None


def get_holidays(month: date) -> dict:
    cache_key = f"holidays_{month.year}_{month.month}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    if not (url := settings.HOLIDAYS_URL):
        return {}

    days_in_month = calendar.monthrange(month.year, month.month)[1]
    start_date = month.replace(day=1).strftime("%Y-%m-%d")
    end_date = month.replace(day=days_in_month).strftime("%Y-%m-%d")

    try:
        response = requests.get(
            url, {"start_date": start_date, "end_date": end_date}, timeout=5
        )
        response.raise_for_status()

        data = response.json()
        if not isinstance(data, dict):
            return {}

        holidays = data.get("holidays", [])
        holidays_map = {
            h["date"]: h["type"]
            for h in holidays
            if isinstance(h, dict) and "date" in h and "type" in h
        }
        cache.set(cache_key, holidays_map, 60 * 60 * 24)

        return holidays_map
    except Exception:
        return {}
