from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.translation import gettext as _
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from . import serializers
from .models import Session, SessionEntry, SessionEntryComment


class EnterView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = serializers.SessionEnterPostRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session, created = Session.objects.get_or_create(
            user=request.user, date=timezone.now()
        )

        check_in = serializer.validated_data.get("check_in")
        type = serializer.validated_data.get("type")

        try:
            session.add_enter(check_in=check_in, type=type)
        except Exception as e:
            return APIException(detail=e, code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)

    def put(self, request):
        serializer = serializers.SessionEnterPutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            session = Session.objects.get(user=request.user, date=timezone.now())
        except Session.DoesNotExist as e:
            return APIException(detail=e, code=status.HTTP_404_NOT_FOUND)

        entry_id = serializer.validated_data.get("id")
        check_in = serializer.validated_data.get("check_in")
        type = serializer.validated_data.get("type")

        try:
            session.update_entry(entry_id, type, check_in)
        except Exception as e:
            return APIException(detail=e, code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class ExitView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def put(self, request):
        serializer = serializers.SessionExitPostRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entry_id = serializer.validated_data.get("id")
        check_out = serializer.validated_data.get("check_out")
        type = serializer.validated_data.get("type")

        try:
            session = Session.objects.get(user=request.user, date=timezone.now())
        except Session.DoesNotExist as e:
            return APIException(detail=e, code=status.HTTP_404_NOT_FOUND)

        try:
            session.update_entry(entry_id, type, check_out=check_out)
        except Exception as e:
            return APIException(detail=e, code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ViewSet):

    def create(self, request, entry_id=None):
        entry = get_object_or_404(SessionEntry, id=entry_id)
        serializer = serializers.CommentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get("comment")

        try:
            entry.set_comment(comment)
        except Exception as e:
            return APIException(detail=e, code=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        try:
            comment.comment = serializer.validated_data.get("comment")
            comment.save()
        except Exception as e:
            return APIException(detail=e, code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)
