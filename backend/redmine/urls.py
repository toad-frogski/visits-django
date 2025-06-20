from django.urls import path
from .views import RedmineSpendTimeStatisticsView

urlpatterns = [
    path("spend-time", RedmineSpendTimeStatisticsView.as_view()),
]
