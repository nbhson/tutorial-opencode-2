# 12 — Plugins + SDK + API (mở rộng OpenCode như dân pro)

> **Dành cho:** người viết tool nội bộ / nhúng agent vào app · **Vấn đề:** plugin v1 chết trên v2, API v1 đổi contract · **Đọc xong:** cài/quản plugin v2 + biết khi nào dùng `@opencode/client` vs `@opencode/sdk` · **Thời gian:** ~15 phút.

## Mục tiêu

- Khai báo + quản lý plugin v2 (`plugins[]`, CLI `plugin *`).
- Biết cấu trúc plugin v2 (server/TUI/GUI/RPC) + hot-reload.
- Port plugin v1 sang v2 đúng hướng (`Plugin.define`, `setup(ctx)`).
- Phân biệt `@opencode/client` (gọi server qua HTTP) vs `@opencode/sdk` (nhúng engine in-process).

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [Giải thích từng phần](#giải-thích-từng-phần)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. Plugins v2 (API mới, hot-reload)

```jsonc
{ "plugins": [
  "opencode-acme-plugin",
  "opencode-acme-plugin@1.2.0",
  "@acme/opencode-plugin",
  "./plugins/local",
  { "package": "@acme/opencode-plugin", "options": { "agent": "reviewer", "strict": true } }
] }
```

Quản lý: `opencode plugin add/list/check/update/remove` (thêm `--builtin` để kể cả plugin dựng sẵn). Relative resolve từ file config chứa entry; path local phải là **thư mục** (trỏ vào 1 file sẽ bị bỏ qua). Disable bằng prefix `-` (vd `"-acme.reviewer"`), `*` cho tất cả, `.*` cho theo tiền tố ID; ID xuất hiện sau sẽ bật lại. Hai plugin builtin (`opencode.config.policy`, `opencode.provider.opencode` — kết nối Console giao chính sách org) **không gỡ được** — để repo không tự tắt [policy enforcement](https://opencode.ai/v2/docs/policies/).

Ngoài config, OpenCode còn tự nạp `.ts`/`.js` và thư mục plugin ngay trong mọi `.opencode/plugins/` (và `~/.config/opencode/plugins/` cho global). Lưu ý bẫy: thư mục `plugins/` nằm cạnh `opencode.json` ở root project **không** tự được discovery — phải khai báo tường minh hoặc chuyển xuống `.opencode/plugins/`.

```bash
opencode plugin add opencode-acme-plugin@1.2.0
opencode plugin list              # them --builtin de xem plugin san co
opencode plugin check             # xem plugin package co ban moi khong
opencode plugin update            # cap nhat het thu outdated
opencode plugin remove opencode-acme-plugin@1.2.0
```

**Nôm na:** plugin v2 như app trên điện thoại mới — app của đời máy cũ (v1) không cài được, phải tải bản mới; được cái cài không cần khởi động lại (hot-reload).

**Vì sao quan trọng?** Plugin là đường mở rộng chính thống của v2: thêm tools, hooks, commands, agents — mà không phải fork OpenCode.
**Nếu làm sai?** Copy plugin v1 sang rồi bảo "sao không load" — API khác hẳn, rename không cứu. Tài liệu chính thức nói thẳng: *plugin implementation v1 không chạy trên v2; chuyển file hay đổi tên config entry chưa đủ.*

### 2. Server API mới + 2 package

Ba đường mở rộng từ code — chọn đúng là đỡ khổ:

- **`@opencode/client`** — TypeScript client cho **HTTP API** của server OpenCode (types và methods sinh từ cùng contract với [API reference](https://opencode.ai/v2/docs/api)). Dùng khi app của bạn nối tới server đang chạy qua mạng. Có bản Effect API riêng (`/v2/docs/build/client/effect/`).
- **`@opencode/sdk`** — nhúng thẳng engine OpenCode (chính code chạy CLI) vào app/server của bạn: `OpenCode.create()` dựng server trong bộ nhớ, route API qua HTTP router **in-memory**, không mở HTTP listener, không thêm network hop. Có guide chạy trên Cloudflare Durable Objects và bản Effect API (`/build/sdk/effect/`).
- **Server API đổi contract so với v1** — tích hợp cũ (fetch API v1) phải port sang endpoint mới; `@opencode/client` là cách được hỗ trợ chính thức.
- **ACP**: `opencode acp` chạy Agent Client Protocol qua stdin/stdout cho editor tích hợp (chi tiết ở [bài 14](./14-worktree-git-ide-acp.md)).

**Nôm na:** `client` là điện thoại gọi vào tổng đài (server), `sdk` là bạn đeo nguyên tổng đài vào người (in-process). Gọi xã cần linh hoạt thì client; cần tốc độ + kiểm soát thì sdk.

**Vì sao quan trọng?** Nhận đúng package tránh cả 2 cực: dựng HTTP server chỉ để nhúng (phiền), hoặc tự viết HTTP client tay (sai contract v1). Client có sẵn types sinh từ chính API reference.
**Nếu làm sai?** Cầm tutorial của v1 dán vào — endpoint khác, field khác (`plugin` → `plugins`, snake_case OAuth...), mất hàng ngày debug không ra.

## Ví dụ chi tiết

### A. Cấu hình plugin đầy đủ (nhiều hình thức + control)

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    "*",                                  // bat het
    "-opencode.provider.*",               // tat ca provider plugin theo tien to
    "opencode.provider.openai",           // bat lai dung cai nay
    "-acme.reviewer",                     // tat reviewer cua acme
    { "package": "@acme/qa", "options": { "strict": true } }  // plugin nhan options
  ]
}
```

### B. Plugin v2 tối thiểu (server part)

```ts title=".opencode/plugins/example/index.ts"
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example", // id on dinh: storage va diagnostics leo theo cai nay
  async setup(ctx) {
    await ctx.storage.set("loaded", true)
    return () => { /* cleanup khi plugin unload */ }
  },
})
```

### C. Gọi server bằng client

```ts
import { OpenCode } from "@opencode/client"

