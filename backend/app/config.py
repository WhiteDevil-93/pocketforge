from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="POCKETFORGE_",
        protected_namespaces=("settings_",),
    )

    model_path: str = "./models/gemma-4-e2b-q4"
    lora_adapter_path: str = "./models/pocketforge-lora"

    max_new_tokens: int = 512
    temperature: float = 0.7

    cors_origins: str = (
        "http://localhost:3000,"
        "https://whitedevil-93.github.io"
    )

    use_stub_responses: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()