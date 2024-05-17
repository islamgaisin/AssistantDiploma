from django.shortcuts import render
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .train import build_chain, create_database

chain = build_chain()
database = create_database()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
    
    async def disconnect(self, clode_code):
        pass

    async def receive(self, text_data):
        message = json.loads(text_data)["message"]
        try:
            relevants = database.similarity_search(message)
            doc = relevants[0].dict()['metadata']
            answer = chain.run(doc)
            await self.send(text_data=answer)

        except Exception as e:
            print(e)
