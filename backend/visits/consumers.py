from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NotificationsConsumer(AsyncJsonWebsocketConsumer):
    groups = ["visits"]

    async def session_status_updated(self, event: dict[str, dict]):
        await self.send_json(event)

    async def user_avatar_changed(self, event: dict[str, dict]):
        await self.send_json(event)
