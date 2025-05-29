from django.urls import path
from .views import UsersTodayView, UserProfileView

urlpatterns = [
    path("today", UsersTodayView.as_view()),
    path("profile", UserProfileView.as_view())
]
