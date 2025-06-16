from channels.generic.websocket import AsyncJsonWebsocketConsumer


class SessionStatusConsumer(AsyncJsonWebsocketConsumer):
    groups = ["session_status"]

    async def session_status_updated(self, event: dict[str, dict]):
        await self.send_json({"type": "session_update", "payload": event["payload"]})
