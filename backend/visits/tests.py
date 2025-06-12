from datetime import timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework import status
from django.utils import timezone
from .models import Session, SessionEntry


class SessionTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test_user", password="test_user_secret_password"
        )
        self.client.login(username="test_user", password="test_user_secret_password")

    def test_create_session_enter(self):
        assert_date = timezone.now()
        assert_date.replace(hour=9, minute=0, second=0)
        response = self.client.post(
            "/api/v1/visits/enter",
            {"check_in": assert_date.isoformat()},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        session = Session.objects.filter(user=self.user, date=timezone.now()).first()
        self.assertIsNotNone(session)

        entry = session.entries.first()  # type: ignore
        self.assertIsNotNone(entry)
        self.assertEqual(entry.check_in, assert_date)
        self.assertEqual(entry.type, SessionEntry.Type.SYSTEM)

    def test_update_session_enter(self):
        assert_date = timezone.now()
        assert_date.replace(hour=9, minute=0, second=0)
        session = Session.objects.create(user=self.user, date=timezone.now())
        entry = SessionEntry.objects.create(
            session=session, check_in=assert_date, type=SessionEntry.Type.SYSTEM
        )

        assert_date.replace(hour=10)
        response = self.client.put(
            "/api/v1/visits/enter",
            {"id": entry.id, "check_in": assert_date.isoformat()},
            content_type="application/json",
        )

        updated_entry = SessionEntry.objects.get(id=entry.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(updated_entry.check_in, assert_date)

    def test_create_session_exit(self):
        assert_date = timezone.now()
        assert_date = assert_date.replace(hour=9, minute=0, second=0)
        session = Session.objects.create(user=self.user, date=timezone.now())
        entry = SessionEntry.objects.create(
            session=session, check_in=assert_date, type=SessionEntry.Type.SYSTEM
        )
        assert_date = assert_date.replace(hour=10)
        response = self.client.put(
            "/api/v1/visits/exit",
            {"id": entry.id, "check_out": assert_date.isoformat()},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated_entry = SessionEntry.objects.get(id=entry.id)
        self.assertEqual(updated_entry.check_out, assert_date)

    def test_get_current_session(self):
        today = timezone.now()
        yesterday = today - timedelta(days=1)

        session: Session = Session.objects.create(user=self.user, date=yesterday)
        entry: SessionEntry = SessionEntry.objects.create(
            session=session, check_in=yesterday
        )

        response = self.client.get(
            "/api/v1/visits/current",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(session.id, response.data["id"])

        entry.check_out = yesterday
        entry.save()

        response = self.client.get(
            "/api/v1/visits/current",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 404)

        session = Session.objects.create(user=self.user, date=today)

        response = self.client.get(
            "/api/v1/visits/current",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(session.id, response.data["id"])

        entry.check_in = today
        entry.check_out = today
        entry.session = session
        entry.save()

        response = self.client.get(
            "/api/v1/visits/current",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(session.id, response.data["id"])
