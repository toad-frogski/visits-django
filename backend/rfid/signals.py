from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import RFIDSettings

@receiver(post_save, sender=User)
def user_created_or_updated(sender, instance: User, created: bool, **kwargs):
    if created:
        RFIDSettings.objects.create(user=instance)