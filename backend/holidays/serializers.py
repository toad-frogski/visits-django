from rest_framework import serializers


class HolidaysExtraFieldPayloadSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["holiday", "weekend"])