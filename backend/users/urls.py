from django.urls import path
from .views import UsersTodayView, AvatarView, MeView

urlpatterns = [
    path("today", UsersTodayView.as_view()),
    path("avatar", AvatarView.as_view()),
    path("me", MeView.as_view())
]
