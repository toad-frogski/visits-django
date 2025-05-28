from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException

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
        except Exception as e:
            return APIException(detail=e, code=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            return APIException(detail=str(e), code=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return APIException(detail=str(e), code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return APIException(detail=e, code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "RFID exit processed"}, status=status.HTTP_200_OK)
