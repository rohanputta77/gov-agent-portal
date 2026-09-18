from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bureaucracy Management Agent"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./bureaucracy.db"
    GEMINI_API_KEY_1: str = ""
    GEMINI_API_KEY_2: str = ""
    GROQ_API_KEY: str = ""
    UPLOAD_DIR: str = "./uploads"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000" # Comma separated list of origins

    class Config:
        env_file = ".env"

settings = Settings()
