import logging

from app.routes.auth import router as auth_router
from app.routes.portfolio import router as portfolio_router
from app.routes.stream import router as stream_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Portfolio Copilot API")

logging.basicConfig(level=logging.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(portfolio_router)
app.include_router(stream_router)


@app.get("/health")
def health():
    return {"ok": True}
