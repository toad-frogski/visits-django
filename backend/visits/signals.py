from django.dispatch import receiver
from django_auth_ldap.backend import populate_user, LDAPBackend, _LDAPUser
from django.contrib.auth.models import User
from ldap.cidict import cidict


@receiver(populate_user, sender=LDAPBackend)
def user_populated(user: User, ldap_user: _LDAPUser, **kwargs):
    attrs: cidict = ldap_user.attrs
    updated = False

    email = attrs.get("mail")
    email = email[0] if isinstance(email, list) else email

    if user.email != email:
        user.email = email
        updated = True

    given_name = attrs.get("givenname")
    given_name = given_name[0] if isinstance(given_name, list) else given_name

    if user.first_name != given_name:
        user.first_name = given_name
        updated = True

    sn = attrs.get("sn")
    sn = sn[0] if isinstance(sn, list) else sn

    if user.last_name != sn:
        user.last_name = sn
        updated = True

    if updated:
        user.save()
