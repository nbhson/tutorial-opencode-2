# 09 — Permissions + Policies (luật chặn cuối, đừng trông chờ prompt)

> **Dành cho:** người sợ agent `rm -rf` / đọc `.env` / push bừa · **Vấn đề:** không phân biệt `permissions` (linh hoạt) vs `policies` (khóa cứng) · **Đọc xong:** viết rules `action/resource/effect` + policy org đúng + hiểu saved approvals · **Thời gian:** ~15 phút.

## Mục tiêu

- Viết `permissions[]` last-match-wins với `shell/edit/read/subagent/skill/...`.
- Dùng `ask` + saved approvals đúng cách, hiểu nó không thắng `deny`.
- Viết `policies` khóa cứng (`tool.use`, `provider.use`, `mcp.use`/`skill.use`/`plugin.use`) đúng thứ tự ưu tiên.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Permissions của từng agent](#permissions-của-từng-agent)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. `permissions`: ai được làm gì với cái gì

```jsonc
{ "permissions": [
  { "action": "shell", "resource": "*", "effect": "ask" },
  { "action": "shell", "resource": "git status *", "effect": "allow" },
  { "action": "shell", "resource": "git diff *", "effect": "allow" },
  { "action": "shell", "resource": "git push *", "effect": "deny" }
] }
```

Mỗi rule: `action` (tool/việc) + `resource` (path/lệnh/URL/skillID/agentID, wildcard `*`/`?`) + `effect` (`allow`/`ask`/`deny`). **Rule khớp cuối cùng thắng.** Không rule nào khớp → `ask`. Một op chạm nhiều resources: 1 `deny` là tạch, còn lại 1 `ask` là hỏi. (verify 28/10/2026 — [docs/permissions](https://opencode.ai/v2/docs/permissions/))

Wildcard là **whole-value**: `*` = 0+ ký tự bất kỳ (kể cả `/`), `?` = đúng 1 ký tự, còn lại là ký tự literal. Path được normalize (backslash → slash; Windows không phân biệt hoa thường). Pattern shell kết thúc bằng `" *"` còn khớp cả lệnh **không đối số**: `git status *` khớp cả `git status` lẫn `git status --short`.

Actions hay dùng (V2, verify 28/10/2026):

| Action | Resource là gì |
|---|---|
| `shell` | command string do scanner tách; lệnh ghép có thể sinh nhiều resource |
| `edit` | path đích của `edit`/`write`/`patch` |
| `read` / `glob` / `grep` | path / glob pattern / regex (chú ý: `grep` là **regex**, không phải đường dẫn tìm) |
| `subagent` | agent ID |
| `skill` | skill ID |
| `question` | `*` |
| `webfetch` / `websearch` | URL / query |
| `external_directory` | biên thư mục ngoài, thường kết thúc `/*` |
| `<server>_<tool>` | MCP tool; ký tự không hợp lệ thành `_` |
| `opencode_list_mcp_resources` / `opencode_read_mcp_resource` | server name / `<server>:<uri>` |
| `execute` | `*` — deny là gỡ Code Mode của server đó |

Plugin có thể định nghĩa action string mới. `doom_loop` và `lsp` **không** phải action V2 hiện tại. Tên v1 `bash`/`task` đã đổi thành `shell`/`subagent` — đổi đây là breaking nhẹ.

**Nôm na:** permissions như nội quy nhà — "khách được vào phòng khách (allow), vào bếp thì hỏi (ask), cấm vào két sắt (deny)". Quy định viết sau (cụ thể hơn) thắng quy định chung viết trước.

**Vì sao quan trọng?** Không viết luật = mọi lệnh nguy hiểm đều `ask` giữa chừng, task dài đứt liên tục; viết ẩu = agent bị chặn oan.
**Nếu làm sai?** `allow shell *` cho tiện → mất phanh; `deny` quá rộng → agent bất lực, bạn ngồi gỡ từng cái.

Thứ tự nạp rules: config **ưu tiên thấp hơn** nạp trước → global nối vào sau → agent rules nối sau cùng. Nghĩa là rules của agent nối **sau** global (không replace mảng global). Subagent dùng permissions của chính nó, không phải tập con của parent.

### 2. Directories bên ngoài + `~` expansion

Path ngoài Location hiện tại và worktree gốc được check `external_directory` **trước** `read`/`edit`. Default policy **allow** `external_directory` — nên mặc định agent đọc/ghi ngoài project không hề hỏi bạn. Muốn hỏi:

```jsonc
{ "permissions": [
  { "action": "external_directory", "resource": "*", "effect": "ask" },
  { "action": "external_directory", "resource": "~/projects/reference/*", "effect": "allow" },
  { "action": "read", "resource": "~/projects/reference/*", "effect": "allow" },
  { "action": "edit", "resource": "~/projects/reference/*", "effect": "deny" }
] }
```

Với `external_directory`/`read`/`edit`, đầu `~`, `~/`, `$HOME`, `$HOME/` được expand khi config load. Resource `shell` giữ nguyên text lệnh — **không** expand home. Cảnh báo docs: `shell` chạy với quyền user thật trên filesystem/process/network; suy luận thư mục từ text lệnh chỉ là best-effort — hãy prefer allowlist hẹp thay vì pattern cố "nhận diện mọi lệnh nguy hiểm".

### 3. Base policy + shipped agents

Base policy mọi agent (kể cả custom) đã có:

```jsonc
[
  { "action": "*", "resource": "*", "effect": "allow" },
  { "action": "read", "resource": "*.env", "effect": "ask" },
  { "action": "read", "resource": "*.env.*", "effect": "ask" },
  { "action": "read", "resource": "*.env.example", "effect": "allow" }
]
```

Các agent shipped **nối thêm** vào base này (không replace):

| Agent | Policy thêm |
|---|---|
| `build` | cho phép questions |
| `plan` | cho phép questions; deny edit trừ file dưới `~/.opencode/plan` |
| `general` | deny questions và spawn subagent |
| `explore` | deny gần hết, chỉ còn shell/read/glob/grep/webfetch/websearch/external_directory; `.env` vẫn ask |
| `title` | deny tất cả |
| `summary` | deny tất cả |
| `compaction` | **giữ nguyên base policy** (không deny thêm) |

Lưu ý: `compaction` giữ nguyên base policy (không deny thêm). Rule global/agent viết sau sẽ override các default này.

### 4. Approvals (`ask` → once/always/reject)

Khi `ask`, client trả lời:

| Lựa chọn | Kết quả |
|---|---|
| Allow once (`once`) | Duyệt đúng request đang treo |
| Allow always (`always`) | Duyệt + **lưu pattern** do tool đề xuất cho project |
| Reject (`reject`) | Từ chối + kill mọi permission request đang treo trong session |

Allow always cho `git status --short` có thể lưu pattern `shell: git status * → allow`. Pattern do **tool tự đề xuất**: tool nào đề `*` (rộng!), shell đề command prefix, skill/subagent đề ID của chúng. Saved allow là rule `allow` bền theo project — nhưng **không bao giờ thắng `deny`** đã config. Client có thể kèm feedback khi reject. Non-interactive (`run`): không ai bấm → phải allow/deny trước; configured `deny` vẫn được ép đúng mọi lúc.

**Vì sao quan trọng?** Approvals là tiện ích để đỡ gõ lại allow, không phải chìa khóa vạn năng — và pattern đề xuất đôi khi rất rộng (`*`), phải rà lại.
**Nếu làm sai?** Bấm Allow always cho 1 tool đề xuất `*` → từ đó mọi tool đó đi qua không hỏi.

### 5. `policies`: luật công ty thắng nội quy phòng

```jsonc
{ "policies": [
  { "action": "provider.use", "resource": "openai", "effect": "deny" },
  { "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" }
] }
```

`policies` chạy **sau** permissions + saved approvals, chỉ biến allow/ask → deny (không mở thêm). Các action (verify 30/10/2026 — sau thay đổi của v2.2.3):

| Action | Resource | Chặn gì |
|---|---|---|
| `provider.use` | provider ID (`anthropic`, `opencode`, custom) | provider biến mất khỏi catalog dù có key |
| `tool.use` | `<action>:<value>` (vd `shell:git push *`, `read:*/.ssh/*`) | hard-deny permission check → lỗi `Blocked by configuration policy`, không prompt |
| `mcp.use` | server ID | MCP server bị remove, không load |
| `skill.use` | skill ID | skill bị remove, không nạp |
| `plugin.use` | plugin target | plugin bị remove, không load |
| `integration.use` | integration account (Console integrations) | **từ v2.2.3 chỉ còn điều khiển integration accounts** — không còn chạm MCP/skill/plugin |

⚠️ **Breaking v2.2.3:** rule cũ `integration.use` với prefix `mcp:`/`skill:`/`plugin:` được **convert tự động** sang action mới, nhưng rule `integration.use` không prefix (bare) **không còn** áp dụng cho MCP/skill/plugin — audit lại policy cũ sau khi lên 2.2.3.

`tool.use` với `allow` **không cấp quyền** — nó chỉ gỡ `deny` rộng hơn đứng trước, sau đó quyền quyết định quay về rules của agent. Trong 1 file: khớp cuối thắng, **không có luật specificity** — viết rộng trước, exception sau:

```jsonc
{ "policies": [
  { "action": "tool.use", "resource": "shell:*", "effect": "deny" },
  { "action": "tool.use", "resource": "shell:git status *", "effect": "allow" }  // mo ngoai le
] }
// git status quay ve rule shell cua agent; moi lenh khac bi chan
```

Statement sai validate bị **drop kèm warning trong server log** (phần còn lại vẫn áp dụng) — sửa deny xong nhớ kiểm tra log, đừng tưởng đã chặn.

**Thứ tự ưu tiên policies (cao → thấp, verify 28/10/2026 — [docs/policies](https://opencode.ai/v2/docs/policies/)):**

1. macOS managed preferences (`/Library/Managed Preferences/ai.opencode.managed.plist`)
2. System `opencode.json(c)` (`/Library/Application Support/opencode`, `/etc/opencode`, `%ProgramData%\opencode`)
3. **Connected OpenCode Console workspace**
4. Global `~/.config/opencode/opencode.json(c)`
5. `opencode.json(c)` trực tiếp (thư mục ngoài thắng thư mục trong)
6. `.opencode/opencode.json(c)` (thư mục ngoài thắng thư mục trong)

Policies **đảo ngược** quy tắc "gần thắng" của settings thường: config **rộng hơn** được evaluate sau nên thắng config hẹp (thứ tự ưu tiên: managed preferences > system file > Console workspace > global > project). Repo không thể mở lại provider bị deny global:

```jsonc
// ~/.config/opencode/opencode.jsonc
{ "policies": [{ "action": "provider.use", "resource": "openai", "effect": "deny" }] }
// project/opencode.jsonc
{ "policies": [{ "action": "provider.use", "resource": "openai", "effect": "allow" }] }
// Ket qua: openai VAN bi deny
```

**Console workspace:** policy Providers/Tools trên trang Policies của workspace được biên dịch thành statements trong workspace config, xếp ngay dưới managed preferences + system file. Deny từ Console ghi rõ nguồn: `Blocked by Acme's policy`. Policy thay đổi được áp trong ~1 phút; đổi workspace là thay cả bộ; disconnect là xóa; Console không truy cập được thì giữ bộ cuối cùng. Key `experimental.policies` cũ vẫn được đọc và merge vào `policies`.

**Vì sao quan trọng?** `permissions` project ai cũng sửa được; `policies` ở Console/managed mới là khóa mà repo không lật nổi.
**Nếu làm sai?** Tin "đã chặn" nhưng statement sai cú pháp bị drop âm thầm → lỗ hổng không ai biết.

## Ví dụ chi tiết

Template tối thiểu cho 1 project, ghép cả 3 tầng:

```jsonc
// opencode.jsonc — verify 28/10/2026
{
  "$schema": "https://opencode.ai/config.json",
  "permissions": [
    // Tang 1: shell mac dinh phai hoi
    { "action": "shell", "resource": "*", "effect": "ask" },
    // Ngoai le: lenh doc an toan thi qua
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git diff *", "effect": "allow" },
    { "action": "shell", "resource": "git log *", "effect": "allow" },
    // Khong push, khong force
    { "action": "shell", "resource": "git push *", "effect": "deny" },
    { "action": "shell", "resource": "git reset --hard*", "effect": "deny" },
    // Doc file bi mat: hoi, nhung cho .env.example qua
    { "action": "read", "resource": "*.env", "effect": "deny" },
    { "action": "edit", "resource": "*.env", "effect": "deny" },
    // Ngoai project thi phai hoi
    { "action": "external_directory", "resource": "*", "effect": "ask" }
  ],
  "policies": [
    { "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" },
    { "action": "tool.use", "resource": "shell:rm -rf *", "effect": "deny" },
    { "action": "tool.use", "resource": "read:*/.ssh/*", "effect": "deny" }
  ],
  "agents": {
    "reviewer": {
      "description": "Review code, khong sua gi",
      "mode": "subagent",
      "permissions": [
        { "action": "edit", "resource": "*", "effect": "deny" }
      ]
    }
  }
}
```

Giải thích từng phần:

- `shell * ask` — mặc định hỏi; 2 allow hẹp phía sau cho việc đọc git đi nhanh (viết **sau** rule rộng nên thắng).
- `git push * deny` ở tầng permissions cho project này; nếu muốn không repo nào lật nổi thì chuyển thành `tool.use shell:git push *` ở Console/global policy.
- `reviewer` deny edit — subagent review không sửa code, kể cả khi model cố.
- Base policy lo `.env` (ask) sẵn; thêm `deny` nếu muốn chặn hẳn chứ không chỉ hỏi.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Luật linh hoạt | `permissions[]` last-match-wins | permissions picker / allowlist | permissions + allowlist |
| Ask khi chạy | `ask` + once/always/reject | approval prompt | permission prompt |
| Khóa cứng org | `policies` (Console/system thắng) | policy/branch protection | managed policy/hooks |
| Chặn MCP/skill/plugin | `mcp.use`/`skill.use`/`plugin.use` (2.2.3+) | từng tool setting | từng tool config |
| Tên action cũ | v1 `bash/task` → v2 `shell/subagent` | — | — |

Điểm khác mốc: OpenCode có `policies` **đi theo tài khoản** (Console workspace) — bạn dừng máy này sang máy khác vẫn bị chặn đúng như vậy; Copilot/Claude Code chặn chủ yếu theo máy/repo.

## Lỗi thường gặp

### 1. Viết `bash`/`task` kiểu v1 sang v2

```text
❌ SAI: { "action": "bash", ... } tren v2 -> khong khop rule nao -> roi ve ask mo
✅ ĐÚNG: doi sang shell / subagent; edit gom write+patch
```
**Bài học:** rename này gây fail-open về `ask` (không fail-closed) — task vẫn chạy, chỉ là hỏi nhiều bất thường. Grep config cũ trước khi migrate.

### 2. Allow always rồi tưởng thắng deny

```text
❌ SAI: bam Allow always cho `sudo ...` roi bao "da allow sao van bi chan"
✅ ĐÚNG: policy deny luon thang saved approval; muon mo phai sua policy (neu co quyen), khong phai bam lai
```
**Bài học:** saved approval là tiện ích, không phải chìa khóa vạn năng.

### 3. Tin rằng `deny` đã có hiệu lực khi statement bị drop

```text
❌ SAI: viet policy sai (vd effect: "block") -> statement bi drop, bao "da deny roi"
✅ ĐÚNG: check server log sau khi edit policy; statement sai validate bi drop voi warning, phan con van ap dung
```
**Bài học:** policy chỉ có `allow`/`deny`; giá trị lạ = statement chết. Log server là nơi duy nhất nói cho bạn biết điều đó.

### 4. Quên `external_directory` mặc định là allow

```text
❌ SAI: tin rang agent khong doc duoc file ngoai project vi "mac dinh an toan"
✅ ĐÚNG: them rule external_directory ask/deny neu muon duoc hoi khi agent ra khoi project
```
**Bài học:** "an toàn mặc định" của OpenCode là tiện dụng, không phải cách ly — muốn phanh thì tự lắp.

## Best practices (kèm "vì sao")

- Template tối thiểu mọi project: `shell * ask` + allow `git status/diff/log` + deny `git push` + deny/ask `*.env`. **Vì sao?** Đủ an toàn mà không chặn oan việc thường ngày; `.env.example` vẫn allow để agent đọc mẫu.
- Rule nguy hiểm (`sudo`, `rm -rf`, push, đọc secrets, `.ssh`) cho vào `policies` ở tầng cao nếu quản team. **Vì sao?** `permissions` project ai cũng sửa được; `policies` ở Console/global mới là khóa repo không lật nổi.
- Sau khi bấm Allow always vài ngày, rà saved patterns một lần. **Vì sao?** Một số tool đề xuất pattern rất rộng (`*`) — bạn có thể đã allow nhiều hơn nghĩ.
- Prefers allowlist hẹp cho `shell`. **Vì sao?** Scanner suy luận từ text lệnh là best-effort; pattern "chặn mọi lệnh xấu" sẽ luôn có lỗ hổng.
- Muốn chặn **nguyên mẫu MCP server/skill/plugin** thì dùng `mcp.use`/`skill.use`/`plugin.use`, đừng lýt từng permission. **Vì sao?** Một dòng `mcp.use deny github` sạch hơn chục dòng `<server>_<tool>`.

## Bài tập nhỏ

1. (10 phút) Áp template jsonc ở trên vào 1 repo thử, chạy qua TUI: `git status` (qua), `cat .env` (deny/ask), `git push --dry-run` (deny), `ls ~` (hỏi vì external_directory).
2. (5 phút) Bấm Allow always 1 lệnh an toàn, tìm pattern được lưu cho project (pattern dạng `shell: git status * → allow`).
3. (7 phút) Thêm `tool.use` deny `shell:git push *` vào global config, xác nhận `Blocked by configuration policy` hiện thay vì prompt; đọc server log khi cố tình viết sai 1 statement.
4. (5 phút) Thử `experimental.portable_shell_scanner: true` với 1 lệnh ghép lạ, so hành vi ask/allow với scanner mặc định.

## Reference

- Permissions: https://opencode.ai/v2/docs/permissions/ (verify 28/10/2026)
- Policies: https://opencode.ai/v2/docs/policies/ (verify 28/10/2026)
- Console policies (org): https://opencode.ai/v2/docs/console/ (verify 28/10/2026)
- Scanner experimental: https://opencode.ai/v2/docs/permissions/#scanner (verify 28/10/2026)

## Đọc tiếp

- [03-config-opencode-jsonc.md](03-config-opencode-jsonc.md) — đặt `permissions`/`policies` ở tầng config nào.
- [05-agents-build-plan-custom.md](05-agents-build-plan-custom.md) — `agents.<id>.permissions` cho subagent.
- [02-tui-desktop-web-cli.md](02-tui-desktop-web-cli.md) — `run` non-interactive không ai bấm Allow.
- [08-mcp-codemode.md](08-mcp-codemode.md) — action `<server>_<tool>` và `execute` dành cho MCP/Code Mode.
- [07-skills.md](07-skills.md) — `skill` permission chi tiết theo skill ID.
- [../03-cau-hoi-thuong-gap/03-permissions-policies-faq.md](../03-cau-hoi-thuong-gap/03-permissions-policies-faq.md) — FAQ permissions.
- [../03-cau-hoi-thuong-gap/08-bao-mat-faq.md](../03-cau-hoi-thuong-gap/08-bao-mat-faq.md) — góc nhìn bảo mật tổng thể.
- [../02-tips-thuc-chien/07-teamwork-chuan-hoa.md](../02-tips-thuc-chien/07-teamwork-chuan-hoa.md) — chuẩn hóa permissions cho team.

> **Chốt bài 09:** permissions viết từ rộng → hẹp (hẹp sau thắng), policies khóa cái không được phép — và nhớ: prompt là lời nhờ, luật mới là phanh, còn policy là khóa két.
