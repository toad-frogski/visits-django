from dataclasses import dataclass
import math
from datetime import date, datetime, timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import OuterRef, Subquery
from django.utils import timezone
from openpyxl import Workbook
from openpyxl.styles import PatternFill

from .models import Session, SessionEntry
from . import registry


@dataclass
class SessionEntryType:
    type: SessionEntry.SessionEntryType
    start: datetime
    end: datetime | None = None
    comment: str | None = None


class SessionService:
    """
    Service for managing user sessions and entries.
    It provides methods to enter, exit, update entries, and retrieve session information.
    """

    @classmethod
    def enter(cls, user: User, type: SessionEntry.SessionEntryType, time: datetime):
        """
        Enter a session by creating a new entry or restoring an existing one.
        """
        session, _ = Session.objects.get_or_create(user=user, date=timezone.localdate())
        last_entry = session.get_last_entry()

        if not last_entry:
            session.add_enter(start=time, type=type)
            return

        if last_entry.end:
            # Try to restore session
            break_entry = SessionEntry.objects.create(
                session=session,
                type=SessionEntry.SessionEntryType.BREAK,
                start=last_entry.end,
                end=time,
            )
            break_entry.save()
            session.add_enter(start=time, type=type)
            return

        raise ValueError("Cannot create enter for session.")

    @classmethod
    def exit(cls, user: User, time: datetime, comment: str | None = None):
        """
        Exit the current session by setting the end time of the last entry.
        """
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

    @classmethod
    def apply_interval(
        cls,
        session: Session,
        type: SessionEntry.SessionEntryType,
        start: datetime,
        end: datetime | None = None,
        comment: str | None = None,
    ):
        """
        Apply an interval to a session by creating a new entry or adjusting
        existing entries.
        """
        cls.apply_intervals(
            session=session,
            entries=[
                SessionEntryType(type=type, start=start, end=end, comment=comment)
            ],
        )

    @classmethod
    def apply_intervals(
        cls,
        session: Session,
        entries: list[SessionEntryType],
    ):
        """
        Apply an interval to a session by creating a new entry or adjusting
        existing entries.
        """
        def normalize(
            data: list[
                tuple[
                    datetime,
                    datetime | None,
                    SessionEntry.SessionEntryType,
                    str | None,
                ]
            ],
        ):
            normalized = []
            for s, e, t, c in sorted(data, key=lambda x: x[0]):
                if e is not None and e < s:
                    raise ValueError("Invalid interval: end before start")

                if not normalized:
                    normalized.append((s, e, t, c))
                    continue

                prev_s, prev_e, prev_t, prev_c = normalized[-1]
                normalized_prev_e = prev_e or prev_s

                if normalized_prev_e == s and prev_t == t and prev_c == c:
                    normalized[-1] = (prev_s, e, t, c)
                elif normalized_prev_e < s:
                    # Try to insert a break or extend neighboring breaks.
                    if prev_t == t == SessionEntry.SessionEntryType.BREAK:
                        normalized[-1] = (prev_s, e, prev_t, prev_c)
                    elif t == SessionEntry.SessionEntryType.BREAK:
                        normalized.append((prev_e if prev_e else s, e, t, c))
                    elif prev_t == SessionEntry.SessionEntryType.BREAK:
                        normalized[-1] = (prev_s, s, prev_t, prev_c)
                        normalized.append((s, e, t, c))
                    else:
                        if not prev_e:
                            raise ValueError(
                                "Invalid state: open entry cannot be followed by another entry"
                            )
                        normalized.append(
                            (prev_e, s, SessionEntry.SessionEntryType.BREAK, None)
                        )
                        normalized.append((s, e, t, c))
                else:
                    normalized.append((s, e, t, c))

            return normalized

        stored = session.entries.order_by("start").all()
        working = [
            (entry.start, entry.end, entry.type, entry.comment) for entry in stored
        ]

        for entry in entries:
            if entry.end is not None and entry.end < entry.start:
                raise ValueError("Invalid interval: end before start")

            normalized_end = entry.end or entry.start
            next_working = []

            for stored_start, stored_end, stored_type, stored_comment in working:
                stored_ends_before = (
                    stored_end is not None and stored_end <= entry.start
                )
                stored_starts_after = (
                    stored_start >= normalized_end
                    if entry.end is not None
                    else False
                )
                if stored_ends_before or stored_starts_after:
                    next_working.append(
                        (stored_start, stored_end, stored_type, stored_comment)
                    )
                    continue

                # Keep the piece before incoming interval.
                if stored_start < entry.start:
                    next_working.append(
                        (
                            stored_start,
                            entry.start,
                            stored_type,
                            stored_comment,
                        )
                    )

                # Keep the piece after incoming interval.
                if entry.end is not None and stored_end is not None and stored_end > normalized_end:
                    next_working.append(
                        (
                            entry.end,
                            stored_end,
                            stored_type,
                            stored_comment,
                        )
                    )

            next_working.append((entry.start, entry.end, entry.type, entry.comment))
            working = normalize(next_working)

        # Write to db
        with transaction.atomic():
            stored.delete()

            for s, e, t, c in working:
                SessionEntry.objects.create(
                    session=session, start=s, end=e, type=t, comment=c
                )

    @classmethod
    def handle_leave(
        cls,
        session: Session,
        type: SessionEntry.SessionEntryType,
        time: datetime,
        comment: str | None = None,
    ):
        """
        Handle a leave by closing the current entry and creating a break entry until the end of the day.
        """

        last_entry = session.get_last_entry()

        intervals = []
        if last_entry and not last_entry.end:
            intervals.append(
                SessionEntryType(
                    type=SessionEntry.SessionEntryType(last_entry.type),
                    start=last_entry.start,
                    end=time,
                    comment=last_entry.comment,
                )
            )

        intervals.append(SessionEntryType(type=type, start=time, comment=comment))

        cls.apply_intervals(session=session, entries=intervals)

    @classmethod
    def get_current_session(cls, user: User) -> Session | None:
        session = Session.objects.get_last_user_session(user)

        if not session:
            return None

        if session.date == timezone.localdate() or session.get_open_entries().exists():
            return session

        return None

    @classmethod
    def get_session_last_comment(cls, session: Session) -> str | None:
        last_entry = session.get_last_entry()

        return last_entry.comment if last_entry else None

    @classmethod
    def get_active_user_with_sessions(cls):
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


