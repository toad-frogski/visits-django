from email.policy import default
import hashlib
from rest_framework import serializers
from django.utils import timezone

from session.serializers import UserModelSerializer
from .models import Session, SessionEntry


class SessionEnterSerializer(serializers.ModelSerializer):
    type = serializers.ChoiceField(choices=SessionEntry.Type.choices, default=SessionEntry.Type.WORK)
    start = serializers.DateTimeField(default=lambda: timezone.localtime())

    class Meta:
        model = SessionEntry
        fields = ["start", "type", "comment"]


class SessionExitSerializer(serializers.ModelSerializer):
    end = serializers.DateTimeField(default=lambda: timezone.localtime())
    class Meta:
        model = SessionEntry
        fields = ["end", "comment"]

class SessionEntryLeaveSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(default=lambda: timezone.localtime())

    class Meta:
        model = SessionEntry
        fields = ["time", "type", "comment"]

class SessionEntryModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionEntry
        fields = ["id", "start", "end", "type", "comment", "created_at", "updated_at"]


class SessionModelSerializer(serializers.ModelSerializer):
    entries = SessionEntryModelSerializer(many=True)
    status = serializers.ChoiceField(choices=Session.Status.choices)

    class Meta:
        model = Session
        fields = ["id", "user", "date", "entries", "status"]


class SessionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Session.Status.choices)
    comment = serializers.CharField(required=False, allow_blank=True)


class UserSessionSerializer(serializers.Serializer):
    user = UserModelSerializer()
    session = SessionSerializer()
