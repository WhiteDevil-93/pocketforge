"""Build Gemma chat prompts from PocketForge team payloads."""

from __future__ import annotations

import json

from .schemas import PokemonSet, TeamPayload

SYSTEM_COACH = """You are PocketForge Coach, an expert Pokémon Showdown strategist.
Given a team, field state, and legal moves, recommend optimal competitive play.
Ground advice in type matchups, speed tiers, EV efficiency, and current meta trends.
Be concise and actionable."""


def format_pokemon(mon: PokemonSet) -> str:
    evs = mon.evs.model_dump(by_alias=True)
    invested = [f"{k.upper()} {v}" for k, v in evs.items() if v > 0]
    ev_line = ", ".join(invested) if invested else "uninvested"
    moves = ", ".join(mon.moves) if mon.moves else "—"
    item = mon.item or "none"
    tera = mon.tera_type or "unset"
    return (
        f"- {mon.species} @ {item} | {mon.ability} | {mon.nature} | EVs: {ev_line} "
        f"| Tera: {tera} | Moves: {moves}"
    )


def team_block(team: TeamPayload) -> str:
    lines = [format_pokemon(p) for p in team.pokemon]
    roster = "\n".join(lines) if lines else "(empty)"
    return f"Team: {team.name}\nFormat: {team.format}\n{roster}"


def recommend_sixth_prompt(team: TeamPayload) -> list[dict[str, str]]:
    user = (
        f"{team_block(team)}\n\n"
        f"The roster has {len(team.pokemon)} Pokémon. "
        "Recommend the mathematically best 6th teammate for this format. "
        "Reply with species, item, ability, four moves, and brief reasoning."
    )
    return [
        {"role": "system", "content": SYSTEM_COACH},
        {"role": "user", "content": user},
    ]


def analyze_weakness_prompt(team: TeamPayload) -> list[dict[str, str]]:
    user = (
        f"{team_block(team)}\n\n"
        "Critique this team's structural weaknesses, EV inefficiencies, and priority fixes."
    )
    return [
        {"role": "system", "content": SYSTEM_COACH},
        {"role": "user", "content": user},
    ]


def simulate_opening_prompt(team: TeamPayload, turns: int = 5) -> list[dict[str, str]]:
    user = (
        f"{team_block(team)}\n\n"
        f"Simulate the opening {turns} turns vs a high-ELO meta team. "
        "Give lead advice and predicted lines."
    )
    return [
        {"role": "system", "content": SYSTEM_COACH},
        {"role": "user", "content": user},
    ]


def messages_to_text(messages: list[dict[str, str]]) -> str:
    return json.dumps(messages, ensure_ascii=False, indent=2)