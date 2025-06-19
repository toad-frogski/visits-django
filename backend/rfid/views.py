from rest_framework import views
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError, NotFound
from drf_spectacular.utils import extend_schema

from visits.models import SessionEntry
from visits.services import SessionService

from .authentication import RFIDAuthentication
from .serializers import RFIDSettingsModelSerializer
from .models import RFIDSettings


@extend_schema(tags=["rfid"])
class SettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RFIDSettingsModelSerializer

    def get_object(self):
        return get_object_or_404(RFIDSettings, user=self.request.user)


@extend_schema(exclude=True)
class EnterView(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [RFIDAuthentication]

    def post(self, request):
        session_service = SessionService()

        try:
            session_service.enter(
                request.user,
                type=SessionEntry.SessionEntryType.WORK,
                time=timezone.localtime(),
            )
        except ValueError as e:
            raise ValidationError(detail=e)
        except Exception as e:
            raise APIException(detail=e)

        return Response({"message": "RFID entry processed"}, status=status.HTTP_200_OK)


@extend_schema(exclude=True)
class ExitView(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [RFIDAuthentication]

    def post(self, request):
        session_service = SessionService()

        try:
            session_service.exit(request.user, timezone.localtime())
        except SessionEntry.DoesNotExist as e:
            raise NotFound(detail=e)
        except ValueError as e:
            raise ValidationError(detail=e)
        except Exception as e:
            raise APIException(detail=e)

        return Response({"message": "RFID exit processed"}, status=status.HTTP_200_OK)
