#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: toolkit/package-skills.sh OUTPUT_DIR" >&2
  exit 64
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$(mkdir -p "$1" && cd "$1" && pwd)"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

cp -R "$root/toolkit/skills/." "$stage/"
cp "$root/docs/OWNER-GUIDE.md" "$stage/good-opal-site-guide/OWNER-GUIDE.md"

for dir in "$stage"/*/; do
  name="$(basename "$dir")"
  rm -f "$out/$name.zip"
  (cd "$stage" && python3 -m zipfile -c "$out/$name.zip" "$name")
  echo "$out/$name.zip"
done
