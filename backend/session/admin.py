from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Avatar
from visits.decorators import register_user_admin_inline

User = get_user_model()

@register_user_admin_inline
class AvatarInline(admin.TabularInline):
    model = Avatar
