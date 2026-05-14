from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field, PolymorphicProxySerializer
from django.utils import timezone
from django.contrib.auth import get_user_model

from session.serializers import UserModelSerializer
from .models import Session, SessionEntry
from . import registry

User = get_user_model()


class SessionEnterSerializer(serializers.ModelSerializer):
    type = serializers.ChoiceField(
        choices=SessionEntry.SessionEntryType.choices,
        default=SessionEntry.SessionEntryType.WORK,
    )
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
    id = serializers.ReadOnlyField()

    class Meta:
        model = SessionEntry
        fields = ["id", "start", "end", "type", "comment", "created_at", "updated_at"]


class SessionModelSerializer(serializers.ModelSerializer):
    entries = SessionEntryModelSerializer(many=True)
    status = serializers.ChoiceField(choices=Session.SessionStatus.choices)

    class Meta:
        model = Session
        fields = ["id", "user", "date", "entries", "status"]


class SessionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Session.SessionStatus.choices)
    comment = serializers.CharField(required=False, allow_blank=True)

    @extend_schema_field(
        PolymorphicProxySerializer(
            many=True,
            component_name="SessionExtraField",
            resource_type_field_name="type",
            serializers={
                plugin._type: plugin._serializer_class
                for plugin in registry.get_plugins("session_info")
                if hasattr(plugin, "_serializer_class") and hasattr(plugin, "_type")
            },
        )
    )
    def get_extra(self, obj):
        return obj.get("extra", [])

    extra = serializers.SerializerMethodField()


class UserSessionSerializer(serializers.Serializer):
    user = UserModelSerializer()
    session = SessionSerializer()


class UserMonthStatisticsRequestSerializer(serializers.Serializer):
    start = serializers.DateField(default=lambda: timezone.localdate().replace(day=1))
    end = serializers.DateField(default=lambda: timezone.localdate())
    user_id = serializers.IntegerField(required=False)


class UserMonthStatisticsResponseSerializer(serializers.Serializer):
    class StatisticsFieldSerializer(serializers.Serializer):
        work_time = serializers.FloatField(default=0.0)
        break_time = serializers.FloatField(default=0.0)
        lunch_time = serializers.FloatField(default=0.0)

    class ExtraFieldSerializer(serializers.Serializer):
        type = serializers.CharField()
        payload = serializers.DictField()

    date = serializers.DateField()
    session = SessionModelSerializer(allow_null=True)
    statistics = StatisticsFieldSerializer()

    @extend_schema_field(
        PolymorphicProxySerializer(
            many=True,
            component_name="StatisticsExtraField",
            resource_type_field_name="type",
            serializers={
                plugin._type: plugin._serializer_class
                for plugin in registry.get_plugins("statistics")
                if hasattr(plugin, "_serializer_class") and hasattr(plugin, "_type")
            },
        )
    )
    def get_extra(self, obj):
        return obj.get("extra", [])

    extra = serializers.SerializerMethodField()
