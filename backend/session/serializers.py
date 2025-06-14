import hashlib
from rest_framework import serializers
from rest_framework.request import Request
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

from .models import Avatar


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, allow_blank=False)
    password = serializers.CharField(required=True, allow_blank=False)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"),
            username=username,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                _("Unable to log in with provided credentials."),
                code="authorization",
            )

        attrs["user"] = user

        return attrs


class AvatarModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avatar
        fields = ["avatar"]


class UserModelSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "full_name", "avatar", "email"]

    def get_full_name(self, obj: User):
        return (
            f"{(obj.first_name or "").capitalize()} {(obj.last_name or "").capitalize()}"
            if obj.first_name and obj.last_name
            else f"{obj.username.capitalize()}"
        )

    def get_avatar(self, obj: User):

        if hasattr(obj, "avatar") and obj.avatar and obj.avatar.avatar:
            request: Request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.avatar.avatar.url)

        email = (obj.email or "").strip().lower()
        if not email:
            return None

        email_hash = hashlib.md5(email.encode("utf-8")).hexdigest()
        return f"https://www.gravatar.com/avatar/{email_hash}"
