---
title: "Chuyện đời đầu tiên"
date: 2025-01-03
description: "Một bài viết thử để xác nhận Hugo có render đúng section Chuyện đời hay không."
---

## Đây là bài test cho section Chuyện đời

Bài viết này **không nhằm nội dung**,  
mục đích duy nhất là kiểm tra:

- Hugo có nhận diện `chuyen-doi` là **section thực sự**
- `_index.md` của section có được dùng để render title hay không

---

## Nếu anh đang đọc được bài này

Điều đó có nghĩa là:

- Section `chuyen-doi` **đã có bài con**
- Hugo **bắt buộc phải coi đây là section**
- Mọi logic fallback theo slug **phải bị loại bỏ**

---

## Kết luận của bài test

Sau khi dán bài này:

- Truy cập `/chuyen-doi/`
- Quan sát **title lớn đầu trang**

👉 Nếu title vẫn là **`chuyen-doi`**  
→ chắc chắn **template đang đọc sai context**

👉 Nếu title chuyển thành **“Chuyện đời”**  
→ ta xác nhận **Hugo OK, lỗi nằm ở template hiện tại**

