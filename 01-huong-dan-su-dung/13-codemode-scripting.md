# 13 — Code Mode scripting (vũ khí bí mật của v2)

> **Dành cho:** người có nhiều MCP/OpenAPI · **Vấn đề:** gọi tool từng cái tốn round-trip + context · **Đọc xong:** hiểu runtime Code Mode + nhờ agent viết script gộp calls · **Thời gian:** ~12 phút.

## Mục tiêu

- Kể được Code Mode làm gì (JS interpreter tối giản, catalog tools thành functions).
- Biết tools nào vào catalog, permission vẫn check từng tool.
- Cấu hình per-server: opt-out bằng `codemode: false`, chặn bằng `deny execute`.
- Ra lệnh để agent viết script thay vì gọi lẻ.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Runtime có gì, thiếu gì](#runtime-có-gì-thiếu-gì)
- [Luồng hoạt động](#luồng-hoạt-động-flow)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [Giải thích từng phần](#giải-thích-từng-phần)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

**1 câu:** Code Mode biến MCP servers/OpenAPI thành functions trong 1 JS runtime tối giản — agent viết script gọi gộp nhiều tools 1 lần.

**Nôm na:** thay vì bạn đứng giữa chợ hét từng món, bạn đưa người đi chợ 1 tờ giấy: "lấy A, lọc cái còn hạn, rồi lấy B theo từng cái A". Một chuyến xong.

- Mọi MCP server **default opt-in** Code Mode (trường `codemode` mặc định `true`). Muốn tool hiện native trên list tool của model: `"codemode": false` cho server đó.
- Runtime **không** có filesystem/import/timers trực tiếp — chỉ gọi tools trong catalog; `fetch` có sẵn cho HTTP. Mỗi nested tool vẫn check permissions riêng; `deny execute` với resource `*` là gỡ cả Code Mode + mọi tool chỉ chạm được qua nó (kể cả MCP tools của server không đặt `codemode: false`).
- Trong prompt bạn không cần viết JS tay — hãy bảo agent: `"dùng Code Mode gộp: search 5 issues sentry rồi với mỗi issue lấy chi tiết, 1 script duy nhất"`.
- Code Mode còn có các namespace dựng sẵn: `opencode` (session utilities: `session_rename`, `session_move`, `worktree_create/list/remove`), `browser` (điều khiển browser của OpenCode Desktop).

**Vì sao quan trọng?** Đây là lý do "add 1000 MCP mà context không phình": model thấy functions gọn nhóm theo server (`tools.sentry.*`), không thấy 1000 tool schemas. Code Mode là mặc định của v2 — bật sẵn, không phải cấu hình.
**Nếu làm sai?** Bắt agent gọi 20 tools lẻ cho việc gom được trong 1 script → 20 round-trips, bill + latency nhân 20.

## Runtime có gì, thiếu gì

Bảng ranh giới của runtime `execute` (đọc kỹ trước khi kỳ vọng):

| Thứ | Trong Code Mode? | Ghi chú |
|---|---|---|
| Gọi tools trong catalog | Có | Cả built-in lẫn MCP theo namespace server |
| `fetch` | Có | Dành cho HTTP request |
| Filesystem trực tiếp | Không | Đọc file phải qua `read` tool |
| `import` module | Không | Không có hệ sinh thái npm bên trong |
| Timers (`setTimeout`...) | Không | Không lập lịch được |
| Permission từng tool | Có, vẫn check | Nested tool vẫn hỏi/đúng permission riêng |
| `deny execute` (`*`) | Gỡ cả Code Mode | Cùng lúc gỡ tool chỉ chạm được qua Code Mode |

Từ vantage của agent, tools MCP hiện thành namespace: `tools.sentry.list_issues(...)` — tên server được chuẩn hóa (ký tự lạ → `_`), đúng như cách v2 đặt tên tool `<server>_<tool>` khi native.

### Catalog gồm những gì

| Namespace / nhóm | Nội dung | Điểm nhớ |
|---|---|---|
| MCP tools | theo server: `tools.<server>.<tool>` | vẫn check permission riêng của từng tool |
| `opencode` | session utilities: `session_rename`, `session_move` | không yêu cầu permission action riêng |
| `opencode` (worktree) | `worktree_create/list/remove` | `remove` dùng permission `edit` với thư mục worktree |
| `browser` | tab, snapshot, click, screenshot, console/network, Lighthouse | chỉ khi desktop app attach browser; `deny browser` (`*`) gỡ cả catalog |
| Tool builtin | `read`, `grep`, `glob`, `edit`, `shell`... | cũng vào script được, permission như thường |

**Vì sao quan trọng?** Biết catalog gồm gì thì bạn ra lệnh đúng: "gộp việc đọc file + gọi sentry vào 1 script" là hợp lệ (cả hai đều trong catalog).
**Nếu làm sai?** Tưởng namespace `browser` luôn có mặt — nó chỉ tồn tại khi browser được attach (OpenCode Desktop); session thuần terminal thì không.

**Vì sao quan trọng?** Biết ranh giới thì bạn không mất công "cấm" những thứ nó vốn không có, và không đổ lỗi cho Code Mode khi agent cần thứ nằm ngoài catalog.
**Nếu làm sai?** Bắt agent "vào Code Mode đọc file rồi tự xử lý" — nó không đọc được file trực tiếp; phải quay lại tool `read`.

## Ví dụ chi tiết

### Kịch bản: gom 20 round-trips thành 1 script

Thay vì 10 lần "search sentry issue → lấy chi tiết → lấy 10 sự kiện liên quan":

```text
Ban: "dung Code Mode gop trong 1 script: tim 5 issues sentry co tag 'checkout',
      roi voi moi issue lay chi tiet. Tra ve bang: id | title | so event | assignee"
Agent: viet 1 script execute():
  - tools.sentry.search_issues(...)   // 1 lan
  - Promise.allSettled(5 cai tools.sentry.get_issue(...))  // song song trong script
  - return bang tom tat                // gia tri trung gian khong dot context
```

Kết quả: model chỉ nhận bảng kết quả cuối — không phải 10 trang JSON trung gian.

### Mẫu script agent sẽ viết (để bạn biết "1 script" trông ra sao)

```js
// Script trong execute(): agent viet, ban chi doc de hieu
// 1) tim issues 1 lan
const found = await tools.sentry.search_issues({ query: "checkout" })

// 2) voi moi issue, lay chi tiet - doc lap nen chay song song
const details = await Promise.allSettled(
  found.items.map((it) =>
    tools.sentry.get_issue({ id: it.id })
  )
)

// 3) chi return phan gon - gia tri trung gian khong dot context cua model
return details.map((d, i) => ({
  id: found.items[i].id,
  title: found.items[i].title,
  ok: d.status === "fulfilled",
  events: d.status === "fulfilled" ? d.value.eventCount : null,
}))
```

**Vì sao hiện mẫu này?** Để bạn đọc được script agent viết và bắt lỗi: nếu nó gõ `fs.readFile` (không có trong runtime) hoặc `setTimeout` (không có) — đó là dấu hiệu cần nhắc lại ranh giới.

### Timeout: chỉnh thở cho server chậm

```jsonc title="opencode.jsonc"
{
  "mcp": {
    "timeout": { "startup": 45000, "catalog": 30000, "execution": 600000 },
    "servers": {
      "slow-tools": {
        "type": "remote",
        "url": "https://mcp.example.com/mcp",
        "timeout": { "catalog": 60000 }   // server rieng override mac dinh
      }
    }
  }
}
```

Mặc định: startup 30s, catalog 30s, execution 12 giờ. Code Mode liệt kê catalog theo server — server chậm trả catalog là script của agent đứng trước khi chạy; chỉnh `catalog` ở server đó thay vì tăng mặc định toàn cục.

### Opt-out một server khỏi Code Mode

```jsonc title="opencode.jsonc"
{
  "mcp": {
    "servers": {
      "context7": {
        "type": "remote",
        "url": "https://mcp.context7.com/mcp",
        "codemode": false   // tool nay can nam truc tiep tren tool list cua model
      }
    }
  }
}
```

**Vì sao có opt-out này?** Tool cần model "nhìn thấy schema" để tự chọn tham số chính xác (vd tool có schema phức tạp) hợp lệ hơn khi nằm native. Đổi lại, nó chiếm chỗ context như tool thường.

### Chặn mà không ngắt server

```jsonc
{
  "permissions": [
    { "action": "context7_*", "resource": "*", "effect": "deny" }
  ]
}
```

Deny theo `action` (khớp tên chuẩn hóa `<server>_<tool>`) là **giấu/deny từng tool** mà server vẫn nối. Còn `deny execute` với resource `*` thì gỡ luôn Code Mode — server rời catalog. Đây là 2 núm chỉnh thô/tinh khác nhau: chỉ muốn cụt 1 tool dùng permission action; muốn tắt cả cơ chế thì deny `execute`.

## Luồng hoạt động (Flow)

1. **Bạn muốn gộp nhiều calls** → hỏi agent: "dùng Code Mode gộp: A rồi B với mỗi kết quả của A" → agent viết script.
2. **Script chạy** → `execute` gọi mỗi tool, permission từng cái; lỗi ở step nào thì báo step đó — không có lỗi "tao không rõ ở đâu".
3. **Kết quả trả về** — giá trị gốc của tool cuối; giá trị trung gian không đốt context model. Bạn thấy bảng/array/struct đã xử lý.
4. **Chạy thử tay** — nếu script không ra đúng → kiểm tra catalog (model thấy tools gì?), kiểm tra ranh giới runtime (có dùng thứ ngoài catalog không?).

### Khi nào KHÔNG dùng Code Mode

- Tool có schema cực kỳ phức tạp cần model "thấy" rõ từng field → opt-out `codemode: false`. Nhưng khi đó context đội lên vì 100 tool lẻ nằm trên list.
- Script cần phép tính nặng giữa các kết quả tool → code ngoài Code Mode (trong terminal hoặc bằng 1 bước shell) rẻ hơn nhiều round-trip.
- Việc cần edit thực tế → không phải Code Mode job; session chính giữ quyết định.

**Vì sao?** Code Mode tốt nhất khi nhiều tool độc lập mà kết quả gộp lại. Khi tool là "đầu vào" cho thao tác phức tạp hơn (đọc rồi suy luận), để model tự dùng tool ngoài Code Mode.

## Giải thích từng phần

- **Catalog** — danh sách functions model thấy: tool builtin + tool MCP (theo namespace server). Model không thấy schema thô của từng MCP tool.
- **Per-server opt-out** — `"codemode": false` ở từng server (local lẫn remote) đưa tools của server đó về native list. Đây là cách trị server cần tool "luôn trên mặt".
- **Permission 2 lớp** — script trong `execute` là lớp 1 (deny `execute` là gỡ cả cụm); từng tool gọi trong script vẫn đi qua permission riêng của nó (lớp 2). Plugin tool thì theo permission plugin tự khai báo.
- **Server instructions khi dùng Code Mode** — thay vì dán nguyên instructions của server vào prompt, OpenCode chỉ thêm 1 dòng chỉ model chỗ xem tools; nếu permissions deny hết tools (hoặc deny `execute` của server), instructions cũng bị bỏ theo. Ý nghĩa: chặn tool = chặn cả "lời dặn" đi kèm — tổng context sạch hơn bạn tưởng.
- **sessionID metadata** — mọi call trên danh nghĩa một session đều kèm `ai.opencode/sessionID` trong `_meta` của request (cả native lẫn Code Mode). Đây là ID để correlation, không phải đối tượng xác thực — server remote nhận raw ID và có thể log, đừng dùng nó làm chìa khóa xác thực.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 (Code Mode) | Copilot / Claude (native MCP) |
|---|---|---|
| Thấy gì | functions gọn theo server | từng tool schema |
| Gọi gộp | 1 script nhiều calls | từng call 1 round-trip |
| Chặn | `execute` deny gỡ cả cụm + từng tool vẫn check | deny từng tool |
| Opt-out | `codemode: false` per server | không cần (mặc định native) |

Claude/Copilot không có runtime tương đương trực tiếp — đây là món riêng của OpenCode 2.

## Lỗi thường gặp

### 1. Tưởng runtime là sandbox đa năng

```text
❌ SAI: viet script trong Code Mode doi doc file truc tiep / fetch internet
✅ ĐÚNG: chi goi tools trong catalog (doc file bang read tool, fetch bang webfetch/websearch/MCP tool)
```
**Bài học:** Code Mode là "tờ giấy đi chợ", không phải máy tính tự do. Cần gì thì gọi đúng tool. (Lưu ý: `fetch` HTTP thì có — cái không có là filesystem/import/timer.)

### 2. Nhét 5 servers vào 1 script

```text
❌ SAI: 1 script vua goi sentry vua goi github vua doc file roi xu ly het
✅ ĐÚNG: tach theo server: 1 script sentry, 1 script github; ket qua hop o session chinh
```
**Bài học:** gộp để tiết kiệm, nhưng không gộp đến mức không debug nổi lỗi thuộc server nào.

### 3. Bất ngờ khi tool "biến mất"

```text
❌ SAI: deny execute tung tool rieng roi ngac nhien server van het tool
✅ ĐÚNG: hieu 2 lop - deny execute = go Code Mode cua server; deny <server>_<tool> = chan tung tool
```
**Bài học:** chọn đúng tầng chặn theo ý muốn (cả cụm hay từng tool).

### 4. Tưởng catalog giữ nguyên sau khi restart

```text
❌ SAI: tao MCP server, check tools tren list, roi sua script server -> catalog van nhu cu
✅ ĐÚNG: MCP catalog la ket qua cua handshake luc no ket noi; sua server can restart lai server do
```
**Bài học:** MCP server không auto-reload khi server MCP đổi; bạn cần restart process MCP hoặc restart OpenCode. Đây là hành vi transport, không liên quan Code Mode.

## Best practices (kèm "vì sao")

- Gom theo server (`tools.sentry.*` trong 1 script) thay vì nhảy 5 servers 1 script khó debug. **Vì sao?** Lỗi ở server nào thì log server đó.
- Việc độc lập với nhau → dùng `Promise.allSettled` trong script để chạy song song, tránh tuần tự không cần thiết. **Vì sao?** Code Mode rẻ nhất khi bỏ được round-trip lặp và tuần tự hóa không cần thiết.
- Thêm `worktree_*` vào Code Mode khi làm Git (bài 14). **Vì sao?** Agent tự tạo/move/remove worktree có approve như edit thường.
- Giữ tên server ngắn, chuẩn hóa xong vẫn duy nhất. **Vì sao?** Tên tool/namespace sinh từ tên server — trùng/ký tự lạ là chập chờn về sau.
- Đọc tiếp tips thực chiến ở `../02-tips-thuc-chien/05-codemode-hieu-qua.md` khi muốn tối sâu. **Vì sao?** Bài này là bản đồ, tips là tay nghề.

## Bài tập nhỏ

1. (10 phút) Với 1 MCP có ≥2 tools, bảo agent "gộp 3 calls thành 1 Code Mode script" — đếm round-trip giảm được.
2. (5 phút) Thử `deny execute` 1 server rồi quan sát tools nó biến mất khỏi model.
3. (5 phút) Chuyển 1 server sang `"codemode": false`, so sánh cách model nhìn tool trước/sau (`/mcps` + hỏi agent "liệt kê tool bạn thấy").

## Reference

Nguồn chính thức (đã verify 28/10/2026):

- Tool `execute` + ranh giới runtime: https://opencode.ai/v2/docs/tools/
- `codemode` per-server (local/remote), permission, tên tool chuẩn hóa: https://opencode.ai/v2/docs/mcp-servers/
- Config schema: https://opencode.ai/v2/docs/config/

Bài liên quan: [08 — MCP + Code Mode](./08-mcp-codemode.md) (nền tảng MCP), [09 — Permissions & policies](./09-permissions-policies.md) (chặn tool đúng tầng), [05 — Agents](./05-agents-build-plan-custom.md), tips [05 — Code Mode hiệu quả](../02-tips-thuc-chien/05-codemode-hieu-qua.md).

> **Chốt bài 13:** đừng gọi lẻ khi gộp được. Code Mode là cách v2 biến "nhiều tool" thành lợi thế thay vì gánh nặng.
