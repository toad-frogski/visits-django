from django.urls import path
from .views import EnterView, ExitView, SettingsView
# from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register("", SettingsViewset, basename="rfid-settings")

urlpatterns = [
    path('enter', EnterView.as_view()),
    path('exit', ExitView.as_view()),
    path("rfid", SettingsView.as_view()),
]