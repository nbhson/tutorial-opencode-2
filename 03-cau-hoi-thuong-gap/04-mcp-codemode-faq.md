# FAQ 04 — MCP + Code Mode

## Q1: "Add MCP xong báo `needs authentication`?"

**Trả lời 1 câu:** Remote default OAuth — phải sign-in, sửa config không thay được credential cũ.

**Làm thế nào:** `/mcps` → chọn server → sign-in browser; hoặc `opencode mcp auth <name>`. Đổi account: `opencode mcp logout <name>` rồi auth lại. Server chỉ dùng API key thì `"oauth": false` + headers `{env:}`.

## Q2: "Khi nào tắt Code Mode (`codemode: false`)?"

**Trả lời 1 câu:** Chỉ khi server bắt buộc tools hiện native lên model.

**Giải thích:** Default `true` là để gom tools, đỡ bloat context. Tắt hàng loạt = quay về v1. `deny execute` gỡ cả cụm Code Mode của server đó.

## Q3: "Tool name lạ hoắc (`context_7_...`)?"

**Trả lời 1 câu:** Chuẩn hóa `<server>_<tool>` (ký tự lạ → `_`) — đặt tên server ngắn/sạch từ đầu.

**Làm thế nào:** server `context 7` + tool `resolve.library/id` → `context_7_resolve_library_id`. Chặn theo prefix: `{ "action": "context7_*", "resource": "*", "effect": "deny" }`.
