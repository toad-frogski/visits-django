from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from visits.services import SessionEntryType, SessionService

from .models import Session, SessionEntry


class SessionServiceTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.session_service = SessionService()

    def test_session_enter(self):
        """
        Entering a session should create a new entry with the specified type
        and start time.
        """
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        start = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)
        self.session_service.enter(self.user, SessionEntry.SessionEntryType.WORK, start)

        self.assertEqual(session.entries.count(), 1)
        entry: SessionEntry = session.entries.first()
        self.assertEqual(entry.start, start)
        self.assertEqual(entry.type, SessionEntry.SessionEntryType.WORK)

        status = session.status
        self.assertEqual(status, Session.SessionStatus.ACTIVE)

        entry.close(start.replace(hour=10))

        new_start = start.replace(hour=11)
        self.session_service.enter(
            self.user, SessionEntry.SessionEntryType.WORK, new_start
        )
        self.assertEqual(session.entries.count(), 3)

        # check if no cheating
        entries = session.entries.order_by("start").all()
        for current, next in zip(entries, entries[1:]):
            self.assertTrue(current.end <= next.start)

    def test_session_exit(self):
        """
        Exiting a session should update the last open entry with the end time.
        """
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        start = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)
        self.session_service.enter(self.user, SessionEntry.SessionEntryType.WORK, start)

        entry: SessionEntry = session.entries.first()
        self.assertEqual(entry.start, start)
        self.assertEqual(entry.type, SessionEntry.SessionEntryType.WORK)

        status = session.status
        self.assertEqual(status, Session.SessionStatus.ACTIVE)

        end = start.replace(hour=17)
        self.session_service.exit(self.user, end)

        entry.refresh_from_db()
        self.assertEqual(entry.end, end)

        status = session.status
        self.assertEqual(status, Session.SessionStatus.INACTIVE)

    def test_session_apply_interval_overlap(self):
        """
        Insert an interval that overlaps with an existing entry should split
        the existing entry.
        """
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        now_dt = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)

        start = now_dt.replace(hour=9)
        end = now_dt.replace(hour=18)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.WORK, start, end
        )

        self.assertEqual(session.entries.count(), 1)
        entry: SessionEntry = session.entries.first()
        self.assertEqual(entry.start, start)
        self.assertEqual(entry.end, end)
        self.assertEqual(entry.type, SessionEntry.SessionEntryType.WORK)

        status = session.status
        self.assertEqual(status, Session.SessionStatus.INACTIVE)

        # insert lunch break
        lunch_start = start.replace(hour=12)
        lunch_end = start.replace(hour=13)
        self.session_service.apply_interval(
            session,
            SessionEntry.SessionEntryType.LUNCH,
            lunch_start,
            lunch_end,
            "lunch break",
        )
        self.assertEqual(session.entries.count(), 3)

        entries = session.entries.order_by("start").all()
        self.assertEqual(entries[0].start, start)
        self.assertEqual(entries[0].end, lunch_start)
        self.assertEqual(entries[0].type, SessionEntry.SessionEntryType.WORK)

        self.assertEqual(entries[1].start, lunch_start)
        self.assertEqual(entries[1].end, lunch_end)
        self.assertEqual(entries[1].type, SessionEntry.SessionEntryType.LUNCH)
        self.assertEqual(entries[1].comment, "lunch break")

    def test_session_apply_interval_gaps(self):
        """
        Insert intervals with gaps must fill the gaps with break entries.
        """
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        now_dt = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)

        # Try to insert intervals with gaps
        start = now_dt.replace(hour=8)
        end = now_dt.replace(hour=12)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.WORK, start, end
        )

        break_start = now_dt.replace(hour=14)
        break_end = now_dt.replace(hour=15)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.BREAK, break_start, break_end
        )

        self.assertEqual(session.entries.count(), 2)
        entries = session.entries.order_by("start").all()
        self.assertEqual(entries[0].start, start)
        self.assertEqual(entries[0].end, end)
        self.assertEqual(entries[0].type, SessionEntry.SessionEntryType.WORK)

        # Gap between 12 and 14 should be filled with a break
        self.assertEqual(entries[1].start, end)
        self.assertEqual(entries[1].end, break_end)
        self.assertEqual(entries[1].type, SessionEntry.SessionEntryType.BREAK)

    def test_session_apply_interval_with_null_end(self):
        """
        Apply an interval with a null end time.
        """
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        now_dt = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)

        start = now_dt.replace(hour=10)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.WORK, start, None
        )

        self.assertEqual(session.entries.count(), 1)
        entry: SessionEntry = session.entries.first()
        self.assertEqual(entry.start, start)
        self.assertIsNone(entry.end)
        self.assertEqual(entry.type, SessionEntry.SessionEntryType.WORK)

        status = session.status
        self.assertEqual(status, Session.SessionStatus.ACTIVE)

        # Now apply an interval that overlaps with the open entry
        new_start = now_dt.replace(hour=9)
        new_end = now_dt.replace(hour=18)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.WORK, new_start, new_end
        )

        entries = session.entries.order_by("start").all()
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0].start, new_start)
        self.assertEqual(entries[0].end, new_end)
        self.assertEqual(entries[0].type, SessionEntry.SessionEntryType.WORK)

    def test_session_apply_interval_override_open_break(self):
        """
        Insert break with gaps must extend the break to cover the gaps.
        If we then insert another break that overlaps with the open break,
        it should override the open break and not create a new entry.
        """
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        now_dt = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)

        first_start = now_dt.replace(hour=10)
        first_end = now_dt.replace(hour=11)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.WORK, first_start, first_end
        )

        break_start = now_dt.replace(hour=13)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.BREAK, break_start, None
        )

        last_start = now_dt.replace(hour=16)
        last_end = now_dt.replace(hour=17)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.WORK, last_start, last_end
        )

        # Now apply an interval that overlaps with the open break
        new_break_start = now_dt.replace(hour=13)
        new_break_end = now_dt.replace(hour=14)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.BREAK, new_break_start, new_break_end
        )

        entries = session.entries.order_by("start").all()
        self.assertEqual(len(entries), 3)

        self.assertEqual(entries[1].start, first_end)
        self.assertEqual(entries[1].end, last_start)
        self.assertEqual(entries[1].type, SessionEntry.SessionEntryType.BREAK)

    def test_session_apply_intervals(self):
        """
        Apply multiple intervals at once.
        """
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        now_dt = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)

        intervals = [
            SessionEntryType(
                type=SessionEntry.SessionEntryType.WORK,
                start=now_dt.replace(hour=9),
                end=now_dt.replace(hour=11),
                comment="work",
            ),
            SessionEntryType(
                type=SessionEntry.SessionEntryType.LUNCH,
                start=now_dt.replace(hour=12),
                comment="lunch break",
            ),
        ]

        self.session_service.apply_intervals(session=session, entries=intervals)
        entries = session.entries.order_by("start").all()

        self.assertEqual(session.entries.count(), 3)
        self.assertEqual(entries[0].start, now_dt.replace(hour=9))
        self.assertEqual(entries[0].type, SessionEntry.SessionEntryType.WORK)
        self.assertEqual(entries[0].comment, "work")

        self.assertEqual(entries[1].start, now_dt.replace(hour=11))
        self.assertEqual(entries[1].type, SessionEntry.SessionEntryType.BREAK)

        self.assertEqual(entries[2].start, now_dt.replace(hour=12))
        self.assertEqual(entries[2].type, SessionEntry.SessionEntryType.LUNCH)
        self.assertEqual(entries[2].comment, "lunch break")

    def test_session_apply_intervals_with_open_entry(self):
        """
        Apply multiple intervals at once when there is an open entry.
        The open entry should be properly closed and the new intervals should
        be applied correctly.
        """
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        now_dt = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)

        # Create an open entry
        self.session_service.enter(
            self.user, SessionEntry.SessionEntryType.WORK, now_dt.replace(hour=9)
        )

        intervals = [
            SessionEntryType(
                type=SessionEntry.SessionEntryType.WORK,
                start=now_dt.replace(hour=9),
                end=now_dt.replace(hour=12),
                comment="work",
            ),
            SessionEntryType(
                type=SessionEntry.SessionEntryType.BREAK,
                start=now_dt.replace(hour=12),
            ),
        ]
        self.session_service.apply_intervals(session=session, entries=intervals)
        entries = session.entries.order_by("start").all()

        self.assertEqual(session.entries.count(), 2)
        self.assertEqual(entries[0].start, now_dt.replace(hour=9))
        self.assertEqual(entries[0].end, now_dt.replace(hour=12))
        self.assertEqual(entries[0].type, SessionEntry.SessionEntryType.WORK)

        self.assertEqual(entries[1].start, now_dt.replace(hour=12))
        self.assertEqual(entries[1].type, SessionEntry.SessionEntryType.BREAK)
