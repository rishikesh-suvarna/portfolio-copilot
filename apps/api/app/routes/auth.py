from typing import Any, Dict, cast

from app.core.config import settings
from app.kite.client import get_kite
from app.schemas.auth import ExchangeRequest
from app.services.session_store import store
from app.services.token_file_store import save_token
from fastapi import APIRouter, HTTPException
from kiteconnect import KiteConnect

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/login-url")
def login_url():
    kite = KiteConnect(api_key=settings.KITE_API_KEY)
    return {"url": kite.login_url()}


@router.post("/exchange")
def exchange(req: ExchangeRequest):
    kite = KiteConnect(api_key=settings.KITE_API_KEY)
    try:
        raw = kite.generate_session(req.request_token, api_secret=settings.KITE_API_SECRET)
        data = cast(Dict[str, Any], raw)
        access_token = data["access_token"]
        store.set(access_token)
        save_token(access_token)
        return {
            "ok": True,
            "access_token_set": True,
            "user_id": data.get("user_id"),
            "login_time": data.get("login_time"),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
def logout():
    store.clear()
    return {"ok": True}

@router.get("/me")
def me():
    kite = get_kite()
    return kite.profile()
