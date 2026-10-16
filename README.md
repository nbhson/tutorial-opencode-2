# Khóa Học OpenCode 2 — Từ Zero tới Pro (10/2026)

> **Dành cho:** dev mới nghe tên OpenCode, dev đã dùng v1 muốn lên v2, và tech lead cần chuẩn hóa cách cả team dùng agent terminal.
> **Vấn đề:** OpenCode 2 (09/2026) đổi nhiều cùng lúc — background service chung, Code Mode cho MCP, background subagents, config `permissions`/`agents`/`mcp.servers` mới, plugin API mới, Zen/Go tính tiền model — docs gốc tản mát ở `opencode.ai/v2/docs`.
> **Đọc xong:** tự cài + nâng cấp v1→v2 an toàn, chọn đúng bề mặt (TUI/Desktop/Web/CLI non-interactive), cấu hình model + permissions + agents + skills + MCP đúng chuẩn v2, và có lộ trình 5 ngày lên pro.
> **Thời gian:** ~5 phút trang này; học đủ khóa là 5 ngày.

Bộ tài liệu tiếng Việt deep-dive về **OpenCode 2 (verify 16/10/2026 với `opencode.ai/v2/docs`, announcement 2.0 ngày 12/10/2026, npm `@opencode/cli` 2.0.29)**.
Nguồn tổng hợp: docs v2 chính thức (config/agents/permissions/MCP/skills/plugins/models), migration guide v1→v2, changelog, và kinh nghiệm thực chiến terminal-agent.

## Cho ai đọc?

- Dev mới: muốn setup đúng ngay từ đầu, không đoán mò (đừng copy config v1 cũ rồi thắc mắc sao lỗi).
- Dev đã dùng v1: muốn migrate lên v2 không gãy plugin/API/config.
- Tech lead: muốn chuẩn hóa `opencode.jsonc` + `AGENTS.md` + skills + MCP + policies cho cả team.

> **Nếu bạn chỉ có 30 phút:** đọc [00 — Tổng quan OpenCode 2](./01-huong-dan-su-dung/00-tong-quan-opencode-2.md) để hiểu background service + Code Mode + background tasks trước khi đụng vào bất cứ config nào. Hiểu sai 3 cái này là 90% lý do migrate v2 thất bại.

## Cấu trúc khóa học (mỗi phần = 1 folder)

| Folder | Nội dung (nói thẳng) | Số bài |
|---|---|---|
| [`01-huong-dan-su-dung/`](./01-huong-dan-su-dung/) | **Hướng dẫn sử dụng**: tổng quan, cài đặt + upgrade v1→v2, TUI/Desktop/Web/CLI, config `opencode.jsonc`, models + Zen/Go/BYOK, agents, commands, skills, MCP + Code Mode, permissions + policies, background tasks, sessions, plugins + SDK/API, worktree + Git | 15 bài + commands/ (13 lệnh) |
| [`02-tips-thuc-chien/`](./02-tips-thuc-chien/) | **Tips thực chiến**: AGENTS.md hygiene, prompt + Plan-first, verification, parallel background, Code Mode hiệu quả, tiết kiệm tiền model, teamwork | 7 bài deep-dive |
| [`03-cau-hoi-thuong-gap/`](./03-cau-hoi-thuong-gap/) | **Q&A thường gặp**: cài đặt & upgrade, model & pricing, permissions, MCP + Code Mode, agents & skills, plugins & API, lỗi & troubleshooting, bảo mật | 8 bài deep-dive |
| [`templates/`](./templates/) | Template copy-paste: `opencode.jsonc`, `AGENTS.md`, `agents/`, `commands/`, `skills/`, MCP, plugin stub | copy-paste dùng ngay |
| [`CHEATSHEET.md`](./CHEATSHEET.md) | Bảng tra nhanh CLI, TUI keys, slash commands, config keys, permissions, MCP | 1 trang |

> **Đọc bảng này thế nào:** `01-` là "học nghề" (đọc tuần tự 00 → 14), `02-` là "lên trình" (thói quen thực chiến), `03-` là "tủ thuốc" (tra khi kẹt), `templates/` là bộ khung copy vào repo thật. Tuần đầu chỉ cần `01-` + `CHEATSHEET.md`.

