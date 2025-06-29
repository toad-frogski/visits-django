from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from channels.layers import get_channel_layer, BaseChannelLayer
from asgiref.sync import async_to_sync

from .models import Avatar


@receiver(post_save, sender=User)
def user_created_or_updated(sender, instance, created, **kwargs):
    """
    Create user profile for new registered user
    """
    if created:
        Avatar.objects.get_or_create(user=instance)


@receiver(post_save, sender=Avatar)
def user_avatar_changed(sender, instance: Avatar, created, *args, **kwargs):
    if created:
        return

    channel_layer: BaseChannelLayer | None = get_channel_layer()

    if channel_layer is None:
        return

    message = {
        "type": "user_avatar_changed",
        "payload": {"user_id": instance.user.id, "avatar_url": instance.avatar.url},
    }

    async_to_sync(channel_layer.group_send)("visits", message)
