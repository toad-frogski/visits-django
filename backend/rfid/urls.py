from django.urls import path
from .views import EnterView, ExitView, SettingsView

urlpatterns = [
    path('settings', SettingsView.as_view()),
    path('enter', EnterView.as_view()),
    path('exit', ExitView.as_view()),
]