from django.db import models
from django.conf import settings


class Avatar(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="avatar"
    )
    avatar = models.ImageField(upload_to="avatars", blank=True, null=True)
