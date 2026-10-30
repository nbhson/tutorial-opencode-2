# Cheatsheet OpenCode 2 (10/2026) — 1 trang

> **Dành cho:** đang giữa task cần tra nhanh · **Tra xong:** biết gõ gì, config key nào, tốn bao nhiêu (~5 phút).

Đừng đọc từ đầu. Đang ở terminal thì xem **CLI + TUI keys**, cần config thì xem **Config keys**, sắp giao việc thì xem **Agents + Background**, nối tool ngoài thì xem **MCP + Code Mode**, lo tiền thì xem **Models + Zen/Go**.

## Cài đặt + Upgrade (v2)

| Việc | Lệnh |
|---|---|
| Cài v2 (curl) | `curl -fsSL https://opencode.ai/v2/install \| bash` |
| Cài v2 (brew) | `brew install anomalyco/tap/opencode-v2` |
| Cài v2 (npm) | `npm install -g @opencode/cli` |
| Cài Desktop / WinGet | dmg/deb/rpm/AppImage ở `opencode.ai/v2/docs` · `winget install --id Anomaly.OpenCode -e` |
| Check version | `opencode --version` → phải là `2.2.x` trở lên (latest 2.2.3 — 30/10/2026) |
| Upgrade v1→v2 | lên latest 1.x rồi `opencode upgrade --major` (xóa bản package-manager v1 trước vì chung lệnh `opencode`) |
| Xem có gì mới | mở TUI → `/highlights` (tắt auto: `"highlights": false` trong `cli.json`) |

> V1 (`opencode-ai`, script `opencode.ai/install`) vẫn ra 1.19.x. V1↔V2 không song song mặc định.

## CLI (terminal, non-interactive + serve)

| Lệnh | Ví dụ mini |
|---|---|
| `opencode` | `opencode` → mở TUI full-screen tại project hiện tại |
| `opencode run` | `opencode run "review repo này, chỉ liệt kê issues" -m anthropic/claude-sonnet-4-5` → chạy 1 prompt không mở TUI (CI/script) |
| `opencode run --continue` | `opencode run -c "tiếp tục fix test còn đỏ"` → chạy tiếp session cuối |
| `opencode serve / web` | `opencode serve --port 4096` → dựng API + web server (Desktop/Web/remote nói chuyện qua đây) |
| `opencode pair` | `opencode pair` → in URL + user/pass để mở Web UI |
| `opencode auth login` | `opencode auth login` → login provider (lưu `~/.local/share/opencode/auth.json`) |
| `opencode mcp add/list/auth` | `opencode mcp add context7 --url https://mcp.context7.com/mcp && opencode mcp list` → thêm + kiểm tra MCP |
| `opencode agent create` | `opencode agent create` → wizard sinh agent mới (hỏi path/mode/permissions) |
| `opencode plugin add/list/check/update` | `opencode plugin add opencode-acme-plugin && opencode plugin list` → quản lý plugin |
| `opencode upgrade` | `opencode upgrade --major` → lên v2 (chỉ từ latest 1.x) |
| ACP (editor integrations) | `opencode acp` → chạy Agent Client Protocol server qua stdin/stdout |

## TUI keys + slash (trong session)

