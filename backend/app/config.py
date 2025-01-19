from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    model_name: str = "gpt-4"

    class Config:
        env_file = ".env"

settings = Settings() 