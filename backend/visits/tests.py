from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from visits.services import SessionService

from .models import Session, SessionEntry


class SessionServiceTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.session_service = SessionService()

    def test_session_enter(self):
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
        session = Session.objects.create(user=self.user, date=timezone.localdate())
        now_dt = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)

        start = now_dt.replace(hour=9)
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
        new_start = now_dt.replace(hour=10)
        new_end = now_dt.replace(hour=18)
        self.session_service.apply_interval(
            session, SessionEntry.SessionEntryType.WORK, new_start, new_end
        )

        entries = session.entries.order_by("start").all()
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0].start, start)
        self.assertEqual(entries[0].end, new_end)
        self.assertEqual(entries[0].type, SessionEntry.SessionEntryType.WORK)
