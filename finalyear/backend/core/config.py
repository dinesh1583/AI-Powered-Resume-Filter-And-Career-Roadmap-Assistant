from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict
import os

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        populate_by_name=True
    )

    PROJECT_NAME: str = "AI Career Roadmap Platform"
    MONGODB_URL: str = Field(default="mongodb://localhost:27017", alias="MONGO_URL")
    DATABASE_NAME: str = Field(default="career_roadmap_db", alias="DATABASE_NAME")
    SECRET_KEY: str = Field(default="change-me-in-production", alias="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", alias="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

settings = Settings()
