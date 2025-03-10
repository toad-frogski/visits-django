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
        response = self.client.post(
            "/token/",
            {"username": "test_user", "password": "test_user_secret_password"},
        )
        self.access_token = response.data.get("access")

    def test_create_session_enter(self):
        assert_date = timezone.now()
        assert_date.replace(hour=9, minute=0, second=0)
        response = self.client.post(
            "/v1/visits/enter",
            {"check_in": assert_date.isoformat()},
            content_type="application/json",
            headers={"Authorization": f"Bearer {self.access_token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        session = Session.objects.filter(user=self.user, date=timezone.now()).first()
        self.assertIsNotNone(session)

        entry = session.sessionentry_set.first()
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
            "/v1/visits/enter",
            {"id": entry.id, "check_in": assert_date.isoformat()},
            content_type="application/json",
            headers={"Authorization": f"Bearer {self.access_token}"},
        )

        updated_entry = SessionEntry.objects.get(id=entry.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(updated_entry.check_in, assert_date)

    def test_create_session_exit(self):
        assert_date = timezone.now()
        assert_date.replace(hour=9, minute=0, second=0)
        session = Session.objects.create(user=self.user, date=timezone.now())
        entry = SessionEntry.objects.create(
            session=session, check_in=assert_date, type=SessionEntry.Type.SYSTEM
        )
        assert_date.replace(hour=10)
        response = self.client.put(
            "/v1/visits/exit",
            {"id": entry.id, "check_out": assert_date.isoformat()},
            content_type="application/json",
            headers={"Authorization": f"Bearer {self.access_token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated_entry = SessionEntry.objects.get(id=entry.id)
        self.assertEqual(updated_entry.check_out, assert_date)
