from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, List, Optional, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder

from app.kite.ticker_bridge import TickerBridge

router = APIRouter(tags=["stream"])

bridge = TickerBridge()

# Track connected clients + their subscription tokens
_clients: Set[WebSocket] = set()
_client_tokens: Dict[WebSocket, Set[int]] = {}

# Single broadcaster task per process
_broadcast_task: Optional[asyncio.Task] = None
_lock = asyncio.Lock()


def _all_tokens_union() -> List[int]:
    tokens: Set[int] = set()
    for tset in _client_tokens.values():
        tokens |= tset
    return list(tokens)


async def _ensure_broadcaster_started() -> None:
    global _broadcast_task

    async with _lock:
        if _broadcast_task and not _broadcast_task.done():
            return

        loop = asyncio.get_running_loop()
        bridge.start(loop)

        async def broadcaster():
            while True:
                payload = await bridge.queue.get()

                if payload.get("type") != "TICKS":
                    # send non-tick events to all connected clients
                    msg = json.dumps(jsonable_encoder(payload))
                    dead: List[WebSocket] = []
                    for ws in list(_clients):
                        try:
                            await ws.send_text(msg)
                        except Exception:
                            dead.append(ws)
                    for ws in dead:
                        _clients.discard(ws)
                        _client_tokens.pop(ws, None)
                    continue

                ticks = payload.get("data") or []
                if not isinstance(ticks, list):
                    continue

                # Send filtered ticks per-client
                dead: List[WebSocket] = []
                for ws in list(_clients):
                    subs = _client_tokens.get(ws, set())
                    if not subs:
                        continue

                    filtered = [t for t in ticks if t.get("instrument_token") in subs]
                    if not filtered:
                        continue

                    out = dict(payload)
                    out["data"] = filtered
                    msg = json.dumps(jsonable_encoder(out))

                    try:
                        await ws.send_text(msg)
                    except Exception:
                        dead.append(ws)

                for ws in dead:
                    _clients.discard(ws)
                    _client_tokens.pop(ws, None)

        _broadcast_task = asyncio.create_task(broadcaster())


@router.websocket("/ws/stream")
async def ws_stream(ws: WebSocket):
    await ws.accept()

    await _ensure_broadcaster_started()

    _clients.add(ws)
    _client_tokens[ws] = set()

    try:
        while True:
            raw = await ws.receive_text()
            data = json.loads(raw)

            msg_type = data.get("type")

            if msg_type == "SUBSCRIBE":
                tokens = data.get("tokens", [])
                mode = data.get("mode", "full")

                if not isinstance(tokens, list):
                    tokens = []

                # store per-client tokens
                _client_tokens[ws] = set(int(t) for t in tokens if isinstance(t, int) or (isinstance(t, str) and t.isdigit()))

                # update global KiteTicker subscription union
                union = _all_tokens_union()
                bridge.update_subscription(union, mode)

                await ws.send_text(
                    json.dumps(
                        {"type": "SUBSCRIBED", "tokens": list(_client_tokens[ws]), "mode": mode}
                    )
                )

            elif msg_type == "UNSUBSCRIBE":
                tokens = data.get("tokens", [])
                if not isinstance(tokens, list):
                    tokens = []

                current = _client_tokens.get(ws, set())
                remove = set(int(t) for t in tokens if isinstance(t, int) or (isinstance(t, str) and t.isdigit()))
                current -= remove
                _client_tokens[ws] = current

                union = _all_tokens_union()
                bridge.update_subscription(union, "full")

                await ws.send_text(
                    json.dumps({"type": "UNSUBSCRIBED", "tokens": list(remove)})
                )

            elif msg_type == "UNSUBSCRIBE_ALL":
                _client_tokens[ws] = set()
                union = _all_tokens_union()
                bridge.update_subscription(union, "full")
                await ws.send_text(json.dumps({"type": "UNSUBSCRIBED_ALL"}))

            else:
                await ws.send_text(json.dumps({"type": "ERROR", "message": "Unknown message type"}))

    except WebSocketDisconnect:
        pass
    finally:
        _clients.discard(ws)
        _client_tokens.pop(ws, None)
        union = _all_tokens_union()
        bridge.update_subscription(union, "full")
