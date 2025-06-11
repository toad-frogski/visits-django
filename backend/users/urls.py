from django.urls import path
from .views import UsersTodayView, AvatarView

urlpatterns = [
    path("today", UsersTodayView.as_view()),
    path("avatar", AvatarView.as_view()),
]
