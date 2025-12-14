from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, List

from app.kite.ticker_bridge import TickerBridge
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["stream"])

bridge = TickerBridge()


@router.websocket("/ws/stream")
async def ws_stream(ws: WebSocket):
    await ws.accept()

    # Start bridge once per process
    loop = asyncio.get_running_loop()
    bridge.start(loop)

    # client can SUBSCRIBE with tokens and mode
    async def reader():
        while True:
            msg = await ws.receive_text()
            data = json.loads(msg)
            if data.get("type") == "SUBSCRIBE":
                tokens: List[int] = data.get("tokens", [])
                mode: str = data.get("mode", "full")
                bridge.update_subscription(tokens, mode)
                await ws.send_text(json.dumps({"type": "SUBSCRIBED", "tokens": tokens, "mode": mode}))

    async def writer():
        while True:
            payload = await bridge.queue.get()
            await ws.send_text(json.dumps(payload))

    try:
        await asyncio.gather(reader(), writer())
    except WebSocketDisconnect:
        return
        return
