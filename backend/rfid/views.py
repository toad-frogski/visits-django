from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
        serializer = serializers.EnterRequestSerializer(data=request.data)

        session_service = SessionService()

        return Response({"message": "RFID entry processed"}, status=200)

    def put(self, request):
        # Logic for updating RFID entry
        return Response({"message": "RFID entry updated"}, status=200)


class ExitView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [RFIDAuthentication]

    def post(self, request):
        # Logic for handling RFID exit
        return Response({"message": "RFID exit processed"}, status=200)

    def put(self, request):
        # Logic for updating RFID exit
        return Response({"message": "RFID exit updated"}, status=200)
