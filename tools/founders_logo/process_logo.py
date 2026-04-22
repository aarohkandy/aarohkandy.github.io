from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE = Path.home() / "Downloads" / "f_inc_logo.avif"
DEFAULT_OUTPUT = ROOT / "assets" / "f_inc_logo.png"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare the Founders Inc. logo web asset.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--size", type=int, default=256)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not args.source.exists():
        raise FileNotFoundError(f"Logo source not found: {args.source}")

    args.output.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(args.source) as image:
        image = ImageOps.contain(image.convert("RGBA"), (args.size, args.size), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (args.size, args.size), (0, 0, 0, 255))
        offset = ((args.size - image.width) // 2, (args.size - image.height) // 2)
        canvas.alpha_composite(image, offset)
        canvas.save(args.output, optimize=True)

    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
