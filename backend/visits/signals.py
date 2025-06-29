from django.dispatch import receiver
from django_auth_ldap.backend import populate_user, LDAPBackend, _LDAPUser
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from ldap.cidict import cidict
from channels.layers import get_channel_layer, BaseChannelLayer
from asgiref.sync import async_to_sync

from .models import SessionEntry


@receiver(populate_user, sender=LDAPBackend)
def user_populated(user: User, ldap_user: _LDAPUser, **kwargs):
    attrs: cidict = ldap_user.attrs
    updated = False

    email = attrs.get("mail")
    email = email[0] if isinstance(email, list) else email

    if email and user.email != email:
        user.email = email
        updated = True

    given_name = attrs.get("givenname")
    given_name = given_name[0] if isinstance(given_name, list) else given_name

    if given_name and user.first_name != given_name:
        user.first_name = given_name
        updated = True

    sn = attrs.get("sn")
    sn = sn[0] if isinstance(sn, list) else sn

    if sn and user.last_name != sn:
        user.last_name = sn
        updated = True

    if updated:
        user.save()


@receiver(post_save, sender=SessionEntry)
def session_updated(sender, instance: SessionEntry, **kwargs):
    channel_layer: BaseChannelLayer | None = get_channel_layer()

    if channel_layer is None:
        return

    message = {
        "type": "session_status_updated",
        "payload": {
            "session_id": instance.session.id,
            "status": instance.session.status,
            "user_id": instance.session.user.id,
            "comment": instance.comment,
        },
    }

    async_to_sync(channel_layer.group_send)("visits", message)
