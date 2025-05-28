from datetime import datetime
from visits.models import Session, SessionEntry
from django.utils import timezone


class SessionService:

    @staticmethod
    def enter(user, check_in: datetime, type: SessionEntry.Type):
        session, _ = Session.objects.get_or_create(
            user=user, date=timezone.now().date()
        )
        session.add_enter(check_in=check_in, type=type)

    @staticmethod
    def update_entry(
        user,
        entry_id: int,
        type: SessionEntry.Type,
        check_in: datetime | None = None,
        check_out: datetime | None = None,
    ):
        session = Session.objects.get(user=user, date=timezone.now())
        return session.update_entry(
            entry_id, type, check_in=check_in, check_out=check_out
        )

    @staticmethod
    def exit(user, entry_id: int, type: SessionEntry.Type, check_out: datetime):
        session = Session.objects.get(user=user, date=timezone.now())
        session.update_entry(entry_id, type, check_out=check_out)
