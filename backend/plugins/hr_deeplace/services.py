from plugins.hr_deeplace.serializers import HrDeeplaceSessionInfoPluginSerializer
from visits.models import Session


class SessionInfoPlugin:
    _type = "hr_deeplace"
    _serializer_class = HrDeeplaceSessionInfoPluginSerializer

    def __call__(self, session: Session):
        raise NotImplementedError()
