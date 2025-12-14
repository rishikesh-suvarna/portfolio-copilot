from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Optional

TOKEN_PATH = Path(".kite_token.json")

def save_token(access_token: str, ttl_hours: int = 18) -> None:
    now = datetime.utcnow()
    data = {
        "access_token": access_token,
        "created_at": now.isoformat(),
        "expires_at": (now + timedelta(hours=ttl_hours)).isoformat(),
    }
    TOKEN_PATH.write_text(json.dumps(data), encoding="utf-8")

def load_token() -> Optional[str]:
    if not TOKEN_PATH.exists():
        return None
    try:
        data: Dict[str, Any] = json.loads(TOKEN_PATH.read_text(encoding="utf-8"))
        return data.get("access_token") or None
    except Exception:
        return None

def clear_token() -> None:
    if TOKEN_PATH.exists():
        TOKEN_PATH.unlink()
