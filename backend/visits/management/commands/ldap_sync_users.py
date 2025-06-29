from django.core.management.base import BaseCommand, CommandParser
from django.conf import settings
from django.contrib.auth import get_user_model
import os
from typing import Any
import ldap
import logging

logger = logging.getLogger(__name__)

USER_ACCOUNT_DISABLED = 0x2
User = get_user_model()


class Command(BaseCommand):
    help = "Sync users from LDAP server"

    def add_arguments(self, parser: CommandParser):
        parser.add_argument(
            "--filter",
            type=str,
            required=True,
            default="(objectClass=person)",
            help='LDAP search filter. Example: "(uid=*)"',
        )
        parser.add_argument(
            "--admins",
            type=lambda s: s.split(","),
            required=True,
            help="List of administrators. Example: admin1,admin2"
        )

    def handle(self, *args: Any, **options: Any):
        try:
            ldap_uri: str = settings.AUTH_LDAP_SERVER_URI
            bind_dn: str = settings.AUTH_LDAP_BIND_DN
            bind_password: str = settings.AUTH_LDAP_BIND_PASSWORD
            base_dn: str = os.getenv("LDAP_BASE_DN", "")

            conn = ldap.initialize(ldap_uri)
            conn.simple_bind_s(bind_dn, bind_password)

            search_filter = options["filter"]
            administrators = options["admins"]

            result = conn.search_s(base_dn, ldap.SCOPE_SUBTREE, search_filter) or []

            for account in result:
                attributes = account[1]
                user_account_control = int(
                    attributes.get("userAccountControl", [b"0"])[0]
                )

                if user_account_control & USER_ACCOUNT_DISABLED:
                    continue

                username = attributes.get("sAMAccountName", [b""])[0].decode()
                email = attributes.get("mail", [b""])[0].decode()
                first_name = attributes.get("givenName", [b""])[0].decode()
                last_name = attributes.get("sn", [b""])[0].decode()
                is_superuser = username in administrators

                if not username or not email:
                    continue

                User.objects.get_or_create(
                    username=username,
                    defaults={
                        "email": email,
                        "is_active": True,
                        "first_name": first_name,
                        "last_name": last_name,
                        "is_superuser": is_superuser,
                        "is_staff": is_superuser
                    },
                )
                logger.info(F"Sync user {username}")
        except Exception as e:
            logger.error(str(e))
