# `/sessions` — liệt kê + quay lại session cũ

> **Dành cho:** tiếp việc hôm qua · **Đọc xong:** mở lại đúng session, biết fork khi cần (~2 phút)

## 1 câu nôm na

Như kệ vở cũ có nhãn — muốn làm tiếp đề nào thì rút đúng vở đó ra.

## Vì sao dùng `/sessions`?

Đóng TUI không mất việc: sessions lưu lại, mở lại đúng context đang dở thay vì kể lại từ đầu.

## Khi nào dùng / khi nào đừng

- Dùng khi: tiếp task dang dở, đối chiếu 2 hướng làm cũ.
- ĐỪNG dùng khi: task đã xong hẳn (thì `/new` cho sạch).

## Cách gọi (copy-paste)

```text
/sessions
```
Phím tắt: `Ctrl+X` rồi `L`; `Ctrl+O` mở recents (sessions + projects). CLI: `opencode -c` (tiếp cuối), `opencode -s <id>`, `--fork` để rẽ nhánh.

## Ví dụ thật

```text
/sessions
-> chon "rate-limit login (hom qua)" -> prompt tiep "lam phase 2 theo plan"
```

**Kết quả mong đợi:** đúng session cũ, context + plan còn nguyên.
**✅ Verify:** agent nhắc được quyết định hôm qua (vd "phase 1 đã xong").

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: mo session cu de lam task moi hoan toan khac
✅ ĐÚNG: tiep viec do thi /sessions; viec moi thi /new (can thi --fork de giu ban goc)
```
**Bài học:** rút nhầm vở thì viết nhầm đề.

## So sánh với Copilot / Claude Code

| Việc | OpenCode (`/sessions`) | Copilot | Claude Code |
|---|---|---|---|
| Mở lại | `/sessions`, `-c/-s` | history/checkpoints | resume/continue tương tự |
| Rẽ nhánh | `--fork` | fork/thread tương tự | tương tự tùy bản |

## Best practices (kèm "vì sao")

- Session thử nghiệm liều thì `--fork` trước khi đụng. **Vì sao?** Bản gốc còn nguyên, hỏng thì bỏ nhánh.

## Bài tập nhỏ

1. (3 phút) `/sessions` mở 1 session cũ, hỏi 1 câu tiếp nối — xem nó còn nhớ không.

## Tham khảo

- Index nhóm: [README.md](README.md) · Bài tổng: [../../11-sessions-undo-compaction.md](../../11-sessions-undo-compaction.md)

> Câu chốt: việc dở thì `/sessions`, việc mới thì `/new` — rút đúng vở.
