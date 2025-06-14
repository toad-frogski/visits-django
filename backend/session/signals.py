from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from .models import Avatar


@receiver(post_save, sender=User)
def user_created_or_updated(sender, instance, created, **kwargs):
    """
    Create user profile for new registered user
    """
    if created:
        Avatar.objects.get_or_create(user=instance)
