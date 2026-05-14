from datetime import date, datetime
from io import BytesIO
import logging

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import mixins, status
from rest_framework.exceptions import (
    APIException,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from session.serializers import UserModelSerializer
from visits import registry

from . import serializers, services
from .models import Session, SessionEntry


logger = logging.getLogger(__name__)


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
        type: SessionEntry.SessionEntryType = serializer.validated_data.get("type")  # type: ignore

        session_service = services.SessionService()

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
        comment: SessionEntry.SessionEntryType = serializer.validated_data.get(
            "comment"
        )  # type: ignore

        session_service = services.SessionService()

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

        type: SessionEntry.SessionEntryType = serializer.validated_data.get("type")  # type: ignore
        time: datetime = serializer.validated_data.get("time")  # type: ignore
        comment: str | None = serializer.validated_data.get("comment")  # type: ignore

        try:
            current_session = services.SessionService.get_current_session(request.user)
            if current_session is None:
                raise Session.DoesNotExist()

            services.SessionService.apply_interval(
                session=current_session,
                start=time,
                end=None,
                type=type,
                comment=comment,
            )
        except Session.DoesNotExist as e:
            raise NotFound(detail=str(e))
        except ValueError as e:
            raise ValidationError(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response()


@extend_schema(tags=["visits"])
class InsertLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema("insertLeave", request=serializers.SessionEntryModelSerializer)
    def post(self, request: Request, *args, **kwargs):
        session_id = self.kwargs.get("session_id")
        serializer = serializers.SessionEntryModelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        type: SessionEntry.SessionEntryType = serializer.validated_data.get("type")  # type: ignore
        start: datetime = serializer.validated_data.get("start")  # type: ignore
        end: datetime = serializer.validated_data.get("end")  # type: ignore
        comment: str = serializer.validated_data.get("comment")  # type: ignore

        try:
            session = Session.objects.get(pk=session_id)
            services.SessionService.apply_interval(
                session=session, start=start, end=end, type=type, comment=comment
            )
        except Session.DoesNotExist as e:
            raise NotFound(detail=str(e))
        except ValueError as e:
            raise ValidationError(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response()


@extend_schema(tags=["visits"])
class CheaterLeaveView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.SessionEntryModelSerializer

    def get_queryset(self):
        return SessionEntry.objects.filter(session__user=self.request.user)

    @extend_schema("cheaterLeave", request=serializers.SessionEntryModelSerializer)
    def post(self, request: Request, *args, **kwargs):
        instance: SessionEntry = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)

        end: datetime = serializer.validated_data.get("end")

        try:
            services.SessionService.apply_interval(
                session=instance.session,
                start=instance.start,
                end=end,
                type=SessionEntry.SessionEntryType(instance.type),
                comment=instance.comment,
            )
        except ValueError as e:
            raise ValidationError(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response()


@extend_schema(tags=["visits"])
@extend_schema_view(
    create=extend_schema("createEntry"),
    destroy=extend_schema("destroyEntry"),
    partial_update=extend_schema("partialUpdateEntry"),
    update=extend_schema("updateEntry"),
)
class SessionEntryModelViewset(
    GenericViewSet,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.SessionEntryModelSerializer

    def get_queryset(self):
        return SessionEntry.objects.filter(session__user=self.request.user)

    def perform_create(self, serializer):
        session_id = self.kwargs.get("session_id")
        session = get_object_or_404(Session, id=session_id, user=self.request.user)
        serializer.save(session=session)


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
        session_service = services.SessionService()
        session = session_service.get_current_session(request.user)
        if session is None:
            raise NotFound()

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

        session_service = services.SessionService()
        active_users_with_sessions = session_service.get_active_user_with_sessions()

        result = []
        for user_session in active_users_with_sessions:
            user = user_session.get("user")
            session: Session | None = user_session.get("session")

            record = {}

            record["user"] = user
            record["session"] = {
                "status": getattr(session, "status", Session.SessionStatus.INACTIVE),
                "comment": session_service.get_session_last_comment(session)
                if session
                else None,
                "extra": self._collect_extra_info(session),
            }

            result.append(record)

        serializer = serializers.UserSessionSerializer(
            result, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def _collect_extra_info(self, session: Session | None):
        """
        Collect extra info for the session from registered providers.
        """
        extra_info = []
        if session is None:
            return extra_info

        for provider_cls in registry.get_plugins("session_info"):
            try:
                provider = provider_cls()
                payload = provider(session)

                if payload is not None:
                    extra_info.append({"type": provider._type, "payload": payload})

            except Exception as e:
                logger.error(
                    f"Error while getting extra info from provider {provider}: {e}"
                )

        return extra_info


@extend_schema(tags=["statistics"])
class UserMonthStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user(self, request: Request, user_id: int | None):
        if user_id is None or request.user.id == user_id:
            return request.user

        if not request.user.is_superuser:
            raise PermissionDenied("You are not allowed to view this user's data.")

        return get_object_or_404(get_user_model(), id=user_id)

    @extend_schema(
        "statistics",
        parameters=[serializers.UserMonthStatisticsRequestSerializer],
        responses=serializers.UserMonthStatisticsResponseSerializer(many=True),
    )
    def get(self, request: Request, user_id: int | None = None):
        request_serializer = serializers.UserMonthStatisticsRequestSerializer(
            data=request.query_params
        )
        request_serializer.is_valid(raise_exception=True)
        start: date = request_serializer.validated_data.get("start")
        end: date = request_serializer.validated_data.get("end")
        user = self.get_user(request, user_id)

        statistics_service = services.StatisticsService()
        result = statistics_service.get_user_date_range_statistics(user, start, end)

        response_serializer = serializers.UserMonthStatisticsResponseSerializer(
            result, many=True
        )

        return Response(response_serializer.data)


@extend_schema(tags=["statistics"])
class ExportUserReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user(self, request: Request, user_id: int | None):
        if user_id is None or request.user.id == user_id:
            return request.user

        if not request.user.is_superuser:
            raise PermissionDenied("You are not allowed to view this user's data.")

        return get_object_or_404(get_user_model(), id=user_id)

    @extend_schema(
        "export",
        parameters=[serializers.UserMonthStatisticsRequestSerializer],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description="Excel file with user statistics",
            )
        },
    )
    def get(self, request: Request):
        request_serializer = serializers.UserMonthStatisticsRequestSerializer(
            data=request.query_params
        )
        request_serializer.is_valid(raise_exception=True)
        start: date = request_serializer.validated_data["start"]  # type: ignore
        end: date = request_serializer.validated_data["end"]  # type: ignore
        user_id: int = request_serializer.validated_data["user_id"]  # type: ignore

        user = self.get_user(request, user_id)

        statistics_service = services.StatisticsService()
        result = statistics_service.get_user_date_range_statistics(user, start, end)
        xlsx_service = services.XlsxService()

        try:
            wb = xlsx_service.user_date_period_statistics_xlsx(user, start, end, result)
        except Exception as e:
            raise APIException(str(e))

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{request.user.username} {str(start.strftime("%Y-%m-%d"))} {str(end.strftime("%Y-%m-%d"))}.xlsx"'
            },
        )

        return response


@extend_schema(tags=["users"])
class UsersView(ListAPIView):
    queryset = get_user_model().objects.filter(is_active=True)
    serializer_class = UserModelSerializer
