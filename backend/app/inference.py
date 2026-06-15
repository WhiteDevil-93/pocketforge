"""
Gemma-4-E2B inference layer.

When POCKETFORGE_USE_STUB_RESPONSES=false and model weights exist, load
Unsloth/GGUF Q4_0 checkpoint + PocketForge LoRA adapter here.
"""

from __future__ import annotations

from .config import settings
from .prompts import (
    analyze_weakness_prompt,
    recommend_sixth_prompt,
    simulate_opening_prompt,
)
from .schemas import (
    AnalyzeWeaknessRequest,
    AnalyzeWeaknessResponse,
    RecommendTeammateRequest,
    RecommendTeammateResponse,
    SimulateBattleRequest,
    SimulateBattleResponse,
    TeamPayload,
)


class GemmaCoach:
    def __init__(self) -> None:
        self._loaded = False
        self._model = None
        self._tokenizer = None

    @property
    def is_loaded(self) -> bool:
        return self._loaded and not settings.use_stub_responses

    def load(self) -> None:
        if settings.use_stub_responses:
            return
        # TODO Phase 2.4: load Gemma-4-E2B QAT + LoRA via Unsloth/llama.cpp
        self._loaded = False

    def _team_summary(self, team: TeamPayload) -> str:
        mons = ", ".join(p.species for p in team.pokemon) or "empty"
        return f"{team.name} ({team.format}): {mons}"

    def _generate(self, messages: list[dict[str, str]]) -> str:
        raise NotImplementedError

    def recommend_teammate(self, req: RecommendTeammateRequest) -> RecommendTeammateResponse:
        if self.is_loaded:
            _ = recommend_sixth_prompt(req.team)
            pass

        species_list = [p.species for p in req.team.pokemon]
        return RecommendTeammateResponse(
            species="Landorus-Therian",
            item="Choice Scarf",
            ability="Intimidate",
            moves=["Earthquake", "U-turn", "Stone Edge", "Knock Off"],
            reasoning=(
                f"Stub coach: your core ({', '.join(species_list) or 'none'}) may lack "
                "speed control and Ground-type pressure. Landorus-T fills both roles in "
                f"{req.team.format}. Replace with Gemma output after SFT + DPO."
            ),
            model="stub" if settings.use_stub_responses else "gemma-4-e2b",
        )

    def analyze_weakness(self, req: AnalyzeWeaknessRequest) -> AnalyzeWeaknessResponse:
        if self.is_loaded:
            _ = analyze_weakness_prompt(req.team)
            pass

        return AnalyzeWeaknessResponse(
            summary=(
                f"Stub analysis for {self._team_summary(req.team)}. "
                "Connect trained Gemma for natural-language VGC/Champions coaching."
            ),
            structural_flaws=[
                "Check shared Ground weakness across your defensive core.",
                "Verify speed tiers — one slow pivot may lose the turn-1 tempo race.",
            ],
            ev_suggestions=[
                "Revisit max Speed on bulky pivots; HP/SpD often yields better trades.",
                "Ensure at least one Pokémon outspeeds the format's top threats.",
            ],
            priority_fixes=[
                "Add a secondary win condition if your primary attacker is walled.",
                "Confirm Tera types cover your team's most common 2x weaknesses.",
            ],
            model="stub" if settings.use_stub_responses else "gemma-4-e2b",
        )

    def simulate_battle(self, req: SimulateBattleRequest) -> SimulateBattleResponse:
        if self.is_loaded:
            _ = simulate_opening_prompt(req.team, req.turns)
            pass

        return SimulateBattleResponse(
            match_id="stub-match-0001",
            status="queued",
            opening_advice=(
                "Stub sim: lead with your fastest safe pivot, scout Tera on turn 1, "
                "and preserve your answer to the opponent's main breaker."
            ),
            predicted_lines=[
                "Turn 1: Lead A vs Lead X — trade chip or pivot based on matchup.",
                "Turn 2: Reveal Tera only if it flips a 2HKO into an OHKO.",
                "Turn 3+: Press advantage with your faster win condition.",
            ],
            model="stub" if settings.use_stub_responses else "gemma-4-e2b",
        )


coach = GemmaCoach()