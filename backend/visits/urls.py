from django.urls import path

from . import views
from . import consumers

session_entry_create = views.SessionEntryModelViewset.as_view(
    {
        "post": "create",
    }
)

session_entry_detail = views.SessionEntryModelViewset.as_view(
    {
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy",
    }
)

urlpatterns = [
    path("current", views.CurrentSessionView.as_view()),
    path("<int:session_id>/session-entry/create", session_entry_create),
    path("session-entry/<int:pk>", session_entry_detail),
    path("session-entry/<int:pk>/cheater", views.CheaterLeaveView.as_view()),
    path("enter", views.EnterView.as_view()),
    path("exit", views.ExitView.as_view()),
    path("leave", views.LeaveView.as_view()),
    path("today", views.UsersTodayView.as_view()),
    path("stats/me", views.UserMonthStatisticsView.as_view()),
    path("stats/export", views.ExportUserReportView.as_view()),
]

websocket_urlpatterns = [
    path("notifications", consumers.NotificationsConsumer.as_asgi())
]
