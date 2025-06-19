from datetime import datetime
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Subquery, OuterRef
from visits.models import Session, SessionEntry


class SessionService:

    @staticmethod
    def enter(user: User, type: SessionEntry.SessionEntryType, time: datetime):
        session, _ = Session.objects.get_or_create(user=user, date=timezone.localdate())
        last_entry = session.get_last_entry()

        if not last_entry or not last_entry.end:
            session.add_enter(start=time, type=type)
            return

        # Try to restore session
        break_entry = SessionEntry.objects.create(
            session=session,
            type=SessionEntry.SessionEntryType.BREAK,
            start=last_entry.end,
            end=time,
        )
        break_entry.save()
        session.add_enter(start=time, type=type)

    @staticmethod
    def update_entry(
        entry_id: int,
        type: SessionEntry.SessionEntryType,
        start: datetime | None = None,
        end: datetime | None = None,
        comment: str | None = None,
    ):
        entry = get_object_or_404(SessionEntry, id=entry_id)

        for attr, value in {"start": start, "end": end, "comment": comment}.items():
            if value is not None:
                setattr(entry, attr, value)

        entry.type = type
        entry.save()

    @staticmethod
    def exit(user: User, time: datetime, comment: str | None = None):
        session = Session.objects.get_last_user_session(user)
        if session is None:
            raise Session.DoesNotExist()

        last_entry = session.get_last_entry()

        if last_entry is None:
            raise SessionEntry.DoesNotExist("No entry found to exit.")

        if last_entry.end is not None:
            raise ValueError("Entry already checked out.")

        last_entry.end = time
        last_entry.comment = comment
        last_entry.save()

    @staticmethod
    def handle_leave(
        user: User,
        type: SessionEntry.SessionEntryType,
        time: datetime,
        comment: str | None = None,
    ):
        session = Session.objects.get_last_user_session(user)
        if session is None:
            raise Session.DoesNotExist()

        last_entry = session.get_last_entry()
        if last_entry is None or last_entry.end is not None:
            raise ValueError("No open work entry to leave from.")

        last_entry.close(time)
        session.add_enter(start=time, type=type, comment=comment)

    @staticmethod
    def leave(
        user: User,
        type: SessionEntry.SessionEntryType = SessionEntry.SessionEntryType.BREAK,
        time: datetime = timezone.localtime(),
        comment: str | None = None,
    ):
        SessionService.handle_leave(user, type, time, comment)

    @staticmethod
    def comeback(
        user: User,
        type: SessionEntry.SessionEntryType = SessionEntry.SessionEntryType.WORK,
        time: datetime = timezone.localtime(),
        comment: str | None = None,
    ):
        SessionService.handle_leave(user, type, time, comment)

    @staticmethod
    def get_current_session(user: User) -> Session | None:
        session = Session.objects.get_last_user_session(user)

        if not session:
            return None

        if session.date == timezone.localdate() or session.get_open_entries().exists():
            return session

        return None

    @staticmethod
    def get_session_last_comment(session: Session | None) -> str | None:
        if session is None:
            return None

        last_entry = session.get_last_entry()
        return last_entry.comment if last_entry else None

    @staticmethod
    def get_session_status(session: Session | None) -> Session.SessionStatus:
        return session.status if session else Session.SessionStatus.INACTIVE

    @staticmethod
    def get_active_user_with_sessions():
        current_sessions = Session.objects.filter(user=OuterRef("pk")).order_by(
            "-date", "-id"
        )

        users = (
            User.objects.filter(is_active=True)
            .annotate(current_session=Subquery(current_sessions.values("id")[:1]))
            .prefetch_related("avatar")
        )

        session_ids = [u.current_session for u in users if u.current_session]
        sessions = Session.objects.filter(id__in=session_ids).select_related("user")
        sessions_by_id = {s.id: s for s in sessions}

        return [
            {"user": user, "session": sessions_by_id.get(user.current_session)}
            for user in users
        ]
