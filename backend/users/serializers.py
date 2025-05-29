from rest_framework import serializers
from django.contrib.auth.models import User
from visits.serializers import SessionModelSerializer
from .models import UserProfile


class UserProfileModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["avatar"]


class UserModelSerializer(serializers.ModelSerializer):
    profile = UserProfileModelSerializer(allow_null=True)
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "profile"]


class UserSessionSerializer(serializers.Serializer):
    user = UserModelSerializer()
    session = SessionModelSerializer(allow_null=True)
