# 00 — Tổng quan OpenCode 2 (vì sao v2 khác v1?)

> **Dành cho:** ai cũng nên đọc trước · **Vấn đề:** v2 đổi process model + tool model + execution model cùng lúc, không nắm 3 cái này thì config nào cũng sai · **Đọc xong:** kể được v2 khác v1 ở đâu và chọn đúng bề mặt cho task · **Thời gian:** ~12 phút.

## Mục tiêu bài học

- Kể được 3 thay đổi lớn: shared background service, Code Mode cho MCP, background subagents/shell.
- Phân biệt 4 bề mặt: TUI / Desktop / Web / CLI non-interactive (`run`).
- Biết 3 breaking changes khi migrate v1→v2.

## Mục lục

- [1. OpenCode 2 là gì](#1-opencode-2-là-gì)
- [2. Ba thay đổi lớn](#2-ba-thay-đổi-lớn)
- [3. Bốn bề mặt, một service](#3-bốn-bề-mặt-một-service)
- [4. So sánh với Copilot / Claude Code](#4-so-sánh-với-copilot--claude-code)
- [5. Lỗi thường gặp](#5-lỗi-thường-gặp)
- [6. Best practices](#6-best-practices)
- [7. Bài tập nhỏ](#7-bài-tập-nhỏ)
- [8. Reference](#8-reference)

## 1. OpenCode 2 là gì

**1 câu:** OpenCode là AI coding agent mã nguồn mở (MIT, 210k+ stars giữa 10/2026), chạy terminal-first, cho phép bạn dùng **bất kỳ model nào** (key của bạn, Go subscription, hoặc Zen gateway).

**Nôm na:** nếu Copilot là "phụ bếp đứng sẵn trong bếp IDE", OpenCode là "đội thợ bạn gọi tới công trường terminal" — bạn chỉ công việc, họ tự đi lấy đồ nghề (tools/MCP), làm xong báo cáo, việc lâu thì làm nền không chặn bạn nói tiếp.

**Vì sao quan trọng?** Vì chọn sai "đội thợ" cho việc sẽ tốn tiền + tốn thời gian: việc gõ từng dòng hợp IDE autocomplete, việc refactor đa file + chạy lệnh hợp agent terminal như OpenCode.
**Nếu làm sai?** Dùng OpenCode như chatbot hỏi đáp (không cho tools, không cho chạy lệnh) = trả tiền model để nhận câu trả lời chung chung, phí nhất.

## 2. Ba thay đổi lớn

### 2.1. Một background service chung (thay vì mỗi cửa sổ một process)

V1 đã có thiết kế client/server nhưng ít ai dùng. V2 chạy **1 background service cho mỗi user**, TUI + Desktop + Web đều nói chuyện với nó.

```bash
opencode          # TUI nói chuyện với service chung
opencode serve --port 4096   # dựng service/API + web server tường minh
opencode pair     # lấy URL + user/pass mở Web UI trỏ vào service đó
```

**Vì sao quan trọng?** Mở 3 cửa sổ cùng project = cùng 1 service, sessions/permissions/MCP nhất quán, không còn "mỗi terminal một thế giới".
**Nếu làm sai?** Chạy `opencode` ở 2 user khác nhau rồi mong share session — mỗi user 1 service, không thấy nhau.

### 2.2. Code Mode cho MCP (mặc định bật)

Thay vì bày từng MCP tool lên model (10 servers × 20 tools = 200 tools ngốn context), v2 gói tools mỗi server thành **functions gọi được từ một JS interpreter tối giản** (`@opencode/codemode`). Agent viết 1 script: gọi tool A → map kết quả → gọi tool B, **1 round-trip**.

**Nôm na:** thay vì sai vặt từng món ("đi mua trứng... về rồi... giờ đi mua sữa"), bạn đưa cả danh sách + xe ("mua hết list này rồi về").

**Vì sao quan trọng?** Đây là lý do v2 dám nói "add cả nghìn MCP servers mà context không phình".
**Nếu làm sai?** Tắt `codemode` hàng loạt vì "không quen" = quay lại bloat context như v1.

```jsonc
// chi tat khi server BAT BUOC phai hien native tool
{ "mcp": { "servers": { "my-server": { "type": "remote", "url": "https://mcp.example.com/mcp", "codemode": false } } } }
```

### 2.3. Background subagents + background shell

Model mới giỏi orchestration nên v2 cho phép: primary agent **spawn subagent chạy nền** (thậm chí model khác, vd background `fable` review trong lúc bạn prompt tiếp) + **shell async** (lệnh lâu không block agent, xong thì notify; lệnh foreground lâu thì bấm hotkey đẩy ra background).

```
Ban noi: "spawn background explore subagent ve ban do auth, toi tiep tuc prompt"
Agent:   child session chay nen -> xong bao lai, ban khong bi block
```

**Vì sao quan trọng?** Lần đầu terminal-agent làm việc kiểu "song song thật" thay vì "làm từng việc nối đuôi".
**Nếu làm sai?** Mọi thứ để foreground: `npm install` 5 phút là 5 phút ngồi nhìn.

### 3 breaking changes (nhớ kỹ trước khi upgrade)

1. **Plugin v1 không chạy trên v2** (plugin API viết lại; team tự rewrite ~80 internal plugins để chứng minh API đủ dùng).
2. **Server API + clients đổi contract** (dùng `@opencode/client` mới; embed thì `@opencode/sdk`).
3. **Config TUI chuyển nhà**: layered `tui.json(c)` → **1 file global** `~/.config/opencode/cli.json` (tự migrate lần đầu mở v2).

Ngoài 3 cái trên, **config server cũ vẫn được đọc + normalize trong bộ nhớ** (không rewrite file). Convert sang native v2 là optional — nhờ chính OpenCode migrate giúp.

## 3. Bốn bề mặt, một service

| Bề mặt | Lệnh / cách mở | Khi nào dùng |
|---|---|---|
| TUI (chính) | `opencode` trong project | code hàng ngày: prompt + tools + diff + undo |
| Desktop app | dmg/deb/rpm/AppImage | thích GUI nhưng vẫn chung service |
| Web UI | `opencode pair` → mở URL | xem/điều khiển từ xa, sau proxy/auth |
| CLI non-interactive | `opencode run "..." -m provider/model` | CI, script, cron, quick answer không mở TUI |

Ví dụ CI review:

```bash
npm install -g @opencode/cli
opencode run --model anthropic/claude-sonnet-4-5 "Review repo for correctness, list issues only."
```

## 4. So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code | Ghi chú |
|---|---|---|---|---|
| Nơi mạnh nhất | Terminal TUI, 1 service nền | VS Code autocomplete + Chat | Terminal agentic | Chọn tool theo nơi bạn sống |
| Tiền | OSS free + trả model (BYOK/Go/Zen) | Seat + AI Credits | Subscription/API | OpenCode tách tiền tool khỏi tiền model |
| Custom persona | agents `build/plan/general/explore` + custom | Ask/Edit/Agent + custom agent | Subagents | Ý tưởng giống, khác tên file |
| Tool ngoài | MCP + Code Mode | MCP native | MCP native | Chỉ OpenCode gom qua script runtime |
| Embed vào app | `@opencode/sdk` (chạy in-process, cả Durable Objects) | Copilot SDK | Headless/API | OpenCode đi xa nhất ở "làm library" |

## 5. Lỗi thường gặp

### 1. Cài theo kênh cũ rồi bảo "sao vẫn v1?"

```text
❌ SAI: npm i -g opencode-ai (hoac script opencode.ai/install) roi doi co v2
✅ ĐÚNG: curl -fsSL https://opencode.ai/v2/install | bash | brew install anomalyco/tap/opencode-v2 | npm i -g @opencode/cli
```
**Bài học:** kênh cũ bị ghim ở line 1.x (1.19.x giữa 10/2026) cố ý. Nhìn tên package trước khi kết luận version.

### 2. Mong plugin v1 + script API v1 chạy tiếp

```text
❌ SAI: copy plugins/ + script fetch server API v1 sang may v2
✅ ĐÚNG: port plugin sang API moi; script doi sang @opencode/client / API reference v2
```
**Bài học:** 2 breaking changes này là cố ý. Rename file không đủ.

## 6. Best practices (kèm "vì sao")

- Mở TUI **tại root project** rồi mới prompt. **Vì sao?** `.opencode/` discovery + `AGENTS.md` đi từ cwd lên root; đứng sai chỗ = agent mù luật.
- Task mới = session mới (`Ctrl+X N`). **Vì sao?** Context cũ là nhiễu; session sạch rẻ hơn compaction sau này.
- Việc dài auto cho ra background sớm, đừng đợi nó ì. **Vì sao?** Model orchestration chỉ phát huy khi bạn prompt tiếp trong lúc nó làm.

## 7. Bài tập nhỏ

1. (5 phút) `opencode --version` → xác nhận `2.0.x`. Mở TUI, gõ `/highlights` đọc changelog v2.
2. (5 phút) `Ctrl+X M` đổi model, `Shift+Tab` đổi agent, `Ctrl+P` mở palette — sờ 3 phím này cho thuộc tay.
3. (10 phút) Chạy `opencode run "giai thich repo nay trong 5 gach dau dong"` từ ngoài TUI, so với hỏi trong TUI — cảm nhận khác biệt non-interactive.

## 8. Reference

- V2 docs: https://opencode.ai/v2/docs
- Announcement 2.0 (12/10/2026): https://anoma.ly/notes/opencode-2-0/
- Migrate v1: https://opencode.ai/v2/docs/migrate-v1/

> **Chốt bài 00:** v2 = 1 service chung + Code Mode gom MCP + background tasks. Nhớ 3 breaking changes rồi hãy sang bài 01 upgrade.
