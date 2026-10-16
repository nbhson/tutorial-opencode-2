# Commands — Index tra cứu slash commands OpenCode 2 (13 lệnh)

> **Dành cho:** đang trong TUI cần tra 1 lệnh · **Đọc xong:** biết lệnh làm gì + gõ sao + ví dụ thật.
> Trong TUI gõ `/` rồi gõ tiếp để filter, Enter để chạy. `Ctrl+P` mở palette đầy đủ.

| Nhóm | Lệnh | Nó làm gì | Chi tiết |
|---|---|---|---|
| session | `/new` | session mới sạch | [session/new](./session/new/README.md) |
| session | `/sessions` | liệt kê + quay lại session cũ | [session/sessions](./session/sessions/README.md) |
| session | `/undo` | lùi checkpoint (lấy lại prompt để sửa) | [session/undo](./session/undo/README.md) |
| session | `/redo` | tiến lại sau undo | [session/redo](./session/redo/README.md) |
| session | `/diff` | xem diff cạnh session (`f` fullscreen) | [session/diff](./session/diff/README.md) |
| session | `/editor` | sửa prompt trong `$EDITOR` | [session/editor](./session/editor/README.md) |
| session | `/btw` | hỏi nhanh ngoài lề, không nhiễm context | [session/btw](./session/btw/README.md) |
| session | `/highlights` | xem lại changelog sau update | [session/highlights](./session/highlights/README.md) |
| model-agent | `/models` | đổi model giữa session | [model-agent/models](./model-agent/models/README.md) |
| model-agent | `/agents` | đổi agent primary giữa session | [model-agent/agents](./model-agent/agents/README.md) |
| model-agent | `/connect` | login provider / Zen / Go | [model-agent/connect](./model-agent/connect/README.md) |
| system-mcp | `/mcps` | xem/connect/auth MCP servers | [system-mcp/mcps](./system-mcp/mcps/README.md) |
| system-mcp | `/review` (custom, mẫu) | ví dụ command tự tạo từ `.opencode/commands/` | [system-mcp/review](./system-mcp/review/README.md) |

> Đã bỏ: `/share` (backend retired từ v1.19.1, v2 không có). Prompt của MCP thành `/<server>:<prompt>` (vd `/context_7:find_docs`) — xem [bài 08](../08-mcp-codemode.md).

Quay về: [../README.md](../README.md)
