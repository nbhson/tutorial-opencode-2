# 16 — Formatters + LSP + Built-in Tools (định dạng tự động, công cụ có sẵn, LSP không phải việc của v2)

> **Dành cho:** người muốn code luôn đẹp sau khi agent sửa · **Vấn đề:** v2 không chạy LSP (đừng tìm LSP config để có diagnostics) và built-in tools rất nhiều nhưng hay bị bỏ qua đúng lúc · **Đọc xong:** bật formatters đúng cách, hiểu vì sao v2 không có LSP diagnostics + alternatives, dùng được đúng tools · **Thời gian:** ~12 phút.

## Mục tiêu bài học

- Bật formatter với `formatter: true` hoặc config chi tiết; tự viết formatter tùy biến.
- Hiểu v2 không chạy LSP server và không sinh LSP diagnostics — biết alternative đúng.
- Liệt kê được 8 nhóm built-in tools (file, command, web, tương tác, tự động hóa, session, worktree, browser).
- Biết cách thêm tools qua MCP và plugin (so sánh ngắn, cross-link bài 12).

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Luồng hoạt động](#luồng-hoạt-động-flow)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. Formatters: "dọn bàn" sau mỗi thao tác

**1 câu:** Formatter định dạng file mỗi khi `write`, `edit`, hoặc `patch` thay đổi nó — bật bằng `formatter: true` hoặc override chi tiết trong `opencode.jsonc`.

**Nôm na:** formatter như thư ký: sau mỗi lần bạn viết xong một đoạn, cô ấy dọn lại cho thẳng hàng, thụt đầu dòng đúng, thêm dấu chấm phẩy nếu thiếu. Không bật thì code agent viết xong vẫn "xấu" — không lỗi nhưng đồng nghiệp đọc thì khó.

Mặc định formatter **tắt**. Bật toàn bộ built-in:

```jsonc
// opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "formatter": true
}
```

Hoặc config chi tiết:

```jsonc
{
  "formatter": {
    "prettier": {
      "environment": { "NODE_ENV": "development" },
      "extensions": [".js", ".ts"]
    },
    "deno-markdown": {
      "command": ["deno", "fmt", "$FILE"],
      "extensions": [".md"]
    }
  }
}
```

Cấu trúc mỗi formatter entry:

| Field | Ý nghĩa |
|---|---|
| `disabled: true` | Tắt built-in cụ thể, giữ others. |
| `command` | Mảng lệnh thay thế built-in (`["custom-fmt", "--write", "$FILE"]`). |
| `environment` | Env vars bổ sung khi chạy lệnh. |
| `extensions` | Thay thế danh sách extension được hỗ trợ (`.js`, `.py`...). |

`$FILE` trong command được thay bằng absolute path. Lệnh là mảng, không phải chuỗi shell.

26 built-in formatters (verify 28/10/2026 — [docs/formatters](https://opencode.ai/v2/docs/formatters/)):

| Formatter | Extensions | Yêu cầu |
|---|---|---|
| `gofmt` | `.go` | lệnh `gofmt` |
| `mix` | `.ex .exs .eex .heex .leex .neex .sface` | lệnh `mix` |
| `oxfmt` | `.js .jsx .ts .tsx .mjs .cjs .mts .cts` | `oxfmt` trong `package.json` |
| `prettier` | hàng chục: `.js .ts .html .css .json .yaml .md ...` | `prettier` trong `package.json` |
| `biome` | như prettier | `biome.json` + `@biomejs/biome` binary |
| `clang-format` | `.c .cpp .h .hpp ...` | lệnh `clang-format` + `.clang-format` |
| `ktlint` | `.kt .kts` | lệnh `ktlint` |
| `ruff` | `.py .pyi` | lệnh `ruff` |
| `air` | `.R` | lệnh `air` |
| `uv` | `.py .pyi` | lệnh `uv format` |
| `rubocop` / `standardrb` | `.rb .rake .gemspec .ru` | lệnh `rubocop`/`standardrb` |
| `dart` | `.dart` | lệnh `dart` |
| `zig` | `.zig .zon` | lệnh `zig` |
| `rustfmt` | `.rs` | lệnh `rustfmt` |
| `shfmt` | `.sh .bash` | lệnh `shfmt` |
| `pint` | `.php` | `laravel/pint` trong `composer.json` |
| `nixfmt` | `.nix` | lệnh `nixfmt` |
| `terraform` | `.tf .tfvars` | lệnh `terraform` |
| `ormolu` | `.hs` | lệnh `ormolu` |
| `cljfmt` | `.clj .cljs .cljc .edn` | lệnh `cljfmt` |
| `ocamlformat` | `.ml .mli` | lệnh `ocamlformat` + `.ocamlformat` |
| `htmlbeautifier` | `.erb` | lệnh `htmlbeautifier` |
| `latexindent` | `.tex` | lệnh `latexindent` |
| `gleam` | `.gleam` | lệnh `gleam` |
| `dfmt` | `.d` | lệnh `dfmt` |

Nhiều formatter nhất là `prettier` và `biome` — cả hai đều phủ gần hết ngôn ngữ web/phổ biến. Nếu project dùng Prettier thì đó là formatter bạn cần.

**Vì sao quan trọng?** Formatter tắt mặc định — nhiều dev v2 quên bật, rồi bực mình vì code luôn "xấu" sau mỗi sửa. Bật đúng formatter cho ngôn ngữ dự án = giảm đáng kể lần review phải comment "format lại".
**Nếu làm sai?** Tắt nhầm formatter bằng `false` toàn cục → tất cả file đều không format, kể cả formatter ngôn ngữ bạn đang dùng.

### 2. LSP: v2 không chạy LSP — hãy hiểu đúng

**1 câu:** V2 giữ config key `lsp` nhưng **không chạy language server và không sinh LSP diagnostics** — go-to-definition, hover, diagnostics kiểu IDE không phải việc của OpenCode v2.

**Nôm na:** LSP là dịch vụ "cô gái biết mọi thứ về code" (go-to-def, hover, lint live). OpenCode v2 không thuê cô này. OpenCode là agent — nó đọc file bằng `read`, tìm bằng `grep`/`glob`, chạy lệnh bằng `shell` để lấy feedback (test, typecheck). Muốn diagnostics "chuẩn IDE", hãy dùng IDE riêng (VS Code + extension, Zed...) chạy song song, hoặc dùng `opencode acp` để editor tích hợp trực tiếp.

```jsonc
// Config lsp vẫn được đọc — nhưng v2 khong chay language server
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": {
    // giu tuong thich; khong sinh diagnostics trong v2 (verify 28/10/2026)
  }
}
```

**Vì sao quan trọng?** Người migrating từ v1 thường tìm LSP config để có auto-fix/diagnostics — không có, và config cũ cũng không tự chạy. Biết trước để không mất thời gian.
**Nếu làm sai?** Ngồi debug "sao diagnostics không hiện" — vì nó chưa từng được thiết kế để hiện. Muốn diagnostics: chạy `tsc --noEmit`, `go vet`, `eslint` trong TUI hoặc để agent tự chạy qua `shell`.

Alternatives cho diagnostics trong workflow agent:

| Cần gì | Làm gì với OpenCode 2 |
|---|---|
| Type check / lint sau khi agent sửa | Để agent chạy `bun typecheck`, `eslint`, `ruff check` qua `shell` tool. |
| Diagnostics realtime khi gõ | Dùng IDE (VS Code/Zed...) chạy song song; hoặc `opencode acp` để editor tích hợp agent. |
| Format sau sửa | `formatter: true` — chính là chủ đề phần 1. |
| MCP server cung cấp diagnostics | Tự thêm MCP server LSP nếu cần; tools đi qua Code Mode (`mcp.servers`). |

### 3. Built-in tools: cái gì agent có thể dùng

**1 câu:** Built-in tools là các "tay chân" agent dùng trực tiếp — mỗi tool có một permission action tương ứng, và gần như tất cả đều có thể bị `permissions[]` chặn.

**Nôm na:** tool là bộ dao kéo của agent. Nếu bạn không biết có những dao gì, bạn sẽ không biết mình có thể yêu cầu gì — "dùng grep tìm" hay "mở browser tab" là những yêu cầu hoàn toàn hợp lệ.

8 nhóm chính (verify 28/10/2026 — [docs/tools](https://opencode.ai/v2/docs/tools/)):

| Nhóm | Tools | Permission action |
|---|---|---|
| Files | `read`, `glob`, `grep`, `edit`, `write`, `patch` | `read`/`glob`/`grep`/`edit` |
| Commands | `shell` | `shell` |
| Web | `webfetch`, `websearch` | `webfetch`/`websearch` |
| Tương tác | `question` | `question` |
| Skill | `skill` | `skill` |
| Tự động hóa | `subagent`, `execute` (Code Mode) | `subagent`/`execute` |
| Session + worktree | `session_rename`, `session_move`, `worktree_*` | (một số không cần permission) |
| Browser | tab, snapshot, click, screenshot, console, network, Lighthouse | `browser` |
| Ảnh (2.2.2+) | `image_generate` | theo tool permission thường |

Chi tiết đáng nhớ:

- `image_generate` — từ v2.2.2 **bật mặc định** khi provider đang dùng hỗ trợ sinh ảnh (v2.2.1 còn opt-in). Chọn model sinh ảnh bằng `experimental.image_generate.model` trong config; provider không hỗ trợ thì tool không xuất hiện. (verify 30/10/2026 — changelog v2.2.1/v2.2.2)

- `read` chỉ đọc text 2000 dòng/50 KiB mỗi page; hỗ trợ PNG/JPEG/GIF/WebP/PDF tới 20 MiB.
- `grep` pattern là **regex**, resource của permission là pattern chứ không phải path tìm.
- `shell` có timeout mặc định 2 phút; `background: true` cho dev server dài hạn.
- `edit`/`write`/`patch` là 3 công cụ sửa file; `patch` chỉ expose cho một số model GPT hỗ trợ, còn lại dùng `edit`+`write`.
- `execute` chính là Code Mode — deny `execute *` là tắt Code Mode và mọi MCP tool đi qua nó (trừ server có `codemode: false`).
- `browser` chỉ hoạt động khi Desktop app attach browser; không dùng được từ TUI thuần.

### 4. Thêm tool mới: MCP hay Plugin?

**1 câu:** MCP server thêm tool có sẵn từ bên ngoài; plugin viết TypeScript/JS để thêm tool/hook/lệnh/agent mới trong server.

**Nôm na:** MCP là "thuê thầu ngoài" (cắm server là có tool), plugin là "tuyển nhân viên nội bộ" (viết code lồng vào vòng đời OpenCode). Cả hai đều thêm tool, nhưng plugin có thể chặn can thiệp sâu hơn (hook trước/sau tool, sửa request...).

```jsonc
// MCP: cong cu tu server ben ngoai
{
  "mcp": { "servers": { "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" } } }
}
```

```ts
// Plugin: them tool moi vao server (xem chi tiet bai 12)
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "my-tools",
  async setup(ctx) {
    // dang ky tool, hook, command, agent tai day
  },
})
```

Chi tiết cách viết plugin tool: xem [12-plugins-sdk-api.md](./12-plugins-sdk-api.md).

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | GitHub Copilot | Claude Code |
|---|---|---|---|
| Định dạng sau sửa | `formatter: true` + built-in/named | auto-format trong VS Code | format tích hợp CLI |
| LSP diagnostics | Không — giữ config nhưng không chạy server | VS Code LSP | CLI không LSP, dùng editor tích hợp |
| Go-to-definition | Không có | VS Code LSP | Editor tích hợp |
| Tool có sẵn | read/edit/write/grep/glob/shell/subagent/execute/webfetch/websearch/question/skill/browser | Giới hạn trong IDE | Giới hạn terminal |
| MCP tools | `mcp.servers` + `codemode: false` cho native tool list | MCP trong `.vscode/mcp.json` | MCP trong `.mcp.json` |
| Plugin tools | Plugin API v2 viết TypeScript | Extension API (VS Code) | — |

Điểm mạnh OpenCode: tools phong phú cho terminal workflow (shell, background, worktree). Điểm yếu: không LSP — dùng IDE để bù.

## Lỗi thường gặp

### 1. Tìm LSP diagnostics trong v2

```text
❌ SAI: dat lsp config trong opencode.jsonc roi doi diagnostics xuat hien
✅ ĐÚNG: v2 khong chay LSP server; dung IDE (VS Code, Zed) cho diagnostics realtime;
   hoac de agent goi lệnh typecheck/lint qua shell sau khi sua
```
**Bài học:** LSP config tồn tại để tương thích v1, không phải feature v2. Không tìm diagnostics ở đây.

### 2. Tắt formatter toàn cục rồi bực

```text
❌ SAI: "formatter": false o muc global roi thanh "sao code khong dep"
✅ ĐÚNG: formatter: true cho built-in; hoac "formatter": {} de ke thua gia tri thap hon
```
**Bài học:** `false` tắt hoàn toàn mọi formatter — kể cả ngôn ngữ bạn đang viết. Dùng `{}` để inherit.

### 3. Dùng MCP tool mà không biết `codemode`

```text
❌ SAI: them MCP server roi goi tool truc tiep, khong hieu tai sao tool no nam trong nhom execute
✅ ĐÚNG: MCP mac dinh qua Code Mode (execute); dat "codemode": false neu can native tool list
```
**Bài học:** `codemode: true` (default) = MCP tools gọi qua Code Mode; `codemode: false` = expose tool trực tiếp. Cần nhắm tool thì biết mình đang gọi qua đâu.

### 4. Quên require của formatter

```text
❌ SAI: formatter: true roi thanh "prettier khong chay"
✅ ĐÚNG: prettier/oxfmt/biome can command co san; `formatter: true` khong tu install;
   kiem tra lệnh tồn tại (prettier --version) truoc
```
**Bài học:** formatter built-in chỉ chạy khi command tồn tại. Bật formatter mà command thiếu = lỗi im lặng (file không format, không error).

## Best practices (kèm "vì sao")

- Mọi project đều có `formatter: true` ở mức tối thiểu. **Vì sao?** Code đẹp giảm noise trong diff — mỗi PR review chỉ thấy thay đổi thật, không thay đổi format thừa.
- Với project dùng Prettier: để Prettier đứng đầu trong list — khi nhiều formatter khớp, built-in order được thử trước. **Vì sao?** Nếu prettier chạy trước, các tool khác không cần can thiệp nếu Prettier đã handle.
- Biết ranh giới LSP: dùng IDE để code, dùng OpenCode để viết code — đừng kỳ vọng OpenCode thay thế IDE. **Vì sao?** Realtime diagnostics cần live indexing; OpenCode là agent chạy batch, không phải editor chạy persistent.
- Muốn MCP tool hiện trong native tool list thay vì ẩn trong Code Mode: thêm `"codemode": false` vào server config. **Vì sao?** Nhiều developer muốn nhắm tool để test/tìm hiểu — `codemode: false` cho phép điều đó.

## Bài tập nhỏ

1. (3 phút) Thêm `"formatter": true` vào `opencode.jsonc` project của bạn, `opencode run "write a test file"` để agent tạo file TypeScript, xác nhận file được format đúng.
2. (5 phút) Tắt formatter Prettier, bật biome: `"formatter": { "prettier": { "disabled": true }, "biome": {} }` — kiểm tra project có `biome.json` và binary chưa.
3. (3 phút) Trong TUI, gõ "use grep to find all TODO comments in src" — xác nhận agent dùng đúng tool `grep`.
4. (4 phút) Thử `opencode acp` để kết nối editor (Zed), bật LSP diagnostics trong editor — so sánh trải nghiệm diagnostics giữa editor và TUI.
5. (4 phút) Thêm MCP server context7: `opencode mcp add context7 --url https://mcp.context7.com/mcp`, hỏi agent "what is the latest version of Express" — xem tool xuất hiện dưới namespace nào.

## Reference

- Formatters: https://opencode.ai/v2/docs/formatters/ (verify 28/10/2026)
- Built-in tools: https://opencode.ai/v2/docs/tools/ (verify 28/10/2026)
- LSP note: migration v1→v2 ghi rõ LSP config giữ lại nhưng không sinh diagnostics (verify 28/10/2026)
- MCP servers: https://opencode.ai/v2/docs/mcp-servers/ (verify 28/10/2026)
- Plugins (thêm tool tùy biến): https://opencode.ai/v2/docs/plugins/ + https://opencode.ai/v2/docs/build/plugins/ (verify 28/10/2026)

## Đọc tiếp

- [12-plugins-sdk-api.md](./12-plugins-sdk-api.md) — chi tiết plugin API (thêm tool, hook, agent).
- [08-mcp-codemode.md](./08-mcp-codemode.md) — MCP server config + `codemode` + permissions.
- [03-config-opencode-jsonc.md](./03-config-opencode-jsonc.md) — cách config nằm ở tầng nào.
- [05-agents-build-plan-custom.md](./05-agents-build-plan-custom.md) — agent có thể gọi tool theo role.
- [../02-tips-thuc-chien/05-codemode-hieu-qua.md](../02-tips-thuc-chien/05-codemode-hieu-qua.md) — dùng Code Mode hiệu quả.
- [../03-cau-hoi-thuong-gap/04-mcp-codemode-faq.md](../03-cau-hoi-thuong-gap/04-mcp-codemode-faq.md) — FAQ MCP.

> **Chốt bài 16:** formatter bật là có ngay, LSP diagnostics không có trong v2 — đừng đợi OpenCode thay máy IDE, mà hãy để agent làm công việc và để IDE làm công việc của IDE.
