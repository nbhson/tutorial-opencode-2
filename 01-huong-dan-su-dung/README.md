# 01 — Hướng dẫn sử dụng OpenCode 2 (đọc từ 00 → 14)

> **Dành cho:** người mới + dev v1 muốn migrate đúng thứ tự.
> **Vấn đề:** 15 bài — đọc cái nào trước, bài nào liên quan việc đang làm.
> **Đọc xong:** biết thứ tự 00 → 14 và tra đúng bài khi kẹt.
> **Thời gian:** ~5 phút.

Nhóm "học nghề": 15 bài xếp liền mạch từ **tổng quan → cài đặt → bề mặt → config nền (model/agents/commands/skills/MCP/permissions) → vận hành nâng cao (background, sessions, plugins/SDK, worktree, IDE)**.

Cách học nhanh: đọc 4 bài đầu (**00–03**), rồi vừa đọc vừa mở TUI làm theo — ví dụ đọc bài 05 thì `Shift+Tab` đổi agent thật, đọc bài 08 thì `opencode mcp add` thật.

## Danh sách bài (15 bài)

| # | Tên bài | Mô tả 1 dòng | Link |
|---|---|---|---|
| 00 | Tổng quan OpenCode 2 | Background service + Code Mode + background tasks: 3 cái mới làm nên v2 | [00](./00-tong-quan-opencode-2.md) |
| 01 | Cài đặt + Upgrade v1→v2 | 3 kênh cài v2, `upgrade --major`, 3 breaking changes | [01](./01-cai-dat-upgrade-v1-v2.md) |
| 02 | TUI / Desktop / Web / CLI | 4 bề mặt nói chuyện với 1 service chung + khi nào dùng cái nào | [02](./02-tui-desktop-web-cli.md) |
| 03 | Config `opencode.jsonc` | Thứ tự merge system→global→project, `$schema`, `{env:}` | [03](./03-config-opencode-jsonc.md) |
| 04 | Models: Zen / Go / BYOK | Trả tiền model 3 cách, selector `provider/model#variant` | [04](./04-models-zen-go-byok.md) |
| 05 | Agents: build/plan + custom | 4 builtins, `mode`, `permissions`, `model#variant` | [05](./05-agents-build-plan-custom.md) |
| 06 | Commands (slash tái dùng) | `.opencode/commands/` → `/review` của riêng bạn | [06](./06-commands-slash-custom.md) |
| 07 | Skills (`SKILL.md`) | Viết skill để agent tự nạp kiến thức khi cần, không nhồi prompt | [07](./07-skills.md) |
| 08 | MCP + Code Mode | `mcp.servers`, `codemode` default true, OAuth, đặt tên tool | [08](./08-mcp-codemode.md) |
| 09 | Permissions + Policies | `permissions[]` last-match-wins + `policies` khóa cứng của org | [09](./09-permissions-policies.md) |
| 10 | Background tasks | Background subagents + background shell, không block prompt | [10](./10-background-tasks.md) |
| 11 | Sessions: new/continue/undo | Vòng đời session, `/undo` checkpoint, compaction | [11](./11-sessions-undo-compaction.md) |
| 12 | Plugins + SDK + API | Plugin API mới (v1 không chạy), `@opencode/client`, `@opencode/sdk` | [12](./12-plugins-sdk-api.md) |
| 13 | Code Mode scripting | Agent viết script JS gọi gộp MCP/OpenAPI 1 round-trip | [13](./13-codemode-scripting.md) |
| 14 | Worktree + Git + IDE/ACP | `worktree_*` trong Code Mode, `AGENTS.md`, ACP cho editor | [14](./14-worktree-git-ide-acp.md) |

## Tra cứu lệnh chi tiết (`commands/`)

Phần này dùng để tra nhanh khi đang làm việc — không cần đọc từ đầu.

- Tổng số: **13** thư mục lệnh (`find 01-huong-dan-su-dung/commands -mindepth 3 -name README.md | wc -l`).
- Index đầy đủ theo 3 nhóm: [commands/README.md](./commands/README.md)
- Ví dụ tra cứu nhanh: [commands/session/new/README.md](./commands/session/new/README.md)
  (thay `new` bằng slug bất kỳ, vd `./commands/model-agent/models/README.md`, `./commands/system-mcp/mcps/README.md`).

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 (nhóm này) | Copilot / Claude | Ghi chú |
|---|---|---|---|
| Nơi chạy chính | Terminal TUI + 1 service nền | Copilot: IDE; Claude: terminal | [bài 00](./00-tong-quan-opencode-2.md) |
| Luật repo | `AGENTS.md` duy nhất | Copilot: `copilot-instructions.md`; Claude: `CLAUDE.md` | [tips 01](../02-tips-thuc-chien/01-agents-md-hygiene.md) |
| Persona | build/plan/general/explore | Copilot: Ask/Edit/Agent; Claude: agentic mặc định | [bài 05](./05-agents-build-plan-custom.md) |
| Tool ngoài | MCP + Code Mode | MCP native tools | [bài 08](./08-mcp-codemode.md) |
| Chặn cuối | permissions + policies | Copilot: policy; Claude: permissions/hooks | [bài 09](./09-permissions-policies.md) |

Quay về: [../README.md](../README.md) · Bài tổng: [00](./00-tong-quan-opencode-2.md)

> Chốt nhóm 01: đừng đọc 15 bài như 15 thứ rời — chúng là một đường leo thang từ "chạy được" tới "chạy pro có luật".
