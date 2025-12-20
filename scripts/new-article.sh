#!/bin/bash

# ===== INPUT =====
read -p "Slug bài viết (vd: ai-ky-la-gi): " SLUG
read -p "Topic (vd: tam-ly-con-nguoi): " TOPIC
read -p "Loại bài? (article / pillar): " TYPE

DATE=$(date +"%Y-%m-%d")
TITLE=$(echo "$SLUG" | sed 's/-/ /g' | sed 's/.*/\u&/')

# ===== PATH =====
DIR="content/$TOPIC"
FILE="$DIR/$SLUG.md"

if [ "$TYPE" = "pillar" ]; then
  FILE="$DIR/_index.md"
fi

mkdir -p "$DIR"

# ===== FRONT MATTER =====
cat <<EOF > "$FILE"
---
title: "$TITLE"
description: ""
date: $DATE
lastmod: $DATE
author: "Góc Nhìn Toàn Cảnh"
image: "/images/og-default.jpg"

type: "$TYPE"
pillar: $( [ "$TYPE" = "pillar" ] && echo true || echo false )
topic: "$TOPIC"
related: []

draft: true
---

EOF

echo "✅ Đã tạo: $FILE"
