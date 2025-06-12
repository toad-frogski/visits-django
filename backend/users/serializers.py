import hashlib
from rest_framework import serializers
from rest_framework.request import Request
from django.contrib.auth.models import User
from visits.models import Session
from visits.serializers import SessionModelSerializer
from .models import Avatar


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
        request: Request = self.context.get("request")

        if hasattr(obj, "avatar") and obj.avatar and obj.avatar.avatar:
            return request.build_absolute_uri(obj.avatar.avatar.url)

        email = (obj.email or "").strip().lower()
        if not email:
            return None

        email_hash = hashlib.md5(email.encode("utf-8")).hexdigest()
        return f"https://www.gravatar.com/avatar/{email_hash}"


class SessionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Session.SessionStatus.choices)
    comment = serializers.CharField(required=False, allow_blank=True)


class UserSessionSerializer(serializers.Serializer):
    user = UserModelSerializer()
    session = SessionSerializer()
