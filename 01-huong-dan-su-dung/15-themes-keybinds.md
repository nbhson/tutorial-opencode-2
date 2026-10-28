# 15 — Themes + Keybinds (cá nhân hóa TUI, đúng file, đúng phím)

> **Dành cho:** người dùng TUI muốn giao diện + phím tắt theo thói quen riêng · **Vấn đề:** theme/keybind là config của terminal client nhưng hay bị nhét nhầm vào `opencode.jsonc` rồi thắc mắc "sao không ăn" · **Đọc xong:** chọn/tự tạo theme đúng chỗ, viết keybinds trong `cli.json`, hiểu leader key và bộ phím soạn input · **Thời gian:** ~15 phút.

## Mục tiêu bài học

- Chọn theme bằng `/themes` hoặc `cli.json`, hiểu theme thuộc terminal client chứ không thuộc server.
- Tạo theme JSON riêng (global hoặc per-project) theo cấu trúc `base` + `light`/`dark`.
- Đổi keybinds trong `cli.json`: cú pháp key, mảng phím thay thế, object phím chi tiết, tắt binding.
- Dùng leader key (`ctrl+x` mặc định) và thuộc các phím soạn input kiểu Readline/Emacs.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. Theme: "quần áo" của terminal client

**1 câu:** Theme là bộ màu của TUI, cấu hình trong `~/.config/opencode/cli.json` — file riêng của terminal client, không phải `opencode.jsonc` của server.

**Nôm na:** OpenCode tách 2 phần: **server** (đọc `opencode.jsonc` — model, agents, permissions) và **terminal client** (đọc `cli.json` — theme, keybinds, animations). Theme là quần áo bạn mặc; `opencode.jsonc` là quy trình làm việc của công ty. Mặc gì cũng không đổi quy trình, và gửi `opencode.jsonc` cho đồng nghiệp cũng không mang theo theme của bạn.

```json
// ~/.config/opencode/cli.json
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "theme": {
    "name": "tokyonight",
    "mode": "dark"
  }
}
```

**Vì sao quan trọng?** Đây là lỗi phân tầng config phổ biến nhất khi mới dùng v2: nhét `theme` vào `opencode.jsonc` rồi ngỡ config "không ăn". Hiểu đúng ranh giới này, mọi setting bề mặt sau này (animations, tabs, diffs, sounds...) đều đặt đúng chỗ ngay lần đầu.
**Nếu làm sai?** Config vẫn parse hợp lệ (không lỗi gì!) nhưng TUI bỏ qua — bạn ngồi debug một cái file mà server hoàn toàn không đọc.

### 2. Chọn theme: `/themes` hoặc settings

