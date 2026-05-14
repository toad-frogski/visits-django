from rest_framework import serializers


class HolidaysExtraFieldPayloadSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["holiday", "weekend"])


class HolidaysStatisticsPluginSerializer(serializers.Serializer):
    # type = "holidays"
    type = serializers.ReadOnlyField(default="holidays")
    payload = HolidaysExtraFieldPayloadSerializer()
