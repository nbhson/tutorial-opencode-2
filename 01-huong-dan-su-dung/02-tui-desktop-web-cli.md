# 02 — TUI / Desktop / Web / CLI (4 bề mặt, 1 service)

> **Dành cho:** người mới mở OpenCode lần đầu · **Vấn đề:** không biết khi nào mở TUI, khi nào dùng `run`, khi nào mở Desktop/Web · **Đọc xong:** chọn đúng bề mặt cho từng việc + thuộc phím TUI cốt lõi · **Thời gian:** ~12 phút.

## Mục tiêu bài học

- Kể được 4 bề mặt nói chuyện với 1 background service thế nào.
- Thuộc 8 phím/slash TUI dùng hàng ngày.
- Biết khi nào dùng `opencode run` thay vì mở TUI.

## Khái niệm cốt lõi

### 1. Shared background service

**1 câu:** V2 chạy 1 process nền cho mỗi user; mọi client (TUI/Desktop/Web) chỉ là mặt tiền nói chuyện với nó.

**Nôm na:** như tổng đài — bạn gọi bằng điện thoại bàn (TUI), app (Desktop), web (Web) thì tổng đài viên vẫn là một người, lịch sử cuộc gọi (sessions) không mất.

```bash
opencode serve --port 4096   # dung service tuong minh
opencode pair                # lay URL/user/pass mo Web UI tro vao service
```

**Vì sao quan trọng?** Không còn cảnh "terminal A không thấy session của terminal B".
**Nếu làm sai?** Mỗi user 1 service — `sudo -u other opencode` rồi hỏi "session của tôi đâu" là sai mô hình.

### 2. TUI (mặt chính)

Mở bằng `opencode` tại project. Gõ yêu cầu, Enter. Gõ `/` xem slash, `Ctrl+P` mở palette.

| Phím | Việc | Ví dụ |
|---|---|---|
| `Ctrl+X M` / `/models` | đổi model giữa session | việc dễ → haiku rẻ, kiến trúc khó → sonnet mạnh |
| `Shift+Tab` / `/agents` | đổi agent primary | `build` code ↔ `plan` lập kế hoạch |
| `F2` | xoay model gần đây | đổi nhanh không mở picker |
| `Ctrl+X N` / `/new` | session mới | task mới = session mới |
| `Ctrl+X L` / `/sessions`, `Ctrl+O` | quay lại session cũ | tiếp việc hôm qua |
| `Ctrl+X E` / `/editor` | sửa prompt trong `$EDITOR` | prompt dài 20 dòng |
| `/undo` `/redo` | lùi/tiến checkpoint | agent sửa hỏng → undo |
| `/diff` (`f` fullscreen) | xem diff cạnh session | review trước khi accept |

### 3. CLI non-interactive (`run`)

**1 câu:** `opencode run` chạy 1 prompt rồi thoát — cho script/CI, không mở TUI.

```bash
opencode run "toan bo test do o dau, liet ke file" --dir ./my-app
opencode run -c "tiep tuc fix test do" -m anthropic/claude-sonnet-4-5
opencode run --format json "summarize repo" > out.json
```

**Vì sao quan trọng?** Đây là cách đưa agent vào CI/cron mà không cần người ngồi canh.
**Nếu làm sai?** Dùng `run` cho task cần approve giữa chừng (`ask` permissions) mà không config `deny/allow` trước → task treo đợi input không ai trả lời.

### 4. Desktop + Web

Desktop = bản GUI của cùng service (tải dmg/deb/rpm/AppImage). Web = `opencode pair` mở URL, tiện khi máy chạy agent còn bạn xem từ xa. Cả hai vẫn chịu cùng `permissions`/`policies` như TUI — đổi mặt không đổi luật.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Mặt chính | TUI terminal | VS Code IDE | Terminal |
| Chạy không người | `run` + `serve` + SDK | Coding agent cloud / Actions | headless |
| GUI | Desktop + Web cùng service | github.com + IDE | Web/IDE extension tùy bản |
| Editor nhúng | ACP (`opencode acp`) cho editor nói chuyện | Extension chính chủ | Extension/LSP tùy bản |

## Lỗi thường gặp

### 1. Đợi approve trong `run` non-interactive

```text
❌ SAI: opencode run "refactor auth" voi permissions mac dinh ask moi shell -> treo
✅ ĐÚNG: run voi rules allow san cho lenh an toan + deny san cho lenh nguy hiem; hoac chi dung run cho task read-only
```
**Bài học:** non-interactive không có người bấm Allow. Luật phải viết trước.

## Best practices (kèm "vì sao")

- Đặt `VISUAL`/`EDITOR` trước khi dùng `/editor`. **Vì sao?** Không đặt thì TUI không biết mở gì.
- Tắt highlights auto khi đã quen (`"highlights": false` trong `cli.json`). **Vì sao?** Đỡ 1 màn hình chắn mỗi lần update.

## Bài tập nhỏ

1. (5 phút) Mở TUI, gõ `/`, chụp nhanh 5 slash bạn đoán sẽ dùng nhiều nhất.
2. (5 phút) `opencode run "repo nay dung stack gi" --dir .` so với hỏi trong TUI.

> **Chốt bài 02:** hàng ngày sống trong TUI; `run` cho máy chạy; Desktop/Web chỉ là mặt tiền khác của cùng service.