const client = OpenCode.make({ baseUrl: "http://localhost:4096" })

const session = await client.session.create({
  location: { directory: "/workspace" },
})
await client.session.prompt({
  sessionID: session.id,
  text: "Review the current changes",
})

// lang su kien server (async iterable, co loc theo type)
for await (const event of client.event.subscribe({ types: ["config.updated"] })) {
  console.log(event.type)
}
```

### D. Nhúng engine bằng SDK

```ts
import { OpenCode } from "@opencode/sdk"

await using opencode = await OpenCode.create()   // tu dong giai phong router, fibers...
const session = await opencode.sessions.create({
  location: { directory: "/workspace" },
})
await opencode.sessions.prompt({
  sessionID: session.id,
  text: "Review the current changes",
})
```

### E. Đăng ký plugin vào SDK host + quản worktree

```ts
import { OpenCode } from "@opencode/sdk"

await using opencode = await OpenCode.create({ plugins: [plugin] })
await opencode.plugin(pluginKhac)   // them plugin sau khi host da start

// worktree qua SDK can projectID
const projectID = session.projectID
const worktree = await opencode.worktree.create({ projectID, name: "task" })
await opencode.worktree.refresh({ projectID })
await opencode.worktree.remove({ projectID, directory: worktree.directory, force: false })
```

### F. Dựng client nối shared service (app Node)

```ts
import { OpenCode } from "@opencode/client"
import { Service } from "@opencode/client/service"

