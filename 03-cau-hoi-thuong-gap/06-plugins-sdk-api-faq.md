# FAQ 06 — Plugins, SDK & API

> Tra nhanh khi port plugin, chọn client/SDK, nối editor. Link chéo: [Bài 12 — Plugins/SDK/API](../01-huong-dan-su-dung/12-plugins-sdk-api.md), [Bài 13 — Codemode scripting](../01-huong-dan-su-dung/13-codemode-scripting.md), [Bài 14 — Worktree/Git/IDE/ACP](../01-huong-dan-su-dung/14-worktree-git-ide-acp.md).
> Nguồn chính thức: [plugins](https://opencode.ai/v2/docs/plugins) · [build/plugins/migrate-v1](https://opencode.ai/v2/docs/build/plugins/migrate-v1) · [build/sdk](https://opencode.ai/v2/docs/build/sdk) · [cli/acp](https://opencode.ai/v2/docs/cli/acp) (verify 28/10/2026, OpenCode 2.2.0).

## Q1: "Plugin v1 sao không load trên v2?"

**Trả lời 1 câu:** Plugin API viết lại hoàn toàn — code v1 không chạy trên v2, đổi tên file/config không đủ, phải port sang `Plugin.define` + `setup(ctx)`.

**Giải thích:** Đây là breaking change chính thức số 1: "V1 plugin implementations do not run in V2. Moving a file or renaming its config entry is not enough" ([migrate-v1](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026). V1 trả về object chứa tools + hooks; V2 default-export định nghĩa có `id` và `setup(ctx)`, đăng ký hook/transform/tool qua `ctx` — bảng đối chiếu từng hook nằm trên [trang migrate-v1 plugin](https://opencode.ai/v2/docs/build/plugins/migrate-v1). Hai plugin builtin `opencode.config.policy` và `opencode.provider.opencode` **không gỡ được từ config** — cố ý, để repo không tắt được policy enforcement.

**Làm thế nào:**

1. `opencode plugin list` (thêm `--builtin` để thấy builtin), `opencode plugin check`, `opencode plugin update`.
2. Port theo hướng dẫn migrate-v1: `Plugin.define({ id, async setup(ctx) {...} })`, hooks đăng ký qua domain (`ctx.tool.hook(...)`, `ctx.session.hook(...)`...).
3. Prod: pin exact version (`opencode-acme-plugin@1.2.0`); local path review như code thường.

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", (event) => {
      // logic cua ban o day
    })
  },
})
```

**Nếu vẫn lỗi:** `plugin add` từ chối target tarball/alias — chỉ nhận npm name + version/tag/range, git spec, hoặc local path là **thư mục** (file đơn bị skip kèm warning trong log).

## Q2: "`@opencode/client` vs `@opencode/sdk` khác nhau thế nào?"

**Trả lời 1 câu:** `@opencode/client` gọi server API v2 qua mạng (cùng client với TUI/Desktop); `@opencode/sdk` nhúng cả engine vào app bạn — router in-memory, không mở HTTP listener.

**Giải thích:** Client dùng khi bạn có một server OpenCode đang chạy (local service, `opencode serve`...) và muốn điều khiển từ ngoài ([build](https://opencode.ai/v2/docs/build/), verify 28/10/2026). SDK thì "hosts OpenCode directly inside your application": tự dựng server trong bộ nhớ, **không mở HTTP listener, không thêm network hop**, và có hướng dẫn riêng cho Cloudflare Durable Objects ([build/sdk](https://opencode.ai/v2/docs/build/sdk), verify 28/10/2026). Cả hai dùng chung Promise values, error types, streams.

```ts
import { OpenCode } from "@opencode/sdk"

