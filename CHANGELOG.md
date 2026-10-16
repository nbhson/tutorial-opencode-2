# Changelog — Khóa Học OpenCode 2 (tiếng Việt)

## [Unreleased] — Dựng repo lần đầu (2026-10-16)

- Dựng khung TƯƠNG TỰ `tutorial-copilot`: `README.md`, `CHEATSHEET.md`, `STYLE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`, `01-huong-dan-su-dung/` (15 bài), `02-tips-thuc-chien/` (7 bài), `03-cau-hoi-thuong-gap/` (8 bài), `templates/`.
- Snapshot sự thật verify 16/10/2026 với `opencode.ai/v2/docs`, announcement 2.0 (12/10/2026), npm `@opencode/cli` 2.0.29:
  - Cài v2: `curl .../v2/install`, `brew anomalyco/tap/opencode-v2`, `npm i -g @opencode/cli`. Kênh cũ vẫn ra v1.
  - Upgrade `opencode upgrade --major` từ latest 1.x; 3 breaking changes (plugin API, server API, `tui.json` → `cli.json`).
  - Background service chung, Code Mode MCP default, background subagents + background shell, 80+ internal plugins, `@opencode/sdk` + `@opencode/client`, ACP.
  - 4 agents builtin (build/plan/general/explore), config `permissions`/`agents`/`mcp.servers`/`providers`/`commands`, `AGENTS.md` only, không chạy LSP, `/share` đã bỏ.
  - Pricing: OSS free + BYOK / Go $10 / Go Plus $40 / Zen pay-as-you-go.
