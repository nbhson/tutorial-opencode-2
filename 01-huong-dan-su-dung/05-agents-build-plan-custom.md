# 05 — Agents: build / plan + custom (chia vai cho đúng việc)

> **Dành cho:** người giao việc cho agent · **Vấn đề:** quăng mọi task cho `build` rồi than nó phá code · **Đọc xong:** dùng đúng 4 builtins + tự tạo agent `primary/subagent` · **Thời gian:** ~15 phút.

## Mục tiêu

- Kể được 4 agents thấy được + mode của từng đứa.
- Tạo custom agent bằng markdown + JSONC.
- Gắn `permissions` + `model#variant` cho agent.

## Khái niệm cốt lõi

### 1. Bốn diễn viên chính

| Agent | Mode | Việc | Ví dụ prompt |
|---|---|---|---|
| `build` | `primary` (default) | code thật, tools allow mặc định (trừ `.env` hỏi lại) | `"thêm rate-limit /api/login + test"` |
| `plan` | `primary` read-only | khám + lập kế hoạch, deny edit (trừ plan files), shell vẫn hỏi | `"vẽ plan refactor auth, chưa sửa code"` |
| `general` | `subagent` | nghiên cứu/việc nhiều bước, broad tools, **không spawn tiếp** | `"dùng general nghiên cứu 3 cách cache"` |
| `explore` | `subagent` | search/đọc code + web, **deny edit** | `"dùng explore vẽ bản đồ file chạm auth"` |

**Nôm na:** `plan` là kiến trúc sư (vẽ bản vẽ, không cầm búa), `build` là đội thi công, `explore` là trinh sát (chỉ nhìn không đụng), `general` là tổ cơ động.

**Vì sao quan trọng?** Sai vai = hoặc agent phá code (build làm việc của plan), hoặc agent bất lực (plan mà bắt nó sửa file).
**Nếu làm sai?** Mọi task đều `build` → không có bản vẽ để duyệt, review diff mệt gấp đôi.

Depth lồng mặc định **1** (general không gọi tiếp subagent). Không còn `scout` như v1.

### 2. Tạo custom agent (2 cách)

Cách A — markdown (khuyên dùng cho project):

```md
---
description: Reviews changes for correctness and regressions
mode: subagent
model: anthropic/claude-sonnet-4-5#high
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
---
Review the current changes. List findings in severity order with file and line references.
```

Lưu ở `.opencode/agents/reviewer.md` (project) hoặc `~/.config/opencode/agents/<name>.md` (global). Nested path thành ID (`team/reviewer.md` → `team/reviewer`). Gọi:

```text
Use the reviewer subagent to review my current changes.
```

Cách B — JSONC trong `opencode.jsonc`:

```jsonc
{
  "agents": {
    "reviewer": {
      "description": "Reviews current changes",
      "mode": "subagent",
      "system": "Report findings in severity order.",
      "permissions": [{ "action": "edit", "resource": "*", "effect": "deny" }]
    }
  },
  "default_agent": "writer"
}
```

Wizard nhanh: `opencode agent create` (hỏi path/description/mode/permissions rồi sinh file).

### 3. Ba field hay sai: `mode` / `model` / `permissions`

- `mode`: `primary` (ngồi ghế chính) / `subagent` (chỉ chạy con) / `all` (cả hai). Custom mới default `primary`.
- `model`: `provider/model#variant`. Subagent không set thì **thừa hưởng model của session cha**.
- `permissions`: array `action/resource/effect`, **last-match-wins**, append sau global. Muốn orchestrator chỉ được gọi reviewer:

```jsonc
{ "agents": { "orchestrator": { "permissions": [
  { "action": "subagent", "resource": "*", "effect": "deny" },
  { "action": "subagent", "resource": "reviewer", "effect": "allow" }
] } } }
```

Override builtin cùng ID (`agents.build.permissions`) để siết `git push` chẳng hạn. `hidden: true` chỉ giấu khỏi list (không phải bảo mật). `steps: 8` giới hạn số model steps.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Persona chính | build/plan | Ask/Edit/Agent + personas | agentic mặc định |
| Việc ồn ào | subagent (general/explore/custom) | custom agent | subagents |
| File định nghĩa | `.opencode/agents/*.md` + `agents{}` | `.github/agents/*.agent.md` | `.claude/agents/` |

## Lỗi thường gặp

### 1. Subagent không hiện / model không gọi nó

```text
❌ SAI: viet agent khong co description roi hoi "sao no khong dung"
✅ ĐÚNG: subagent BAT BUOC co description (model doc de chon); kiem tra skill/subagent permissions co deny khong
```
**Bài học:** `description` là CV xin việc của subagent — không CV thì không được gọi.

### 2. Đổi primary agent mà model không đổi theo

```text
❌ SAI: Shift+Tab sang plan roi tuong model tu doi
✅ ĐÚNG: agent ID va session model la 2 thu rieng; doi model bang Ctrl+X M
```
**Bài học:** agent = vai diễn, model = bộ não. Đổi vai không đổi não.

## Best practices (kèm "vì sao")

- Luồng chuẩn: `explore` vẽ bản đồ → `plan` duyệt → `build` thi công từng phase + test. **Vì sao?** Mỗi bước rẻ dần sai sót; sửa bản vẽ rẻ hơn sửa nhà xây dở.
- Reviewer luôn `deny edit+shell`. **Vì sao?** Người chấm không được cầm búa sửa bài.

## Bài tập nhỏ

1. (10 phút) Tạo `.opencode/agents/reviewer.md` như mẫu, gọi nó review 1 diff thật.
2. (5 phút) `Shift+Tab` sang `plan`, bắt nó plan 1 refactor mà không cho sửa file — xem nó có ngoan không.

> **Chốt bài 05:** plan vẽ, explore nhìn, build làm, reviewer chấm. Giao đúng vai là xong nửa việc quản agent.
