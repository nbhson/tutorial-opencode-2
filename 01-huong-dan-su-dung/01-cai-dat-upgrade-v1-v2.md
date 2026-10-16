# 01 — Cài đặt + Upgrade v1 → v2 (đừng gãy giữa đường)

> **Dành cho:** máy mới + máy đang v1 · **Vấn đề:** kênh cài cũ vẫn ra v1, v1↔v2 chung lệnh `opencode`, upgrade sai thứ tự là gãy · **Đọc xong:** cài fresh v2 + upgrade v1→v2 an toàn, verify được · **Thời gian:** ~15 phút.

## Mục tiêu bài học

- Cài fresh v2 bằng 1 trong 3 kênh chính, verify `2.0.x`.
- Upgrade từ latest 1.x bằng `upgrade --major` đúng thứ tự.
- Kể được 3 breaking + phần nào tương thích ngược.

## Mục lục

- [1. Kênh cài v2](#1-kênh-cài-v2)
- [2. Upgrade v1→v2 đúng thứ tự](#2-upgrade-v1v2-đúng-thứ-tự)
- [3. Cái gì vỡ, cái gì giữ](#3-cái-gì-vỡ-cái-gì-giữ)
- [4. So sánh](#4-so-sánh)
- [5. Lỗi thường gặp](#5-lỗi-thường-gặp)
- [6. Best practices](#6-best-practices)
- [7. Bài tập nhỏ](#7-bài-tập-nhỏ)
- [8. Reference](#8-reference)

## 1. Kênh cài v2

**1 câu:** V2 có kênh phân phối riêng (`/v2/install`, tap `opencode-v2`, npm `@opencode/cli`); kênh cũ bị ghim ở v1.

**Nôm na:** như chung cư có 2 thang máy — thang cũ chỉ lên tầng 1, muốn lên tầng 2 phải đi thang mới có bảng "V2".

```bash
# lua 1 trong 3 (macOS/Linux/WSL)
curl -fsSL https://opencode.ai/v2/install | bash
brew install anomalyco/tap/opencode-v2
npm install -g @opencode/cli
# Windows: WinGet
winget install --id Anomaly.OpenCode -e
```

Verify (giữa 10/2026 phải thấy 2.0.29+):

```bash
opencode --version
# -> 2.0.x
```

Standalone binary (máy không có package manager): tải zip/tar theo platform ở trang docs (darwin-arm64/x64, windows-arm64/x64, linux glibc/musl). Docker: `ghcr.io/anomalyco/opencode:2.0.0` (tag theo version).

**Vì sao quan trọng?** Cài nhầm kênh = debug cả buổi vì "docs nói A mà máy làm B".
**Nếu làm sai?** `opencode-ai` + script `opencode.ai/install` vẫn ra 1.19.x — đọc docs v2 rồi áp vào binary v1 là lệch toàn tập.

## 2. Upgrade v1→v2 đúng thứ tự

Flow chính thức (verify 16/10/2026):

```bash
# 1. dang v1? len latest 1.x truoc (dung /update trong TUI)
opencode
# /update  -> len 1.19.x moi nhat

# 2. upgrade major (rieng biet, khong phai update thuong)
opencode upgrade --major

# 3. verify
opencode --version   # 2.0.x
opencode mcp list    # models/credentials/agents/permissions/MCP con du khong
```

Nếu cài v1 bằng package manager (npm/brew/...): **gỡ v1 trước**, vì cả hai dùng chung lệnh `opencode`, không song song mặc định. V2 curl installer sẽ thay binary. mise cần ≥2026.10.9 mới hiểu v2.

Lần đầu mở TUI v2: nó tự migrate settings `tui.json` global + persisted preferences sang `~/.config/opencode/cli.json`, **để nguyên file v1** (không xóa). Project-local client config không migrate (v2 client config là global).

## 3. Cái gì vỡ, cái gì giữ

| Nhóm | V2 xử lý thế nào |
|---|---|
| `opencode.json(c)` system/global/project + `.opencode/` agents/commands/skills | Đọc + normalize trong bộ nhớ, **giữ nguyên file**. Convert native v2 là optional |
| Tên field cũ | `permission`→`permissions[]`, `bash`→`shell`, `task`→`subagent`, `agent`+`mode`→`agents`, `provider`→`providers`, `command`→`commands`, MCP `enabled`→`disabled`, agent `prompt`→`system`, model `id`→`modelID`, OAuth `clientId`→`client_id`... V1 + V2 được phép **coexist**, V2 thắng khi cùng set 1 giá trị |
| Plugin v1 | **VỠ** — viết lại theo plugin API mới, hot-reload được |
| Script gọi server API v1 | **VỠ** — port sang API mới (`@opencode/client`) |
| `tui.json` | Chuyển sang `cli.json` global duy nhất |
| `lsp` config | Giữ file nhưng **không chạy language server, không diagnostics** — dùng linter/typecheck của project |
| `CLAUDE.md` fallback | **Không đọc** — chỉ `AGENTS.md` |
| `mode/` dirs, `skill/` (số ít) | Vẫn discover (nhưng nên chuyển sang `agents/`, `skills/`) |
| `/share` | **Bỏ hẳn** (backend retired từ v1.19.1) |

Cách migrate config nhàn nhất (docs gợi ý): mở OpenCode v2 và bảo nó:

```text
Migrate my OpenCode configuration, including file-based definitions, from the V1 format to the native V2 format.
Preserve its behavior and all unrelated settings.
```

## 4. So sánh

| Việc | V1 | V2 | Ghi chú |
|---|---|---|---|
| Process | client/server có nhưng ít dùng | 1 background service/user mặc định | v2 mở nhiều cửa sổ vẫn nhất quán |
| MCP tools | native tool list | Code Mode default | v2 chịu được nhiều servers |
| Subagent/shell | foreground | foreground + background | v2 không block prompt |
| Plugin | API 1.0 | API mới, TUI plugins stable, hot-reload | phải port |
| TUI config | layered `tui.json` | 1 file `cli.json` global | auto-migrate lần đầu |

## 5. Lỗi thường gặp

### 1. `opencode upgrade --major` báo đang mới nhất dù vẫn v1

```text
❌ SAI: o v1.18.x go `upgrade --major` roi bao "khong co gi moi"
✅ ĐÚNG: /update len latest 1.x (1.19.x) truoc, roi moi upgrade --major
```
**Bài học:** upgrade path yêu cầu latest 1.x. Đứng ở bản cũ thì offer 2.0 không hiện.

### 2. Homebrew/yarn quản lý mà update kiểu curl

```text
❌ SAI: brew cai v1 roi curl de len v2 -> 2 bo quan ly danh nhau
✅ ĐÚNG: go ban package-manager truoc (hoac upgrade bang chinh package manager do), giu 1 kenh duy nhat
```
**Bài học:** v1.19.2+ đã tách line update (1.x không offer 2.x như update thường). Trộn kênh = version ma.

## 6. Best practices (kèm "vì sao")

- Snapshot config trước upgrade (`cp -r ~/.config/opencode /tmp/backup`). **Vì sao?** Normalize trong bộ nhớ không rewrite file, nhưng backup giúp diff sau migrate.
- Upgrade xong verify 5 thứ: models, credentials, agents, permissions, MCP (`opencode mcp list` + `/mcps`). **Vì sao?** Đây là 5 thứ hay gãy ngầm nhất.
- Port plugin/API trước khi rủ cả team lên. **Vì sao?** 2 breaking này chặn cả team nếu tool nội bộ chết.

## 7. Bài tập nhỏ

1. (5 phút) `opencode --version` + `which opencode` → biết mình đang ở line nào, binary từ đâu.
2. (10 phút) Nếu đang v1: backup config, lên latest 1.x, `upgrade --major`, verify 5 thứ trên.
3. (5 phút) Mở TUI v2, `cat ~/.config/opencode/cli.json` → xem settings nào được auto-migrate.

## 8. Reference

- Migrate v1: https://opencode.ai/v2/docs/migrate-v1/
- Announcement 2.0: https://anoma.ly/notes/opencode-2-0/
- Changelog: https://opencode.ai/changelog

> **Chốt bài 01:** đúng kênh → đúng thứ tự → verify 5 thứ. Xong mới đụng config ở bài 03.
