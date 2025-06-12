from datetime import datetime
from django.utils import timezone
from django.contrib.auth.models import User
from visits.models import Session, SessionEntry


class SessionService:

    @staticmethod
    def enter(user: User, type: SessionEntry.Type, check_in: datetime):
        session, _ = Session.objects.get_or_create(
            user=user, date=timezone.now().date()
        )

        last_entry = session.get_last_entry()
        if last_entry and last_entry.check_out is None:
            raise ValueError("Previous entry has not been checked out.")

        session.add_enter(check_in=check_in, type=type)

    @staticmethod
    def update_entry(
        user: User,
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
    def exit(user: User, type: SessionEntry.Type, check_out: datetime):
        session = Session.objects.get(user=user, date=timezone.now())
        last_entry = session.get_last_entry()

        if last_entry is None:
            raise SessionEntry.DoesNotExist("No entry found to exit.")

        if last_entry.check_out is not None:
            raise ValueError("Entry already checked out.")

        session.update_entry(last_entry.id, type, check_out=check_out)

    @staticmethod
    def get_current_session(user: User) -> Session | None:
        today = timezone.localdate()
        session = Session.objects.get_last_user_session(user)

        if session is None:
            return None

        if session.date != today and session.entries.count() == 0:
            return None

        last_entry = session.get_last_entry()

        if session.date != today and last_entry and last_entry.check_out is not None:
            return None

        return session

    @staticmethod
    def get_session_status(
        user: User, session: Session | None
    ) -> Session.SessionStatus:
        if session is None:
            return Session.SessionStatus.INACTIVE

        return Session.SessionStatus.INACTIVE

    @staticmethod
    def get_session_last_comment(session: Session) -> str:
        raise Exception("Not implemented yet")
