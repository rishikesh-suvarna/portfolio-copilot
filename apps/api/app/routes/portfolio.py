from app.kite.client import get_kite
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("/holdings")
def holdings():
    kite = get_kite()
    try:
        return kite.holdings()
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/positions")
def positions():
    kite = get_kite()
    try:
        return kite.positions()
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/margins")
def margins():
    kite = get_kite()
    try:
        return kite.margins()
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
