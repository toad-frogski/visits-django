from datetime import date
from functools import reduce
from django.contrib.auth.models import User
from django.core.cache import cache
from django.utils import timezone
from visits.callbacks import register_statistics_extra
from .models import RedmineTimeEntry, RedmineUser
from .serializers import RedmineExtraFieldPayloadSerializer


@register_statistics_extra(type="redmine", serializer_class=RedmineExtraFieldPayloadSerializer)
def redmine_statisitcs_extra(user: User, date: date):
    redmine_user = _get_redmine_user_by_username(user.username)
    if not redmine_user:
        return None

    hours = _get_redmine_user_date_entries(redmine_user, date)

    return {"hours": hours}


def _get_redmine_user_date_entries(user: RedmineUser, date: date):
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


def _get_redmine_user_by_username(username: str) -> RedmineUser | None:
    cache_key = f"redmine_user_{username}"
    redmine_user = cache.get(cache_key)
    if redmine_user is None:
        redmine_user = RedmineUser.objects.filter(login=username).first()
        cache.set(cache_key, redmine_user, 86400)

    return redmine_user
