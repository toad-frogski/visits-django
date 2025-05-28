from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone

from .models import RFIDSettings
from visits.models import Session, SessionEntry


class RFIDSessionTestCase(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            username="test_user", password="test_password"
        )
        self.rfid = RFIDSettings.objects.create(rfid_token="1111", user=self.user)

    def test_enter(self):
        response = self.client.post(
            "/api/v1/rfid/enter",
            content_type="application/json",
            headers={"X-RFID-Token": self.rfid.rfid_token}
        )
        self.assertEqual(response.status_code, 200)

        session = Session.objects.filter(user=self.user).first()
        self.assertIsNotNone(session)
        self.assertEqual(session.sessionentry_set.count(), 1)

        response = self.client.post(
            "/api/v1/rfid/enter",
            content_type="application/json",
            headers={"X-RFID-Token": self.rfid.rfid_token}
        )
        self.assertEqual(response.status_code, 400)



    def test_exit(self):
        session = Session.objects.create(user=self.user)
        session.add_enter(check_in=timezone.now(), type=SessionEntry.Type.SYSTEM)

        response = self.client.post(
            "/api/v1/rfid/exit",
            content_type="application/json",
            headers={"X-RFID-Token": self.rfid.rfid_token}
        )

        self.assertEqual(response.status_code, 200)

        session.refresh_from_db()
        last_entry = session.get_last_entry()
        self.assertIsNotNone(last_entry)
        self.assertIsNotNone(last_entry.check_out)
