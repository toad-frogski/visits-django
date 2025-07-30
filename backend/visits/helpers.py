import pytz
from datetime import datetime
from django.utils import timezone


def to_utc(dt: datetime):
    if timezone.is_naive(dt):
        return timezone.make_aware(dt, timezone=pytz.UTC)
    else:
        return dt.astimezone(pytz.UTC)