const endpoint = await Service.ensure()   // phat hien/hoac khoi dong shared service
const client = OpenCode.make({
  baseUrl: endpoint.url,
  headers: Service.headers(endpoint),
})
const info = await client.server.info()
```

**Vì sao có `Service`?** Entrypoint chính của client chạy được cả trong browser — không quản process. Trong Node, `@opencode/client/service` bổ sung phần "tìm hoặc bật server": `discover()` chỉ tìm, `ensure()` tìm-hoặc-khởi, `stop()` dừng đúng instance đã đăng ký.

## Giải thích từng phần

- **Một plugin, nhiều phần (parts):** server (`.`), TUI (`./tui`), GUI desktop (`./gui-experimental`), RPC (`./rpc`) — tất cả chỉ phụ thuộc 1 package `@opencode/plugin`. Một entry trong `plugins[]` nạp mọi phần; bản TUI-only thì khai trong `cli.json`.
- **Hot-reload:** đổi file trong config directory được watch thì tự nạp lại; đổi file cục bộ phụ thuộc (unwatched) có thể vẫn phải restart. `plugin check/update` chỉ đụng package **chưa pin** — version exact và full commit hash được giữ nguyên.
- **`ctx` là client + API cùng lúc:** v2 gom thao tác theo domain (`ctx.session`, `ctx.tool`, `ctx.provider`, `ctx.worktree`...), thay cho bảng hook-by-string của v1. Bảng tham khảo nhanh khi port:

| V1 hook | V2 đích |
|---|---|
| `event` | `ctx.event.subscribe()` |
| `tool` map / `tool.definition` | `ctx.tool.transform(...)` |
| `tool.execute.before/after` | `ctx.tool.hook("execute.before/after", ...)` |
| `shell.env` | `ctx.shell.hook("create.before", ...)` |
| `permission.ask` | `ctx.permission.hook("evaluate", ...)` |
| `chat.params` | `ctx.session.hook("context", ...)` |
| `chat.headers` | `ctx.session.hook("model.request", ...)` hoặc `"http.request"` |
| `provider` | `ctx.provider.transform(...)` + `ctx.model.transform(...)` |
| `dispose` | cleanup function mà `setup` trả về |

- **RPC plugin:** plugin xuất `./rpc` cho client/plugin khác gọi method typed — client import contract rồi `client.rpc(Acme)`; còn mọi HTTP client đều có thể gọi `POST /api/rpc/{rpcID}/{method}` với `{ "input": ... }`. Import contract **không tự đăng ký** — server plugin phải được cấu hình và implement.
- **`Service` của client** (`@opencode/client/service`): `Service.ensure()` tự phát hiện/khởi động shared background service (`opencode serve --service`) rồi trả endpoint — bạn không tự quản process.
- **Cần verify:** câu "đồ án Figma chính chủ gồm MCP + 6 skills" từ bản nháp cũ chưa tìm được xác nhận trong docs v2 (verify 28/10/2026) — hãy kiểm tra lại trang plugins trước khi trích dẫn số liệu này.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Mở rộng | plugins v2 (npm/Git/local, hot-reload, server/TUI/GUI parts) | Extensions/Marketplace, Agent Plugins 1.0 | plugins/marketplace tùy bản |
| Gọi từ code | `@opencode/client` (API mới + RPC plugin) | Copilot SDK | SDK/API riêng |
| Nhúng engine | `@opencode/sdk` (in-process, không HTTP listener) | self-host proxy tương tự | headless tương tự |
| Editor giao thức | ACP (`opencode acp`) | extension chính chủ | extension/LSP |

## Lỗi thường gặp

### 1. Pin plugin bằng tag mở cho production

```text
❌ SAI: pin plugin bang tag mo (latest) cho production CI
✅ ĐÚNG: pin exact version / full commit hash; unpinned moi auto-check update
```
**Bài học:** hot-reload + auto-check tiện cho dev, độc cho prod. Prod phải pin.

### 2. Copy plugin v1 rồi đổi tên

```text
❌ SAI: cp v1-plugin.ts .opencode/plugins/ doi ten entry config roi bao "khong load"
✅ ĐÚNG: doc guide migrate-v1, viet lai bang Plugin.define + setup(ctx), thuc hanh tung hook
```
**Bài học:** v1 implementation hoàn toàn không chạy trên v2 — đây là port, không phải rename.

### 3. Nhầm client và SDK

```text
❌ SAI: can goi server dang chay qua mang ma cai @opencode/sdk roi tu dung engine them 1 nua
✅ ĐÚNG: server dang chay -> @opencode/client; app muon "la" engine (khong can HTTP) -> @opencode/sdk
```
**Bài học:** client = gọi qua mạng (HTTP), sdk = nhúng trong tiến trình. Chọn sai là thêm một network hop thừa hoặc một dependency nặng oan.

## Best practices (kèm "vì sao")

- Plugin nội bộ để local path + review như code. **Vì sao?** Plugin chạy với quyền user — supply-chain attack qua plugin là đường nhanh nhất.
- Tách CLI-only plugins ra `cli.json` khi nối remote server. **Vì sao?** TUI plugin trong `cli.json` vẫn active khi nối remote server — nhầm là rò quyền.
- Khi cần tương thích cả v1 lẫn v2, export 1 object vừa `setup()` (v2) vừa `server()` (v1) trong thời gian chuyển tiếp, rồi bỏ phần v1. **Vì sao?** Một package hai API hỗ trợ bạn phát hành chậm rãi, nhưng không tự dịch hook — đừng ảo về điều đó.
- Dùng `ctx.storage` cho state của plugin thay vì tự chế file global. **Vì sao?** Storage bền, scope đúng theo plugin ID, không phá khi đổi máy.
- Verify plugin đã port theo checklist: ID xuất hiện trong `plugin list`, chạy thử từng hook/transform/tool đã đăng ký, test options + storage bằng project sạch, package published thì test bản đã cài chứ không chỉ bản workspace-linked. **Vì sao?** Plugin chạy được ≠ plugin chạy đúng — từng hook phải được "sờ" riêng.
- Đọc link `../03-cau-hoi-thuong-gap/06-plugins-sdk-api-faq.md` khi băn khoăn client vs sdk. **Vì sao?** FAQ gọn hơn trang build, hợp cho tra nhanh.

## Bài tập nhỏ

1. (10 phút) `opencode plugin list` (và `--builtin`) xem máy có gì; thử `plugin check` 1 lần.
2. (10 phút) Viết plugin tối thiểu `.opencode/plugins/hello/index.ts` (định nghĩa `id` + `setup` ghi `ctx.storage`), khởi động lại, xác nhận nó xuất hiện trong `plugin list`.
3. (15 phút) Chạy `@opencode/client`: `OpenCode.make({ baseUrl })`, tạo session, gửi 1 prompt, nghe `client.event.subscribe()` in event type.

## Reference

Nguồn chính thức (đã verify 28/10/2026):

- Cấu hình + quản lý plugin: https://opencode.ai/v2/docs/plugins/
- Kiến trúc plugin + parts + publish: https://opencode.ai/v2/docs/build/plugins/
- Port từ v1 (Plugin.define, hook mapping): https://opencode.ai/v2/docs/build/plugins/migrate-v1/
- `@opencode/client` — make/subscribe/Service: https://opencode.ai/v2/docs/build/client/
- `@opencode/sdk` — OpenCode.create, in-process, worktrees: https://opencode.ai/v2/docs/build/sdk/
- SDK trên Cloudflare Durable Objects: https://opencode.ai/v2/docs/build/sdk/cloudflare/
- Effect variants (plugin/client/sdk): https://opencode.ai/v2/docs/build/plugins/effect/ , https://opencode.ai/v2/docs/build/sdk/effect/
- Server API reference: https://opencode.ai/v2/docs/api

Bài liên quan: [13 — Code Mode scripting](./13-codemode-scripting.md), [14 — Worktree + Git + IDE/ACP](./14-worktree-git-ide-acp.md), [09 — Permissions & policies](./09-permissions-policies.md), [01 — Cài đặt & upgrade v1→v2](./01-cai-dat-upgrade-v1-v2.md).

> **Chốt bài 12:** v1 plugin/API coi như bỏ. V2: plugin cho mở rộng, client cho gọi, SDK cho nhúng.
