# 14 — Worktree + Git + IDE/ACP (làm song song, không giẫm chân)

> **Dành cho:** người làm nhiều task song song / dùng editor khác · **Vấn đề:** 2 task chung 1 working tree là conflict + agent sửa nhầm · **Đọc xong:** dùng worktree isolation + `AGENTS.md` + ACP · **Thời gian:** ~12 phút.

## Mục tiêu

- Tạo/list/remove worktree qua Code Mode (`worktree_*`) + move session vào worktree.
- Chỉnh `worktree.directory` cho project của bạn.
- Viết `AGENTS.md` tối thiểu (vì v2 chỉ đọc file này).
- Hiểu ACP (`opencode acp`) cho editor tích hợp (Zed...) + debug khi editor lỗi.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Luồng hoạt động](#luồng-hoạt-động-flow)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [Giải thích từng phần](#giải-thích-từng-phần)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. Worktree isolation

Nhờ agent trong Code Mode: `worktree_create` (tạo cây Git riêng, trả về `directory`), `session_move` (move session vào đó — có hiệu lực tại biên an toàn, việc phụ thuộc destination để call sau), `worktree_list` (liệt kê), `worktree_remove` (dọn; thêm `force` để vứt luôn thay đổi chưa commit). Mỗi task 1 worktree + 1 session → không giẫm file nhau, `/undo` cũng an toàn hơn.

```text
Ban: "tao worktree cho feat/login, move session nay vao do roi code"
Agent: worktree_create -> session_move -> code + test trong worktree rieng
```

Mặc định, worktree mới được tạo dưới data directory của server (`worktree/<6 ký tự đầu projectID>`). Muốn chủ động vị trí:

```jsonc title="opencode.jsonc"
{
  "worktree": {
    "directory": "../worktrees"   // duong dan tuong doi resolve tu canonical checkout cua project
  }
}
```

Git là chiến lược (strategy) mặc định; plugin có thể đăng ký strategy riêng và tự thành default trong runtime của nó. Trong TUI, dialog **Move session** còn có phím riêng: `ctrl+a` tạo worktree mới, `ctrl+m` move, `ctrl+d` xóa worktree, `ctrl+r` refresh.

**Vì sao quan trọng?** Song song 3 features chung 1 tree = agent A sửa file agent B đang sửa. Worktree là vách ngăn vật lý.
**Nếu làm sai?** Task rủi ro cao (migration, refactor lớn) làm thẳng trên `main` — sai là mất đường lui.

### 2. `AGENTS.md` (file luật duy nhất v2 đọc)

V2 **chỉ** discover `AGENTS.md` — không fallback `CLAUDE.md` (docs ghi rõ callout này). Đặt ở root; các file trong thư mục cha/anh em cũng được gộp theo thứ tự từ xa đến gần; `AGENTS.md` ở thư mục con sẽ được nạp khi agent đọc tới vùng đó (nearest-first, có dedupe). Global: `~/.config/opencode/AGENTS.md`.

Nội dung tối thiểu: stack + lệnh dev/build/test đã chạy thử + quy ước không được phá (xem tips 01 + `../templates/AGENTS.md`).

```md
# AGENTS.md
- Run `bun typecheck` after changing TypeScript.
- Keep database queries in `src/database`.
- Do not edit generated files directly.
```

Mẹo vận hành: sửa `AGENTS.md` khi session đang chạy — OpenCode nhận thấy thay đổi và nạp instruction update **trước** prompt kế tiếp (dòng "AGENTS.md changes" → "instruction update" → prompt). Muốn bỏ hẳn project rules: `OPENCODE_DISABLE_PROJECT_CONFIG=1` (global file vẫn nạp).

Thứ tự nạp ban đầu (docs ghi rõ — biết để không thắc mắc "luật ai đè luật ai"):

```text
1. Agent hoac provider system prompt
2. Code Mode tool guidance (khi bat)
3. MCP server / reference / skill guidance
4. AGENTS.md (global + project), roi instructions khai bao trong config
5. Built-in date + environment context
6. Session-specific instructions tu API
```

Các nguồn này **gộp lại**, không override nhau; file `AGENTS.md` lồng nhau nạp theo discovery order.

**Vì sao quan trọng?** Rules sai tên file = rules không tồn tại. Toàn bộ kỷ luật của agent (lệnh test, vùng cấm) sống trong đúng 1 tên file.
**Nếu làm sai?** Để `CLAUDE.md` cũ từ thời Claude Code rồi thắc mắc "sao OpenCode không nghe lời" — vì nó chưa từng đọc.

### 3. ACP cho editor (`opencode acp`)

`opencode acp` chạy OpenCode như một agent theo [Agent Client Protocol](https://agentclientprotocol.com) — trao đổi JSON-RPC qua stdin/stdout (ACP protocol version 1), để ACP client (Zed...) lái OpenCode. Cấu hình Zed:

```json title="~/.config/zed/settings.json"
{
  "agent_servers": {
    "OpenCode": {
      "command": "opencode",
      "args": ["acp"]
    }
  }
}
```

Chi tiết đáng nhớ:

- `opencode acp` tự khởi chạy **private OpenCode server riêng** cho nó — không nối shared background service, không mở network port cho ACP; thoát khi client đóng stdin. 1 process phục vụ được nhiều ACP session.
- Auth dùng credential provider sẵn có; đăng nhập từ terminal trước: `opencode auth login`. Nếu prompt fail vì provider chưa auth, client nhận ACP error `auth_required`.
- Debug: chạy trong terminal trực tiếp sẽ "treo" — nó đang chờ message trên stdin, đó là bình thường. Client báo protocol lỗi thì thêm `--print-logs` **trước** `acp` (`opencode --print-logs acp`) để log ra stderr, stdout chỉ còn ACP message.
- Fix vụ extension gọi `--port` cũ đã bị gỡ — update extension lên bản nói ACP v2.
- IDE chỉ là mặt tiền — luật vẫn từ service: permissions, AGENTS.md, plugins, MCP của **thư mục cwd** là thứ chi phối.

## Luồng hoạt động (Flow)

1. **Ước lượng task** — >30 phút, đụng schema/migration, hoặc sẽ chạy song song với task khác? Nếu có: đi thẳng bước 2. Không: làm thẳng, đỡ công.
2. **Tạo vách ngăn** — nhờ agent `worktree_create` + `session_move`. Lỗi hay gặp: tạo worktree nhưng quên move session — bạn vẫn gõ code vào tree cũ.
3. **Kiểm tra luật đã vào chưa** — mở đầu session, hỏi agent "bạn đang đọc AGENTS.md nào?" — nó trả lời được là luật sống.
4. **Làm việc trong worktree** — commit nhỏ, test thường; `/undo` giờ chỉ đụng worktree này.
5. **Merge + dọn dẹp** — merge worktree về nhánh chính, rồi `worktree_remove` ngay trong cùng lượt. Lỗi hay gặp: quên bước 5, sau 1 tuần có 7 worktree ma.

## Ví dụ chi tiết

### Vòng đời worktree đầy đủ (nói với agent)

```text
Ban: "tao worktree ten 'rate-limit' roi move session nay vao do"
# agent: worktree_create({ name: "rate-limit" }) -> directory
# agent: session_move({ directory: "<worktree dir>" })

Ban: "code tinh nang rate-limit va chay test"
# ... lam viec trong worktree ...

Ban: "xong roi, remove worktree nay"       # can merge truoc thi commit + merge tu ban
# agent: worktree_remove({ directory: "...", force: false })
```

```bash
# tu kiem tra phia git (khong qua agent):
git worktree list
```

### Worktree qua SDK (khi bạn điều khiển bằng code)

```ts
// nho bai 12: @opencode/sdk chay engine trong tien trinh cua ban
const projectID = session.projectID
const worktree = await opencode.worktree.create({ projectID, name: "task" })
await opencode.worktree.refresh({ projectID })   // quet worktree qua cac checkout da biet
await opencode.worktree.remove({ projectID, directory: worktree.directory, force: false })
```

`refresh` quét worktree qua các checkout root đã biết bằng mọi strategy khả dụng; `remove` dùng strategy đã ghi nhận, fail nếu strategy đó không còn sẵn. Bạn đăng ký strategy riêng qua plugin (`ctx.worktree` transform) — khi đó nó tự thành default trong runtime plugin.

### `AGENTS.md` phân tầng cho monorepo

```text
my-project/
├── AGENTS.md                # luat chung: build/test/chuan commit
└── packages/web/
    └── AGENTS.md            # luat rieng web: khong sua schema, chi dung hook X
```

Root nạp khi mở session; file trong `packages/web/` nạp tự động khi agent đọc/sửa vào khu đó — luật hiện **đúng lúc cần**, không đốt context từ đầu.

### `AGENTS.md` qua config `instructions` (khi AGENTS.md chưa đủ)

```jsonc title="opencode.jsonc"
{
  "instructions": [
    "CONTRIBUTING.md",           // file, resolve tu workspace len project root
    "docs/guidelines/*.md",      // glob
    "~/rules/opencode.md",       // path tuyet doi / home
    "https://example.com/instructions.md"  // URL, fetch luc config load, timeout 5 giay
  ]
}
```

Configured instructions nạp **sau** các `AGENTS.md` và theo thứ tự khai báo. File local tự cập nhật khi đổi; file khớp glob mới nạp ở lần config đổi kế tiếp; URL fetch thất bại thì dùng nội dung lần fetch cuối (hoặc bị bỏ qua nếu chưa từng fetch được).

**Vì sao quan trọng?** AGENTS.md là quy ước phát hiện; `instructions` là cách đưa tài liệu không tên chuẩn (CONTRIBUTING, bộ quy tắc reviewer...) vào cùng mạch context mà không phải gộp chúng thành AGENTS.md.

Root nạp khi mở session; file trong `packages/web/` nạp tự động khi agent đọc/sửa vào khu đó — luật hiện **đúng lúc cần**, không đốt context từ đầu.

## Giải thích từng phần

- **`worktree_remove` dùng permission `edit`** với thư mục worktree làm resource — vì xóa worktree là hành động phá dữ liệu; hai util còn lại (`create`, `list`) không yêu cầu permission action riêng.
- **`session_move` chờ "safe boundary"** — move không xảy ra giữa chừng model đang chạy; việc phụ thuộc đường dẫn mới (cài lại node_modules, chạy build) nên đặt ở prompt sau.
- **Snapshot theo active directory** — bài 11 nói `/undo` hồi file trong thư mục active; worktree giúp phạm vi đó nhỏ và sạch hơn.
- **ACP session** — client tạo session với `cwd` tuyệt đối; cấu hình của thư mục đó (models, agents, commands, skills, plugins, MCP) là thứ session dùng. `session/load` replay messages, còn `resume`/`fork` thì không.
- **Additional directories** — ACP client có thể cấp thêm thư mục (`additionalDirectories`) trên `session/new`, `session/load`, `session/resume`, `session/fork`:

```json
{ "cwd": "/work/app", "additionalDirectories": ["/work/shared"], "mcpServers": [] }
```

Mỗi entry phải là đường dẫn tuyệt đối, không chứa `*` hay `?`. Permission rule read/edit/shell vẫn áp dụng; chứng thư cấp lưu trên session (child session kế thừa) — tức client ACP khác dùng lại session vẫn thấy các grant cũ.

- **ACP có thể đi cả MCP** — client được truyền MCP servers (stdio + HTTP) khi tạo session; server trùng tên config sẽ đè server cấu hình trong thư mục đó; policy `integration.use` vẫn áp dụng.
- **Một prompt mỗi lúc** — session ACP chạy 1 prompt tại một; prompt thứ hai trong lúc chạy sẽ bị lỗi. Hủy bằng `session/cancel` (`stopReason: "cancelled"`).
- **ACP child session** — OpenCode gửi update của child session qua `session/update` trên session của ACP prompt, mỗi update mang `_meta["opencode/child-session"]` (id, parentID, depth, title). Sau khi prompt kết thúc, OpenCode ngừng gửi update child, nhưng permission request và question từ child vẫn tới client.
- **ACP retry status** — khi model call fail và OpenCode lên lịch retry, nó gửi `session_info_update` với `_meta["opencode/retry"]` (attempt, nextRetryAt, error); khi retry bắt đầu thật, giá trị chuyển thành `null`. Client nên clear retry status khi prompt response đến.
- **ACP compaction marker** — client không advertise `session.compaction` thì OpenCode báo compaction qua marker `_meta["opencode/compaction"]` (status: started/completed/failed; messageId ghép start/end; reason: auto/manual). Client nào advertise `session.compaction` thì nhận bản update đầy đủ kèm summary chunk theo RFD của ACP (đang Preview).

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Song song | git worktree + session riêng (qua Code Mode) | worktrees + checkpoints | worktree tương tự |
| Luật repo | `AGENTS.md` duy nhất (phân tầng) | `copilot-instructions.md` + `AGENTS.md` | `CLAUDE.md` |
| Editor lái agent | ACP (`opencode acp`, stdin/stdout) | extension chính chủ | extension/LSP |

## Lỗi thường gặp

### 1. Sai tên file luật

```text
❌ SAI: de CLAUDE.md cu tu thoi Claude Code roi bao "sao OpenCode khong doc luat"
✅ ĐÚNG: doi/mirror sang AGENTS.md; giu 1 nguon that, con lai chi tro duong
```
**Bài học:** sai tên file = mù luật. V2 không đoán hộ bạn.

### 2. ACP "treo" khi tự chạy tay

```text
❌ SAI: go `opencode acp` trong terminal roi nghi no bi loi vi khong gi xay ra
✅ ĐÚNG: no dang cho JSON-RPC tren stdin - chay tu ACP client (Zed); debug loi thi them --print-logs truoc acp
```
**Bài học:** stdin/stdout là giao thức, không phải UI. "Im lặng" là trạng thái chờ.

### 3. Worktree cũ chất đống

```text
❌ SAI: tao 10 worktree qua 3 ngay, khong ai remove, disk day + git worktree list ranh rac
✅ ĐÚNG: task merge xong -> remove ngay trong cung luot lam; can quet thi worktree_list truoc
```
**Bài học:** worktree rẻ để tạo nhưng phải có lối ra; quy trình không có bước dọn là nợ kỹ thuật.

## Best practices (kèm "vì sao")

- Task >30 phút hoặc đụng schema/migration → worktree riêng. **Vì sao?** Rollback = xóa worktree, rẻ hơn revert commit lỗi.
- Giữ `AGENTS.md` ngắn, chỉ luật đã kiểm chứng bằng lệnh thật. **Vì sao?** Luật dài chưa test là luật agent diễn giải tùy hứng; file phân tầng giúp luật cục bộ hiện đúng chỗ.
- Extension VS Code báo lỗi `--port`: update extension lên bản nói ACP v2. **Vì sao?** Flag cũ đã gỡ — cố dùng là fail.
- Đặt `worktree.directory` theo team (vd `.lane/trees` như docs ví dụ). **Vì sao?** Vị trí dự đoán được giúp cả người lẫn CI tìm worktree, đỡ đào data directory của server.
- Tách việc (worktree) + tách luật (AGENTS.md) + tách mặt tiền (ACP) — dùng bộ ba, không chọn lọc. **Vì sao?** Ba lớp cách ly cùng phục vụ một mục tiêu: song song hóa không phá lẫn nhau.

## Bài tập nhỏ

1. (10 phút) Nhờ agent tạo worktree cho 1 task thử, code xong thì remove — đi hết vòng đời; kiểm chứng bằng `git worktree list`.
2. (5 phút) Viết `AGENTS.md` 15 dòng cho 1 repo thật (stack + 3 lệnh + 3 điều cấm), rồi sửa nó giữa session và hỏi agent xem luật mới đã vào chưa.
3. (10 phút) Cấu hình Zed (hoặc client ACP khác) chạy `opencode acp`; thử `opencode --print-logs acp` khi client báo lỗi protocol.

## Reference

Nguồn chính thức (đã verify 28/10/2026):

- Tools — `worktree_*`, `session_move`, permission của remove: https://opencode.ai/v2/docs/tools/
- Config — `worktree.directory`, vị trí mặc định, strategy: https://opencode.ai/v2/docs/config/
- Instructions — `AGENTS.md` only, discovery, update runtime: https://opencode.ai/v2/docs/instructions/
- ACP — `opencode acp`, Zed config, auth, `--print-logs`: https://opencode.ai/v2/docs/cli/acp/ và https://opencode.ai/v2/docs/cli/commands/
- Keybinds — `dialog.move_session.*`: https://opencode.ai/v2/docs/cli/keybinds/

Bài liên quan: [11 — Sessions & undo](./11-sessions-undo-compaction.md) (snapshot theo thư mục active), [13 — Code Mode scripting](./13-codemode-scripting.md) (worktree qua Code Mode), [09 — Permissions & policies](./09-permissions-policies.md), tips [01 — AGENTS.md hygiene](../02-tips-thuc-chien/01-agents-md-hygiene.md), mẫu [`../templates/AGENTS.md`](../templates/AGENTS.md).

> **Chốt bài 14 + cả nhóm 01:** worktree cách ly việc, AGENTS.md cách ly luật, ACP cách ly mặt tiền. Ba vách ngăn này là dáng pro của OpenCode 2.
