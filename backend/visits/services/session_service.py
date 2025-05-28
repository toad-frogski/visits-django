from datetime import datetime
from visits.models import Session, SessionEntry
from django.utils import timezone


class SessionService:

    @staticmethod
    def enter(user, type: SessionEntry.Type, check_in: datetime):
        session, _ = Session.objects.get_or_create(
            user=user, date=timezone.now().date()
        )

        last_entry = session.get_last_entry()
        if last_entry and last_entry.check_out is None:
            raise ValueError("Previous entry has not been checked out.")

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
    def exit(user, type: SessionEntry.Type, check_out: datetime):
        session = Session.objects.get(user=user, date=timezone.now())
        last_entry = session.get_last_entry()

        if last_entry is None:
            raise SessionEntry.DoesNotExist("No entry found to exit.")

        if last_entry.check_out is not None:
            raise ValueError("Entry already checked out.")

        session.update_entry(last_entry.id, type, check_out=check_out)
