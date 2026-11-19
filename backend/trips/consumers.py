import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TerminalBoardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.terminal_id = self.scope['url_route']['kwargs']['terminal_id']
        self.room_group_name = f"terminal_{self.terminal_id}_board"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Clients can send ping or request refresh
        pass

    async def board_message(self, event):
        # Broadcast message down to WebSocket
        await self.send(text_data=json.dumps(event['data']))

class PassengerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f"passenger_{self.user_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def passenger_message(self, event):
        await self.send(text_data=json.dumps(event['data']))
