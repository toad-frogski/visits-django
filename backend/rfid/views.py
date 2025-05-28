from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError, NotFound

from visits.models import SessionEntry
from visits.services.session_service import SessionService

from .authentication import RFIDAuthentication


class SettingsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return Response()


class EnterView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [RFIDAuthentication]

    def post(self, request):
        session_service = SessionService()

        try:
            session_service.enter(
                request.user, type=SessionEntry.Type.SYSTEM, check_in=timezone.now()
            )
        except ValueError as e:
            raise ValidationError(detail=e)
        except Exception as e:
            raise APIException(detail=e)

        return Response({"message": "RFID entry processed"}, status=status.HTTP_200_OK)


class ExitView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [RFIDAuthentication]

    def post(self, request):
        session_service = SessionService()

        try:
            session_service.exit(
                request.user, type=SessionEntry.Type.SYSTEM, check_out=timezone.now()
            )
        except SessionEntry.DoesNotExist as e:
            raise NotFound(detail=e)
        except ValueError as e:
            raise ValidationError(detail=e)
        except Exception as e:
            raise APIException(detail=e)

        return Response({"message": "RFID exit processed"}, status=status.HTTP_200_OK)
