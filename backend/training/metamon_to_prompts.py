#!/usr/bin/env python3
"""
Step 1 — Metamon → Gemma SFT prompts.

Usage (after downloading Metamon from Hugging Face):
  python training/metamon_to_prompts.py \\
    --input ./data/metamon/raw \\
    --output ./data/metamon/prompts.jsonl \\
    --min-elo 1600 \\
    --format gen9vgc2024
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

SYSTEM_PROMPT = """You are PocketForge Coach, an expert Pokémon Showdown strategist.
Given a team, field state, and legal moves, recommend the optimal competitive play.
Respond with concise reasoning grounded in type matchups, speed tiers, and meta trends."""


def battle_state_to_user_prompt(record: dict) -> str:
    turn = record.get("turn", "?")
    format_id = record.get("format", "gen9")
    active = record.get("active", [])
    legal_moves = record.get("legal_moves", [])
    return (
        f"Format: {format_id}\n"
        f"Turn: {turn}\n"
        f"Active: {json.dumps(active)}\n"
        f"Legal moves: {json.dumps(legal_moves)}\n"
        "What is the best move this turn?"
    )


def record_to_assistant(record: dict) -> str:
    return record.get("chosen_move") or record.get("action", "Pass")


def convert_file(src: Path, min_elo: int) -> list[dict]:
    rows: list[dict] = []
    if src.suffix == ".jsonl":
        for line in src.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            record = json.loads(line)
            if record.get("elo", 0) < min_elo:
                continue
            rows.append(
                {
                    "system": SYSTEM_PROMPT,
                    "user": battle_state_to_user_prompt(record),
                    "assistant": record_to_assistant(record),
                }
            )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Metamon → Gemma SFT JSONL")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--min-elo", type=int, default=1600)
    parser.add_argument("--format", type=str, default="")
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)

    all_rows: list[dict] = []
    if args.input.is_file():
        all_rows.extend(convert_file(args.input, args.min_elo))
    else:
        for path in sorted(args.input.rglob("*.jsonl")):
            all_rows.extend(convert_file(path, args.min_elo))

    with args.output.open("w", encoding="utf-8") as out:
        for row in all_rows:
            out.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(f"Wrote {len(all_rows)} prompts → {args.output}")


if __name__ == "__main__":
    main()