from django.shortcuts import render
from channels.generic.websocket import AsyncWebsocketConsumer

# Create your views here.

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
    
    async def disconnect(self, clode_code):
        pass

    async def receive(self, text_data):
        pass