from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException, ValidationError, NotFound
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema, extend_schema_view

from django.utils.translation import gettext as _
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q

from visits.services.session_service import SessionService

from . import serializers
from .models import Session, SessionEntry, SessionEntryComment


@extend_schema(tags=["visits"])
class EnterView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request: Request):
        serializer = serializers.SessionEnterPostRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        check_in: datetime = serializer.validated_data.get("check_in")
        type: SessionEntry.Type = serializer.validated_data.get("type")

        session_service = SessionService()

        try:
            session_service.enter(user=request.user, check_in=check_in, type=type)
        except ValueError as e:
            raise ValidationError(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response(status=status.HTTP_200_OK)

    def put(self, request: Request):
        serializer = serializers.SessionEnterPutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entry_id: int = serializer.validated_data.get("id")
        check_in: datetime = serializer.validated_data.get("check_in")
        type: SessionEntry.Type = serializer.validated_data.get("type")

        session_service = SessionService()

        try:
            session_service.update_entry(
                user=request.user, entry_id=entry_id, type=type, check_in=check_in
            )
        except Session.DoesNotExist as e:
            raise NotFound(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["visits"])
class ExitView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def put(self, request: Request):
        serializer = serializers.SessionExitPostRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entry_id: int = serializer.validated_data.get("id")
        check_out: datetime = serializer.validated_data.get("check_out")
        type: SessionEntry.Type = serializer.validated_data.get("type")

        session_service = SessionService()

        try:
            session_service.update_entry(
                request.user, entry_id, type, check_out=check_out
            )
        except Session.DoesNotExist as e:
            raise NotFound(detail=str(e))
        except Exception as e:
            raise APIException(detail=str(e))

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["visits"])
class CommentViewSet(viewsets.ViewSet):

    def create(self, request, entry_id=None):
        entry = get_object_or_404(SessionEntry, id=entry_id)
        serializer = serializers.CommentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment_data: str = serializer.validated_data.get("comment")

        try:
            entry.set_comment(comment_data)
        except Exception as e:
            raise APIException(detail=str(e))

        return Response(status=status.HTTP_200_OK)

    def list(self, request, entry_id=None):
        entry = get_object_or_404(SessionEntry, id=entry_id)
        comments = SessionEntryComment.objects.filter(session_entry=entry)
        serializer = serializers.CommentRequestSerializer(comments, many=True)

        return Response(serializer.data)

    def update(self, request, entry_id=None, comment_id=None):
        get_object_or_404(SessionEntry, id=entry_id)
        comment = get_object_or_404(SessionEntryComment, id=comment_id)

        serializer = serializers.CommentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment_data: str = serializer.validated_data.get("comment")

        try:
            comment.comment = comment_data
            comment.save()
        except Exception as e:
            raise APIException(detail=str(e))

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["visits"], summary="Get current session info")
class CurrentSessionView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request: Request):
        session_service = SessionService()
        session = session_service.get_current_session(request.user)

        if session is None:
            raise NotFound(detail="Session not found")

        serializer = serializers.SessionModelSerializer(session)

        return Response(serializer.data)
