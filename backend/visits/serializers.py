from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field, PolymorphicProxySerializer
from django.utils import timezone
from django.contrib.auth import get_user_model

from session.serializers import UserModelSerializer
from .models import Session, SessionEntry
from .callbacks import statistics_extra_callbacks

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


class UserSessionSerializer(serializers.Serializer):
    user = UserModelSerializer()
    session = SessionSerializer()


class UserMonthStatisticsRequestSerializer(serializers.Serializer):
    start = serializers.DateField(default=lambda: timezone.localdate().replace(day=1))
    end = serializers.DateField(default=lambda: timezone.localdate())


class UserMonthStatisticsResponseSerializer(serializers.Serializer):

    class StatisticsFieldSerializer(serializers.Serializer):
        work_time = serializers.FloatField(default=0.0)
        break_time = serializers.FloatField(default=0.0)
        lunch_time = serializers.FloatField(default=0.0)

    class ExtraFieldBaseSerializer(serializers.Serializer):
        type = serializers.ChoiceField(
            choices=[
                (callback._type, callback._type)
                for callback in statistics_extra_callbacks()
            ]
        )
        payload = serializers.SerializerMethodField()

        @extend_schema_field(
            PolymorphicProxySerializer(
                component_name="ExtraData",
                serializers=[
                    callback._serializer_class
                    for callback in statistics_extra_callbacks()
                ],
                resource_type_field_name=None,
            )
        )
        def get_payload(self, obj: dict) -> dict:
            return obj["payload"]

    date = serializers.DateField()
    session = SessionModelSerializer(allow_null=True)
    statistics = StatisticsFieldSerializer()
    extra = ExtraFieldBaseSerializer(many=True)
