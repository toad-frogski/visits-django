from rest_framework import serializers
from django.utils import timezone

from .models import SessionEntry, SessionEntryComment


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
