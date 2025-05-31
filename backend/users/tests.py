from datetime import timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone

from visits.models import Session


class UsersTestCase(TestCase):

    def setUp(self) -> None:
        self.user = User.objects.create_user(
            username="test_user", password="test_user_secret_password"
        )

    def test_get_today_user_list_with_sessions(self):
        today = timezone.now()
        yesterday = today - timedelta(days=1)

        session = Session.objects.create(user=self.user, date=yesterday)
        users_count = User.objects.filter(is_active=True).count()
        response = self.client.get("/api/v1/user/today")

        self.assertEqual(users_count, len(response.data))

        today_user = next(
            (item for item in response.data if item["user"]["id"] == self.user.id), None
        )

        self.assertNotEqual(today_user, None)
        self.assertEqual(today_user["session"], None)

        session = Session.objects.create(user=self.user, date=today)
        response = self.client.get("/api/v1/user/today")

        today_user = next(
            (item for item in response.data if item["user"]["id"] == self.user.id), None
        )

        self.assertEqual(today_user["session"]["id"], session.id)
