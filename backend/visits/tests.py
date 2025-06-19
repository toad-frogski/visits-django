from datetime import timedelta
from urllib import response
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework import status
from django.utils import timezone

from .models import Session, SessionEntry


class SessionServiceTestCase(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            username="test_user", password="test_user_secret_password"
        )
        self.client.login(username="test_user", password="test_user_secret_password")

    def test_create_session_enter(self):
        assert_date = timezone.localtime()
        assert_date.replace(hour=9, minute=0, second=0)
        response = self.client.post(
            "/api/v1/visits/enter",
            {"start": assert_date.isoformat(), "type": SessionEntry.SessionEntryType.SYSTEM},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        session = Session.objects.filter(user=self.user, date=assert_date).first()
        self.assertIsNotNone(session)

        entry = session.entries.first()  # type: ignore
        self.assertIsNotNone(entry)
        self.assertEqual(entry.start, assert_date)
        self.assertEqual(entry.type, SessionEntry.SessionEntryType.SYSTEM)

    def test_handle_leave(self):
        assert_date = timezone.localtime()
        assert_date.replace(hour=9, minute=0, second=0)
        session = Session.objects.create(user=self.user, date=assert_date)
        session.add_enter(start=assert_date, type=SessionEntry.SessionEntryType.WORK)

        leave_time = assert_date + timedelta(hours=1)
        response = self.client.post(
            "/api/v1/visits/leave",
            {"time": leave_time, "type": SessionEntry.SessionEntryType.LUNCH},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(session.entries.count(), 2)

        [enter, leave] = session.entries.all()
        self.assertIsNotNone(enter.end)
        self.assertEqual(leave.type, SessionEntry.SessionEntryType.LUNCH)
        self.assertEqual(enter.end, leave_time)
        self.assertEqual(leave.start, leave_time)

    def test_handle_exit(self):
        assert_date = timezone.localtime().replace(microsecond=0)
        assert_date.replace(hour=9, minute=0, second=0)
        session = Session.objects.create(user=self.user, date=assert_date)
        session.add_enter(start=assert_date, type=SessionEntry.SessionEntryType.WORK)
        end_date = assert_date + timedelta(hours=1)
        response = self.client.put(
            "/api/v1/visits/exit", {"end": end_date}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(session.entries.count(), 1)

        [entry] = session.entries.all()
        self.assertEqual(entry.start, assert_date)
        self.assertEqual(entry.end, end_date)

    def test_get_current_session(self):
        today = timezone.localtime()
        yesterday = today - timedelta(days=1)

        session: Session = Session.objects.create(user=self.user, date=yesterday)
        entry: SessionEntry = SessionEntry.objects.create(
            session=session, start=yesterday
        )

        response = self.client.get("/api/v1/visits/current")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(session.id, response.data["id"])

        entry.end = yesterday
        entry.save()

        response = self.client.get("/api/v1/visits/current")
        self.assertEqual(response.data.get("status"), Session.SessionStatus.INACTIVE)

        session = Session.objects.create(user=self.user, date=today)

        response = self.client.get("/api/v1/visits/current")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(session.id, response.data["id"])

        entry.start = today
        entry.end = today
        entry.session = session
        entry.save()

        response = self.client.get("/api/v1/visits/current")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(session.id, response.data["id"])
