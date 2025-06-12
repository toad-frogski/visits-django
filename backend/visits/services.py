from datetime import datetime
from django.utils import timezone
from django.shortcuts import get_object_or_404
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
        entry_id: int,
        type: SessionEntry.Type,
        check_in: datetime | None = None,
        check_out: datetime | None = None,
    ):
        entry = get_object_or_404(SessionEntry, id=entry_id)

        if check_in is not None:
            entry.check_in = check_in

        if check_out is not None:
            entry.check_out = check_out

        entry.type = type
        entry.save()


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
        session = Session.objects.get_last_user_session(user)

        if not session:
            return None

        if session.date == timezone.localdate() or session.get_open_entries().exists():
            return session

        return None

    @staticmethod
    def get_session_status(
        user: User, session: Session | None
    ) -> Session.SessionStatus:
        if session is None:
            return Session.SessionStatus.INACTIVE

        # @todo: Handle other statuses

        open_entries = session.get_open_entries()
        if len(open_entries) > 1:
            return Session.SessionStatus.CHEATER

        last_entry = session.get_last_entry()
        if last_entry is None:
            return Session.SessionStatus.INACTIVE

        if last_entry.check_in and last_entry.check_out is None:
            return Session.SessionStatus.ACTIVE

        return Session.SessionStatus.INACTIVE

    @staticmethod
    def get_session_last_comment(session: Session | None) -> str | None:
        if session is None:
            return None

        last_entry = session.get_last_entry()
        if last_entry is None:
            return None

        last_comment = last_entry.get_last_comment()
        return last_comment.comment if last_comment else None