class StatisticsService:
    """
    Service for collecting user statistics over a date range.
    It provides methods to retrieve statistics for a user over a specified date range.
    """

    def get_user_date_range_statistics(
        self, user: User, start_date: date, end_date: date
    ) -> list[dict]:
        result = []

        sessions = Session.objects.filter(
            user=user, date__range=(start_date, end_date)
        ).prefetch_related("entries")

        session_date_map = {s.date: s for s in sessions}

        current_date = start_date
        while current_date <= end_date:
            session: Session | None = session_date_map.get(current_date)
            entries = session.entries.all() if session else []
            statistics = self._calculate_statistics(entries)
            extra = self._collect_extra(user, current_date)
            result.append(
                {
                    "date": current_date,
                    "session": session,
                    "statistics": statistics,
                    "extra": extra,
                }
            )
            current_date += timedelta(days=1)

        return result

    def _calculate_statistics(self, entries: list[SessionEntry]) -> dict[str, float]:
        result = {
            "work_time": 0.0,
            "break_time": 0.0,
            "lunch_time": 0.0,
        }

        for entry in entries:
            if not entry.end:
                continue

            delta = (entry.end - entry.start).total_seconds()

            if entry.type == "WORK":
                result["work_time"] += delta
            elif entry.type == "BREAK":
                result["break_time"] += delta
            elif entry.type == "LUNCH":
                result["lunch_time"] += delta

        return result

    def _collect_extra(self, user: User, date: date):
        results = []

        for plugin_cls in registry.get_plugins("statistics"):
            plugin = plugin_cls()
            data = plugin(user, date)

            if data:
                results.append({"type": plugin._type, "payload": data})

        return results


class XlsxService:
    """
    Service for generating XLSX reports.
    """

    def user_date_period_statistics_xlsx(
        self, user: User, start: date, end: date, data: list[dict]
    ) -> Workbook:

        def format_timedelta(td: timedelta) -> str:
            total_minutes = int(td.total_seconds() // 60)
            hours = total_minutes // 60
            minutes = total_minutes % 60

            return f"{hours}:{minutes:02d}"

        wb = Workbook()
        ws = wb.active
        if not ws:
            raise Exception

        ws.title = f"Report {user.username} {start.strftime('%Y-%m-%d')} - {end.strftime('%Y-%m-%d')}"

        ws.column_dimensions["A"].width = 12
        ws.column_dimensions["B"].width = 15
        ws.column_dimensions["C"].width = 15
        ws.column_dimensions["D"].width = 15
        ws.column_dimensions["E"].width = 15
        ws.column_dimensions["F"].width = 15

        gray_fill = PatternFill(
            start_color="CACACA", end_color="CACACA", fill_type="solid"
        )

        ws.append(
            ["Date", "Start Time", "End Time", "Work Time", "Break Time", "Lunch Time"]
        )
        current_idx = 1
        for cell in ws[current_idx]:
            cell.fill = gray_fill

        for row in data:
            entries: list[SessionEntry] = (
                list(row["session"].entries.all()) if row["session"] else []
            )

            if not entries:
                ws.append([row["date"], "--", "--", "--", "--", "--"])
                current_idx += 1
                continue

            first_entry, last_entry = entries[0], entries[-1]
            session_start = (
                timezone.localtime(first_entry.start).strftime("%H:%M:%S")
                if first_entry.start
                else ""
            )
            session_end = (
                timezone.localtime(last_entry.end).strftime("%H:%M:%S")
                if last_entry.end
                else ""
            )

            summary = [
                row["date"],
                session_start,
                session_end,
                format_timedelta(
                    timedelta(seconds=math.floor(row["statistics"]["work_time"] or 0))
                ),
                format_timedelta(
                    timedelta(seconds=math.floor(row["statistics"]["break_time"] or 0))
                ),
                format_timedelta(
                    timedelta(seconds=math.floor(row["statistics"]["lunch_time"] or 0))
                ),
            ]

            ws.append(summary)
            current_idx += 1

            for cell in ws[current_idx]:
                cell.fill = gray_fill

            if len(entries) == 0:
                continue

            ws.append(["", "Start Time", "End Time", "Type", "Comment"])
            current_idx += 1

            ws.row_dimensions[current_idx].outline_level = 1
            ws.row_dimensions[current_idx].hidden = True

            group_start = group_end = current_idx + 1
            for entry in entries:
                ws.append(
                    [
                        "",
                        (entry.start.strftime("%H:%M:%S") if entry.start else ""),
                        entry.end.strftime("%H:%M:%S") if entry.end else "",
                        entry.type if entry.type else "",
                        entry.comment if entry.comment else "",
                    ]
                )
                current_idx += 1
                group_end = current_idx

            for i in range(group_start, group_end + 1):
                ws.row_dimensions[i].outline_level = 1
                ws.row_dimensions[i].hidden = True

        return wb
