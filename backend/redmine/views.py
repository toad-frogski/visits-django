from datetime import date
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework import status
from drf_spectacular.utils import extend_schema

from .helpers import get_redmine_user_by_username, get_redmine_user_time_entries_sum

from .serializers import (
    RedmineExtraFieldPayloadSerializer,
    RedmineSpentDateRequestSerializer,
)


@extend_schema(tags=["redmine"])
class RedmineSpentDateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "spentToday",
        parameters=[RedmineSpentDateRequestSerializer],
        responses={
            status.HTTP_200_OK: RedmineExtraFieldPayloadSerializer,
        },
    )
    def get(self, request: Request):
        redmine_user = get_redmine_user_by_username(request.user.username)
        if not redmine_user:
            raise NotFound()

        request_serializer = RedmineSpentDateRequestSerializer(data=request.query_params)
        request_serializer.is_valid(raise_exception=True)

        search_date: date = request_serializer.validated_data.get("date")

        hours = get_redmine_user_time_entries_sum(redmine_user, search_date)
        response_serializer = RedmineExtraFieldPayloadSerializer({"hours": hours})

        return Response(response_serializer.data)
