from pydantic import BaseModel, Field


class EVSpread(BaseModel):
    hp: int = 0
    atk: int = 0
    def_: int = Field(0, alias="def")
    spa: int = 0
    spd: int = 0
    spe: int = 0

    model_config = {"populate_by_name": True}


class PokemonSet(BaseModel):
    species: str
    nickname: str | None = None
    level: int = 50
    ability: str = ""
    item: str | None = None
    tera_type: str | None = Field(None, alias="teraType")
    moves: list[str] = Field(default_factory=list)
    evs: EVSpread = Field(default_factory=EVSpread)
    ivs: EVSpread = Field(default_factory=lambda: EVSpread(hp=31, atk=31, def_=31, spa=31, spd=31, spe=31))
    nature: str = "Serious"

    model_config = {"populate_by_name": True}


class TeamPayload(BaseModel):
    name: str = "Untitled Team"
    format: str = "champions-ma"
    pokemon: list[PokemonSet] = Field(default_factory=list)


class RecommendTeammateRequest(BaseModel):
    team: TeamPayload
    regulation: str | None = None


class RecommendTeammateResponse(BaseModel):
    species: str
    item: str | None = None
    ability: str | None = None
    moves: list[str] = Field(default_factory=list)
    reasoning: str
    model: str = "stub"


class AnalyzeWeaknessRequest(BaseModel):
    team: TeamPayload


class AnalyzeWeaknessResponse(BaseModel):
    summary: str
    structural_flaws: list[str] = Field(default_factory=list)
    ev_suggestions: list[str] = Field(default_factory=list)
    priority_fixes: list[str] = Field(default_factory=list)
    model: str = "stub"


class SimulateBattleRequest(BaseModel):
    team: TeamPayload
    opponent_archetype: str | None = None
    turns: int = Field(5, ge=1, le=20)


class SimulateBattleResponse(BaseModel):
    match_id: str
    status: str
    opening_advice: str
    predicted_lines: list[str] = Field(default_factory=list)
    model: str = "stub"


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    stub_mode: bool
    version: str = "phase2-dev"