from django.db import models
from django.contrib.auth.models import User


class RFIDSettings(models.Model):
    rfid_token = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
