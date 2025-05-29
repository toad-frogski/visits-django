from dataclasses import fields
from rest_framework import serializers
from django.utils import timezone

from .models import Session, SessionEntry, SessionEntryComment


class SessionEntryCommentSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    comment = serializers.CharField(required=True)


class SessionEnterPostRequestSerializer(serializers.Serializer):
    check_in = serializers.DateTimeField(default=timezone.now, required=False)
    type = serializers.ChoiceField(
        choices=SessionEntry.Type.choices, default=SessionEntry.Type.SYSTEM
    )


class SessionEnterPutRequestSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    check_in = serializers.DateTimeField(default=timezone.now, required=False)
    type = serializers.ChoiceField(
        choices=SessionEntry.Type.choices, default=SessionEntry.Type.SYSTEM
    )


class SessionExitPostRequestSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    check_out = serializers.DateTimeField(default=timezone.now, required=False)
    type = serializers.ChoiceField(
        choices=SessionEntry.Type.choices, default=SessionEntry.Type.SYSTEM
    )


class CommentRequestSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    comment = serializers.CharField(required=True, max_length=255)


class SessionEntryCommentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionEntryComment
        fields = ['id', 'comment']


class SessionEntryModelSerializer(serializers.ModelSerializer):
    comments = SessionEntryCommentModelSerializer(many=True)
    class Meta:
        model = SessionEntry
        fields = ['id', 'check_in', 'check_out', 'type', 'comments', 'created_at', 'updated_at']


class SessionModelSerializer(serializers.ModelSerializer):
    entries = SessionEntryModelSerializer(many=True)
    class Meta:
        model = Session
        fields = ['id', 'user', 'date', 'entries']