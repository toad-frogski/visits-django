from typing import Optional
from django.db import models
from django.conf import settings
from django.utils.translation import gettext as _
from django.utils import timezone
from datetime import datetime


class SessionEntryComment(models.Model):
    session_entry = models.ForeignKey("SessionEntry", on_delete=models.CASCADE, related_name="comments")
    comment = models.CharField(max_length=255)


class SessionEntry(models.Model):
    class Type(models.TextChoices):
        SYSTEM = "SYSTEM", _("System")
        LUNCH = "LUNCH", _("Lunch")
        PERSONAL = "PERSONAL", _("Personal reasons")
        WORK = "WORK", _("Work reasons")

    session = models.ForeignKey("Session", on_delete=models.CASCADE, related_name="entries")
    check_in = models.DateTimeField(default=timezone.now, null=False)
    check_out = models.DateTimeField(null=True, blank=True)
    type = models.CharField(max_length=10, choices=Type.choices, default=Type.SYSTEM)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_comment(self, comment: str, comment_id: int | None = None):
        if comment_id:
            SessionEntryComment.objects.update_or_create(
                id=comment_id, defaults={"session_entry": self, "comment": comment}
            )
        else:
            SessionEntryComment.objects.create(session_entry=self, comment=comment)


class SessionManager(models.Manager):
    def get_last_user_session(self, user) -> Optional["Session"]:
        today = timezone.localdate()
        return (
            self.filter(user=user)
            .filter(models.Q(date=today) | models.Q(date__lt=today))
            .order_by("-date")
            .prefetch_related("entries__comments")
            .first()
        )


class Session(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField(_("Date"), default=timezone.now)
    objects: SessionManager = SessionManager()

    def get_last_entry(self):
        return self.entries.order_by("-id").first()  # type: ignore

    def add_enter(self, check_in: datetime, type: SessionEntry.Type = SessionEntry.Type.SYSTEM):
        entry = SessionEntry(session=self, check_in=check_in, type=type)
        entry.save()

    def update_entry(
        self,
        entry_id: int,
        type: SessionEntry.Type = SessionEntry.Type.SYSTEM,
        check_in: datetime | None = None,
        check_out: datetime | None = None,
    ):
        entry = self.entries.get(id=entry_id)  # type: ignore

        if check_in is not None:
            entry.check_in = check_in

        if check_out is not None:
            entry.check_out = check_out

        entry.type = type
        entry.save()