## Lộ trình học đề xuất (5 ngày)

```
Ngày 1: 01 bài 00 → 03 (tổng quan, cài đặt + upgrade, TUI/Desktop/Web, config)
Ngày 2: 01 bài 04 → 08 (models/Zen/Go, agents, commands, skills, MCP + Code Mode)
Ngày 3: 01 bài 09 → 14 (permissions/policies, background tasks, sessions, plugins/SDK, worktree, IDE/ACP)
Ngày 4: 02 tips 01 → 04 (AGENTS hygiene, prompt, plan-first, verify + parallel)
Ngày 5: 02 tips 05 → 07 + 03 FAQ tra cứu khi gặp lỗi
```

Quy tắc vàng (nhớ 4 câu này là đủ 80% sức mạnh):

1. **Config là bottleneck, không phải model** — `AGENTS.md` + skills gọn thắng model đắt (xem `02-tips-thuc-chien/01`).
2. **Plan → Build → Verify leo thang** — không bao giờ giao task lớn cho Build ngay.
3. **permissions là gợi ý, policies là luật** — cái gì không được phép thì đưa vào `policies`, đừng trông chờ prompt.
4. **Việc ồn ào đẩy sang subagent background** — session chính chỉ giữ quyết định.

## Cách dùng repo này

- Đọc theo thứ tự `00-*` → `NN-*` trong mỗi folder. Mỗi bài FAQ trong `03-*` theo cấu trúc cố định: **Hỏi 1 câu → Trả lời 1 câu → Giải thích chi tiết + ví dụ → Làm thế nào (steps copy-paste) → Nếu vẫn lỗi thì...**
- Mọi code block đều copy-paste được. Template trong `templates/` dùng ngay (copy `opencode.jsonc` + `.opencode/` sang repo thật, sửa model/permissions cho khớp).
- Trong TUI, gõ `/` để xem slash commands, `Ctrl+X M` đổi model, `Shift+Tab` đổi agent, `Ctrl+P` mở command palette.
- Kẹt ở đâu tra đó: `CHEATSHEET.md` → `01-huong-dan-su-dung/commands/` ([index 13 lệnh](./01-huong-dan-su-dung/commands/README.md)) → `03-cau-hoi-thuong-gap/`.

## So sánh nhanh với Copilot / Claude Code

| Việc | OpenCode 2 | GitHub Copilot | Claude Code | Học ở đâu |
|---|---|---|---|---|
| Chạy ở đâu | Terminal-first (TUI) + Desktop + Web, 1 background service | IDE-first (VS Code) + CLI phụ | Terminal-first | [01 — bài 00](./01-huong-dan-su-dung/00-tong-quan-opencode-2.md) |
| Giá tool | Free OSS, trả tiền model (BYOK / Go $10 / Go Plus $40 / Zen pay-as-you-go) | Seat + AI Credits | Subscription + API | [01 — bài 04](./01-huong-dan-su-dung/04-models-zen-go-byok.md) |
| Luật trong repo | `AGENTS.md` (chỉ đọc file này, không fallback `CLAUDE.md`) | `.github/copilot-instructions.md` + `AGENTS.md` | `CLAUDE.md` | [02 — tips 01](./02-tips-thuc-chien/01-agents-md-hygiene.md) |
| Persona | `build` / `plan` (primary) + `general` / `explore` (subagent) | Ask/Edit/Agent + Session Target | Mặc định agentic | [01 — bài 05](./01-huong-dan-su-dung/05-agents-build-plan-custom.md) |
| Lệnh tái dùng | Commands (`.opencode/commands/`) | Skills / prompt files | `.claude/commands/` | [01 — bài 06](./01-huong-dan-su-dung/06-commands-slash-custom.md) |
| Nối hệ thống ngoài | MCP (`mcp.servers`) + **Code Mode mặc định** | MCP (`.vscode/mcp.json`) | MCP (`.mcp.json`) | [01 — bài 08](./01-huong-dan-su-dung/08-mcp-codemode.md) |
| Chặn cuối | `permissions` (last-match-wins) + `policies` (org thắng repo) | Policy/allowlist | Permissions + hooks | [01 — bài 09](./01-huong-dan-su-dung/09-permissions-policies.md) |
| Chạy ngầm | Background subagents + background shell | Coding agent (cloud) | Background tasks | [01 — bài 10](./01-huong-dan-su-dung/10-background-tasks.md) |

