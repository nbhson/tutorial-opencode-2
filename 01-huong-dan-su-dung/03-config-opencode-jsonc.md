# 03 — Config `opencode.jsonc` (viết một lần, cả team nhờ)

> **Dành cho:** người setup repo/team · **Vấn đề:** config merge nhiều tầng (system/global/project/env), sai thứ tự là luật viết ra không có hiệu lực · **Đọc xong:** viết `opencode.jsonc` đúng scope + dùng `{env:}` + `$schema` · **Thời gian:** ~15 phút.

## Mục tiêu

- Kể được thứ tự merge + file nào thắng file nào.
- Viết config có `$schema`, `model`, `permissions`, `mcp.servers`, `{env:}`.
- Phân biệt `opencode.jsonc` (server) vs `cli.json` (TUI client).

## Khái niệm cốt lõi

### 1. Thứ tự merge (ai thắng ai)

**1 câu:** Config merge từ rộng → hẹp; với settings thường thì hẹp thắng, với `policies` thì rộng (org/system) thắng.

| Độ ưu tiên | Nguồn |
|---|---|
| Thấp → cao (settings) | remote `.well-known` → global `~/.config/opencode/opencode.json(c)` → `OPENCODE_CONFIG` → project direct → `.opencode/opencode.json(c)` → `OPENCODE_CONFIG_CONTENT` → system managed → macOS MDM |
| Ngược lại (policies) | Console workspace/org + system managed luôn có tiếng nói cuối |

**Nôm na:** settings như "quy định phòng ban" (team gần bạn được linh hoạt), policies như "luật công ty" (càng trên càng to).

```jsonc
{
  "$schema": "https://opencode.ai/config.json", // de editor validate + autocomplete
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5"
}
```

**Vì sao quan trọng?** Viết `deny git push` ở project mà org `allow` thì settings thua — phải hiểu để không tưởng "config không ăn".
**Nếu làm sai?** Nhồi mọi thứ vào global rồi than "sang máy khác mất config project" — sai scope.

### 2. Hai file config hay nhầm

- `opencode.json(c)`: config **server/runtime** (model, providers, permissions, agents, MCP, skills, plugins, policies). Service đọc.
- `~/.config/opencode/cli.json`: config **riêng TUI client** (theme, keybinds, `highlights`). TUI đọc, service không đọc.

### 3. `{env:}` + `{file:}` (đừng hardcode secrets)

```jsonc
{
  "mcp": { "servers": { "private": {
    "type": "remote",
    "url": "https://mcp.example.com/mcp",
    "headers": { "Authorization": "Bearer {env:MCP_API_KEY}" }
  } } }
}
```

Shell `$NAME` **không** expand trong JSON — chỉ `{env:NAME}` mới có tác dụng.

## Ví dụ chi tiết (template team nhỏ)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "permissions": [
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git diff *", "effect": "allow" },
    { "action": "shell", "resource": "git push *", "effect": "deny" },
    { "action": "read", "resource": "*.env", "effect": "deny" }
  ],
  "mcp": { "servers": {
    "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" }
  } }
}
```

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| File luật repo | `opencode.jsonc` + `AGENTS.md` | `.github/copilot-instructions.md` + `AGENTS.md` | `CLAUDE.md` + `.claude/` |
| Secrets | `{env:}` | `${input}`/`${env}` trong `mcp.json` | env trong `.mcp.json` |
| Khóa cứng org | `policies` thắng mọi tầng | policy/allowlist | managed permissions |

## Lỗi thường gặp

### 1. Hai format V1+V2 cùng set 1 giá trị

```text
❌ SAI: de ca `permission: {...}` (v1) va `permissions: [...]` (v2) roi doan "cai nao thang"
✅ ĐÚNG: xoa dang v1, giu native v2; khi ca hai cung set thi V2 thang bat ke thu tu key
```
**Bài học:** coexist chỉ để migrate dần, không phải để sống chung lâu dài. Mỗi nested entry (agent/provider/model...) giữ thuần 1 format.

## Best practices (kèm "vì sao")

- Mọi `opencode.jsonc` đều có `$schema`. **Vì sao?** Validate + autocomplete ngay trong editor, sai key biết liền.
- Relative path trong `skills` tính từ **cwd**, trong `plugins` tính từ **file config chứa entry**. **Vì sao?** Nhầm gốc là lỗi "file not found" ma.

## Bài tập nhỏ

1. (10 phút) Copy `templates/opencode.jsonc` vào 1 repo thử, `opencode mcp list` xem service đọc được gì.
2. (5 phút) Cố tình sai 1 key, xem editor báo schema thế nào.

> **Chốt bài 03:** nhớ "settings hẹp thắng, policies rộng thắng" + secrets qua `{env:}` là bạn đã hơn nửa team.
