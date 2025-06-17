from datetime import timedelta
from email.policy import default
from rest_framework import serializers
from django.utils import timezone

from session.serializers import UserModelSerializer
from .models import Session, SessionEntry


class SessionEnterSerializer(serializers.ModelSerializer):
    type = serializers.ChoiceField(
        choices=SessionEntry.Type.choices, default=SessionEntry.Type.WORK
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


def first_day_of_current_month():
    today = timezone.localdate().today()
    return today.replace(day=1)


def last_day_of_current_month():
    today = timezone.localdate().today()
    next_month = today.replace(day=28) + timedelta(days=4)
    return next_month.replace(day=1) - timedelta(days=1)


class UserMonthStatisticsRequestSerializer(serializers.Serializer):
    start = serializers.DateField(default=first_day_of_current_month)
    end = serializers.DateField(default=last_day_of_current_month)


class UserMonthStatisticsResponseSerializer(serializers.Serializer):

    class StatisticsFieldSerializer(serializers.Serializer):
        work_time = serializers.FloatField(default=0.0)
        break_time = serializers.FloatField(default=0.0)
        lunch_time = serializers.FloatField(default=0.0)

    date = serializers.DateField()
    session = SessionModelSerializer(allow_null=True)
    statistics = StatisticsFieldSerializer(allow_null=True)
    extra = serializers.ListField(child=serializers.DictField())
