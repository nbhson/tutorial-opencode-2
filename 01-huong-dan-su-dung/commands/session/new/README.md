# `/new` — session mới sạch

> **Dành cho:** bắt đầu task mới · **Đọc xong:** biết khi nào new thay vì ôm session cũ (~2 phút)

## 1 câu nôm na

Như lấy vở mới cho đề mới — context cũ là nhiễu, vở mới rẻ hơn tẩy xóa.

## Vì sao dùng `/new`?

Session cũ chứa quyết định + code dở của task khác; model đọc hết vào context rồi đoán mò. Task mới = session mới là cách rẻ nhất giữ agent tỉnh.

## Khi nào dùng / khi nào đừng

- Dùng khi: đổi task, đổi branch, session bắt đầu loạn.
- ĐỪNG dùng khi: chỉ muốn hỏi thêm về đúng task đang làm (prompt tiếp trong session hiện tại).

## Cách gọi (copy-paste)

```text
/new
```
Phím tắt: `Ctrl+X` rồi `N`.

## Ví dụ thật

```text
/new
"them rate-limit 5 req/phut cho POST /api/login, khong dung schema DB"
```

**Kết quả mong đợi:** session trắng, agent chỉ thấy task mới + `AGENTS.md`.
**✅ Verify:** tiêu đề session phản ánh đúng task mới, không nhắc gì task cũ.

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: 1 session ôm 3 task (login + payments + release) roi hoi "sao no nham"
✅ ĐÚNG: moi task 1 /new; can tiep tuc thi /sessions mo lai dung session
```
**Bài học:** session là vở, không phải thùng rác.

## So sánh với Copilot / Claude Code

| Việc | OpenCode (`/new`) | Copilot | Claude Code |
|---|---|---|---|
| Session mới | `/new` | `/new` (Chat) | `/clear` |
| Xóa turns mà giữ luật | `/new` (luật từ file, không mất) | `/clear` (giữ instructions) | `/clear` tương tự |

## Best practices (kèm "vì sao")

- Trước `/new`, chốt 5 gạch task cũ (mục tiêu + việc dở) nếu còn dang dở. **Vì sao?** Vở mới không có trang cũ — ghi trước kẻo quên.

## Bài tập nhỏ

1. (2 phút) `/new` rồi hỏi `"tom tat luat repo nay"` — xem session sạch + `AGENTS.md` vẫn được đọc.

## Tham khảo

- Index nhóm: [README.md](README.md) · Bài tổng: [../../11-sessions-undo-compaction.md](../../11-sessions-undo-compaction.md)

> Câu chốt: đổi task thì `/new` trước, prompt sau — 2 giây này tiết kiệm 20 phút gỡ rối.
