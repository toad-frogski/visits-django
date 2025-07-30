from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from .models import RFIDSettings
from .settings import settings
from visits.models import Session, SessionEntry


class RFIDSessionTestCase(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            username="test_user", password="test_password"
        )
        rfid = RFIDSettings.objects.get(user=self.user)
        rfid.rfid_token = "test"
        rfid.save()
        self.rfid = rfid

    def test_enter(self):
        response = self.client.post(
            "/api/v1/rfid/enter",
            content_type="application/json",
            headers={
                settings.RFID_TOKEN_HEADER_NAME: self.rfid.rfid_token,
                settings.RFID_SERVICE_TOKEN_HEADER_NAME: settings.RFID_SERVICE_TOKEN,
            },
        )
        self.assertEqual(response.status_code, 200)

        session = Session.objects.filter(user=self.user).first()
        self.assertIsNotNone(session)
        self.assertEqual(session.entries.count(), 1)  # type: ignore

        response = self.client.post(
            "/api/v1/rfid/enter",
            content_type="application/json",
            headers={
                settings.RFID_TOKEN_HEADER_NAME: self.rfid.rfid_token,
                settings.RFID_SERVICE_TOKEN_HEADER_NAME: settings.RFID_SERVICE_TOKEN,
            },
        )
        self.assertEqual(response.status_code, 400)

    def test_exit(self):
        session = Session.objects.create(user=self.user)
        session.add_enter(
            start=timezone.localtime(), type=SessionEntry.SessionEntryType.WORK
        )

        response = self.client.post(
            "/api/v1/rfid/exit",
            content_type="application/json",
            headers={
                settings.RFID_TOKEN_HEADER_NAME: self.rfid.rfid_token,
                settings.RFID_SERVICE_TOKEN_HEADER_NAME: settings.RFID_SERVICE_TOKEN,
            },
        )

        self.assertEqual(response.status_code, 200)

        session.refresh_from_db()
        last_entry = session.get_last_entry()
        self.assertIsNotNone(last_entry)
        self.assertIsNotNone(last_entry.end)  # type: ignore
