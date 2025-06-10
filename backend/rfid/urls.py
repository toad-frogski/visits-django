from django.urls import path
from .views import EnterView, ExitView, SettingsView

urlpatterns = [
    path('enter', EnterView.as_view()),
    path('exit', ExitView.as_view()),
    path("rfid", SettingsView.as_view()),
]