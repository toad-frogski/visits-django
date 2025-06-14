from django.contrib import admin

from .models import Session, SessionEntry


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):

    class SessionEntryInline(admin.TabularInline):
        model = SessionEntry
        extra = 0

    list_display = ("session",)
    inlines = [SessionEntryInline]

    @admin.display()
    def session(self, obj: Session):
        return f"{obj.user} {obj.date}"
