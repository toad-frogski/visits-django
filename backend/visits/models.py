from typing import Optional
from django.db import models
from django.conf import settings
from django.utils.translation import gettext as _
from django.utils import timezone
from datetime import datetime


class SessionEntry(models.Model):
    class Type(models.TextChoices):
        SYSTEM = "SYSTEM", _("System")
        LUNCH = "LUNCH", _("Lunch")
        BREAK = "BREAK", _("Break")
        WORK = "WORK", _("Work")

    session = models.ForeignKey(
        "Session", on_delete=models.CASCADE, related_name="entries"
    )
    start = models.DateTimeField(default=timezone.localtime, null=False)
    end = models.DateTimeField(null=True, blank=True)
    type = models.CharField(max_length=10, choices=Type.choices, default=Type.SYSTEM)
    comment = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_open(self) -> bool:
        return self.end is None

    def close(self, time: datetime | None = None):
        self.end = time or timezone.localtime()
        self.save()


class SessionManager(models.Manager["Session"]):
    def get_last_user_session(self, user) -> Optional["Session"]:
        today = timezone.localdate()
        return (
            self.filter(user=user)
            .filter(models.Q(date=today) | models.Q(date__lt=today))
            .order_by("-date")
            .first()
        )


class Session(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField(_("Date"), default=timezone.localtime)
    objects: SessionManager = SessionManager()

    class Status(models.TextChoices):
        ACTIVE = "active", _("Active")
        INACTIVE = "inactive", _("Inactive")
        CHEATER = "cheater", _("Cheater")
        HOLIDAY = "holiday", _("Holiday")
        VACATION = "vacation", _("Vacation")

    def get_last_entry(self) -> SessionEntry | None:
        return self.entries.order_by("-id").first()  # type: ignore

    def get_open_entries(self):
        return self.entries.filter(end__isnull=True)  # type: ignore

    def add_enter(
        self,
        start: datetime,
        type: SessionEntry.Type = SessionEntry.Type.SYSTEM,
        comment: str | None = None,
    ):
        entry = SessionEntry(session=self, start=start, type=type, comment=comment)
        entry.save()

    def update_entry(
        self,
        entry_id: int,
        type: SessionEntry.Type = SessionEntry.Type.SYSTEM,
        start: datetime | None = None,
        end: datetime | None = None,
    ):
        entry = self.entries.get(id=entry_id)  # type: ignore

        if start is not None:
            entry.start = start

        if end is not None:
            entry.end = end

        entry.type = type
        entry.save()

    @property
    def status(self):
        entries = list(self.entries.order_by("start"))  # type: ignore

        for i in range(1, len(entries)):
            if entries[i - 1].end is None or entries[i].start < entries[i - 1].end:
                return Session.Status.CHEATER

        if entries[-1].end is None:
            return Session.Status.ACTIVE

        return Session.Status.INACTIVE
