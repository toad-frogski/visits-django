from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

from .models import Session, SessionEntry
from .registry.store import get_user_admin_inlines

User = get_user_model()

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):

    class SessionEntryInline(admin.TabularInline):
        model = SessionEntry
        extra = 0
        ordering= ("start",)

    list_display = ("session",)
    inlines = [SessionEntryInline]

    @admin.display()
    def session(self, obj: Session):
        return f"{obj.user} {obj.date}"


class VisitsUserAdmin(UserAdmin):
    inlines = get_user_admin_inlines()


admin.site.unregister(User)
admin.site.register(User, VisitsUserAdmin)