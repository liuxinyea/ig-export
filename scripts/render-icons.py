#!/usr/bin/env python3
"""Regenerate LeadFlow extension PNG icons from the approved 128px source."""

from pathlib import Path
import sys

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ICONS_DIR = ROOT / "extension" / "icons"
SOURCE = ICONS_DIR / "leadflow-exporter-128.png"
SIZES = (16, 32, 64, 128)


def main() -> int:
    if not SOURCE.is_file():
        print(f"[icons] Source icon not found: {SOURCE}", file=sys.stderr)
        return 1

    with Image.open(SOURCE) as source:
        source = source.convert("RGBA")
        if source.size != (128, 128):
            print(
                f"[icons] Expected a 128x128 source, got {source.width}x{source.height}.",
                file=sys.stderr,
            )
            return 1

        for size in SIZES:
            output = ICONS_DIR / f"leadflow-exporter-{size}.png"
            image = source if size == 128 else source.resize((size, size), Image.Resampling.LANCZOS)
            image.save(output, format="PNG", optimize=True)
            print(f"[icons] Wrote {output.relative_to(ROOT)} ({size}x{size})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
