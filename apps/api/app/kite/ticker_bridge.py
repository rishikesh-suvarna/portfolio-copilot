from __future__ import annotations

import asyncio
import json
import threading
from ctypes import cast
from typing import Any, Dict, List, Optional, Set, cast

from app.core.config import settings
from app.services.session_store import store
from kiteconnect import KiteTicker


class TickerBridge:
    """
    Runs KiteTicker in a background thread and publishes ticks to an asyncio queue.
    """
    def __init__(self) -> None:
        self._thread: Optional[threading.Thread] = None
        self._kws: Optional[KiteTicker] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None

        self._queue: "asyncio.Queue[Dict[str, Any]]" = asyncio.Queue()
        self._subscribed: Set[int] = set()
        self._mode: str = "full"  # "ltp" | "quote" | "full"

        self._lock = threading.Lock()

    @property
    def queue(self) -> "asyncio.Queue[Dict[str, Any]]":
        return self._queue

    def start(self, loop: asyncio.AbstractEventLoop) -> None:
        with self._lock:
            if self._thread and self._thread.is_alive():
                return
            self._loop = loop
            self._thread = threading.Thread(target=self._run, daemon=True)
            self._thread.start()

    def update_subscription(self, tokens: List[int], mode: str = "full") -> None:
        with self._lock:
            self._subscribed = set(tokens)
            self._mode = mode
            if self._kws:
                self._kws.subscribe(tokens)
                if mode == "ltp":
                    self._kws.set_mode(self._kws.MODE_LTP, tokens)
                elif mode == "quote":
                    self._kws.set_mode(self._kws.MODE_QUOTE, tokens)
                else:
                    self._kws.set_mode(self._kws.MODE_FULL, tokens)

    def _emit(self, payload: Dict[str, Any]) -> None:
        if not self._loop:
            return
        asyncio.run_coroutine_threadsafe(self._queue.put(payload), self._loop)

    def _run(self) -> None:
        sess = store.get()
        if not sess:
            self._emit({"type": "ERROR", "message": "No access_token. Login first."})
            return

        kws = KiteTicker(settings.KITE_API_KEY, sess.access_token)
        kws_any = cast(Any, kws)
        self._kws = kws

        def on_connect(ws, response):
            with self._lock:
                tokens = list(self._subscribed)
                mode = self._mode
            if tokens:
                ws.subscribe(tokens)
                if mode == "ltp":
                    ws.set_mode(ws.MODE_LTP, tokens)
                elif mode == "quote":
                    ws.set_mode(ws.MODE_QUOTE, tokens)
                else:
                    ws.set_mode(ws.MODE_FULL, tokens)
            self._emit({"type": "CONNECTED"})

        def on_ticks(ws, ticks):
            self._emit({"type": "TICKS", "data": ticks})

        def on_error(ws, code, reason):
            self._emit({"type": "ERROR", "code": code, "reason": reason})

        def on_close(ws, code, reason):
            self._emit({"type": "CLOSED", "code": code, "reason": reason})

        kws_any.on_connect = on_connect
        kws_any.on_ticks = on_ticks
        kws_any.on_error = on_error
        kws_any.on_close = on_close

        # threaded connect so this thread can manage callbacks
        kws.connect(threaded=False)
        kws.connect(threaded=False)
