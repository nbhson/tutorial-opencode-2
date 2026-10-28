# Tips 07 — Teamwork chuẩn hóa (một cách dùng chung)

> **Dành cho:** tech lead · **Vấn đề:** mỗi người 1 config, 1 model, 1 kiểu prompt · **Đọc xong:** dựng bộ khung team: config + AGENTS + skills + policies · **Thời gian:** ~15 phút.

## Mục tiêu

- Commit bộ khung tối thiểu: config + agents + commands + skills + AGENTS.md.
- Org khóa cứng bằng policies; secrets không bao giờ nằm trong git.
- Onboard member mới < 15 phút mà không hỏi lại ai.

## Bộ khung tối thiểu (commit vào repo)

```
opencode.jsonc            # model mac dinh + permissions co ban + mcp team
.opencode/agents/         # reviewer, planner chuan team
.opencode/commands/       # /review, /write-tests theo mau team
.opencode/skills/         # git-release, review-pr...
AGENTS.md                 # stack + lenh + cam + tro skills
```

**Vì sao quan trọng?** Agent nhân mọi thói quen lên số người — 1 config ẩu × 10 dev = 10 cách phá repo. Config team thì ai cũng chạy đúng một chuẩn, member mới onboard là có ngay reviewer + command chuẩn.
**Nếu làm sai?** Mỗi người BYOK model khác nhau, không pin → "máy tôi chạy, máy bạn fail" phiên bản agent. Không pin model = không review cùng một tiêu chí, kết quả agent mỗi người mỗi kiểu.

## Ví dụ copy-paste

### 1. `opencode.jsonc` khung team (commit vào repo, không có secret)

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "permissions": [
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git diff *", "effect": "allow" },
    { "action": "shell", "resource": "git push *", "effect": "deny" }
  ]
}
```

Quy tắc **sau cùng thắng** (last match wins) — để exception cụ thể sau rule rộng (verify: docs/permissions).

### 2. Policies khóa cứng org (không cho project mở khóa)

```jsonc
{
  "policies": [
    { "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" },
    { "action": "tool.use", "resource": "shell:git push *", "effect": "deny" },
    { "action": "provider.use", "resource": "*", "effect": "deny" },
    { "action": "provider.use", "resource": "anthropic", "effect": "allow" }
  ]
}
```

Policies **hard-deny sau khi permissions + saved approvals chạy** — biến allow/ask thành deny, không bao giờ cấp quyền ngược lại (verify: docs/permissions#policies). Global + Console-managed policies đè lên config project — đó là cách org chặn điều mà repo muốn cho phép.

### 3. Secrets qua env, không commit

```jsonc title="opencode.jsonc"
{
  "mcp": {
    "servers": {
      "company-tools": {
        "type": "remote",
        "url": "https://mcp.example.com/mcp",
        "headers": { "API_KEY": "{env:MCP_API_KEY}" }
      }
    }
  }
}
```

Kèm `.env.example` (commit) + docs onboard ghi rõ `export` biến nào. `{env:NAME}` không set → chuỗi rỗng — lỗi lúc chạy, không lộ key (verify: docs/config — Variables).

### 4. Agent chuẩn team: reviewer chỉ đọc

```md title=".opencode/agents/reviewer.md"
---
description: Review code khong sua file - dung khi duoc hoi review
mode: subagent
model: anthropic/claude-sonnet-4-5#high
permissions:
  - action: edit
    resource: "*"
    effect: deny
---