| Phím / lệnh | Ví dụ mini |
|---|---|
| `/` list commands | `gõ /` → filter `diff`, Enter để chạy |
| `Ctrl+P` palette | `Ctrl+P` → mọi action của view hiện tại |
| `Ctrl+X M` / `/models` | `Ctrl+X M` → đổi model giữa session (không sửa config file) |
| `Shift+Tab` / `/agents` | `Shift+Tab` → xoay vòng agent primary (`build` ↔ `plan`) |
| `Ctrl+X N` / `/new` | session mới sạch cho task mới |
| `Ctrl+X L` / `/sessions` · `Ctrl+O` recents | quay lại session cũ; `/sessions` quản lý danh sách |
| `Ctrl+X E` / `/editor` | sửa prompt dài trong `$EDITOR` rồi Enter gửi |
| `/undo` · `/redo` | `undo` lùi thay đổi agent vừa làm (checkpoint), `redo` tiến lại |
| `/diff` (`f` fullscreen) | `/diff` → xem diff cạnh session đang làm |
| `/connect` | login provider/Zen/Go ngay trong TUI; từ v2.2.3 có **Claude Agent** — cài Claude Code + `claude auth login`, chọn Claude Agent để dùng login/models của Claude Code |
| `/goal` | `/goal "task chỉ xong khi pnpm test xanh"` → session tự làm đến khi đạt objective; `/goal pause` · `/goal resume` · `/goal clear` (từ v2.2.1) |
| `/schedule` | `/schedule` → đặt prompt chạy định kỳ (opt-in, experimental; từ v2.2.1) |
| `/mcps` | xem/connect/disconnect/auth MCP servers |
| `/share` | **đã bỏ** (backend sharing retired từ v1.19.1, v2 không có) |
| `F2` | xoay model dùng gần đây |
| Chạy background | shell/subagent lâu → phím đưa ra background, tiếp tục prompt (xem bài 10) |

## Config keys (`opencode.jsonc`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",   // provider/model[#variant]
  "small_model": "anthropic/claude-haiku-4-5",
  "default_agent": "build",
  "permissions": [                            // last-match-wins
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git push *", "effect": "deny" }
  ],
  "policies": [{ "action": "provider.use", "resource": "openai", "effect": "deny" }],
  "mcp": { "servers": { "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" } } },
  "agents": { "reviewer": { "mode": "subagent" } },
  "skills": ["./team-skills"],
  "plugins": ["opencode-acme-plugin"]
}
```

> Từ v2.2.2: tool `experimental_image_generate` **bật mặc định** khi provider kết nối hỗ trợ image models — chọn model qua `experimental.image_generate.model`. Policies chặn dùng plugin/skill/MCP: từ v2.2.3 có action riêng `plugin.use` / `skill.use` / `mcp.use` (`integration.use` chỉ còn điều khiển integrations).

| File | Scope |
|---|---|
| `/Library/Application Support/opencode/` · `/etc/opencode/` (system, admin) | cao nhất, chứa policies khóa cứng |
| `~/.config/opencode/opencode.json(c)` | global — providers/models/permissions của bạn |
| `OPENCODE_CONFIG` / `OPENCODE_CONFIG_CONTENT` | override đường dẫn / inline JSON |
| `<project>/opencode.json(c)` + `<project>/.opencode/opencode.json(c)` | project — `.opencode/` thắng direct |
| `~/.config/opencode/cli.json` | **v2 mới**: config riêng TUI client (thay layered `tui.json`) |

## Agents (4 builtins thấy được)

| Agent | Mode | Ví dụ mini |
|---|---|---|
| `build` | primary (default) | `"thêm rate-limit cho /api/login + test"` → code thật |
| `plan` | primary (read-only) | `"vẽ plan refactor auth, chưa sửa code"` → duyệt plan rồi mới build |
| `general` | subagent | `"dùng general subagent nghiên cứu 3 cách cache"` → việc ồn ào đẩy sang nó |
| `explore` | subagent | `"dùng explore vẽ bản đồ file chạm tới auth"` → chỉ đọc/search, không edit |
| custom | `primary`/`subagent`/`all` | `.opencode/agents/reviewer.md` với `mode: subagent` + `permissions: edit deny` |

> Không còn `scout`. Depth lồng mặc định 1 (`general` không spawn tiếp subagent).

## Commands (slash tái dùng)

| Việc | Ví dụ mini |
|---|---|
| Tạo nhanh | `.opencode/commands/review.md` → gọi `/review` trong TUI |
| Truyền args | `/review --staged` (định nghĩa args trong frontmatter/command body) |
| Scope | `~/.config/opencode/commands/` (global) vs `.opencode/commands/` (project) |

## Skills (`SKILL.md`)

| Việc | Ví dụ mini |
|---|---|
| Tạo | `.opencode/skills/git-release/SKILL.md` (có `description` thì model mới tự thấy) |
| Gọi tay | `@git-release` hoặc `"dùng skill git-release chuẩn bị release"` |
| Thêm nguồn | `"skills": ["./team-skills", "https://example.com/opencode/skills/"]` |
| Chặn/mở | `permissions: [{action: skill, resource: internal-*, effect: deny}]` |

## MCP + Code Mode (mặc định bật)

| Việc | Ví dụ mini |
|---|---|
| Thêm remote | `opencode mcp add context7 --url https://mcp.context7.com/mcp` |
| Thêm local | `opencode mcp add everything -- npx -y @modelcontextprotocol/server-everything` |
| Auth OAuth | `/mcps` → chọn server → sign in · hoặc `opencode mcp auth sentry` |
| Tắt Code Mode cho 1 server | `"codemode": false` trong `mcp.servers.<name>` → tools hiện native |
| Tên tool | `<server>_<tool>` (vd `context_7_resolve_library_id`); prompt từ MCP thành `/server:prompt` |
| Chặn tool | `permissions: [{action: "context7_*", resource: "*", effect: deny}]` |

