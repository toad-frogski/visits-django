from django.urls import path
from . import views

urlpatterns = [
    path("spend-time", views.RedmineSpentDateView.as_view()),
]
