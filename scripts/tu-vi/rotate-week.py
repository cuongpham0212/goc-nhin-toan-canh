import frontmatter
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# ===============================
# CONFIG
# ===============================

CONTENT_DIR = Path("content/tu-vi/cung-hoang-dao")
SUMMARY_TEMPLATE_FILE = Path("scripts/tu-vi/summary-templates.json")
ARCHIVE_LIMIT = 8   # giữ tối đa 8 tuần đã qua

# ===============================
# LOAD SUMMARY TEMPLATES
# ===============================

with open(SUMMARY_TEMPLATE_FILE, "r", encoding="utf-8") as f:
    SUMMARY_TEMPLATES = json.load(f)

# ===============================
# HELPERS
# ===============================

def parse_date(d):
    return datetime.strptime(d, "%d/%m/%Y")

def format_date(d):
    return d.strftime("%d/%m/%Y")

def week_id_from_date(d):
    return d.strftime("%Y-w%U")

def generate_next_week(from_date_str):
    start = parse_date(from_date_str)
    next_start = start + timedelta(days=7)
    next_end = next_start + timedelta(days=6)
    return {
        "tu_ngay": format_date(next_start),
        "den_ngay": format_date(next_end)
    }

def generate_summary(start, end):
    opener = random.choice(SUMMARY_TEMPLATES["openers"])
    theme = random.choice(SUMMARY_TEMPLATES["themes"])
    focus = random.choice(SUMMARY_TEMPLATES["focus"])
    closer = random.choice(SUMMARY_TEMPLATES["closers"])

    return (
        f"{opener} giai đoạn {start} – {end} cho thấy {theme} "
        f"{focus} {closer}"
    )

def build_archive_item(tuan):
    start_date = parse_date(tuan["tu_ngay"])
    summary = generate_summary(tuan["tu_ngay"], tuan["den_ngay"])

    return {
        "week_id": week_id_from_date(start_date),
        "tu_ngay": tuan["tu_ngay"],
        "den_ngay": tuan["den_ngay"],
        "summary": summary
    }

# ===============================
# MAIN LOGIC
# ===============================

def rotate_file(md_file):
    post = frontmatter.load(md_file)

    if "tu_vi_tuan" not in post or "tu_vi_next" not in post:
        print(f"⚠ Bỏ qua (thiếu tu_vi_tuan / tu_vi_next): {md_file.name}")
        return

    current = post["tu_vi_tuan"]
    next_week = post["tu_vi_next"]
    archive = post.get("tu_vi_archive", [])

    # 1. Đẩy tuần hiện tại vào archive
    archive.insert(0, build_archive_item(current))

    # 2. Giữ archive gọn
    archive = archive[:ARCHIVE_LIMIT]

    # 3. Luân chuyển tuần
    post["tu_vi_tuan"] = next_week

    # 4. Sinh tuần kế tiếp tự động
    post["tu_vi_next"] = generate_next_week(next_week["tu_ngay"])

    # 5. Cập nhật archive + lastmod
    post["tu_vi_archive"] = archive
    post["lastmod"] = datetime.now().strftime("%Y-%m-%d")

    frontmatter.dump(post, md_file)
    print(f"✔ Updated: {md_file.name}")

# ===============================
# RUN FOR ALL SIGNS
# ===============================

def main():
    files = sorted(CONTENT_DIR.glob("*.md"))

    if not files:
        print("❌ Không tìm thấy file tử vi")
        return

    print(f"▶ Bắt đầu cập nhật {len(files)} cung hoàng đạo...\n")

    for md in files:
        rotate_file(md)

    print("\n✅ Hoàn tất cập nhật tử vi tuần")

if __name__ == "__main__":
    main()
