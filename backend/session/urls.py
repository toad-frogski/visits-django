from django.urls import path
from .views import AvatarView, LoginView, LogoutView, MeView

urlpatterns = [
    path("login", LoginView.as_view()),
    path("logout", LogoutView.as_view()),
    path("me", MeView.as_view()),
    path("avatar", AvatarView.as_view()),
]
