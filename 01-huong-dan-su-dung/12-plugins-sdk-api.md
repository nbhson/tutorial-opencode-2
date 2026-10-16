# 12 — Plugins + SDK + API (mở rộng OpenCode như dân pro)

> **Dành cho:** người viết tool nội bộ / nhúng agent vào app · **Vấn đề:** plugin v1 chết trên v2, API v1 đổi contract · **Đọc xong:** cài/quản plugin v2 + biết khi nào dùng `@opencode/client` vs `@opencode/sdk` · **Thời gian:** ~15 phút.

## Mục tiêu

- Khai báo + quản lý plugin v2 (`plugins[]`, CLI `plugin *`).
- Biết TUI plugins stable + hot-reload.
- Phân biệt `@opencode/client` (gọi server) vs `@opencode/sdk` (embed engine).

## Khái niệm cốt lõi

### 1. Plugins v2 (API mới, hot-reload)

```jsonc
{ "plugins": [
  "opencode-acme-plugin",
  "opencode-acme-plugin@1.2.0",
  "@acme/opencode-plugin",
  "./plugins/local",
  { "package": "@acme/opencode-plugin", "options": { "agent": "reviewer", "strict": true } }
] }
```

Quản lý: `opencode plugin add/list/check/update/remove`. Relative resolve từ file config chứa entry. Disable bằng prefix `-` (`"-acme.reviewer"`), `*` cho tất cả. Hai plugin builtin (`opencode.config.policy`, `opencode.provider.opencode`) **không gỡ được** (giữ policy enforcement). Đồ án Figma chính chủ là ví dụ plugin kèm MCP + 6 skills.

**Nôm na:** plugin v2 như app trên điện thoại mới — app của đời máy cũ (v1) không cài được, phải tải bản mới; được cái cài không cần khởi động lại (hot-reload).

**Vì sao quan trọng?** Team tự rewrite ~80 tính năng thành internal plugins để chứng minh API đủ dùng — nghĩa là bạn cũng viết được sâu như họ.
**Nếu làm sai?** Copy plugin v1 sang rồi bảo "sao không load" — API khác hẳn, rename không cứu.

### 2. Server API mới + 2 package

- **Server API đổi contract.** Tích hợp cũ (fetch API v1) phải port. Dùng `@opencode/client` cho API mới đã release.
- **`@opencode/sdk`**: nhúng thẳng engine OpenCode (chính code chạy CLI) vào app/server của bạn, không cần HTTP listener; có bản Effect API; có guide chạy trên Cloudflare Durable Objects. Giữa 10/2026 SDK vẫn note "đang phát triển" — dùng sớm thì khóa version.
- **ACP**: `opencode acp` chạy Agent Client Protocol qua stdin/stdout cho editor tích hợp (xem bài 14).

```bash
opencode plugin add opencode-acme-plugin
opencode plugin list
opencode plugin check && opencode plugin update
```

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Mở rộng | plugins v2 (npm/Git/local, hot-reload) | Extensions/Marketplace, Agent Plugins 1.0 | plugins/marketplace tùy bản |
| Gọi từ code | `@opencode/client` (API mới) | Copilot SDK | SDK/API riêng |
| Nhúng engine | `@opencode/sdk` (in-process) | self-host proxy tương tự | headless tương tự |

## Lỗi thường gặp

```text
❌ SAI: pin plugin bang tag mo (latest) cho production CI
✅ ĐÚNG: pin exact version / full commit hash; unpinned moi auto-check update
```
**Bài học:** hot-reload + auto-check tiện cho dev, độc cho prod. Prod phải pin.

## Best practices (kèm "vì sao")

- Plugin nội bộ để local path + review như code. **Vì sao?** Plugin chạy với quyền user — supply-chain attack qua plugin là đường nhanh nhất.
- Tách CLI-only plugins ra config riêng khi nối remote server. **Vì sao?** Plugin CLI vẫn active khi nối remote — nhầm là rò quyền.

## Bài tập nhỏ

1. (10 phút) `opencode plugin list` xem máy có gì; thử `plugin check` 1 lần.
2. (10 phút) Đọc 1 plugin mẫu (Figma official) — kể được nó gồm MCP + skills nào.

> **Chốt bài 12:** v1 plugin/API coi như bỏ. V2: plugin cho mở rộng, client cho gọi, SDK cho nhúng.
