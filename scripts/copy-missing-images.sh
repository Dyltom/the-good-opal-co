#!/bin/bash

BACKUP="/Users/dylanhenderson/the-good-opal-co/gdopalco-bkup"
PUBLIC="/Users/dylanhenderson/the-good-opal-co/public/images/products"

missing=(
"20210606_145446.jpg"
"20210714_171016-e1626258257167.jpg"
"20210714_171803-e1626258427260.jpg"
"20210809_182256-e1628508066813.jpg"
"20210612_163955-e1623581983869.jpg"
"20210809_181757-e1628507947884.jpg"
"20210809_181013-e1628504859538.jpg"
"20210612_165338-e1623583381523.jpg"
"20210505_103931.png"
"20210705_103017-e1625471447217.jpg"
"20210119_132504-scaled-e1614300991943.jpg"
"20210627_202949.jpg"
"20200913_163116.jpg"
"20210627_202327.jpg"
"20200919_151934-scaled.jpg"
"20200913_162038-scaled.jpg"
"20200913_160334.jpg"
"20200913_162542.jpg"
"20200913_155717.jpg"
"20200913_163304.jpg"
"20200913_152424-scaled.jpg"
"20200913_162929.jpg"
"20200902_170003.jpg"
"20200902_193708.jpg"
"20200902_155844-1.jpg"
"20200902_154918-scaled.jpg"
"20200902_153811-1.jpg"
"20200902_151336-scaled.jpg"
)

found_count=0
for img in "${missing[@]}"; do
  found=$(find "$BACKUP" -name "$img" -type f 2>/dev/null | head -1)
  if [ -n "$found" ]; then
    cp "$found" "$PUBLIC/"
    echo "✓ $img"
    ((found_count++))
  else
    echo "✗ NOT FOUND: $img"
  fi
done

echo ""
echo "✅ Copied $found_count missing images"
