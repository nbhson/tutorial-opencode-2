# FAQ 04 — MCP + Code Mode

> Tra nhanh khi MCP server cài xong mà không chạy. Link chéo: [Bài 08 — MCP & Code Mode](../01-huong-dan-su-dung/08-mcp-codemode.md), [Tips 05 — Code Mode hiệu quả](../02-tips-thuc-chien/05-codemode-hieu-qua.md), [FAQ 03](./03-permissions-policies-faq.md).
> Nguồn chính thức: [mcp-servers](https://opencode.ai/v2/docs/mcp-servers) (verify 28/10/2026, OpenCode 2.2.0).

## Q1: "Add MCP xong báo `needs authentication`?"

**Trả lời 1 câu:** Remote server mặc định dùng OAuth — phải sign-in một lần, và sửa config không thay được credential đã lưu.

**Giải thích:** "Remote servers use OAuth by default" ([mcp-servers](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). OpenCode tự discover authorization server, đăng nhập bằng PKCE và tự refresh token; credentials lưu **ngoài** project config — nên sửa config không xóa được credential cũ, phải `logout` trước. Server chỉ dùng API key thì tắt OAuth bằng `"oauth": false` và truyền key qua headers với `{env:}`.

**Làm thế nào:**

```bash
# trong TUI: /mcps -> chon server -> sign-in bang browser
opencode mcp auth context7       # bat dau flow OAuth tu CLI
opencode mcp logout context7     # xoa credential khi doi account
```

```jsonc
// server chi dung API key: tat OAuth, key dua qua bien moi truong
{ "mcp": { "servers": { "context7": {
  "type": "remote",
  "url": "https://mcp.context7.com/mcp",
  "oauth": false,
  "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" }
} } } }
```

**Nếu vẫn lỗi:** server của công ty bắt client đã đăng ký trước → khai `oauth.client_id`/`client_secret` (snake_case trong v2) hoặc `auth_server_metadata_url` nếu server không publish metadata; đổi account thì bắt buộc `mcp logout` trước.

## Q2: "Khi nào tắt Code Mode (`codemode: false`)?"

**Trả lời 1 câu:** Chỉ khi server bắt buộc tools phải hiện native trên danh sách tool của model — còn lại giữ default `true` để gom tools, đỡ bloat context.

**Giải thích:** `codemode` mặc định `true` cho cả local lẫn remote: tools được gom qua Code Mode thay vì phình system prompt ([mcp-servers — Permissions](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). Tắt hàng loạt = quay về hành vi v1. Lưu ý phân biệt: `deny` action `execute` gỡ cả cụm Code Mode của server đó (tool ẩn đi), trong khi `codemode: false` đổi cách expose tools.

```jsonc
{ "mcp": { "servers": { "context7": {
  "type": "remote",
  "url": "https://mcp.context7.com/mcp",
  "codemode": false
} } } }
```

**Làm thế nào:**

1. Mặc định để `true` (hoặc không ghi gì).
2. Chỉ set `false` cho server có tools mà model cần thấy trực tiếp.
3. Muốn ẩn/deny tools mà vẫn giữ server → dùng permission `<server>_*` thay vì đổi codemode.

**Nếu vẫn lỗi:** tool gọi không chạy trong Code Mode mà server cần native → set `codemode: false` chỉ cho server đó; đừng tắt hàng loạt.

## Q3: "Tool name lạ hoắc (`context_7_...`)?"

**Trả lời 1 câu:** Tên chuẩn hóa là `<server>_<tool>` — mọi ký tự khác chữ/số/`_`/`-` đổi thành `_`, nên hãy đặt tên server ngắn, sạch từ đầu.

**Giải thích:** Ví dụ chính thức: server `context 7` + tool `resolve.library/id` → tool name `context_7_resolve_library_id`; MCP prompts thành lệnh `/context_7:find_docs` ([mcp-servers — Names](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). Code Mode group tools theo tên server đã normalize: `tools.context_7.resolve_library_id(...)`.

**Làm thế nào:**

1. Đặt tên server ngắn, không ký tự đặc biệt ngay từ khi `mcp add`.
2. Chặn theo prefix đã normalize: rule `context7_*` khớp mọi tool của server đó.
3. Tên trùng nhau sau khi normalize là dính dính nhau — đổi tên server ngay.

**Nếu vẫn lỗi:** không chắc tên chuẩn → xem trong Code Mode hoặc catalog `tools.<server_norm>.<tool>`; tên server phải unique sau normalize.

## Q4: "Server chậm / tool gọi bị timeout?"

**Trả lời 1 câu:** Tinh chỉnh `timeout` theo từng mục đích — startup 30s, catalog 30s, execution 12 giờ mặc định; server nào chậm riêng thì override riêng.

**Giải thích:** Timeout là miliseconds dương; `mcp.timeout` là default, `timeout` của từng server đè lên ([mcp-servers — Timeouts](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). `execution` mặc định 12 giờ vì có tool chạy dài; đừng giảm nó nếu tool của bạn thật sự chạy lâu.

```jsonc
{ "mcp": {
  "timeout": { "startup": 45000, "catalog": 30000, "execution": 600000 },
  "servers": { "slow-tools": { "type": "remote", "url": "https://mcp.example.com/mcp",
    "timeout": { "catalog": 60000 } } }
} }
```

**Làm thế nào:**

1. `opencode mcp list` xem trạng thái từng server.
2. Timeout khi **list tools** → tăng `catalog`; chậm ngay khi khởi động → tăng `startup`.
3. Tool chạy quá lâu → tăng `execution` cho server đó.

**Nếu vẫn lỗi:** vẫn fail ở đúng mức timeout → thường là mạng/endpoint, thử gọi endpoint bằng `curl` ngoài OpenCode để tách lỗi mạng ra khỏi lỗi OpenCode.

## Q5: "Server MCP mới chạy protocol 2026-07-28 nhưng không connect?"

**Trả lời 1 câu:** Server dựng trên revision 2026-07-28 cần `protocol: "auto"` (hoặc `"2026-07-28"`) — default `legacy` chỉ handshake `initialize` cổ điển.

**Giải thích:** V2 mở mọi server bằng handshake `initialize` cổ điển mặc định; `auto` sẽ dò `server/discover` rồi fallback `legacy` nếu server không hỗ trợ, còn `"2026-07-28"` thì bắt buộc server mới, cũ sẽ fail hẳn ([mcp-servers — Protocol version](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). Lưu ý: probe `auto` trên server local `legacy` có thể sinh thêm process tạm và chờ tới startup timeout — chỉ bật `auto` cho server cần nó.

```jsonc
{ "mcp": { "servers": { "modern": {
  "type": "remote", "url": "https://mcp.example.com/mcp",
  "protocol": "auto"  // "legacy" | "auto" | "2026-07-28"
} } } }
```

**Làm thế nào:**

1. Biết server của bạn dùng revision nào → chọn đúng giá trị.
2. Không chắc → `auto` (tự dò rồi fallback).
3. Bị fail với `2026-07-28` → server của bạn cũ hơn, quay về `legacy`/`auto`.

**Nếu vẫn lỗi:** local server `legacy` chờ lâu khi bị probe → giữ `auto` chỉ cho server cần nó, còn lại dùng `legacy`.

## Q6: "MCP add bằng CLI hay sửa config bằng tay?"

**Trả lời 1 câu:** `opencode mcp add` ghi vào project config (thêm `--global` nếu muốn mọi project); cấu hình tay phải đặt server dưới `mcp.servers` — v2 không đặt tên server trực tiếp dưới `mcp`.

**Giải thích:** Cấu trúc v2 là `mcp.servers.<tên>` với `type: "local" | "remote"`; giữ server không kết nối bằng `disabled: true` (không còn `enabled` như v1). Config precedence cao hơn **thay thế toàn bộ object server trùng tên** — đổi account thì đặt tên server mới thay vì ghi đè ([mcp-servers — Config](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026).

**Làm thế nào:**

```bash
opencode mcp add context7 --url https://mcp.context7.com/mcp        # remote
opencode mcp add everything -- npx -y @modelcontextprotocol/server-everything  # local
opencode mcp add context7 --global --url https://mcp.context7.com/mcp          # cho moi project
opencode mcp list                                                    # kiem tra trang thai
```

**Nếu vẫn lỗi:** `opencode mcp list` hiện `disabled` → config có `disabled: true`; muốn bật lại phải sửa config (disconnect trong `/mcps` không đổi config).

## Q7: "Agent đọc được tài liệu MCP resource không, chặn thế nào?"

**Trả lời 1 câu:** Qua 2 tool builtin `list_mcp_resources`/`read_mcp_resource`, chặn bằng action `opencode_list_mcp_resources` / `opencode_read_mcp_resource`.

**Giải thích:** Resource action match theo tên server (và `<server>:<uri>` khi đọc) ([mcp-servers — Resources](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026).

```jsonc
// cho doc moi resource tu server "docs", chan server khac
{ "permissions": [
  { "action": "opencode_read_mcp_resource", "resource": "docs:*", "effect": "allow" },
  { "action": "opencode_read_mcp_resource", "resource": "*:*", "effect": "deny" }
] }
```

**Nếu vẫn lỗi:** server có resource mà agent không thấy → check rule `opencode_list_mcp_resources`/`opencode_read_mcp_resource` theo đúng tên server; MCP elicitation (server hỏi input) hiện dạng form trong client, đóng form = hủy request.

## Q8: "Server instructions của MCP không xuất hiện trong prompt?"

**Trả lời 1 câu:** Instructions bị **bỏ qua** khi mọi tool của server bị permissions deny — kể cả deny `execute` cho server dùng Code Mode.

**Giải thích:** Instructions từ `initialize` được chèn vào system prompt trong tag `<mcp_instructions>`; nhưng "A server's instructions are omitted when the agent's permissions deny every one of its tools" ([mcp-servers — Server instructions](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). Nếu bạn deny prefix `<server>_*` hoặc deny `execute`, đừng thắc mắc server "im lặng" — đó là hành vi thiết kế.

**Làm thế nào:** muốn giữ instructions mà không cho gọi tool → không được; instructions và tools đi cùng nhau. Đổi hướng: giữ server, chỉ deny từng tool cụ thể thay vì cả prefix.

**Nếu vẫn lỗi:** instructions thiếu mà quyền không thấy vấn đề → kiểm tra server có trả instructions lúc `initialize` không (`opencode mcp list` + log server); server dùng Code Mode thì instructions chỉ nói nơi tìm tools, nội dung thật nằm trong tool catalog.

## Q9: "MCP prompts của server thành slash command thế nào?"

**Trả lời 1 câu:** MCP prompts biến thành lệnh `<server>:<prompt>` với cùng luật chuẩn hóa tên — gọi kèm đối số cách nhau bằng khoảng trắng, có spaces thì quote.

**Giải thích:** Server `context 7` + prompt `find_docs` → `/context_7:find_docs`; command text điền arguments của prompt theo thứ tự, giá trị có khoảng trắng thì quote ([mcp-servers — Names](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026).

```text
/context_7:find_docs react "server components"
```

**Làm thế nào:**

1. `/` trong TUI để tìm lệnh theo prefix tên server.
2. Gõ đối số theo thứ tự prompt khai báo; bọc quote khi có khoảng trắng.
3. Đặt tên server ngắn sạch để lệnh không trở nên dài loằng ngoằng.

**Nếu vẫn lỗi:** lệnh không chạy → check đúng dấu hai chấm `<server>:<prompt>` và tên đã normalize (ký tự lạ thành `_`).

## Q10: "Tạm ngừng một server MCP mà không xóa config?"

**Trả lời 1 câu:** Set `"disabled": true` cho server đó trong config — `disabled` thay cho field `enabled` của v1.

**Giải thích:** "Use `disabled`, not an `enabled` field, to keep one configured without connecting it" ([mcp-servers — Config](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). Disconnect trong `/mcps` chỉ ngắt phiên hiện tại, không đổi config — mở lại app là connect lại. Muốn tắt hẳn phải vào config.

**Làm thế nào:**

1. Tạm ngừng (session hiện tại): `/mcps` → disconnect.
2. Ngừng vĩnh viễn nhưng giữ cấu hình: thêm `"disabled": true` vào server entry.
3. Bật lại: đổi `disabled: false` hoặc xóa field.

**Nếu vẫn lỗi:** config precedence cao hơn thay toàn bộ object server trùng tên — nếu server của bạn "mất" field (vd oauth settings), một file config tầng cao hơn đang khai đè cùng tên server; đổi tên server hoặc lặp lại mọi field cần thiết.
