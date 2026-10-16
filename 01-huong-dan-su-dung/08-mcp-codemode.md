# 08 — MCP + Code Mode (cắm tool ngoài mà không bloat context)

> **Dành cho:** người cần agent chạm tới GitHub/Sentry/docs/DB... · **Vấn đề:** càng add MCP càng nặng context, OAuth lằng nhằng · **Đọc xong:** add local/remote server + auth + `codemode` đúng chỗ · **Thời gian:** ~15 phút.

## Mục tiêu

- Add MCP local (stdio) + remote (Streamable HTTP) bằng CLI và tay.
- Auth OAuth (`/mcps`, `mcp auth/logout`) + headers bí mật qua `{env:}`.
- Hiểu Code Mode default + khi nào `codemode: false`.

## Khái niệm cốt lõi

### 1. MCP trong OpenCode là gì

**1 câu:** MCP là chuẩn cắm tool/data ngoài (tools, prompts, resources) vào agent; OpenCode gom chúng qua Code Mode để đỡ tốn context.

**Nôm na:** MCP servers như gian hàng trong chợ — agent không cần mang cả chợ theo, cần gì thì viết giấy (script) sai người đi lấy gộp một chuyến.

```bash
opencode mcp add context7 --url https://mcp.context7.com/mcp
opencode mcp list   # phai thay: context7 connected
opencode mcp add everything -- npx -y @modelcontextprotocol/server-everything
opencode mcp add everything --env LOG_LEVEL=info -- npx -y @modelcontextprotocol/server-everything
```

Global cho mọi project: thêm `--global`.

### 2. Config tay (`mcp.servers`)

```jsonc
{
  "mcp": {
    "servers": {
      "everything": { "type": "local",
        "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
        "cwd": ".",
        "environment": { "LOG_LEVEL": "info", "MCP_API_KEY": "{env:MCP_API_KEY}" } },
      "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" }
    },
    "timeout": { "startup": 45000, "catalog": 30000, "execution": 600000 }
  }
}
```

Nhớ: V2 key là `mcp.servers` (không đặt tên server ngay dưới `mcp`), tắt bằng `disabled: true` (không còn `enabled`). Project config cùng tên **replace cả object** — override thì chép đủ field.

Remote + API key (tắt OAuth khi server chỉ dùng header):

```jsonc
{ "mcp": { "servers": { "ctx": {
  "type": "remote", "url": "https://mcp.context7.com/mcp",
  "oauth": false, "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" } } } } }
```

OAuth: default bật, PKCE + refresh, credential lưu ngoài project config. Server báo `needs authentication` → `/mcps` chọn server sign-in, hoặc `opencode mcp auth sentry` / `opencode mcp logout sentry`.

### 3. Code Mode default + đặt tên + phân quyền

- `codemode` default `true` → tools gom theo server (`tools.context_7.resolve_library_id(...)`), agent viết script gọi gộp.
- `codemode: false` → tools hiện native lên model (chỉ khi server bắt buộc).
- Tên tool chuẩn hóa: `<server>_<tool>` (ký tự lạ → `_`). Prompt của MCP thành command `/server:prompt`.
- Chặn tool không cần disconnect server:

```jsonc
{ "permissions": [{ "action": "context7_*", "resource": "*", "effect": "deny" }] }
```

Resources đọc qua `list_mcp_resources` / `read_mcp_resource`, phân quyền bằng `opencode_list_mcp_resources` / `opencode_read_mcp_resource`. Server gửi instructions lúc init sẽ được cộng vào system prompt (trừ khi bạn deny hết tools nó).

**Vì sao quan trọng?** Đây là khác biệt lớn nhất của OpenCode 2 với mọi agent khác ở mảng MCP.
**Nếu làm sai?** Add 10 servers + tắt Code Mode + allow hết → context đầy tools ít dùng, model gọi sai, bill tăng.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Thêm server | `opencode mcp add` + `mcp.servers` | `.vscode/mcp.json` | `.mcp.json` |
| Gom tools | Code Mode default | native | native |
| Auth | OAuth PKCE + headers `{env:}` | OAuth/inputs tương tự | OAuth/headers tương tự |

## Lỗi thường gặp

### 1. `needs authentication` mãi không hết

```text
❌ SAI: doi config, restart TUI, van needs authentication
✅ ĐÚNG: /mcps -> chon server -> sign-in browser; neu doi account: opencode mcp logout <name> roi auth lai
```
**Bài học:** OAuth credential nằm ngoài config file — sửa file không thay được credential cũ.

### 2. `protocol` với server MCP 2026-07-28 mới

```text
❌ SAI: server doi hoi handshake moi nhung de legacy -> connect fail/timeout
✅ ĐÚNG: set "protocol": "auto" (probe roi fallback) hoac "2026-07-28" cho server do
```
**Bài học:** default `legacy` (đến 2025-11-25). Server hiện đại cần opt-in.

## Best practices (kèm "vì sao")

- Chỉ add server task này cần; xong thì `disabled: true` thay vì để connected. **Vì sao?** MCP tools vẫn tốn catalog + instructions dù Code Mode đã gom.
- Server tên ngắn, không dấu/cách (`sentry`, `ctx7`). **Vì sao?** Tên thành prefix mọi tool; tên xấu → tool name xấu, model gọi nhầm.

## Bài tập nhỏ

1. (10 phút) Add `context7` remote, `opencode mcp list` + `/mcps` verify `connected`, hỏi 1 câu bắt dùng tool nó.
2. (5 phút) Thử `codemode: false` cho 1 server ít dùng, so cảm giác list tools (rồi bật lại).

> **Chốt bài 08:** add ít thôi, để Code Mode gom, secrets qua env, OAuth thì auth trong `/mcps`.
