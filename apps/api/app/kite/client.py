from app.core.config import settings
from app.services.session_store import store
from kiteconnect import KiteConnect


def get_kite() -> KiteConnect:
    kite = KiteConnect(api_key=settings.KITE_API_KEY)
    sess = store.get()
    if sess:
        kite.set_access_token(sess.access_token)
    return kite
