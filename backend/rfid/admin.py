from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import RFIDSettings
from visits.registry.decorators import register_user_admin_inline

User = get_user_model()


@register_user_admin_inline
class RFIDSettingsInline(admin.TabularInline):
    model = RFIDSettings
