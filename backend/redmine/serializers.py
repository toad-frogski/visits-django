from rest_framework import serializers
from django.utils import timezone


class RedmineExtraFieldPayloadSerializer(serializers.Serializer):
    hours = serializers.FloatField()


class RedmineSpendTimeStatisticsRequestSerializer(serializers.Serializer):
    start = serializers.DateField(default=lambda: timezone.localdate().replace(day=1))
    end = serializers.DateField(default=lambda: timezone.localdate())
