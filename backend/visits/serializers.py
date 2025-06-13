import hashlib
from rest_framework import serializers

from session.serializers import UserModelSerializer
from .models import Session, SessionEntry


class SessionEnterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionEntry
        fields = ["start", "type", "comment"]


class SessionExitSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = SessionEntry
        fields = ["id", "end", "type", "comment"]


class SessionEntryModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionEntry
        fields = ["id", "start", "end", "type", "comment", "created_at", "updated_at"]


class SessionModelSerializer(serializers.ModelSerializer):
    entries = SessionEntryModelSerializer(many=True)

    class Meta:
        model = Session
        fields = ["id", "user", "date", "entries"]


class SessionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Session.Status.choices)
    comment = serializers.CharField(required=False, allow_blank=True)


class UserSessionSerializer(serializers.Serializer):
    user = UserModelSerializer()
    session = SessionSerializer()
