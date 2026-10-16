# Nhóm session (8 lệnh) — quản vòng đời session trong TUI

> **Dành cho:** người làm task dài · **Đọc xong:** biết khi nào new/sessions/undo/redo/diff/editor/btw/highlights.

| Lệnh | Nó làm gì | Khi nào dùng | Chi tiết |
|---|---|---|---|
| `/new` | session mới sạch | task mới | [new](./new/README.md) |
| `/sessions` | list + mở lại session cũ | tiếp việc hôm qua | [sessions](./sessions/README.md) |
| `/undo` | lùi checkpoint, prompt về composer | agent sửa hỏng | [undo](./undo/README.md) |
| `/redo` | tiến lại sau undo | undo nhầm | [redo](./redo/README.md) |
| `/diff` | diff cạnh session (`f` fullscreen) | review trước accept | [diff](./diff/README.md) |
| `/editor` | sửa prompt trong `$EDITOR` | prompt dài | [editor](./editor/README.md) |
| `/btw` | hỏi nhanh, không nhiễm context | thắc mắc giữa chừng | [btw](./btw/README.md) |
| `/highlights` | xem lại changelog update | sau update | [highlights](./highlights/README.md) |

Phím tắt tương đương: `Ctrl+X N` (new), `Ctrl+X L` (sessions), `Ctrl+X U` (undo), `Ctrl+X R` (redo), `Ctrl+X E` (editor).

Quay về: [README.md](README.md) · Bài tổng: [../11-sessions-undo-compaction.md](../11-sessions-undo-compaction.md)
