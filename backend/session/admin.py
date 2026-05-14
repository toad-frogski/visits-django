from django.contrib import admin
from django.contrib.auth import get_user_model

from visits.registry import register_user_admin_inline

from .models import Avatar

User = get_user_model()


@register_user_admin_inline
class AvatarInline(admin.TabularInline):
    model = Avatar
