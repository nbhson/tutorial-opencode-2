# FAQ 06 — Plugins, SDK & API

## Q1: "Plugin v1 sao không load trên v2?"

**Trả lời 1 câu:** Plugin API viết lại hoàn toàn — phải port, rename không đủ.

**Làm thế nào:** `opencode plugin list/check/update`; pin exact version cho prod; local path review như code. Hai builtin policy/provider không gỡ được là cố ý.

## Q2: "`@opencode/client` vs `@opencode/sdk`?"

**Trả lời 1 câu:** Client = gọi server API mới từ ngoài; SDK = nhúng cả engine vào app bạn (kể cả Durable Objects).

**Giải thích:** Script fetch API v1 phải port sang API + client mới. SDK giữa 10/2026 vẫn "đang phát triển" — khóa version khi dùng sớm.

## Q3: "Tích hợp editor (VS Code) thế nào?"

**Trả lời 1 câu:** `opencode acp` (Agent Client Protocol qua stdin/stdout) — update extension lên bản nói ACP v2.

**Nếu vẫn lỗi:** extension cũ gọi `--port` đã gỡ → update là hết.