> Code Mode = agent viết JS gọi gộp nhiều MCP tools trong 1 round-trip (không filesystem/import/fetch trực tiếp). Muốn thêm 1000 servers mà không bloat context thì để mặc định.

## Permissions + Policies (luật chặn cuối)

| Viết | Ý nghĩa |
|---|---|
| `{action: shell, resource: "git push *", effect: deny}` | cấm push dù prompt nói gì |
| `{action: edit, resource: "*.env", effect: deny}` | cấm đụng secrets |
| `{action: subagent, resource: reviewer, effect: allow}` | chỉ cho spawn reviewer |
| `policies: [{action: tool.use, resource: "shell:sudo *", effect: deny}]` | org khóa cứng, project không mở lại được |

> Last-match-wins trong `permissions`. `policies` (Console/org, system, global...) thắng `permissions` + saved approvals. Saved "Allow always" không bao giờ thắng `deny`.

## Models + tiền (Zen / Go / BYOK)

| Cách trả | Khi nào dùng |
|---|---|
| BYOK (key của bạn) | `opencode auth login` → trả provider trực tiếp, không markup |
| Claude Agent (v2.2.3) | đã có subscription Claude Code → cài Claude Code + `claude auth login`, chọn **Claude Agent** trong `/connect` |
| Go $10/tháng · Go Plus $40/tháng | curated catalog (GLM/Kimi/DeepSeek/MiniMax + Grok/Claude Haiku...), khác nhau ở hạn mức $/model/tháng |
| Zen pay-as-you-go | `opencode Zen` gateway, `opencode/<model>`, per-1M-tokens, có model Free, set spend limit + auto-reload |

> Model selector: `provider/model#variant` (vd `anthropic/claude-sonnet-4-5#high`). Session đang chọn thắng config file.

## 3 cạm bẫy hay gặp

```text
❌ SAI: dùng plugin v1 trên v2 / script gọi server API v1
✅ ĐÚNG: port plugin sang API mới; dùng @opencode/client cho API mới, @opencode/sdk để embed
Bài học: 2 breaking changes này là cố ý, không phải bug.
```
```text
❌ SAI: hardcode token vào opencode.jsonc rồi commit
✅ ĐÚNG: "{env:NAME}" + export env; secrets không vào git
Bài học: lỗi bảo mật kinh điển, org policy cũng không cứu được key đã lộ.
```
```text
❌ SAI: để CLAUDE.md rồi mong OpenCode đọc
✅ ĐÚNG: dùng AGENTS.md (v2 không fallback CLAUDE.md)
Bài học: sai tên file = agent mù luật repo.
```

## Tra cứu chi tiết

Index 13 lệnh: [01-huong-dan-su-dung/commands/README.md](01-huong-dan-su-dung/commands/README.md) · Hỏi đáp: [03-cau-hoi-thuong-gap/README.md](03-cau-hoi-thuong-gap/README.md) · Mẫu copy-paste: [templates/README.md](templates/README.md)

> **Chốt:** cheatsheet chỉ giúp gõ đúng cú pháp — thắng thua nằm ở: AGENTS.md gọn, Plan trước Build, permissions/polices chặn đúng chỗ, và bắt agent chạy lệnh verify.
