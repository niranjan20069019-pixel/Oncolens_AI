from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "OncoLens AI"
    app_version: str = "3.0.0"
    oncolens_env: str = Field(default="development", alias="ONCOLENS_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    secret_key: str = Field(default="dev-secret-change-in-production", alias="SECRET_KEY")
    allowed_origins: str = Field(
        default="http://127.0.0.1:8501,http://localhost:8501",
        alias="ALLOWED_ORIGINS",
    )
    database_url: str = Field(
        default="sqlite+aiosqlite:///./data/oncolens.db",
        alias="DATABASE_URL",
    )
    access_token_expire_minutes: int = Field(default=480, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    max_upload_bytes: int = Field(default=15 * 1024 * 1024, alias="MAX_UPLOAD_BYTES")
    rate_limit: str = Field(default="30/minute", alias="RATE_LIMIT")
    ml_model_name: str = Field(default="efficientnet_b0", alias="ML_MODEL_NAME")
    ml_device: str = Field(default="cpu", alias="ML_DEVICE")
    ml_weights_path: str = Field(default="", alias="ML_WEIGHTS_PATH")

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _strip_origins(cls, v: str) -> str:
        return v.strip() if v else ""

    def origin_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
