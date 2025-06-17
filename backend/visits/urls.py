from django.urls import path
from .views import CurrentSessionView, EnterView, ExitView, LeaveView, UsersTodayView, UpdateSessionEntryView

urlpatterns = [
    path("current", CurrentSessionView.as_view()),
    path("update/<int:pk>/", UpdateSessionEntryView.as_view()),
    path("enter", EnterView.as_view()),
    path("exit", ExitView.as_view()),
    path("leave", LeaveView.as_view()),
    path("today", UsersTodayView.as_view()),
]
