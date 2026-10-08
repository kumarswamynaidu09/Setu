import json
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("setu.ws")

class ConnectionManager:
    def __init__(self):
        # session_id -> set of active WebSockets
        self.active_rooms: Dict[str, Set[WebSocket]] = {}
        # websocket -> metadata (role, student_id, session_id)
        self.connection_meta: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str, role: str = "student", nickname: str = "Student"):
        await websocket.accept()
        if session_id not in self.active_rooms:
            self.active_rooms[session_id] = set()
        
        self.active_rooms[session_id].add(websocket)
        self.connection_meta[websocket] = {
            "session_id": session_id,
            "role": role,
            "nickname": nickname
        }
        logger.info(f"WebSocket connected to room {session_id} as {role}. Room size: {len(self.active_rooms[session_id])}")
        
        # Broadcast participant count update
        await self.broadcast_participant_count(session_id)

    def disconnect(self, websocket: WebSocket):
        meta = self.connection_meta.pop(websocket, None)
        if meta:
            session_id = meta.get("session_id")
            if session_id and session_id in self.active_rooms:
                self.active_rooms[session_id].discard(websocket)
                if not self.active_rooms[session_id]:
                    del self.active_rooms[session_id]
                logger.info(f"WebSocket disconnected from room {session_id}. Remaining: {len(self.active_rooms.get(session_id, []))}")
                return session_id
        return None

    def get_room_count(self, session_id: str) -> int:
        return len(self.active_rooms.get(session_id, set()))

    async def broadcast_participant_count(self, session_id: str):
        count = self.get_room_count(session_id)
        payload = {
            "type": "PARTICIPANT_UPDATE",
            "participant_count": count
        }
        await self.broadcast_to_room(session_id, payload)

    async def broadcast_to_room(self, session_id: str, message: dict):
        if session_id not in self.active_rooms:
            return
        dead_sockets = set()
        message_json = json.dumps(message)
        
        for ws in self.active_rooms[session_id]:
            try:
                await ws.send_text(message_json)
            except Exception as e:
                logger.warning(f"Error sending message to ws: {e}")
                dead_sockets.add(ws)
                
        for dead in dead_sockets:
            self.disconnect(dead)

    async def send_to_teachers(self, session_id: str, message: dict):
        """Sends message specifically to teacher connections in the room"""
        if session_id not in self.active_rooms:
            return
        message_json = json.dumps(message)
        for ws in self.active_rooms[session_id]:
            meta = self.connection_meta.get(ws, {})
            if meta.get("role") == "teacher":
                try:
                    await ws.send_text(message_json)
                except Exception:
                    pass

ws_manager = ConnectionManager()
