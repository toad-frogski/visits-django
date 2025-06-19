from rest_framework import serializers


class RedmineExtraFieldPayloadSerializer(serializers.Serializer):
    hours = serializers.FloatField()
