from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bureaucracy Management Agent"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./bureaucracy.db"
    GEMINI_API_KEY: str = ""
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = ".env"

settings = Settings()
