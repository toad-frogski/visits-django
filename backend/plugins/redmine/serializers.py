from rest_framework import serializers
from django.utils import timezone


class RedmineExtraFieldPayloadSerializer(serializers.Serializer):
    hours = serializers.FloatField()


class RedmineStatisticsPluginSerializer(serializers.Serializer):
    type = serializers.ReadOnlyField(default="redmine")
    payload = RedmineExtraFieldPayloadSerializer()


class RedmineSpentDateRequestSerializer(serializers.Serializer):
    date = serializers.DateField(default=lambda: timezone.localdate())
