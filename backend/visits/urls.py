from django.urls import path
from .views import CurrentSessionView, EnterView, ExitView, CommentViewSet

urlpatterns = [
    path("current", CurrentSessionView.as_view()),
    path("enter", EnterView.as_view()),
    path("exit", ExitView.as_view()),
    path(
        "<int:entry_id>/comment",
        CommentViewSet.as_view({"post": "create", "get": "list"}),
    ),
    path(
        "<int:entry_id>/comment/<int:comment_id>",
        CommentViewSet.as_view({"put": "update"}),
    ),
]
