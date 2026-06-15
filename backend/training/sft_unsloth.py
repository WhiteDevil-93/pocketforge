#!/usr/bin/env python3
"""
Step 2 — Supervised fine-tuning with Unsloth on RTX 4050.

Usage:
  python training/sft_unsloth.py \\
    --prompts ./data/metamon/prompts.jsonl \\
    --output ./models/pocketforge-lora
"""

from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="PocketForge Gemma SFT (Unsloth)")
    parser.add_argument("--base-model", default="google/gemma-4-e2b-qat")
    parser.add_argument("--prompts", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("./models/pocketforge-lora"))
    parser.add_argument("--epochs", type=int, default=1)
    parser.add_argument("--rank", type=int, default=16)
    args = parser.parse_args()

    try:
        import unsloth  # noqa: F401
    except ImportError as exc:
        raise SystemExit(
            "Install training deps: pip install -r training/requirements.txt"
        ) from exc

    args.output.mkdir(parents=True, exist_ok=True)
    print(f"SFT scaffold ready. Wire Unsloth trainer, then save LoRA to {args.output}")


if __name__ == "__main__":
    main()