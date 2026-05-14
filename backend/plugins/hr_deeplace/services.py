import random

from plugins.hr_deeplace.serializers import HrDeeplaceSessionInfoPluginSerializer
from visits.models import Session


class SessionInfoPlugin:
    _type = "hr_deeplace"
    _serializer_class = HrDeeplaceSessionInfoPluginSerializer

    def __call__(self, session: Session):
        res = random.random()
        if res > 0.66:
            return {"status": "vacation"}
        elif res > 0.33:
            return {"status": "sick"}
        else:
            return {"status": "home"}
