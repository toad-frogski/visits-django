from typing import Optional
from django.db import models
from django.conf import settings
from django.utils.translation import gettext as _
from django.utils import timezone
from datetime import datetime


class SessionEntry(models.Model):

    class SessionEntryType(models.TextChoices):
        SYSTEM = "SYSTEM", _("System")
        LUNCH = "LUNCH", _("Lunch")
        BREAK = "BREAK", _("Break")
        WORK = "WORK", _("Work")

    session = models.ForeignKey(
        "Session", on_delete=models.CASCADE, related_name="entries"
    )
    start = models.DateTimeField(default=timezone.localtime, null=False)
    end = models.DateTimeField(null=True, blank=True)
    type = models.CharField(
        max_length=10,
        choices=SessionEntryType.choices,
        default=SessionEntryType.SYSTEM,
        null=False,
    )
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
    def get_queryset(self) -> models.QuerySet["Session"]:
        return (
            super()
            .get_queryset()
            .prefetch_related(
                models.Prefetch(
                    "entries", queryset=SessionEntry.objects.order_by("start")
                )
            )
        )

    def get_last_user_session(self, user) -> Optional["Session"]:
        today = timezone.localdate()
        return (
            self.filter(user=user)
            .filter(models.Q(date=today) | models.Q(date__lt=today))
            .order_by("-date")
            .first()
        )


class Session(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions"
    )
    date = models.DateField(_("Date"), default=timezone.localdate)
    objects: SessionManager = SessionManager()

    class SessionStatus(models.TextChoices):
        ACTIVE = "active", _("Active")
        INACTIVE = "inactive", _("Inactive")
        CHEATER = "cheater", _("Cheater")
        HOLIDAY = "holiday", _("Holiday")
        VACATION = "vacation", _("Vacation")
        SICK = "sick", _("Sick")

    def get_last_entry(self) -> SessionEntry | None:
        return self.entries.order_by("-start").first()  # type: ignore

    def get_open_entries(self):
        return self.entries.filter(end__isnull=True)  # type: ignore

    def add_enter(
        self,
        start: datetime,
        type: SessionEntry.SessionEntryType = SessionEntry.SessionEntryType.SYSTEM,
        comment: str | None = None,
    ):
        entry = SessionEntry(session=self, start=start, type=type, comment=comment)
        entry.save()

    def update_entry(
        self,
        entry_id: int,
        type: SessionEntry.SessionEntryType = SessionEntry.SessionEntryType.SYSTEM,
        start: datetime | None = None,
        end: datetime | None = None,
    ):
        entry = self.entries.get(id=entry_id)  # type: ignore
        entry.start = start or entry.start
        entry.end = end or entry.end
        entry.type = type
        entry.save()

    @property
    def status(self):
        entries: list[SessionEntry] = list(self.entries.order_by("start"))  # type: ignore

        if len(entries) == 0:
            return Session.SessionStatus.INACTIVE

        for i in range(1, len(entries)):
            if entries[i - 1].end is None or entries[i].start < entries[i - 1].end:
                return Session.SessionStatus.CHEATER

        last = entries[-1]
        if last.end is None:
            now = timezone.localtime()

            if now.date() != self.date and now.hour > 8:
                return Session.SessionStatus.CHEATER

            return (
                Session.SessionStatus.ACTIVE
                if last.type == SessionEntry.SessionEntryType.WORK
                else Session.SessionStatus.INACTIVE
            )

        return Session.SessionStatus.INACTIVE
