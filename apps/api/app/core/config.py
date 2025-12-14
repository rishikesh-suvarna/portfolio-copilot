from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    KITE_API_KEY: str = ""
    KITE_API_SECRET: str = ""
    REDIRECT_URL: str = "http://localhost:5173/auth/kite/callback"


settings = Settings()
