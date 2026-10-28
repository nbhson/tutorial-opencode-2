# 02 — TUI / Desktop / Web / CLI (4 bề mặt, 1 service)

> **Dành cho:** người mới mở OpenCode lần đầu · **Vấn đề:** không biết khi nào mở TUI, khi nào dùng `run`, khi nào mở Desktop/Web · **Đọc xong:** chọn đúng bề mặt cho từng việc + thuộc phím TUI cốt lõi · **Thời gian:** ~15 phút.

## Mục tiêu bài học

- Kể được 4 bề mặt (TUI, mini, Desktop, Web) nói chuyện với 1 background service thế nào.
- Thuộc 10 phím/slash TUI dùng hàng ngày + biết override trong `cli.json`.
- Biết khi nào dùng `opencode run` thay vì mở TUI, và bẫy non-interactive.
- Tắt/bật shared service có chủ đích, không phá pair.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Luồng chọn bề mặt](#luồng-chọn-bề-mặt)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. Shared background service

**1 câu:** V2 mặc định chạy 1 background server dùng chung cho user của bạn; mọi client (TUI, mini, Desktop, Web) chỉ là mặt tiền kết nối vào server đó.

**Nôm na:** như tổng đài — bạn gọi bằng điện thoại bàn (TUI), app (Desktop), web (Web) thì tổng đài viên vẫn là một người, lịch sử cuộc gọi (sessions) không mất. Cài trên 3 máy thì mỗi máy có tổng đài riêng, không dùng chung.

Server là nơi **sở hữu** mọi thứ: sessions, config, integrations, permissions, tool execution. Client chỉ vẽ lại. (Nguồn: [opencode.ai/v2/docs/cli](https://opencode.ai/v2/docs/cli) — verify 28/10/2026)

```bash
# moc vao 1 server cu the thay vi de auto-discover
opencode --server http://localhost:4096

# chay doc lap: server rieng cho session nay thoi, khong dung shared service
opencode --standalone

# chinh shared service bang lenh service (khong phai sua file)
opencode service set disabled true   # tat shared service, cac lenh sau dung private server
opencode service unset disabled      # bat lai che do tu dong
opencode service start               # start shared service thu cong
```

**Vì sao quan trọng?** Không còn cảnh "terminal A không thấy session của terminal B" — cả hai cùng nói chuyện với 1 server, session sinh ra ở TUI hiện cả ở Desktop/Web.
**Nếu làm sai?** Service là **mỗi user một cái** — `sudo -u other opencode` rồi hỏi "session của tôi đâu" là sai mô hình. Lưu ý nữa: `opencode pair` cần shared service; nếu bạn đã `service set disabled true` thì pair không còn hoạt động.

### 2. TUI (mặt chính)

Mở bằng `opencode` tại project (hoặc `opencode ~/code/my-project` để mở project khác). Gõ yêu cầu, Enter. Gõ `/` xem slash, `Ctrl+P` mở command palette. Terminal được docs khuyên dùng: Ghostty, WezTerm, Alacritty, Kitty; có truecolor thì theme lên màu chuẩn. (verify 28/10/2026 — [docs/cli](https://opencode.ai/v2/docs/cli), [docs/cli/keybinds](https://opencode.ai/v2/docs/cli/keybinds))

Mẹo nhớ phím: leader mặc định là `Ctrl+X`, mọi tổ hợp `<leader>x` đều hiểu là `Ctrl+X` rồi bấm `x`.

| Phím / slash | Việc | Ví dụ |
|---|---|---|
| `Ctrl+X M` (`<leader>m`) / `/models` | đổi model giữa session | việc dễ → model rẻ, kiến trúc khó → model mạnh |
| `Ctrl+T` | xoay variant của model (reasoning effort) | `#high` ↔ `#low` không mở picker |
| `F2` / `Shift+F2` | xoay model gần đây tới/lui | đổi nhanh không mở picker |
| `Shift+Tab` | xoay agent | `build` code ↔ `plan` lập kế hoạch |
| `Ctrl+X N` / `/new` | session mới | task mới = session mới |
| `Ctrl+X L` / `/sessions`, `Ctrl+O` | danh sách session, recent sessions/projects | tiếp việc hôm qua |
| `Ctrl+X E` / `/editor` | sửa prompt trong `$EDITOR` | prompt dài 20 dòng |
| `Ctrl+X U` / `/undo`, `Ctrl+X R` | lùi/tiến checkpoint | agent sửa hỏng → undo |
| `/diff` (`f` fullscreen, `d` đổi scope, `m` mark reviewed) | xem diff cạnh session | review trước khi accept |
| `Ctrl+X C` | compact session | context dài → nén lại |
| `Esc` | interrupt | agent chạy lan → dừng ngay |
| `Ctrl+B` | background tool đang chặn | lệnh lâu → để chạy nền, làm tiếp |

Muốn đổi phím: trong `~/.config/opencode/cli.json` (file CLI settings, chỉ có global — không có bản project-local):

```json
{
  "keybinds": { "leader": "ctrl+space", "model.list": "<leader>m" },
  "leader": { "timeout": 2000 }
}
```

Đặt `"none"` hoặc `false` để tắt 1 binding; Unknown command ID bị bỏ qua nên gõ sai không crash.

Tham khảo thêm (tất cả verify trong [docs/cli/keybinds](https://opencode.ai/v2/docs/cli/keybinds/)):

- `Ctrl+Alt+K` mở **which-key** — bảng gợi ý phím theo ngữ cảnh, cứu khi quên tổ hợp.
- `Ctrl+R` rename session; `Ctrl+F` pin/unpin session trong list; `<leader>1..9` nhảy nhanh tới session slot 1–9.
- Trong model dialog: `Ctrl+F` đánh dấu favorite, `Ctrl+A` mở provider list, `Ctrl+U` xem usage limits.
- Diff viewer: `n`/`p` chuyển file, `]`/`[` nhảy hunk, `v` đổi split/unified, `b` bật/tắt file tree, `s` single patch.
- `session.tab.select.1..10` = `<leader>1..0` — đổi session tab như đổi tab trình duyệt.

### 2.1. Tuỳ biến TUI qua `cli.json` (các nhóm hay dùng)

```jsonc
// prompt dai -> mo editor; paste lon -> rut gon thanh placeholder
{
  "prompt": { "editor": true, "paste": "compact" },
  // moi permission request: prompt (hoac autoaccept — can biem rui ro)
  "session": { "permissions": "prompt", "tps": true, "markdown": "rendered" },
  // diff mo mac dinh theo branch, wrap theo tu
  "diffs": { "source": "branch", "wrap": "word", "view": "auto" },
  // thong bao + am thanh khi terminal khong focus
  "attention": { "notifications": true, "sound": true, "volume": 0.4 },
  // tat man hinh highlights sau moi update
  "highlights": false
}
```

`session.permissions: "autoaccept"` nhận **mọi** permission request tự động — chỉ dùng cho sandbox/CI, không dùng trên máy có code thật. Diffs có 4 scope: `branch`, `committed`, `working`, `turn` (thay đổi của lượt vừa rồi); trong `/diff` bấm `d` để đổi scope, chọn `Base` để so với branch khác — lựa chọn này sống đến khi thoát TUI, không ghi vào `cli.json`.

**Vì sao quan trọng?** TUI là nơi bạn sống 8 tiếng/ngày; 10 phím dưới đây quyết định bạn điều khiển agent hay để agent điều khiển bạn.
**Nếu làm sai?** Không biết `/undo` thì mỗi lần agent sửa hỏng bạn phải `git checkout .` tay — mất cả những thay đổi đúng.

### 3. Mini — TUI thu gọn

**1 câu:** `opencode mini` là giao diện tương tác tối giản, không full-screen — hợp script/terminal nhỏ, ssh yếu.

```bash
opencode mini            # giao dien toi gian trong chinh terminal hien tai
opencode mini --help     # xem cac flag: session, model, agent, prompt, replay
```

`cli.json` có cả nhóm `mini.*` để chỉnh (ẩn tools, ẩn shell output, replay limit...). Cần full transcript, sidebar, tabs thì quay lại TUI thường.

### 4. CLI non-interactive (`run`)

**1 câu:** `opencode run` chạy 1 prompt rồi thoát — cho script/CI, không mở giao diện.

```bash
opencode run "toan bo test do o dau, liet ke file" --dir ./my-app
opencode run -c "tiep tuc fix test do"                    # -c: tiep session gan nhat
opencode run --model anthropic/claude-sonnet-5-5 "Refactor parseToken"
opencode run --format json "summarize repo" > out.json    # output co cau truc de parse
```

**Vì sao quan trọng?** Đây là cách đưa agent vào CI/cron mà không cần người ngồi canh.
**Nếu làm sai?** Dùng `run` cho task cần approve giữa chừng (`ask` permissions) mà không config `deny/allow` trước → task treo đợi input không ai trả lời. Xem [09-permissions-policies.md](09-permissions-policies.md).

### 5. Desktop + Web

- **Desktop**: bản GUI của cùng service — tải dmg (mac), exe (Windows), deb/rpm/AppImage (Linux) từ [opencode.ai/v2/docs](https://opencode.ai/v2/docs/) (verify 28/10/2026). Cài bản nào cũng nói chuyện với cùng server.
- **Web**: `opencode pair` in ra URL một lần, hết hạn sau **5 phút** — mở URL đó ở máy khác để nhìn vào service của bạn. Tiện khi agent chạy ở máy mạnh, bạn theo dõi từ laptop/tablet.

```bash
$ opencode pair
  http://127.0.0.1:49374/auth/connect/...   # link dung 1 lan, het han sau 5 phut
```

Cả TUI, Desktop lẫn Web đều chịu cùng `permissions`/`policies` — đổi mặt không đổi luật (xem [09-permissions-policies.md](09-permissions-policies.md)). Chạy trong container thì dùng image versioned như `ghcr.io/anomalyco/opencode:2.0.0`.

## Luồng chọn bề mặt

1. **Đang code trong terminal** → mở TUI (`opencode`). 90% thời gian của bạn ở đây. Lỗi hay gặp: mở ở sai thư mục → session gắn Location đó; `opencode <dir>` hoặc `session.cd` để đổi.
2. **Prompt dài, cần soạn thảo** → `Ctrl+X E` mở `$EDITOR`. Lỗi hay gặp: chưa đặt `VISUAL`/`EDITOR` → không mở được gì.
3. **Việc chạy trong script/CI/cron** → `opencode run`, không mở TUI. Lỗi hay gặp: permissions `ask` không ai trả lời (đọc lại pitfall ở trên).
4. **Đang ở server không màn hình, muốn xem/giao việc** → `opencode pair` rồi mở Web UI.
5. **Muốn GUI nhưng vẫn giữ workflow terminal** → Desktop app; sessions hiện y như TUI vì cùng service.

## Ví dụ chi tiết

Scenario: bạn muốn một nightly job quét TODO và mở session review sáng hôm sau.

```bash
#!/usr/bin/env bash
# night-scan.sh — chay bang cron, khong mo TUI
# 1. Baodam: shared service da co env can thiet (key...), khong dat trong script
opencode service start

# 2. chay prompt doc-chedo: model re, khong sua code
opencode run \
  --model "opencode/big-pickle" \
  --dir "$HOME/projects/my-app" \
  "quet todo/TODO/FIXME trong repo, nhom theo module, ghi file REPORT.md"

# 3. kiem tra thoat: run tra exit code khac 0 khi that bai
if [ $? -ne 0 ]; then
  echo "night scan that bai" >&2
  exit 1
fi
```

Giải thích:

- `--model opencode/big-pickle` — model Free trên Console (verify 28/10/2026, xem [04-models-zen-go-byok.md](04-models-zen-go-byok.md)); việc quét text rẻ thì đừng đốt model đắt.
- `--dir` chỉ định project mà không cần `cd`.
- Nếu quét này cần shell command → cấu hình `permissions` allow/deny **trước**, vì non-interactive không có ai bấm Allow.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Mặt chính | TUI terminal (+ `mini`) | VS Code IDE | Terminal |
| Chạy không người | `run` + shared service + SDK | Coding agent cloud / Actions | headless `-p` |
| GUI | Desktop + Web cùng service | github.com + IDE | Web/IDE extension tùy bản |
| Editor nhúng | ACP (`opencode acp`) cho editor nói chuyện | Extension chính chủ | Extension/LSP tùy bản |
| Service chung | 1 server/user, mọi client chung sessions | per-session | per-invocation |

## Lỗi thường gặp

### 1. Đợi approve trong `run` non-interactive

```text
❌ SAI: opencode run "refactor auth" voi permissions mac dinh ask moi shell -> treo
✅ ĐÚNG: run voi rules allow san cho lenh an toan + deny san cho lenh nguy hiem; hoac chi dung run cho task read-only
```
**Bài học:** non-interactive không có người bấm Allow. Luật phải viết trước (hoặc dùng `session.permissions: autoaccept` trong `cli.json` nếu chấp nhận rủi ro).

### 2. Tắt shared service rồi mất pair

```text
❌ SAI: opencode service set disabled true roi van goi opencode pair -> khong pair duoc
✅ ĐÚNG: pair can shared service; muon doc lap thi --standalone cho lenh do thoi, de service song cho pair/web
```
**Bài học:** `disabled` chỉ tắt service tự chạy; pair là tính năng của service — tắt nó là mất Web.

### 3. Nhầm CLI settings với project settings

```text
❌ SAI: dat "highlights": false vao opencode.jsonc cua project roi doan "sao van hien highlights"
✅ ĐÚNG: highlights/theme/keybinds... thuoc cli.json global (~/.config/opencode/cli.json), khong co ban project-local
```
**Bài học:** `cli.json` là settings của terminal client; `opencode.jsonc` là settings server/project — hai file hai đời.

## Best practices (kèm "vì sao")

- Hàng ngày sống trong TUI; `run` chỉ cho script/CI. **Vì sao?** `run` không có vòng approve/checkpoint như TUI, task tương tác sẽ treo.
- Đặt `VISUAL`/`EDITOR` trước khi dùng `Ctrl+X E`. **Vì sao?** Không đặt thì TUI không biết mở gì cho prompt dài.
- Tắt highlights auto khi đã quen (`"highlights": false` trong `cli.json`). **Vì sao?** Đỡ 1 màn hình chắn mỗi lần update.
- Override phím ít dùng thay vì học thuộc phím lạ: `"keybinds": { "agent.list": "ctrl+g" }`. **Vì sao?** `cli.json` reload khi đang chạy TUI, không cần restart.
- Dùng `opencode mini` khi đang trong tmux/SSH băng thông thấp. **Vì sao?** Không full-screen, không cướp layout terminal.

## Bài tập nhỏ

1. (5 phút) Mở TUI, gõ `/`, chụp nhanh 5 slash bạn đoán sẽ dùng nhiều nhất; bấm `Ctrl+P` xem palette có gì hơn.
2. (5 phút) `opencode run "repo nay dung stack gi" --dir .` so với hỏi trong TUI — so thời gian và output.
3. (5 phút) Đổi `"keybinds": { "leader": "ctrl+space" }` trong `cli.json`, thử `Ctrl+Space M` mở model picker, rồi đổi lại.

## Reference

- CLI + service + mini: https://opencode.ai/v2/docs/cli/ (verify 28/10/2026)
- Keybinds toàn bộ: https://opencode.ai/v2/docs/cli/keybinds/ (verify 28/10/2026)
- CLI settings `cli.json`: https://opencode.ai/v2/docs/cli/config/ (verify 28/10/2026)
- Install Desktop/Web/Docker: https://opencode.ai/v2/docs/ (verify 28/10/2026)
- `opencode run`: https://opencode.ai/v2/docs/cli/#automation (verify 28/10/2026)

## Đọc tiếp

- [04-models-zen-go-byok.md](04-models-zen-go-byok.md) — đổi não trong chính những mặt tiền này.
- [05-agents-build-plan-custom.md](05-agents-build-plan-custom.md) — `Shift+Tab` xoay agent, agent là gì.
- [09-permissions-policies.md](09-permissions-policies.md) — luật `ask`/`allow`/`deny` đằng sau mọi bề mặt.
- [10-background-tasks.md](10-background-tasks.md) — Ctrl+B đưa tool dài chạy nền.
- [14-worktree-git-ide-acp.md](14-worktree-git-ide-acp.md) — nối OpenCode vào IDE qua ACP.
- [../03-cau-hoi-thuong-gap/07-loi-troubleshooting-faq.md](../03-cau-hoi-thuong-gap/07-loi-troubleshooting-faq.md) — service không start, pair lỗi.

> **Chốt bài 02:** hàng ngày sống trong TUI, `mini` cho terminal chật, `run` cho máy chạy; Desktop/Web chỉ là mặt tiền khác của cùng service — sửa luật một chỗ, cả bốn bề mặt cùng nghe.
