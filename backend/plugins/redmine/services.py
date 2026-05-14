from datetime import date
from functools import reduce
from django.utils import timezone
from django.core.cache import cache
from plugins.redmine.models import RedmineTimeEntry, RedmineUser
from plugins.redmine.serializers import RedmineExtraFieldPayloadSerializer


class StatisticsPlugin:
    _type = "redmine"
    _serializer_class = RedmineExtraFieldPayloadSerializer

    def __call__(self, user, date):
        redmine_user = get_redmine_user_by_username(getattr(user, "username"))
        if not redmine_user:
            return None

        hours = get_redmine_user_time_entries_sum(redmine_user, date)

        return {"hours": hours}


def get_redmine_user_time_entries_sum(user: RedmineUser, date: date):
    cid = f"redmine_stats_{user.login}_{date.isoformat()}"
    today = timezone.localdate()
    if today != date:
        hit = cache.get(cid)
        if hit is not None:
            return hit

    entries = RedmineTimeEntry.objects.filter(user_id=user.id, spent_on=date)
    hours = reduce(lambda acc, el: acc + el.hours, entries, 0)
    cache.set(cid, hours, timeout=8600)

    return hours


def get_redmine_user_by_username(username: str) -> RedmineUser | None:
    cache_key = f"redmine_user_{username}"
    redmine_user = cache.get(cache_key)
    if redmine_user is None:
        redmine_user = RedmineUser.objects.filter(login=username).first()
        cache.set(cache_key, redmine_user, 86400)

    return redmine_user