> **Đọc bảng này thế nào:** đã quen Copilot/Claude thì bạn đã có nền (agent loop, MCP, skills, slash). Cái mới phải học ở OpenCode 2 là **background service chung + Code Mode + `permissions` array + `policies` + Zen/Go pricing**.

## Hiểu nhầm hay gặp (❌ SAI / ✅ ĐÚNG)

**1. Tưởng v2 là "v1 update thường"**

```text
❌ SAI: bấm update rồi mong mọi thứ chạy y cũ (nhất là plugin + script gọi server API)
✅ ĐÚNG: v2 có 3 breaking changes — plugin API mới, server API mới, tui.json → cli.json. Đọc bài 01 trước khi upgrade
```
**Bài học:** config cũ (`opencode.json`) vẫn được đọc + normalize, nhưng plugin v1 và script gọi API v1 **không chạy** trên v2.

**2. Copy cả chục MCP servers rồi than "context phình"**

```text
❌ SAI: add 10 MCP servers, để tools hiện hết lên model
✅ ĐÚNG: v2 đã opt-in Code Mode mặc định — gom tools theo server, agent viết script gọi gộp 1 round-trip. Chỉ tắt codemode khi cần tool native
```
**Bài học:** Code Mode sinh ra để bạn add nhiều MCP mà không bloat context.

## Phiên bản & nguồn

- OpenCode **2.0** (2.0.0 publish 11/09/2026; verify ở 2.0.29–2.0.30 ngày 14–15/10/2026). Xem version: `opencode --version`.
- Docs gốc v2: https://opencode.ai/v2/docs — Announcement 2.0 (12/10/2026): https://anoma.ly/notes/opencode-2-0/ — Migrate v1: https://opencode.ai/v2/docs/migrate-v1/
- Zen models + pricing: https://opencode.ai/zen — Console/Go: https://opencode.ai/v2/docs/console/go
- **Snapshot sự kiện 16/10/2026 (đã verify):**
  - Cài v2: `curl -fsSL https://opencode.ai/v2/install | bash` · `brew install anomalyco/tap/opencode-v2` · `npm i -g @opencode/cli`. Kênh cũ (`opencode-ai`, script `opencode.ai/install`) vẫn ra **v1** (1.19.x).
  - Upgrade: lên latest 1.x rồi `opencode upgrade --major`. V1 và V2 **không cài song song mặc định** (chung lệnh `opencode`).
  - 4 agents thấy được: `build`/`plan` (primary) + `general`/`explore` (subagent). Không còn `scout`. Depth lồng mặc định 1.
  - Config mới: `permissions[]` (`shell` thay `bash`, `subagent` thay `task`, `edit` gộp write/patch), `agents` (thay `agent`+`mode`), `providers`/`commands` (số nhiều), MCP `mcp.servers` + `disabled` (thay `enabled`) + `codemode` default `true`.
  - Chỉ đọc `AGENTS.md` (không fallback `CLAUDE.md`). Giữ `lsp` config nhưng **không chạy language server / không sinh LSP diagnostics**.
  - Tiền model: OSS free, trả provider trực tiếp (BYOK) **hoặc** Go $10/tháng / Go Plus $40/tháng (curated catalog, giới hạn $/model/tháng khác nhau) **hoặc** Zen pay-as-you-go (per-1M-tokens, có model Free).
  - `/share` + session-sharing backend **đã bỏ** (v1.19.1+).

## Đóng góp & thay đổi

- Muốn thêm bài? Đọc [`CONTRIBUTING.md`](./CONTRIBUTING.md) và [`STYLE.md`](./STYLE.md) trước.
- Xem [`CHANGELOG.md`](./CHANGELOG.md) để biết repo đổi gì.

> **Chốt trang này:** đừng đọc hết repo một buổi — mở [bài 00](./01-huong-dan-su-dung/00-tong-quan-opencode-2.md) để chọn đúng "động cơ" (TUI vs run non-interactive vs Desktop/Web), rồi quay lại bảng cấu trúc chọn folder.
