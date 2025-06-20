from datetime import date
from django.contrib.auth.models import User
from visits.callbacks import register_statistics_extra

from .serializers import RedmineExtraFieldPayloadSerializer
from .helpers import get_redmine_user_by_username, get_redmine_user_date_entries


@register_statistics_extra(
    type="redmine", serializer_class=RedmineExtraFieldPayloadSerializer
)
def redmine_statisitcs_extra(user: User, date: date):
    redmine_user = get_redmine_user_by_username(user.username)
    if not redmine_user:
        return None

    hours = get_redmine_user_date_entries(redmine_user, date)

    return {"hours": hours}
