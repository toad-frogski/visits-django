from rest_framework import serializers

class RedmineExtraFieldPayloadSerializer(serializers.Serializer):
    hours = serializers.DecimalField(max_digits=10, decimal_places=7)