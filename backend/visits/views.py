from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException, ValidationError, NotFound
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema
from django.utils.translation import gettext as _
from django.contrib.auth.models import User

from .models import Session, SessionEntry
from .services import SessionService
from . import serializers


@extend_schema(tags=["visits"])
class EnterView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "enter",
        request=serializers.SessionEnterSerializer,
        responses={
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
    )
    def post(self, request: Request):
        serializer = serializers.SessionEnterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        start: datetime = serializer.validated_data.get("start")
        type: SessionEntry.Type = serializer.validated_data.get("type")

        session_service = SessionService()

        try:
            session_service.enter(request.user, type, start)
        except ValueError as e:
            raise ValidationError(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["visits"])
class ExitView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "update_exit",
        request=serializers.SessionExitSerializer,
        responses={
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
    )
    def put(self, request: Request):
        serializer = serializers.SessionExitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entry_id: int = serializer.validated_data.get("id")
        time: datetime = serializer.validated_data.get("end")
        type: SessionEntry.Type = serializer.validated_data.get("type")
        comment: SessionEntry.Type = serializer.validated_data.get("comment")

        session_service = SessionService()

        try:
            session_service.update_entry(entry_id, type, end=time, comment=comment)
        except Session.DoesNotExist as e:
            raise NotFound(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["visits"])
class CurrentSessionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "get_current_session",
        summary="Get current session info",
        responses={status.HTTP_200_OK: serializers.SessionModelSerializer},
    )
    def get(self, request: Request):
        session_service = SessionService()
        session = session_service.get_current_session(request.user)

        if session is None:
            raise NotFound(detail="Session not found")

        serializer = serializers.SessionModelSerializer(session)

        return Response(serializer.data)


@extend_schema(tags=["visits"])
class UsersTodayView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        "today", responses={status.HTTP_200_OK: serializers.UserSessionSerializer(many=True)}
    )
    def get(self, request: Request):
        users = User.objects.filter(is_active=True)
        session_service = SessionService()

        data = []
        for user in users:
            session = session_service.get_current_session(user)
            data.append(
                {
                    "user": user,
                    "session": {
                        "status": session_service.get_session_status(session),
                        "comment": session_service.get_session_last_comment(session),
                    },
                }
            )

        serializer = serializers.UserSessionSerializer(data, many=True)
        return Response(serializer.data)
