import os
from pydantic_settings import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./lexclear.db"
    
    LLM_PROVIDER: str = "offline"  # "offline", "openai", "gemini", "anthropic", "ollama"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # 5 Criteria Weights (Must sum to 1.0)
    WEIGHT_CLARITY: float = 0.25
    WEIGHT_COMPLETENESS: float = 0.20
    WEIGHT_FAIRNESS: float = 0.20
    WEIGHT_LEGAL_RISK: float = 0.25
    WEIGHT_COMPLIANCE: float = 0.10

    @property
    def weights_dict(self) -> Dict[str, float]:
        return {
            "clarity": self.WEIGHT_CLARITY,
            "completeness": self.WEIGHT_COMPLETENESS,
            "fairness": self.WEIGHT_FAIRNESS,
            "legal_risk": self.WEIGHT_LEGAL_RISK,
            "compliance": self.WEIGHT_COMPLIANCE,
        }

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