await using opencode = await OpenCode.create()
const session = await opencode.sessions.create({ location: { directory: "/workspace" } })
await opencode.sessions.prompt({ sessionID: session.id, text: "Review the current changes" })
```

**Làm thế nào:** script gọi server từ xa/CI → `@opencode/client`; nhúng agent vào sản phẩm của bạn → `@opencode/sdk`; cần Durable Objects → hướng dẫn Cloudflare riêng của SDK.

**Nếu vẫn lỗi:** script cũ gọi API v1 → API v2 là intentional breaking change, phải port endpoint + client mới ([migrate-v1 — Server API and clients](https://opencode.ai/v2/docs/migrate-v1)); trạng thái "còn đang phát triển" của SDK từ FAQ cũ — cần verify lại trước khi tin (cần verify 28/10/2026).

## Q3: "Tích hợp editor (Zed, VS Code...) thế nào?"

**Trả lời 1 câu:** `opencode acp` — Agent Client Protocol, giao tiếp JSON-RPC qua stdin/stdout; extension phải nói ACP, không còn gọi `--port` kiểu cũ.

**Giải thích:** `opencode acp` chạy OpenCode như một ACP agent (protocol version 1); nó dựng **server private riêng**, không dùng shared background service, không mở port mạng cho ACP, thoát khi client đóng stdin ([cli/acp](https://opencode.ai/v2/docs/cli/acp), verify 28/10/2026). Cấu hình Zed chỉ cần `command: "opencode", args: ["acp"]`. Nếu extension cũ gọi flag `--port` kiểu v1 thì update extension lên bản hỗ trợ ACP v2 (chi tiết `--port` gỡ bỏ: cần verify trên extension cụ thể — docs chỉ cam kết server API là breaking change).

```json
// ~/.config/zed/settings.json
{ "agent_servers": { "OpenCode": { "command": "opencode", "args": ["acp"] } } }
```

**Nếu vẫn lỗi:** chạy `opencode acp` trực tiếp trong terminal trông như "treo" — bình thường, nó đợi JSON-RPC trên stdin, phải chạy từ ACP client; debug thì `opencode --print-logs acp` đẩy log ra stderr, stdout chỉ chứa ACP messages.

## Q4: "Port plugin xong rồi — sao chắc chắn nó chạy đúng?"

**Trả lời 1 câu:** Đi checklist 5 bước của docs: plugin list → chạy từng hook/transform/tool → verify cleanup → test options/state → test bản cài đặt (không phải bản link workspace).

**Giải thích:** Checklist này lấy từ [migrate-v1 — Verify a ported plugin](https://opencode.ai/v2/docs/build/plugins/migrate-v1) (verify 28/10/2026): (1) ID + nguồn của plugin xuất hiện trong active plugin list; (2) mọi hook, transform, tool, command, subscription đều được kích hoạt; (3) cleanup chạy đúng khi reload/remove; (4) options + storage hoạt động với project sạch; (5) package published thì test **bản cài đặt** chứ không chỉ bản workspace-link.

**Làm thế nào:**

1. `opencode plugin list` — ID và source hiện chưa?
2. Chạy từng thứ đã đăng ký (hook, transform, tool, command, event).
3. Reload/remove plugin — cleanup có chạy không?
4. Test options + `ctx.storage` với project sạch.

**Nếu vẫn lỗi:** plugin load được nhưng hook không bắn → soát bạn đang đăng ký hook ở **domain đúng** chưa (bảng V1→V2 trong migrate-v1); nhớ transform phải đồng bộ và không side-effect, dữ liệu ngoài nạp trước rồi cache.

## Q5: "Plugin local không được load?"

**Trả lời 1 câu:** v2 dò `.opencode/plugins/` (và `.opencode/plugin/` cũ) — plugin khai trong `plugins` config phải trỏ tới **thư mục**, thư mục `plugins/` nằm cạnh file config không tự dò.

**Giải thích:** OpenCode tự load file `.ts`/`.js` và thư mục package plugin trực tiếp trong `.opencode/plugins/` mọi cấp; global tương tự trong `~/.config/opencode/plugins/` ([plugins — Discover](https://opencode.ai/v2/docs/plugins), verify 28/10/2026). Điểm hay dính lỗi: "A `plugins/` directory beside a project-root `opencode.json(c)` is not discovered automatically" — phải khai `plugins: ["./plugins/local"]` hoặc chuyển vào `.opencode/plugins/`. Đường dẫn tương đối resolve từ file config chứa nó.

**Làm thế nào:**

1. Cài global package: `opencode plugin add opencode-acme-plugin@1.2.0`.
2. Local: đặt vào `.opencode/plugins/` hoặc khai path rõ ràng trong `plugins` (path phải là **directory**).
3. Thay đổi file trong thư mục config được watch sẽ tự reload; file dependency ngoài vùng watch cần restart (`opencode service restart`).

**Nếu vẫn lỗi:** `opencode service restart` sau khi sửa local dependency chưa được watch; plugin khai `./plugins/x.ts` (file) bị bỏ qua — chuyển thành `./plugins/x/index.ts`.

## Q6: "Tắt plugin cụ thể (hoặc không tắt được)?"

**Trả lời 1 câu:** Thêm mục `"-" + ID` (hoặc wildcard `-*`) vào mảng `plugins` — nhưng 2 plugin builtin policy/provider không cho tắt.

**Giải thích:** Mảng `plugins` xử lý theo thứ tự: prefix `-` tắt, `*` mọi plugin, `.*` match prefix, ID sau đó bật lại ([plugins — Control](https://opencode.ai/v2/docs/plugins), verify 28/10/2026). `opencode.config.policy` và `opencode.provider.opencode` (kết nối Console delivering org policy) bỏ qua lệnh remove — chính sách: repo không được tự tắt policy enforcement.

```jsonc
{ "plugins": ["*", "-opencode.provider.*", "opencode.provider.openai", "-acme.reviewer"] }
```

**Nếu vẫn lỗi:** muốn tắt builtin provider plugin để tắt auto-discovery (vd Ollama) → `"plugins": ["-opencode.provider.ollama"]`; còn `opencode.config.policy`/`opencode.provider.opencode` thì không tắt được — thiết kế bảo mật, không phải bug.

## Q7: "Script cũ gọi server API v1 / auth kiểu cũ không chạy?"

**Trả lời 1 câu:** Server API v2 là intentional breaking change — port script sang API v2 + `@opencode/client`; auth đổi thành `OPENCODE_PASSWORD`, username luôn là `opencode`.

**Giải thích:** "Integrations that call the V1 server API must migrate" ([migrate-v1](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026). Auth vẫn HTTP Basic nhưng: `OPENCODE_PASSWORD` là biến chính thức (`OPENCODE_SERVER_PASSWORD` vẫn chạy), **username cứng là `opencode`** — `OPENCODE_SERVER_USERNAME` không còn hỗ trợ. Script `fetch` trực tiếp API v1 phải port sang API + client mới.

```bash
curl -u opencode:{env:OPENCODE_PASSWORD} http://127.0.0.1:49374/api/info
# hoac dung tool chinh thuc: opencode api get /api/info
```

**Nếu vẫn lỗi:** `opencode acp` nhìn như treo vì chờ stdin — đó là ACP mode, không phải lỗi; dùng `opencode --print-logs acp` để xem log lỗi protocol từ editor.

## Q8: "Plugin sửa xong có tự reload không?"

**Trả lời 1 câu:** File trong thư mục config được watch thì reload tự động; dependency ngoài vùng watch hoặc package chưa pin cần restart server.

**Giải thích:** "Changes under watched config directories reload automatically"; server khởi động sẽ load plugin package đã cache ngay, cài package thiếu ở nền, và check update cho plugin chưa pin — bản pin exact version/full commit hash thì giữ nguyên ([plugins — Reload](https://opencode.ai/v2/docs/plugins), verify 28/10/2026).

**Làm thế nào:**

```bash
touch .opencode/plugins/concise/index.ts   # kich hoat reload tu dong
opencode service restart                    # fallback khi khong reload
```

1. Sửa file trong `.opencode/plugins/` → tự reload.
2. Sửa local dependency ngoài vùng watch → `opencode service restart`.
3. Package pin exact version sẽ không bị update tự động — đúng ý cho prod.

**Nếu vẫn lỗi:** plugin cập nhật không ăn → `opencode plugin check` + `opencode plugin update`; local plugin bên ngoài vùng watch thì restart service.

## Q9: "Plugin có hiện lên trong Desktop app không?"

**Trả lời 1 câu:** Có, nếu plugin export thêm `./gui-experimental` — app load plugin từ server nó chạy, nên khai trong global config để dùng ở mọi cửa sổ.

**Giải thích:** Plugin có `./gui-experimental` thêm panels/commands/settings vào OpenCode Desktop; **Settings › Extensions › Plugins** liệt kê khi app nối server của chính nó. Switch trong UI chỉ tắt phần desktop UI của plugin; tắt toàn bộ thì dùng `-` + ID trong `plugins` ([plugins — Desktop](https://opencode.ai/v2/docs/plugins), verify 28/10/2026).

**Làm thế nào:**

1. Khai plugin trong `~/.config/opencode/opencode.jsonc` để mọi window dùng.
2. **Settings › Extensions › Plugins** xem trạng thái, **Reload** nếu load lỗi.
3. Tắt UI desktop riêng: toggle trong Settings; tắt cả plugin: `-<id>` trong `plugins`.

**Nếu vẫn lỗi:** plugin không hiện trong Desktop → app đang nối server khác (server riêng/remote); Desktop chỉ load plugin từ server nó chạy.

## Q10: "Plugin TUI-only khác plugin server thế nào?"

**Trả lời 1 câu:** TUI plugin cấu hình riêng trong `~/.config/opencode/cli.json` (mảng `plugins` của cli.json) và vẫn hoạt động khi TUI nối server remote.

**Giải thích:** TUI plugin không chạy trên server nên không đụng plugin server; nó cấu hình trong `cli.json` — "TUI-only plugins are configured separately and remain active when connected to a remote server" ([plugins — Terminal](https://opencode.ai/v2/docs/plugins), verify 28/10/2026). Plugin thường (server-side) khai trong `opencode.json(c)` như FAQ 06 Q1.

```json
// ~/.config/opencode/cli.json
{ "plugins": ["opencode-acme-cli"] }
```

**Làm thế nào:**

1. Plugin đụng TUI/notification/status → khai trong `cli.json` (không phải `opencode.jsonc`).
2. Plugin server-side (hooks, tools) → khai trong `opencode.jsonc`.
3. Cả hai có thể dùng song song — chúng chạy ở hai process khác nhau.

**Nếu vẫn lỗi:** plugin TUI mất khi đổi server remote → TUI-only plugin "remain active when connected to a remote server", nên nếu mất thì bạn đang cấu hình nhầm file (phải là `cli.json`, không phải `opencode.jsonc`).

## Q11: "Options của plugin truyền thế nào?"

**Trả lời 1 câu:** Dùng object form trong mảng `plugins` — `{ "package": "...", "options": {...} }`, plugin đọc qua `ctx.options`.

**Giải thích:** Cấu hình dạng chuỗi chỉ load plugin; muốn truyền options thì bọc object `{ "package": ..., "options": {...} }` ([plugins — Configure](https://opencode.ai/v2/docs/plugins), verify 28/10/2026). Plugin đọc `ctx.options` trong `setup`.

```jsonc
{ "plugins": [
  { "package": "@acme/opencode-plugin", "options": { "agent": "reviewer", "strict": true } }
] }
```

**Làm thế nào:** plugin cần cấu hình → khai `options` trong object entry; trong code dùng `ctx.options.strict === true` (luôn kiểm tra kiểu vì options là `unknown`).

**Nếu vẫn lỗi:** options không đến nơi → nhớ object form bắt buộc khi có options; form string `"plugin-name"` không truyền options được.