Review thay doi hien tai. Tra ve findings theo do nghiem trong, kem file + dong.
Khong sua file.
```

Org khóa cứng: `policies` ở system/Console (`deny provider` lạ, `deny shell:sudo *`), secrets qua `{env:}` + `.env.example` (không commit `.env`). Config team không pin được provider/model của member — dùng policy `provider.use` để chặn provider lạ (verify: docs/policies).

## Onboard member mới (checklist 5 bước)

1. Cài v2: `curl -fsSL https://opencode.ai/v2/install | bash`.
2. Chạy `/connect` → chọn workspace Console của team (không BYOK lẻ loi).
3. `opencode mcp list` — phải `✓` hết; server nào `needs authentication` → `/mcps` chọn server đăng nhập.
4. Chạy thử `/review` lên 1 PR mẫu — output phải theo checklist team.
5. Nếu vấp: ghi lại vào docs onboard — chỗ họ vấp là chỗ bộ khung thiếu.

## Walkthrough theo phút (15 phút)

- **0–3′** Copy khung trên vào repo; điền model mặc định team + 3 permissions cơ bản (allow git status/diff, deny push).
- **3–5′** Thêm policies cứng: `shell:sudo *`, `shell:git push *`, provider lạ (mẫu 2).
- **5–8′** Viết 1 command `/review` + 1 agent `reviewer` theo mẫu — để nó vào `.opencode/commands/` và `.opencode/agents/`.
- **8–11′** Viết `AGENTS.md` ≤40 dòng (tips 01) + `.env.example` + docs onboard ghi rõ biến `export` nào.
- **11–13′** Đẩy lên repo; nhờ 1 đồng nghiệp pull về, mở `opencode`, `/connect`, `opencode mcp list` — phải xanh hết.
- **11–15′** Đồng nghiệp chạy `/review` lên PR mẫu; ghi lại chỗ vấp → đó là việc docs còn thiếu.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Config chung team | `opencode.jsonc` + `.opencode/*` commit repo | `copilot-instructions.md` + settings | `CLAUDE.md` + `.claude/` |
| Khoá cứng org | `policies` (Console/system, đè config project) | không tương đương trực tiếp | không tương đương trực tiếp |
| Model chung team | pin model + `/connect` workspace | theo plan org | theo plan org |

## Lỗi thường gặp

```text
❌ SAI: commit opencode.jsonc kem token that
✅ ĐÚNG: "{env:MCP_API_KEY}" + .env.example + docs onboard ghi export gi
```
**Bài học:** key lộ trong git là lộ vĩnh viễn (history giữ mãi) — phải revoke + rotate, không chỉ xóa dòng.

### Rule ngược đời trong permissions

```text
❌ SAI: dat rule allow "shell:*" SAU rule deny "git push *" -> push duoc allow
✅ ĐÚNG: rule rong truoc, exception sau (last match wins)
```
**Bài học:** thứ tự rule là phần của rule — đảo dòng là mất khóa.

## Best practices (kèm "vì sao")

- Config + agents + skills đều nằm trong repo, không ai tự thêm `.opencode/` riêng ngoài dự án. **Vì sao?** Config team là nguồn sự thật; config cá nhân chỉ để theme/keybind.
- Secrets luôn `{env:NAME}`, kèm `.env.example`. **Vì sao?** `{env:}` thay rỗng khi thiếu — fail sớm, dễ debug, không lộ key trong git history.
- Policies đặt ở Console/system, không đặt ở project. **Vì sao?** Project config member có thể sửa; Console policy đè lên mọi thứ trong ~1 phút.

## Bài tập nhỏ

1. (15 phút) Dựng bộ khung trên cho 1 repo thật, nhờ 1 đồng nghiệp onboard từ 0 — ghi lại chỗ họ vấp. Kết quả đạt: `opencode mcp list` xanh hết trên máy họ + chạy được `/review` mẫu mà không cần bạn chỉ thêm bước nào.

> **Chốt tips 07 + cả nhóm 02:** pro không phải prompt hay hơn — pro là hệ thống khiến người thường cũng ra kết quả ổn.

Reference: [permissions](https://opencode.ai/v2/docs/permissions/), [config](https://opencode.ai/v2/docs/config/), [console](https://opencode.ai/v2/docs/console/) — verify 28/10/2026, v2.2.0.
