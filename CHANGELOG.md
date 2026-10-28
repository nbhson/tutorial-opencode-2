# Changelog — Khóa Học OpenCode 2 (tiếng Việt)

## [Mở rộng độ sâu + fix] — 2026-10-28

### Sửa lỗi biên tập
- Sửa ký tự Trung Quốc `跨` lọt vào `02-tips-thuc-chien/05-codemode-hieu-qua.md` ("Gom theo server trước,跨 server sau" → "server khác sau").
- Sửa typo `mieg`/`buil` trong `02-prompt-plan-first.md` (pitfall block).
- Cập nhật 6 chỗ `2.0.x` còn sót → `2.2.x` (bài 00, 01, FAQ 01, CHEATSHEET, CONTRIBUTING).

### Mở rộng lessons (đạt chuẩn 250–450 dòng theo CONTRIBUTING)
- Bài 02 TUI/Desktop/Web/CLI: 88 → 252 dòng (tuỳ biến `cli.json`, `opencode mini`, keybind chi tiết, luồng chọn bề mặt).
- Bài 04 Models/Zen/Go/BYOK: 72 → 255 dòng (Go limits, phí credits 4.6%+$0.31, local models, `provider.use`).
- Bài 06 Commands: 66 → 276 dòng (`$ARGUMENTS`/`$1`, shell blocks, loading precedence, nested commands).
- Bài 07 Skills: 98 → 254 dòng (cơ chế loading, luật quét 6 cấp, HTTP catalog, frontmatter đầy đủ).
- Bài 09 Permissions/Policies: 95 → 302 dòng (bảng actions đầy đủ, wildcard, precedence đúng thứ tự, Console).
- Bài 10 Background tasks: 59 → 261 dòng. Bài 11 Sessions/Undo/Compaction: 58 → 256. Bài 12 Plugins/SDK/API: 70 → 253. Bài 13 Code Mode scripting: 52 → 255. Bài 14 Worktree/IDE/ACP: 59 → 255.

### Mở rộng FAQ (8 file, 3 → 10–12 Q&As mỗi file)
- FAQ 01–08: 182–192 dòng/file; thêm Q&As về coexist v1/v2, BYOK, permissions vs policies, MCP timeout 3 mức, porting plugin checklist, service status, `{env:}`/`{file:}`.
- Sửa nội dung sai theo docs: WinGet **không được hỗ trợ chính thức** trên Windows (docs: "Windows package managers are not supported"); Kimi K3 không phải model free; precedence policies sửa theo đúng docs; `enabled` → `disabled` (MCP field).

### Mở rộng tips (7 file → 105–149 dòng)
- Đủ chuẩn CONTRIBUTING: ≥3 ví dụ copy-chạy được, minute-by-minute walkthrough, ❌/✅ pitfalls, bài tập có thời gian + kết quả kiểm chứng được.

### Templates hoàn thiện
- Thêm `templates/opencode.jsonc` (220 dòng, mọi key verify qua schema `opencode.ai/config.json` + docs config).
- Thêm `templates/.opencode/plugins/stub.ts` (plugin API v2: `Plugin.define` + `ctx.session.hook("context")` — lưu ý `tool.execute.before`/`chat.message` là hook tên v1).
- Thêm `templates/.opencode/commands/task.md` (`$ARGUMENTS`/`$1` đã verify).
- Sửa `templates/README.md` (bảng map đầy đủ, hết row trỏ file không tồn tại).

### Đánh dấu "cần verify"
- `upgrade --major`, `OPENCODE_DISABLE_AUTOCOMPACT` (thay bằng `compaction.auto: false` đã verify), trạng thái "in development" của SDK, con số nạp/auto-reload Zen — các agent đã đánh dấu rõ trong từng file thay vì giữ mò.
- Sources chính: `opencode.ai/v2/docs` (+ subpages), schema `opencode.ai/config.json` — verify 28/10/2026.

## [Cập nhật version] — 2026-10-27

- Verify lại version với npm registry + changelog chính thức (`opencode.ai/changelog`): **`@opencode/cli` latest = 2.2.0 (27/10/2026)**, không còn 2.0.29 (publish 14/10/2026).
- Thêm vào [bài 08 — MCP + Code Mode](./01-huong-dan-su-dung/08-mcp-codemode.md) bảng **MCP servers phổ biến 2025–2026**: Context7, GitHub MCP official, Playwright MCP (Microsoft), Chrome DevTools MCP, Sentry, Figma, DB servers, Notion/Linear/Slack.
- Ghi nhận v2.1.0→v2.2.0: Todo list trong TUI (`experimental.todo`), MCP Input Forms, background compaction, Desktop plugins experimental, và 3 breaking changes của v2.2.0 (`@opencode/ai` root → Promise API, GitHub Action removed, OpenTUI 0.7).

## [Unreleased] — Dựng repo lần đầu (2026-10-16)

- Dựng khung TƯƠNG TỰ `tutorial-copilot`: `README.md`, `CHEATSHEET.md`, `STYLE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`, `01-huong-dan-su-dung/` (15 bài), `02-tips-thuc-chien/` (7 bài), `03-cau-hoi-thuong-gap/` (8 bài), `templates/`.
- Snapshot sự thật verify 16/10/2026 với `opencode.ai/v2/docs`, announcement 2.0 (12/10/2026), npm `@opencode/cli` 2.0.29:
  - Cài v2: `curl .../v2/install`, `brew anomalyco/tap/opencode-v2`, `npm i -g @opencode/cli`. Kênh cũ vẫn ra v1.
  - Upgrade `opencode upgrade --major` từ latest 1.x; 3 breaking changes (plugin API, server API, `tui.json` → `cli.json`).
  - Background service chung, Code Mode MCP default, background subagents + background shell, 80+ internal plugins, `@opencode/sdk` + `@opencode/client`, ACP.
  - 4 agents builtin (build/plan/general/explore), config `permissions`/`agents`/`mcp.servers`/`providers`/`commands`, `AGENTS.md` only, không chạy LSP, `/share` đã bỏ.
  - Pricing: OSS free + BYOK / Go $10 / Go Plus $40 / Zen pay-as-you-go.
