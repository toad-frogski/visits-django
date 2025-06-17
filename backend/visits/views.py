from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException, ValidationError, NotFound
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema
from django.utils.translation import gettext as _
from django.contrib.auth.models import User
from datetime import date, datetime, timedelta

from .models import Session, SessionEntry
from .services import SessionService
from .callbacks import statistics_extra_callbacks
from . import serializers


@extend_schema(tags=["visits"])
class EnterView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "enter",
        request=serializers.SessionEnterSerializer,
        responses={
            status.HTTP_200_OK: None,
            status.HTTP_404_NOT_FOUND: None,
            status.HTTP_500_INTERNAL_SERVER_ERROR: None,
        },
    )
    def post(self, request: Request):
        serializer = serializers.SessionEnterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        start: datetime = serializer.validated_data.get("start")  # type: ignore
        type: SessionEntry.Type = serializer.validated_data.get("type")  # type: ignore

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
        "exit",
        request=serializers.SessionExitSerializer,
        responses={
            status.HTTP_200_OK: None,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_404_NOT_FOUND: None,
            status.HTTP_500_INTERNAL_SERVER_ERROR: None,
        },
    )
    def put(self, request: Request):
        serializer = serializers.SessionExitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        time: datetime = serializer.validated_data.get("end")  # type: ignore
        comment: SessionEntry.Type = serializer.validated_data.get("comment")  # type: ignore

        session_service = SessionService()

        try:
            session_service.exit(request.user, time, comment)
        except Session.DoesNotExist as e:
            raise NotFound(detail=str(e))
        except ValueError as e:
            raise ValidationError(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["visits"])
class LeaveView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "leave",
        request=serializers.SessionEntryLeaveSerializer,
        responses={
            status.HTTP_200_OK: None,
            status.HTTP_404_NOT_FOUND: None,
            status.HTTP_400_BAD_REQUEST: None,
            status.HTTP_500_INTERNAL_SERVER_ERROR: None,
        },
    )
    def post(self, request: Request):
        serializer = serializers.SessionEntryLeaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        type: SessionEntry.Type = serializer.validated_data.get("type")  # type: ignore
        time: datetime = serializer.validated_data.get("time")  # type: ignore
        comment: str | None = serializer.validated_data.get("comment")  # type: ignore

        session_service = SessionService()

        try:
            session_service.handle_leave(request.user, type, time, comment)
        except Session.DoesNotExist as e:
            raise NotFound(detail=str(e))
        except ValueError as e:
            raise ValidationError(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response()


@extend_schema(tags=["visits"])
class UpdateSessionEntryView(UpdateAPIView):
    serializer_class = serializers.SessionEntryModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SessionEntry.objects.filter(session__user=self.request.user)


@extend_schema(tags=["visits"])
class CurrentSessionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "current",
        summary="Get current session info",
        responses={
            status.HTTP_200_OK: serializers.SessionModelSerializer,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def get(self, request: Request):
        session_service = SessionService()
        session = session_service.get_current_session(request.user)
        if session is None:
            return Response({"status": Session.Status.INACTIVE, "entries": []})

        serializer = serializers.SessionModelSerializer(session)

        return Response(serializer.data)


@extend_schema(tags=["visits"])
class UsersTodayView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        "today",
        responses={status.HTTP_200_OK: serializers.UserSessionSerializer(many=True)},
    )
    def get(self, request: Request):

        session_service = SessionService()
        active_users_with_sessions = session_service.get_active_user_with_sessions()

        result = []
        for user_session in active_users_with_sessions:
            user: User = user_session.get("user")  # type: ignore
            session: Session | None = user_session.get("session")

            result.append(
                {
                    "user": user,
                    "session": {
                        "status": session_service.get_session_status(session),
                        "comment": session_service.get_session_last_comment(session),
                    },
                }
            )

        serializer = serializers.UserSessionSerializer(
            result, many=True, context={"request": request}
        )
        return Response(serializer.data)


@extend_schema(tags=["statistics"])
class UserMonthStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        "statistics",
        request=serializers.UserMonthStatisticsRequestSerializer,
        responses=serializers.UserMonthStatisticsResponseSerializer(many=True),
    )
    def get(self, request: Request):
        request_serializer = serializers.UserMonthStatisticsRequestSerializer(
            data=request.query_params
        )
        request_serializer.is_valid(raise_exception=True)
        start: date = request_serializer.validated_data["start"]  # type: ignore
        end: date = request_serializer.validated_data["end"]  # type: ignore
        user = request.user

        sessions = Session.objects.filter(
            user=user, date__range=(start, end)
        ).prefetch_related("entries")

        sessions_by_date = {session.date: session for session in sessions}

        result = []
        current_date = start
        while current_date <= end:
            session = sessions_by_date.get(current_date)
            if session:
                entries = list(session.entries.all())  # type: ignore
                statistics = self._calculate_statistics(entries)
            else:
                statistics = None

            extra = self._collect_extra(user, current_date)
            result.append(
                {
                    "date": current_date,
                    "session": session,
                    "statistics": statistics,
                    "extra": extra,
                }
            )
            current_date += timedelta(days=1)

        response_serializer = serializers.UserMonthStatisticsResponseSerializer(result, many=True)
        return Response(response_serializer.data)

    def _calculate_statistics(self, entries: list[SessionEntry]) -> dict[str, float]:
        result = {
            "work_time": 0.0,
            "break_time": 0.0,
            "lunch_time": 0.0,
        }

        for entry in entries:
            if not entry.end:
                continue

            delta = (entry.end - entry.start).total_seconds()

            if entry.type == "WORK":
                result["work_time"] += delta
            elif entry.type == "BREAK":
                result["break_time"] += delta
            elif entry.type == "LUNCH":
                result["lunch_time"] += delta

        return result

    def _collect_extra(self, user: User, date: date):
        results = []
        for callback in statistics_extra_callbacks():
            data = callback(user, date)
            if data:
                results.append(data)

        return results
