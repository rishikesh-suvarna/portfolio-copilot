from pydantic import BaseModel


class ExchangeRequest(BaseModel):
    request_token: str
