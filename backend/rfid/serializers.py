from rest_framework import serializers
from .models import RFIDSettings


class RFIDSettingsModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = RFIDSettings
        fields = ["rfid_token"]
