# 11 — Sessions: new / continue / undo / compaction (đừng để context thối)

> **Dành cho:** người làm task dài · **Vấn đề:** 1 session ôm 3 task → context loạn, agent quên đầu bài · **Đọc xong:** quản vòng đời session + undo an toàn + sống với compaction · **Thời gian:** ~10 phút.

## Mục tiêu

- Biết khi nào `/new` vs tiếp tục vs fork.
- Dùng `/undo`/`/redo`, `/sessions`, `/diff`.
- Hiểu compaction (nén context) + `OPENCODE_DISABLE_AUTOCOMPACT`.

## Khái niệm cốt lõi

### 1. Vòng đời session

- Mới: `Ctrl+X N` hoặc `/new` — task mới = session mới.
- Tiếp: `Ctrl+X L` / `/sessions` / `Ctrl+O` mở lại; `opencode -c` / `-s <id>` từ CLI; `--fork` để rẽ nhánh không phá bản gốc.
- Tiêu đề/tóm tắt do agents ẩn (`title`, `summary`) lo — bạn không cần đặt tay.

**Nôm na:** session như vở làm bài — mỗi đề 1 vở mới; viết 3 đề chung 1 vở thì chấm không nổi.

### 2. Undo + Diff (lưới an toàn)

Agent sửa hỏng → `/undo` (lùi checkpoint), đổi ý → `/redo`. `/diff` mở diff cạnh session (`f` fullscreen) để review trước khi accept. Kết hợp bài 14 (worktree) cho task rủi ro cao.

### 3. Compaction (nén khi đầy)

Context đầy → OpenCode tự tóm tắt (compaction) để nói tiếp. Muốn tự chủ: `/summarize`-style thủ công trước khi nó tự nén, hoặc `OPENCODE_DISABLE_AUTOCOMPACT=1` để tắt (rồi tự `/new` đúng lúc).

**Vì sao quan trọng?** Session dài không compaction thì vừa đắt vừa lú; compaction ẩu thì mất quyết định quan trọng.
**Nếu làm sai?** Ôm 2 giờ trong 1 session rồi hỏi "sao nó quên yêu cầu đầu" — vì yêu cầu đầu đã bị nén mất.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Session mới/tiếp/fork | `/new`, `/sessions`, `-c/-s/--fork` | `/new`, `/clear`, checkpoints | `/clear`, continue/resume tương tự |
| Undo | `/undo` checkpoint | checkpoints/undo | undo/checkpoint tùy bản |
| Nén context | autocompact (+ tắt được) | summarize | compact/summarize |

## Lỗi thường gặp

```text
❌ SAI: thay agent sua sai 5 files van co sua tiep trong cung session
✅ ĐÚNG: /undo ngay, hoac /new + mo bai 05 (plan truoc) neu huong sai tu dau
```
**Bài học:** sửa sai hướng càng đi càng lún. Lùi sớm rẻ hơn chữa muộn.

## Best practices (kèm "vì sao")

- Trước compaction tự ghi 5 gạch: mục tiêu + quyết định + việc dở. **Vì sao?** Bản nén của máy giữ chữ, bản của bạn giữ ý.
- `/share` không còn (backend bỏ từ v1.19.1) — cần share thì copy transcript/diff. **Vì sao?** Đừng tìm nút đã khai tử.

## Bài tập nhỏ

1. (5 phút) Làm hỏng cố ý 1 file bằng agent rồi `/undo` — xem lưới an toàn hoạt động.
2. (5 phút) Làm 1 task dài đến khi compact, đọc bản tóm tắt xem mất gì.

> **Chốt bài 11:** task mới vở mới, sai thì undo sớm, dài thì tóm tắt trước khi máy nén hộ.
