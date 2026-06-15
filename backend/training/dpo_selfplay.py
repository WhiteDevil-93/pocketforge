#!/usr/bin/env python3
"""
Step 3 — Self-play + DPO on current regulation.

Usage:
  python training/dpo_selfplay.py \\
    --lora ./models/pocketforge-lora \\
    --format champions-ma \\
    --games 10000 \\
    --output ./models/pocketforge-lora-dpo
"""

from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="PocketForge DPO self-play")
    parser.add_argument("--lora", type=Path, required=True)
    parser.add_argument("--format", default="champions-ma")
    parser.add_argument("--games", type=int, default=10_000)
    parser.add_argument("--showdown-url", default="http://localhost:8001")
    parser.add_argument("--output", type=Path, default=Path("./models/pocketforge-lora-dpo"))
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    print(
        f"DPO scaffold: run {args.games} games on {args.format} @ {args.showdown_url}, "
        f"save to {args.output}"
    )


if __name__ == "__main__":
    main()