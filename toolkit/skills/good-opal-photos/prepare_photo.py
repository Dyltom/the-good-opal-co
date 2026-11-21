import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ASPECT = 4 / 5
FILL_WIDTH = 0.62
FILL_HEIGHT = 0.52
MAX_SIZE = (1600, 2000)
MEAN_TOLERANCE = 2.0


def load(path):
    image = Image.open(path)
    icc = image.info.get("icc_profile")
    image = ImageOps.exif_transpose(image).convert("RGB")
    return image, icc


def border_colour(pixels):
    edge = np.concatenate([pixels[0], pixels[-1], pixels[:, 0], pixels[:, -1]])
    return tuple(int(v) for v in np.median(edge, axis=0))


def find_stone(pixels, background, threshold):
    distance = np.linalg.norm(pixels.astype(np.int32) - np.array(background), axis=2)
    mask = distance > threshold
    height, width = mask.shape
    rows = np.where(mask.sum(axis=1) > width * 0.01)[0]
    cols = np.where(mask.sum(axis=0) > height * 0.01)[0]
    if len(rows) == 0 or len(cols) == 0:
        return None
    box = (int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1)
    if (box[2] - box[0]) * (box[3] - box[1]) > 0.9 * width * height:
        return None
    return box


def fit(start, size, limit):
    if size <= limit:
        return min(max(start, 0), limit - size)
    return start


def frame(box, image_size, fill_width, fill_height):
    stone_width = box[2] - box[0]
    stone_height = box[3] - box[1]
    canvas_width = max(stone_width / fill_width, stone_height / fill_height * ASPECT)
    canvas_height = canvas_width / ASPECT
    centre_x = (box[0] + box[2]) / 2
    centre_y = (box[1] + box[3]) / 2
    width, height = round(canvas_width), round(canvas_height)
    left = fit(round(centre_x - canvas_width / 2), width, image_size[0])
    top = fit(round(centre_y - canvas_height / 2), height, image_size[1])
    return left, top, left + width, top + height


def place(image, window, background):
    canvas = Image.new("RGB", (window[2] - window[0], window[3] - window[1]), background)
    canvas.paste(image, (-window[0], -window[1]))
    return canvas


def check(original, canvas, saved_path, window, box):
    output = Image.open(saved_path).convert("RGB")
    source = np.asarray(original)
    placed = np.asarray(canvas)
    x0, y0, x1, y1 = box
    copied = placed[y0 - window[1]:y1 - window[1], x0 - window[0]:x1 - window[0]]
    exact = copied.shape == source[y0:y1, x0:x1].shape and bool(np.array_equal(copied, source[y0:y1, x0:x1]))
    scale = output.width / canvas.width
    sx0, sy0 = round((x0 - window[0]) * scale), round((y0 - window[1]) * scale)
    sx1, sy1 = round((x1 - window[0]) * scale), round((y1 - window[1]) * scale)
    before = source[y0:y1, x0:x1].reshape(-1, 3).mean(axis=0)
    after = np.asarray(output)[sy0:sy1, sx0:sx1].reshape(-1, 3).mean(axis=0)
    drift = float(np.abs(before - after).max())
    return {
        "stone_box": list(box),
        "stone_pixels_copied_exactly": exact,
        "stone_mean_rgb_before": [round(float(v), 2) for v in before],
        "stone_mean_rgb_after": [round(float(v), 2) for v in after],
        "stone_mean_drift": round(drift, 3),
        "passed": exact and drift <= MEAN_TOLERANCE,
    }


def main():
    parser = argparse.ArgumentParser(description="Frame an opal photo for goodopalco.com without changing its colour.")
    parser.add_argument("source")
    parser.add_argument("output")
    parser.add_argument("--rotate", type=int, choices=[0, 90, 180, 270], default=0, help="Quarter turns only, counter-clockwise")
    parser.add_argument("--box", help="Stone box x0,y0,x1,y1 in the source photo if auto-detection picks the wrong area")
    parser.add_argument("--threshold", type=float, default=40)
    parser.add_argument("--fill-width", type=float, default=FILL_WIDTH)
    parser.add_argument("--fill-height", type=float, default=FILL_HEIGHT)
    parser.add_argument("--quality", type=int, default=90)
    args = parser.parse_args()

    original, icc = load(args.source)
    if args.rotate:
        original = original.transpose({90: Image.Transpose.ROTATE_90, 180: Image.Transpose.ROTATE_180, 270: Image.Transpose.ROTATE_270}[args.rotate])
    pixels = np.asarray(original)
    background = border_colour(pixels)
    box = tuple(int(v) for v in args.box.split(",")) if args.box else find_stone(pixels, background, args.threshold)
    if box is None:
        print(json.dumps({"passed": False, "error": "Could not find the stone. Look at the photo and pass --box x0,y0,x1,y1."}))
        sys.exit(2)

    window = frame(box, original.size, args.fill_width, args.fill_height)
    canvas = place(original, window, background)
    output = canvas.copy()
    output.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    output.save(args.output, "JPEG", quality=args.quality, optimize=True, progressive=True, icc_profile=icc)

    report = check(original, canvas, args.output, window, box)
    report.update({
        "source_size": list(original.size),
        "output_size": list(output.size),
        "padded": window[0] < 0 or window[1] < 0 or window[2] > original.width or window[3] > original.height,
        "padding_rgb": list(background),
        "bytes": Path(args.output).stat().st_size,
    })
    print(json.dumps(report, indent=2))
    if not report["passed"]:
        Path(args.output).unlink()
        sys.exit(1)


if __name__ == "__main__":
    main()
