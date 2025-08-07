from datetime import date
from django.contrib.auth.models import AbstractUser

from visits.registry.decorators import register_statistics_extra

from .serializers import RedmineExtraFieldPayloadSerializer
from .helpers import get_redmine_user_by_username, get_redmine_user_time_entries_sum


@register_statistics_extra(
    type="redmine", serializer_class=RedmineExtraFieldPayloadSerializer
)
def redmine_statisitcs_extra(user: AbstractUser, date: date):
    redmine_user = get_redmine_user_by_username(getattr(user, "username"))
    if not redmine_user:
        return None

    hours = get_redmine_user_time_entries_sum(redmine_user, date)

    return {"hours": hours}