Trong TUI, lệnh nhanh nhất là `/themes` — picker hiện danh sách theme, chọn là áp dụng ngay. Đường dài: `Ctrl+P` → **Open settings** → **Theme**. Theme mặc định là `opencode` (verify 28/10/2026 — [docs/cli/theme](https://opencode.ai/v2/docs/cli/theme/)).

### 3. Mode: `system` / `dark` / `light`

| Mode | Hành vi |
|---|---|
| `system` | Theo light/dark terminal đang phát hiện. |
| `dark` | Luôn dùng bộ màu tối của theme. |
| `light` | Luôn dùng bộ màu sáng của theme. |

Nếu theme tự viết chỉ cung cấp 1 mode, OpenCode dùng đúng mode đó khi mode kia được yêu cầu — không lỗi, không fallback về theme built-in (docs ghi rõ: mode chỉ inherit từ `base` của chính file đó).

### 4. Built-in themes (đếm được, không bịa)

Danh sách built-in (verify 28/10/2026 — [docs/themes](https://opencode.ai/v2/docs/themes/)):

```text
aura, ayu, carbonfox, cobalt2, cursor, dracula, everforest, flexoki
catppuccin, catppuccin-frappe, catppuccin-macchiato
github, gruvbox, kanagawa, material, matrix, mercury, monokai, nightowl, nord
one-dark, opencode, orng, lucent-orng, osaka-jade, palenight, rosepine
solarized, synthwave84, tokyonight, vercel, vesper, zenburn
```

Ngoài ra có theme `system` — chỉ xuất hiện khi OpenCode đọc được palette của terminal (foreground/background + ANSI). Theme mặc định là `opencode`.

### 5. Theme tự viết: thư mục + tên file

| Scope | Thư mục |
|---|---|
| Global | `~/.config/opencode/themes/` |
| Project | `.opencode/themes/` trong cây project |

Tên file (bỏ `.json`) chính là tên theme. `my-theme.json` → theme `my-theme`. File gần thư mục hiện tại hơn **thay thế** theme cùng tên ở global hoặc thư mục cha. Sau khi thêm file, restart OpenCode rồi `/themes` để chọn.

### 6. Cấu trúc file theme: `base` + hue palette

**1 câu:** Mỗi theme khai báo 1 cây token `base` đầy đủ + ít nhất 1 trong `light`/`dark` với bộ hue hoàn chỉnh.

**Nôm na:** `base` là bản thiết kế chung (vai trò nào màu gì), còn `light`/`dark` là hai bộ "điều nhiệt" — cùng một ngôi nhà nhưng ánh sáng khác nhau. Mode không kế thừa theme built-in và không kế thừa nhau; chỉ kế thừa `base` của chính file.

Vì file theme hoàn chỉnh rất dài, hãy dùng **Theme Tool** (https://opencode.ai/theme/) để sinh bản đầy đủ, rồi chỉ sửa phần cần đổi. Đoạn dưới là trích đoạn minh họa, không phải file chạy được:

```json
// themes/ocean.json (trich doan)
{
  "$schema": "https://opencode.ai/theme.json",
  "base": {
    "text": { "base": "#16324f", "muted": "$hue.neutral.400" },
    "syntax": {
      "comment": "$hue.neutral.500",
      "keyword": "$hue.accent.400"
    }
  },
  "light": { "hue": {} },
  "dark": {
    "hue": {},
    "text": { "base": "#d8f3ff" }
  }
}
```

Giải thích từng phần:

- **Màu**: hex (3/4/6/8 chữ số), `"transparent"`, hoặc tham chiếu `$ten.token` (vd `$hue.neutral.400`).
- **Hue**: 8 base (`gray red orange yellow green cyan blue purple`) + 3 alias (`accent interactive neutral`), mỗi cái 9 bước `100`→`900`. Light chạy tối→sáng, dark chạy sáng→tối.
- **Token groups**: `text`, `background`, `border`, `scrollbar`, `diff`, `syntax`, `markdown` — mỗi nhóm có vai trò riêng (vd `syntax` có `comment/keyword/function/variable/string/number/type/operator/punctuation`).
- **States**: `$hovered $focused $pressed $selected $disabled` cho action (`primary/secondary/destructive`); không khai báo thì dùng `base` của action đó.
- **`@dialog`**: override token riêng cho dialog; token tham chiếu `$background.base` sẽ re-resolve theo nền dialog.

### 7. Keybinds: cùng file `cli.json`, cùng số phận

**1 câu:** Keybinds ghi đè lệnh của TUI trong `cli.json` — mỗi lệnh có một command ID, bạn map phím của mình vào.

**Nôm na:** như đổi phím tắt trong game: không đổi luật chơi, chỉ đổi nút bấm. Leader key là "nút Shift của phím tắt" — bấm `ctrl+x` rồi chờ phím tiếp theo (`<leader>m` = mở model picker).

```json
// ~/.config/opencode/cli.json
{
  "keybinds": {
    "leader": "ctrl+x",
    "model.list": "<leader>m",
    "app.exit": ["ctrl+c", "ctrl+d", "<leader>q"],
    "help.show": false
  },
  "leader": { "timeout": 2000 }
}
```

Giải thích từng dạng giá trị:

- **string**: 1 phím (`"ctrl+k"`). Chuỗi có dấu phẩy = các phím thay thế (`"ctrl+c,ctrl+d"`).
- **array**: tương đương chuỗi phẩy — các lựa chọn thay nhau.
- **object**: phím + hành vi sự kiện: `key`, `event` (`press`/`release`), `preventDefault`, `fallthrough`.
- **`"none"` hoặc `false`**: tắt binding đó.
- **`<leader>`**: tham chiếu tới phím `keybinds.leader`. Leader mặc định `ctrl+x`; `leader.timeout` là số ms chờ phím tiếp theo (docs ví dụ 1500–2000ms).
- Command ID lạ bị **bỏ qua im lặng** — gõ sai tên không lỗi, chỉ là không ăn.

Số phím mặc định rất nhiều (hàng trăm binding, chia nhóm app/diff/session/input/composer/dialog...) — xem bảng đầy đủ tại [docs/cli/keybinds](https://opencode.ai/v2/docs/cli/keybinds/), trong đó có nhóm **Input Editing** chính là bộ phím kiểu Readline/Emacs: `ctrl+a` (đầu dòng), `ctrl+e` (cuối dòng), `ctrl+k` (xóa tới cuối dòng), `ctrl+u` (xóa từ đầu dòng), `ctrl+b`/`ctrl+f` (lùi/tiến 1 ký tự), `alt+b`/`alt+f` (lùi/tiến 1 từ), `ctrl+w` (xóa 1 từ). Nếu bạn đã quen bash/zsh thì gần như không cần học lại gì.

**Vì sao quan trọng?** TUI là nơi bạn ở cả ngày; phím sai thói quen = mỗi thao tác tốn thêm một nhịp não. Nhóm Input Editing kiểu Emacs cho phép tái dùng phản xạ terminal có sẵn.
**Nếu làm sai?** Gõ sai command ID → binding "chết" im lặng; hoặc disable nhầm `app.exit` rồi không thoát nổi TUI theo thói quen cũ.

### 8. Shift+Enter xuống dòng: chuyện của terminal

Trong TUI, `Shift+Enter`, `Ctrl+Enter`, `Alt+Enter`, `Ctrl+J` đều chèn xuống dòng (default binding `input.newline`: `shift+return,ctrl+return,alt+return,ctrl+j` — verify 28/10/2026). Nhưng có một bẫy môi trường: nhiều terminal (đặc biệt qua SSH/mosh, hoặc terminal không bật mode enhanced keyboard) gửi cùng một escape sequence cho Enter và Shift+Enter, nên TUI không phân biệt được. Khi đó hãy dùng `Ctrl+J` — luôn hoạt động vì nó chính là ký tự LF. Terminal đề xuất kèm docs: Ghostty, WezTerm, Alacritty, Kitty (hỗ trợ truecolor + phím mở rộng).

## Ví dụ chi tiết

Bộ `cli.json` cá nhân hoàn chỉnh — copy về sửa theo thói quen của bạn:

```json
// ~/.config/opencode/cli.json — verify 28/10/2026
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "theme": {
    "name": "catppuccin-macchiato",
    "mode": "system"
  },
  "animations": true,
  "cursor": { "style": "block", "blinking": true },
  "keybinds": {
    // doi leader thanh ctrl+space (it dung hon ctrl+x trong shell)
    "leader": "ctrl+space",
    // giu cac phim quen thuoc, cong them leader
    "app.exit": ["ctrl+c", "ctrl+d", "<leader>q"],
    // mo model picker bang mot nut
    "model.list": "<leader>m",
    "agent.list": "<leader>a",
    "session.new": "<leader>n",
    "session.list": "<leader>l",
    // tato binding khong dung
    "help.show": false
  },
  "leader": { "timeout": 2000 }
}
```

Luồng áp dụng một keybind mới, từng bước:

1. Tìm command ID trong [docs/cli/keybinds](https://opencode.ai/v2/docs/cli/keybinds/) — lỗi hay gặp: đoán tên (`session.new` ≠ `session.new_session`). Không chắc thì xem which-key panel (`ctrl+alt+k`).
2. Thêm entry vào `cli.json` — lỗi hay gặp: đặt trong `opencode.jsonc` (server không đọc, im lặng).
3. Lưu file — docs ghi rõ: edit hợp lệ trong khi TUI đang chạy được **reload ngay**, không cần restart.
4. Thử trong TUI. Không ăn? Kiểm tra: (a) command ID đúng chưa, (b) key syntax đúng chưa (`shift+return` không phải `shift+enter`), (c) binding khác có chiếm phím đó không.

Ví dụ theme project riêng cho repo có brand màu riêng — theme đặt trong `.opencode/themes/acme.json` chỉ hiện khi mở đúng repo này, không phiền máy người khác:

```json
// .opencode/themes/acme.json (trich doan — dung Theme Tool de sinh file day du)
{
  "$schema": "https://opencode.ai/theme.json",
  "base": {
    "categorical": ["accent", "cyan", "green"],
    "background": {
      "base": "#0a0e14",
      "raised": { "base": "#111722", "high": "#18202e", "max": "#202b3d" }
    }
  },
  "dark": {
    "hue": {
      "accent": "$hue.cyan"
    }
  }
}
```

- `categorical` đặt thứ tự hue dùng để phân biệt các agent/điều lặp lại — mỗi agent một màu, nhìn transcript biết ngay ai làm.
- Cần `light` hoặc `dark` ít nhất một; thiếu mode kia thì OpenCode dùng mode có sẵn khi được hỏi mode ngược lại.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | GitHub Copilot | Claude Code |
|---|---|---|---|
| Đổi theme TUI | `/themes` + `cli.json` | VS Code settings | `/theme` + `/config` |
| Custom theme | JSON `base` + `light`/`dark` | Theme VS Code toàn cục | Sửa trong file settings |
| File config riêng cho client | `cli.json` tách khỏi `opencode.jsonc` | — (một settings duy nhất) | `settings.json` |
| Leader key | `ctrl+x` mặc định, đổi được | — | — |
| Đổi keybinds | `keybinds.<command>` theo command ID | VS Code keybindings | `/keybinds` (TUI) |

Điểm khác: OpenCode tách **client config** (`cli.json`) khỏi **server config** (`opencode.jsonc`) — Copilot/Claude Code gộp chung một nơi. Cái giá: một lần phân biệt, đổi lại theme/keybind không bao giờ ảnh hưởng tới hành vi agent hay bị repo nào đó ghi đè.

## Lỗi thường gặp

### 1. Nhét theme/keybinds vào `opencode.jsonc`

```text
❌ SAI: them "theme": { "name": "dracula" } vao opencode.jsonc roi bao "sao khong an"
✅ ĐÚNG: theme + keybinds + animations... thuoc `cli.json` (global, ~/.config/opencode/);
   khong co cli.json per-project
```
**Bài học:** server đọc `opencode.jsonc`, TUI đọc `cli.json`. Hai thế giới, hai file, không trộn. Lỗi này im lặng hoàn toàn — không warning nào nhắc bạn.

### 2. Đoán command ID thay vì tra

```text
❌ SAI: "keybinds": { "open_models": "ctrl+g" } -> unknown ID bi bo qua, khong bao loi
✅ ĐÚNG: tra docs/cli/keybinds lay dung ID: "model.list"; test ngay trong TUI sau khi luu
```
**Bài học:** command ID lạ bị ignore (docs ghi rõ), nên sai tên = binding tưởng đã đặt nhưng chưa bao giờ tồn tại.

### 3. Tưởng Shift+Enter hỏng vì terminal

```text
❌ SAI: caio Shift+Enter khong xuong dong -> bug cua OpenCode
✅ ĐÚNG: terminal khong phan biet Enter/Shift+Enter (gui cung escape sequence);
   dung Ctrl+J hoac Alt+Enter, hoac doi terminal ho tro phim mo rong (Ghostty, WezTerm, Alacritty, Kitty)
```
**Bài học:** phím "không ăn" trong TUI thường là chuyện terminal gửi gì, không phải chuyện config viết gì. `Ctrl+J` là phương án dự phòng luôn đúng.

### 4. Sửa theme file rồi ngỡ tự cập nhật

```text
❌ SAI: them file .opencode/themes/acme.json xong doi ngay trong session dang chay
✅ ĐÚNG: restart OpenCode sau khi them file theme, roi /themes de chon
```
**Bài học:** docs ghi rõ cần restart sau khi thêm file theme — khác với keybinds/config thường reload khi chạy.

## Best practices (kèm "vì sao")

- Giữ `$schema` trong `cli.json`. **Vì sao?** Schema `https://opencode.ai/v2/cli.json` cho autocomplete + flag value sai ngay trong editor — bù đắp chính xác cho việc OpenCode ignore unknown settings.
- Chỉ override những binding thật sự vướng thói quen, đừng viết lại cả bảng. **Vì sao?** Mỗi v2 release có thể thêm command mới; bạn override ít thì ít thứ phải rà lại sau upgrade.
- Theme để global (`~/.config/opencode/themes/`), chỉ thêm theme project khi cần màu theo brand. **Vì sao?** Theme gần thư mục hiện tại thắng theme cùng tên — theme project treo lơ lửng sẽ "tại sao máy tôi khác máy anh em" khó lần ra nguồn.
- `mode: "system"` là lựa chọn an toàn nhất. **Vì sao?** Terminal của bạn đổi light/dark theo hệ điều hành, TUI theo luôn — không phải đổi tay sáng/chiều.
- Dùng `Ctrl+J` để xuống dòng khi qua SSH. **Vì sao?** Đây là ký tự LF thật, mọi terminal đều gửi đúng, không phụ thuộc enhanced keyboard mode.

## Bài tập nhỏ

1. (3 phút) Mở TUI, chạy `/themes`, đổi qua 3 theme khác nhau, xong khóa `mode` về `dark` trong `cli.json` — kiểm tra file đã đổi như bạn chọn.
2. (5 phút) Copy 1 theme built-in bạn thích, lưu thành `~/.config/opencode/themes/my-night.json`, đổi màu `text.base` sang màu khác, restart, chọn lại — nhìn thấy màu mới trong TUI.
3. (5 phút) Đổi `leader` sang `ctrl+space`, gán `session.new` vào `<leader>n` (mặc định của nó vốn đã vậy — giờ thử chuỗi thay thế thứ hai như `<leader>n,alt+n`), bấm thử cả hai.
4. (5 phút) Tắt binding `help.show`, xác nhận trong TUI không còn mở help; rồi mở bảng keybinds docs, tìm 1 binding đang là `none` và tự gán phím.
5. (2 phút) Trong prompt, thử `Ctrl+A` (đầu dòng) rồi `Ctrl+K` (xóa tới cuối) — xác nhận phản xạ Emacs hoạt động như trong shell.

## Reference

- Theme: https://opencode.ai/v2/docs/cli/theme/ (verify 28/10/2026)
- Cấu trúc file theme: https://opencode.ai/v2/docs/themes/ (verify 28/10/2026)
- Keybinds + bảng default bindings: https://opencode.ai/v2/docs/cli/keybinds/ (verify 28/10/2026)
- Toàn bộ `cli.json` settings: https://opencode.ai/v2/docs/cli/config/ (verify 28/10/2026)
- TUI phím cơ bản + leader: https://opencode.ai/v2/docs/cli/tui/ (verify 28/10/2026)
- Theme Tool: https://opencode.ai/theme/

## Đọc tiếp

- [03-config-opencode-jsonc.md](./03-config-opencode-jsonc.md) — phân biệt server config vs client config từ gốc.
- [02-tui-desktop-web-cli.md](./02-tui-desktop-web-cli.md) — TUI là 1 trong 4 bề mặt; phím tắt khác nhau ra sao.
- [09-permissions-policies.md](./09-permissions-policies.md) — những thứ KHÔNG phải thẩm mỹ: permissions/policies nằm ở `opencode.jsonc`.
- [12-plugins-sdk-api.md](./12-plugins-sdk-api.md) — khi muốn hơn màu sắc: TUI plugin thêm panel/lệnh riêng.
- [../03-cau-hoi-thuong-gap/07-loi-troubleshooting-faq.md](../03-cau-hoi-thuong-gap/07-loi-troubleshooting-faq.md) — khi TUI "không ăn" thì đi từ đâu debug.
- [../CHEATSHEET.md](../CHEATSHEET.md) — bảng tra phím tắt nhanh khi đang làm.

> **Chốt bài 15:** theme và keybind là cấu hình của "cái ghế bạn ngồi", không phải "công việc bạn làm" — một file `cli.json` lo hết, và tách nó khỏi `opencode.jsonc` là bước đầu tiên để không bao giờ hỏi "sao không ăn".
