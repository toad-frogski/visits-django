from django.urls import path
from . import views
from . import consumers

urlpatterns = [
    path("current", views.CurrentSessionView.as_view()),
    path("update/<int:pk>/", views.UpdateSessionEntryView.as_view()),
    path("enter", views.EnterView.as_view()),
    path("exit", views.ExitView.as_view()),
    path("leave", views.LeaveView.as_view()),
    path("today", views.UsersTodayView.as_view()),
    path("stats/me", views.UserMonthStatisticsView.as_view()),
]

websocket_urlpatterns = [
    path("session/status", consumers.SessionStatusConsumer.as_asgi())
]
