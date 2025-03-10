from django.urls import path
from .views import EnterView, ExitView, CommentViewSet

urlpatterns = [
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
