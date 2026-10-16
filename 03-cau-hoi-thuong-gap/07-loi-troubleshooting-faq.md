# FAQ 07 — Lỗi & Troubleshooting

## Q1: "Agent sửa hỏng 5 files — cứu sao?"

**Trả lời 1 câu:** `/undo` ngay (hoặc `/redo` nếu undo nhầm), đừng cố sửa tiếp trong session sai hướng.

**Làm thế nào:** `/diff` xem hỏng đâu → `/undo` → nếu sai từ plan thì `/new` + làm lại plan. Task rủi ro cao thì worktree riêng từ đầu (bài 14).

## Q2: "Model quên yêu cầu đầu task dài?"

**Trả lời 1 câu:** Context bị compaction — task mới thì session mới, trước khi dài thì tóm tắt tay 5 gạch.

**Làm thế nào:** mục tiêu + quyết định + việc dở → ghi trước khi máy nén. Tắt auto nếu cần: `OPENCODE_DISABLE_AUTOCOMPACT=1`.

## Q3: "MCP connect fail / timeout?"

**Trả lời 1 câu:** Check 3 tầng: command/URL → `disabled`/`timeout` → `protocol` (server 2026-07-28 cần `"protocol": "auto"`).

```jsonc
{ "mcp": { "timeout": { "startup": 45000, "catalog": 30000, "execution": 600000 } } }
```

**Nếu vẫn lỗi:** `opencode mcp list` + `/mcps` xem state, thử local `npx` tay ngoài OpenCode để loại trừ mạng.
