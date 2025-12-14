from __future__ import annotations

import threading
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

from app.services.token_file_store import load_token


@dataclass
class KiteSession:
    access_token: str
    created_at: datetime
    expires_at: datetime


class InMemorySessionStore:
    """
    MVP-only. Replace with Postgres + encryption later.
    """
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._session: Optional[KiteSession] = None

    def set(self, access_token: str, ttl_hours: int = 18) -> KiteSession:
        now = datetime.utcnow()
        sess = KiteSession(
            access_token=access_token,
            created_at=now,
            expires_at=now + timedelta(hours=ttl_hours),
        )
        with self._lock:
            self._session = sess
        return sess

    def get(self) -> Optional[KiteSession]:
        with self._lock:
            return self._session

    def clear(self) -> None:
        with self._lock:
            self._session = None


store = InMemorySessionStore()
t = load_token()
if t:
    store.set(t)
