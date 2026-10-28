# FAQ 08 — Bảo mật

> Tra nhanh khi lo agent đụng secrets, push bừa, hoặc nghi plugin/MCP lạ. Link chéo: [FAQ 03](./03-permissions-policies-faq.md), [Tips 01 — AGENTS.md hygiene](../02-tips-thuc-chien/01-agents-md-hygiene.md), [Bài 12 — Plugins](../01-huong-dan-su-dung/12-plugins-sdk-api.md).
> Nguồn chính thức: [permissions](https://opencode.ai/v2/docs/permissions) · [policies](https://opencode.ai/v2/docs/policies) · [config — Variables](https://opencode.ai/v2/docs/config) · [mcp-servers — Context](https://opencode.ai/v2/docs/mcp-servers) (verify 28/10/2026, OpenCode 2.2.0).

## Q1: "Agent có đọc `.env` / push bừa không?"

**Trả lời 1 câu:** Mặc định đọc `.env` chỉ ở mức `ask` — bạn nên `deny` hẳn + deny `git push`, muốn chắc cho team thì đưa vào `policies` tầng cao.

**Giải thích:** Base policy của mọi agent: mọi action `allow`, nhưng `read *.env` và `*.env.*` → `ask`, riêng `*.env.example` → `allow` ([permissions — Defaults](https://opencode.ai/v2/docs/permissions), verify 28/10/2026). Docs cũng cảnh báo shell chạy với toàn bộ quyền user trên máy — đừng trông chờ pattern nhận diện mọi lệnh nguy hiểm, hãy dùng allowlist hẹp.

```jsonc
// den han, khong chi hoi
{ "permissions": [
    { "action": "read", "resource": "*.env", "effect": "deny" },
    { "action": "shell", "resource": "git push *", "effect": "deny" }
  ],
  "policies": [{ "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" }] }
```

**Làm thế nào:**

1. Thêm 2 rule `deny` trên vào project config.
2. Team → chuyển sang `policies` tầng cao (system config hoặc Console) để project không tự mở khóa được.
3. Test: nhờ agent `cat .env` — phải bị chặn, không hiện prompt.

**Nếu vẫn lỗi:** agent vẫn đọc được → nhớ last-match-wins: rule `allow` cụ thể nằm **sau** rule deny của bạn sẽ thắng; hoặc policy của tầng nào đó đang allow.

## Q2: "Secrets để đâu cho đúng?"

**Trả lời 1 câu:** Env vars + `{env:NAME}` (hoặc `{file:path}`) trong config — không hardcode, không commit.

**Giải thích:** `{env:NAME}` thay bằng giá trị env; biến không set thì thành **chuỗi rỗng** — đừng nhầm lỗi to với key rỗng ([config — Variables](https://opencode.ai/v2/docs/config), verify 28/10/2026). `{file:path}` đọc key từ file ngoài (vd `~/.secrets/openai-key`), đường dẫn tương đối tính từ file config. Dùng cho mọi chỗ: headers MCP, OAuth `client_secret`, provider keys.

```jsonc
{
  "mcp": { "servers": { "context7": {
    "type": "remote", "url": "https://mcp.context7.com/mcp",
    "oauth": false,
    "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" }
} } } }
```

**Làm thế nào:**

1. Key vào env hoặc file secrets ngoài repo; config chỉ chứa `{env:...}` / `{file:...}`.
2. Commit kèm `.env.example` (nội dung placeholder, không phải key thật).
3. Chia sẻ config bằng `{env:}`/`{file:}` — cả team tự set env của mình.

**Nếu vẫn lỗi:** model "mất" credential ngầm → nhớ chuỗi rỗng thay vì lỗi; debug config bằng output đã redact credentials, đừng paste raw config có key.

## Q3: "Plugin/MCP lạ có an toàn không?"

**Trả lời 1 câu:** Không mặc định — plugin chạy trong server process với quyền user, MCP remote nhận cả session ID; chỉ thêm thứ bạn tin, disable khi không dùng.

**Giải thích:** Policies không sandbox plugin code ([policies — Callout](https://opencode.ai/v2/docs/policies), verify 28/10/2026); plugin pin version + local plugin review như code thường. MCP: mọi tool call mang session ID trong metadata `_meta["ai.opencode/sessionID"]` — server nhận **ID thô** và có thể log; docs cảnh báo "Do not use it by itself for authentication or authorization" ([mcp-servers — Context](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). Vì vậy đừng coi session ID là bí mật hay token xác thực.

**Làm thế nào:**

1. Chỉ add server/plugin cần dùng; `disabled: true` khi xong việc.
2. Deny tools không dùng (FAQ 03 Q7), pin version plugin.
3. `external_directory ask` để agent phải hỏi trước khi ra khỏi project.

```jsonc
{ "permissions": [
  { "action": "external_directory", "resource": "*", "effect": "ask" }
] }
```

**Nếu vẫn lỗi:** nghi plugin làm gì đó ngoài dự kiến → tắt bằng prefix `-<id>` trong `plugins`, đọc source local, rồi mới bật lại có kiểm soát.

## Q4: "Ra ngoài project — v1 hỏi mà v2 im lặng?"

**Trả lời 1 câu:** Đúng — v2 mặc định **cho phép** `external_directory`; muốn hỏi lại phải tự thêm rule `ask` (hoặc `deny`).

**Giải thích:** Đây là thay đổi hành vi được docs cảnh báo riêng khi migrate: "V2 does not: `external_directory` is allowed by default" ([migrate-v1 — Permissions](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026). Đường ngoài location + worktree được check qua `external_directory` **trước** rule `read`/`edit`; shell thì check thư mục làm việc ngoài trước rồi mới tới rule `shell`.

**Làm thế nào:**

1. Thêm rule `external_directory ask` (bảo toàn hành vi v1).
2. Nới riêng thư mục tin cậy bằng rule hẹp hơn **sau** rule rộng.
3. Shell path không được expand `~` — resource shell là text lệnh thô.

**Nếu vẫn lỗi:** vẫn truy cập ngoài project mà không hỏi → có `allow` cụ thể nào đó cho thư mục đó match sau rule `ask` của bạn; hoặc bạn đang ở trong worktree con của project (được xem là nội bộ).

## Q5: "Log/heap snapshot có rò secrets không?"

**Trả lời 1 câu:** Có thể — heap snapshot chứa prompts, nội dung file, credentials; log gốc có API key/header nếu bạn không redact trước khi share.

**Giải thích:** Warning chính thức: "The snapshot can contain prompts, file contents, and credentials. Do not share it publicly" ([troubleshooting — Capture a heap snapshot](https://opencode.ai/v2/docs/troubleshooting), verify 28/10/2026). Hướng dẫn report issue cũng yêu cầu xóa API keys, authorization headers, prompts, file contents trước khi share log.

**Làm thế nào:**

1. Chỉ viết heap snapshot khi thật sự debug: `opencode debug heap-dump`.
2. Trước khi share log/snapshot: redact key, token, prompt, nội dung file.
3. Heap snapshot để trong máy, mở bằng Chrome DevTools, không upload.

**Nếu vẫn lỗi:** lỡ share rồi → xoay key ở provider ngay, sau đó dọn file snapshot (`~/.local/share/opencode/log/heap-*.heapsnapshot`).

## Q6: "Chặn team-level mà repo cứ mở lại được?"

**Trả lời 1 câu:** Đưa luật vào `policies` ở tầng cao (system config hoặc Console) — project config không mở được khóa này.

**Giải thích:** Precedence của policies đảo chiều so với settings: managed preferences > system > Console workspace > global > project — tầng rộng đánh giá sau nên thắng ([policies — Precedence](https://opencode.ai/v2/docs/policies), verify 28/10/2026). Repo không thể re-enable provider mà org đã deny; org `allow` thì gỡ được `deny` của tầng thấp hơn.

**Làm thế nào:**

1. Khóa cứng máy: system config (`/etc/opencode`, `/Library/Application Support/opencode`, `%ProgramData%\opencode`) hoặc macOS managed preferences.
2. Khóa theo org: Console workspace policy — statements bám theo account, đổi workspace thì đổi bộ luật, disconnect là clear.
3. Repo chỉ nên có permissions thông thường; đừng trông cậy project `allow` mở khóa org `deny`.

**Nếu vẫn lỗi:** Console policy thay đổi được apply khoảng mỗi phút một lần; Console unreachable thì policy cuối cùng vẫn giữ hiệu lực — đừng tưởng "mất mạng là mất luật".

## Q7: "Config debug/log khi nhờ hỗ trợ — phải che gì?"

**Trả lời 1 câu:** Redact API keys, OAuth client secrets, authorization headers trước khi share; debug config nên dùng output đã ẩn credentials.

**Giải thích:** V2 cố gắng để secrets đi qua `{env:}` nên file config thường không chứa key trực tiếp — nhưng log, heap snapshot, transcript vẫn có thể chứa prompt/nội dung file nhạy cảm ([troubleshooting](https://opencode.ai/v2/docs/troubleshooting), [snapshots](https://opencode.ai/v2/docs/snapshots), verify 28/10/2026). Snapshots lưu trong Git object DB nội bộ dưới data directory — coi thư mục data như dữ liệu nhạy cảm cục bộ.

**Làm thế nào:**

1. Chỉ share `opencode --version`, `opencode service status`, steps tái hiện, log đã lọc.
2. Heap snapshot: chứa credentials — dùng nội bộ, không công khai.
3. Debug MCP OAuth: credentials nằm ngoài project config, output debug đã redact — nhưng vẫn kiểm tra trước khi paste.

**Nếu vẫn lỗi:** dùng `{env:}`/`{file:}` để config không bao giờ chứa key từ đầu — phòng vẫn rẻ hơn chữa.

## Q8: "Shell scanner có ảnh hưởng gì tới việc chặn lệnh nguy hiểm?"

**Trả lời 1 câu:** Có — permission shell dựa vào scanner tách lệnh; scanner "portable" (experimental) phân tích được lệnh mà tree-sitter không hiểu, và lệnh không phân tích được sẽ trả **scanner error**, không phải deny.

**Giải thích:** Mặc định dùng scanner tree-sitter; bật `"experimental": { "portable_shell_scanner": true }` để thay thế — không phải fallback lẫn "ý kiến thứ hai" ([permissions — Scanner](https://opencode.ai/v2/docs/permissions), verify 28/10/2026). Lệnh scanner không đọc được → scanner error (không phải permission denial); scanner chỉ đổi parser, rule permission/saved approval/dir inference vẫn áp như cũ. Shell vẫn chạy với toàn quyền user — docs khuyên allowlist hẹp thay vì pattern "bắt mọi lệnh nguy hiểm".

**Làm thế nào:**

1. Lệnh compound phức tạp bị chặn oan → thử bật portable scanner.
2. Vẫn giữ allowlist hẹp cho `shell` (`git status *`, `npm test *`...).
3. Đừng dựa vào pattern để "nhận diện lệnh nguy hiểm" — scanner chỉ là best effort.

**Nếu vẫn lỗi:** scanner error lặp lại → command của bạn quá phức tạp để phân tích tĩnh; tách lệnh đơn giản hơn trong script, để agent gọi script thay vì dòng lệnh chồng lớp.

## Q9: "MCP server dùng OAuth — token PKCE lưu ở đâu, có an toàn không?"

**Trả lời 1 câu:** Credentials lưu ngoài project config (thư mục credentials riêng của server), dùng PKCE + refresh token tự động, `logout` xóa cả refresh token.

**Giải thích:** OpenCode dùng OAuth PKCE cho remote MCP servers mặc định — refresh tokens tự động, credentials không bao giờ nằm trong `opencode.jsonc` ([mcp-servers — OAuth](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). Nếu server chỉ cần API key header, dùng `oauth: false` + `headers` — tránh flow OAuth rườm rà. `opencode mcp logout <name>` xóa refresh token.

**Làm thế nào:**

1. Server có OAuth → thêm vô config, `/mcps` → sign-in.
2. Server chỉ cần API key → `oauth: false` + headers `{env:...}` trong config (cấu hình thủ công, credentials nằm trong biến môi trường).
3. OAuth client gửi cả callback port + loopback redirect — loopback được RFC 8252 chấp nhận cho các redirect này.

**Nếu vẫn lỗi:** logout không xóa credential cũ → `opencode mcp auth <name>` restart flow; config file không chứa credentials nên "sửa config không xóa được" là đúng thiết kế.

## Q10: "Remote MCP server nhận session ID — đó có phải bí mật không?"

**Trả lời 1 câu:** Không — session ID là giá trị tương quan opaque, gửi trong request metadata `_meta`, không phải tham số tool hay header bảo mật; nó có thể bị server log.

**Giải thích:** For calls made on behalf of a session, OpenCode sends the session ID in `_meta["ai.opencode/sessionID"]` — "This applies to direct tools and Code Mode over stdio and Streamable HTTP" ([mcp-servers — Context](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026)). Rules chính thức: (1) Identity = nó nhận diện session, không phải transport session; (2) Presence = vắng mặt khi không có session context; (3) Security = đừng dùng nó làm authentication/authorization; (4) Privacy = server từ xa nhận raw ID và có thể log/retain.

**Làm thế nào:**

1. Đừng tin session ID làm token xác thực — nó là correlation ID.
2. Server có thể log ID (mà không cần biết bạn là ai) — đừng dùng ID chứa thông tin nhạy cảm.
3. Nếu cần authorization thực sự → dùng OAuth/client credentials, không phải session ID.

**Nếu vẫn lỗi:** nghi server MCP ghi log session ID → kiểm tra chính sách log của server đó; bạn không kiểm soát được vì server remote nằm ngoài OpenCode. Nếu nghiêm trọng → `disabled: true` + dùng server khác.

## Q11: "Log/heap snapshot có rò secrets không?"

**Trả lời 1 câu:** Có thể — heap snapshot chứa prompts, nội dung file, credentials; log gốc có API key/header nếu không redact trước khi share. Heap snapshot trên Desktop còn bao gồm **mỗi process** của app.

**Giải thích:** Warning chính thức: "The snapshot can contain prompts, file contents, and credentials. Do not share it publicly" ([troubleshooting](https://opencode.ai/v2/docs/troubleshooting), verify 28/10/2026). Hướng dẫn report issue cũng yêu cầu xóa API keys, authorization headers, prompts, file contents. Trên Desktop, **Capture heap snapshots** viết mỗi window (session, main, GPU) — file `.heapsnapshot` trong thư mục Downloads nên được coi là dữ liệu nhạy cảm.

**Làm thế nào:**

1. Chỉ viết heap snapshot khi thật sự debug: `opencode debug heap-dump` (CLI) hoặc **Capture heap snapshots** (Desktop command palette).
2. Trước khi share log: redact key, token, prompt; nhớ `heap-*.heapsnapshot` nằm trong `~/.local/share/opencode/log/`.
3. Mở snapshot bằng Chrome DevTools, không upload — để trong máy.

**Nếu vẫn lỗi:** lỡ share rồi → xoay key ở provider ngay, sau đó dọn file snapshot và log có thể chứa nội dung sensitive.
