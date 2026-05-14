from rest_framework import serializers


class HrDeeplaceUserInfoFieldPayloadSerializer(serializers.Serializer):
    status = serializers.CharField()


class HrDeeplaceSessionInfoPluginSerializer(serializers.Serializer):
    type = serializers.ReadOnlyField(default="hr_deeplace")
    payload = HrDeeplaceUserInfoFieldPayloadSerializer()
