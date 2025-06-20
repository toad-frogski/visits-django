from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from drf_spectacular.utils import extend_schema

from backend.redmine.helpers import get_redmine_user_by_username

from .serializers import RedmineSpendTimeStatisticsRequestSerializer


class RedmineSpendTimeStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "spendTime", parameters=[RedmineSpendTimeStatisticsRequestSerializer]
    )
    def get(self, request: Request):
        request_serializer = RedmineSpendTimeStatisticsRequestSerializer(
            data=request.data
        )
        request_serializer.is_valid(raise_exception=True)

        redmine_user = get_redmine_user_by_username(request.user.username)
        if not redmine_user:
            raise NotFound()

        return Response()
