from datetime import date
from functools import reduce
from django.core.cache import cache
from django.utils import timezone

from .models import RedmineUser, RedmineTimeEntry


def get_redmine_user_time_entries_sum(user: RedmineUser, date: date):
    cache_key = f"redmine_stats_{user.login}_{date.isoformat()}"
    today = timezone.localdate()
    if today != date:
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            return cached_result

    entries = RedmineTimeEntry.objects.filter(user_id=user.id, spent_on=date)
    hours = reduce(lambda acc, el: acc + el.hours, entries, 0)
    cache.set(cache_key, hours, timeout=8600)

    return hours


def get_redmine_user_by_username(username: str) -> RedmineUser | None:
    cache_key = f"redmine_user_{username}"
    redmine_user = cache.get(cache_key)
    if redmine_user is None:
        redmine_user = RedmineUser.objects.filter(login=username).first()
        cache.set(cache_key, redmine_user, 86400)

    return redmine_user
