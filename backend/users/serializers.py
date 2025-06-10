import hashlib
from rest_framework import serializers
from rest_framework.request import Request
from django.contrib.auth.models import User
from visits.serializers import SessionModelSerializer
from .models import Avatar


class AvatarModelSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(write_only=True, required=False)
    avatar_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Avatar
        fields = ["avatar_url", "avatar"]

    def get_avatar_url(self, obj: Avatar):
        request: Request = self.context.get("request")
        if obj.avatar:
            return request.build_absolute_uri(obj.avatar.url)

        email = (obj.user.email or "").strip().lower()
        if not email:
            return None

        email_hash = hashlib.md5(email.encode("utf-8")).hexdigest()

        return f"https://www.gravatar.com/avatar/{email_hash}"


class UserModelSerializer(serializers.ModelSerializer):
    avatar = AvatarModelSerializer(allow_null=True)
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


class UserSessionSerializer(serializers.Serializer):
    user = UserModelSerializer()
    session = SessionModelSerializer(allow_null=True)
