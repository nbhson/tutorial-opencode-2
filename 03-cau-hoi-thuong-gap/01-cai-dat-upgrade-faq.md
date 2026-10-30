# FAQ 01 — Cài đặt & Upgrade v1→v2

> Tra nhanh khi cài/upgrade v2 bị kẹt. Link chéo: [Bài 01 — Cài đặt & upgrade](../01-huong-dan-su-dung/01-cai-dat-upgrade-v1-v2.md), [Bài 03 — Config](../01-huong-dan-su-dung/03-config-opencode-jsonc.md), [FAQ 03](./03-permissions-policies-faq.md).
> Nguồn chính thức: [docs](https://opencode.ai/v2/docs/) · [migrate-v1](https://opencode.ai/v2/docs/migrate-v1) (verify 28/10/2026, OpenCode 2.2.0).
> **Mẹo nhanh:** Đừng cố upgrade tại chỗ — lộ trình docs là **gỡ V1 → cài V2**, config V1 được normalize tự động, và `opencode uninstall` không bao giờ xóa session/config/state.

## Q1: "Cài theo docs mà `opencode --version` vẫn ra 1.x?"

**Trả lời 1 câu:** Bạn đang dùng binary của kênh v1 — v2 có kênh cài riêng và v1/v2 dùng chung lệnh `opencode` nên phải thay hẳn binary, không cài song song.

**Giải thích:** V1 và V2 cùng dùng lệnh `opencode` và **không còn cài cạnh nhau mặc định** — docs migration khuyên gỡ bản V1 cài bằng package manager trước, còn installer curl của V2 sẽ tự thay binary V1 ([migrate-v1](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026). Kênh cài V2: curl, Homebrew tap, npm/bun/pnpm/yarn/vite+, AUR, mise (cần mise ≥ 2026.10.9 — bản cũ hơn sẽ cài nhầm OpenCode 1) ([docs](https://opencode.ai/v2/docs/), verify 28/10/2026). Lưu ý: docs ghi rõ **Windows không hỗ trợ package manager** — trên Windows chỉ tải binary zip hoặc dùng Desktop app; nếu bạn từng thấy hướng dẫn cài WinGet cho OpenCode thì nó đã không còn đúng với v2 (đã đối chiếu với trang docs hiện tại).

**Làm thế nào:**

```bash
which opencode && opencode --version
# neu ra 1.x: cai lai bang mot kenh V2 duoi day (chon 1 kenh thoi)
curl -fsSL https://opencode.ai/v2/install | bash
# brew install anomalyco/tap/opencode-v2
# npm install -g @opencode/cli
opencode --version   # phai ra 2.2.x
```

**Nếu vẫn lỗi:** kiểm tra `mise` (bản < 2026.10.9 không hiểu v2), PATH đang trỏ binary cũ ở thư mục khác (`which -a opencode`), hoặc Docker tag nhầm — image Docker dùng tag version như `ghcr.io/anomalyco/opencode:2.2.3`, không phải tag chung cho cả 2 dòng.

## Q2: "`upgrade --major` báo không có gì mới dù đang v1?"

**Trả lời 1 câu:** Phải ở latest 1.x trước, offer 2.0 mới hiện — nhưng cách chắc chắn nhất hiện nay là gỡ hẳn kênh v1 rồi cài trực tiếp kênh v2.

**Giải thích:** V2 không có luồng "nâng cấp tại chỗ" chính thức trong docs: trang [migrate-v1](https://opencode.ai/v2/docs/migrate-v1) (verify 28/10/2026) mô tả lộ trình là *gỡ V1 → cài V2 bằng một trong các kênh cài* rồi verify. Lệnh `upgrade --major` giữ lại từ FAQ cũ — cần verify trên bản của bạn bằng `opencode --help` trước khi tin (cần verify 28/10/2026). Điều chắc chắn theo docs: cập nhật phiên bản trong v2 do setting `update` điều khiển (`"disable"` / `"notify"` / `"auto"`, mặc định `"notify"`) và cài tự động không restart server đang chạy.

**Làm thế nào:**

1. `opencode --version` — nếu 1.x, lên latest 1.x trước (nếu tool của bạn hỗ trợ `/update` trong TUI).
2. Gỡ package v1 (`brew uninstall ...` / `npm uninstall -g ...` tùy kênh cũ), hoặc để installer curl v2 tự thay.
3. Cài v2 theo Q1, chạy `opencode --version` xác nhận 2.2.x.
4. Đặt `update` trong config nếu muốn tự động hóa lần sau.

```jsonc
// ~/.config/opencode/opencode.jsonc
{ "update": "notify" } // "disable" | "notify" | "auto" - mac dinh "notify"
```

**Nếu vẫn lỗi:** xem có phải Homebrew Core / yarn-managed install không — đổi hẳn sang một kênh cài V2 ở Q1 cho khớp, đừng trộn 2 package manager cho cùng một binary.

## Q3: "Config v1 có phải viết lại hết không?"

**Trả lời 1 câu:** Không — v2 đọc và normalize config cũ trong bộ nhớ, việc convert sang format v2 là tùy chọn.

**Giải thích:** V2 đọc cùng các vị trí config như V1, chuyển đổi các field V1 được hỗ trợ **trong bộ nhớ** mà không ghi đè file gốc ([migrate-v1](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026). Chỉ 3 thứ là breaking changes chính thức: plugin v1 (phải port code), tích hợp gọi server API v1 (phải port sang API + client mới), và `tui.json` → `cli.json` (auto-migrate lần đầu). Còn lại, config V1 và V2 coexist được — khi cả hai set cùng giá trị, **giá trị V2 native thắng** bất kể thứ tự key; nhưng bên trong từng `agent`/`provider`/`command`/`model` phải giữ thuần một format (riêng `mcp`, `compaction`, `experimental` được trộn). Muốn convert, nhờ chính OpenCode v2 làm:

```text
Migrate my OpenCode configuration, including file-based definitions,
from the V1 format to the native V2 format.
Preserve its behavior and all unrelated settings.
```

**Nếu vẫn lỗi:** grep config tìm field đã đổi tên (`permission` → `permissions`, `bash` → `shell`, `task` → `subagent`, `enabled` MCP → `disabled`, `plugin` → `plugins`...) rồi so với bảng trong bài 01.

## Q4: "Chạy được cả v1 lẫn v2 trên một máy không?"

**Trả lời 1 câu:** Không mặc định — hai dòng dùng chung lệnh `opencode`, bạn chọn dòng bằng cách chọn kênh cài, không phải cài 2 binary.

**Giải thích:** V1 và V2 "no longer installed side by side by default" ([migrate-v1](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026). Kênh **stable, beta, next** dùng chung file service/database nên đổi kênh vẫn giữ session; riêng **dev build** chạy server riêng, file riêng, không đụng tới bản shared. Điều đó có nghĩa: bạn không cần "giữ v1 phòng hờ" — config locations giống nhau, và docs khuyên giữ bản sao config V1 trong lúc kiểm chứng thay vì cố chạy song song.

**Làm thế nào:**

1. Backup `~/.config/opencode/` và thư mục `.opencode/` của project (copy tay, 2 phút).
2. Cài v2 theo Q1.
3. Chạy và verify từng thứ: model, credentials, agents, permissions, MCP, plugins.
4. Chưa ổn muốn quay lại? Cài lại package v1 — nhưng **đừng** trỏ v1 vào config đã convert sang shape thuần v2.

**Nếu vẫn lỗi:** thấy hành vi "v2 nên có" mà không chạy → đây là compatibility bug, report kèm `opencode --version` theo hướng dẫn [troubleshooting](https://opencode.ai/v2/docs/troubleshooting).

## Q5: "`tui.json` cũ của tôi đâu rồi?"

**Trả lời 1 câu:** v2 gộp các file `tui.json(c)` phân lớp thành một file global `~/.config/opencode/cli.json`, tự migrate lần đầu khởi động TUI v2.

**Giải thích:** Đây là 1 trong 3 breaking changes. Client terminal "owns" file này — background service không load nó. Migration chỉ chạy khi `cli.json` chưa tồn tại, migrate các setting global được hỗ trợ và preferences đã lưu, **giữ nguyên file v1** ([migrate-v1](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026). Không có file cli.json theo project — cấu hình client v2 là global; riêng cấu hình server/project vẫn nằm trong `opencode.json(c)`. File mới có `$schema` riêng để editor gợi ý: `https://opencode.ai/v2/cli.json`.

**Làm thế nào:**

1. Mở TUI v2 lần đầu → `~/.config/opencode/cli.json` xuất hiện (nếu chưa có).
2. `cat ~/.config/opencode/cli.json` kiểm tra setting đã sang chưa.
3. Sửa tay thì giữ `$schema` để editor bắt lỗi; file reload khi TUI đang chạy.

**Nếu vẫn lỗi:** setting nào không migrate được thì tra [CLI settings](https://opencode.ai/v2/docs/cli/config) — nhiều setting v1 đổi tên (vd nhóm `tabs.enabled` boolean giờ là `tabs.mode`).

## Q6: "Field nào v2 nuốt im lặng (không có tác dụng)?"

**Trả lời 1 câu:** V2 chấp nhận một số field v1 nhưng **bỏ qua + cảnh báo** — đừng nhầm "config load được" với "đang có tác dụng".

**Giải thích:** Danh sách "accepted but unsupported" chính thức ([migrate-v1](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026): `logLevel` (dùng `OPENCODE_LOG_LEVEL` khi khởi động), `server`, `subagent_depth` top-level (dùng `experimental.subagent_depth`), `compaction.tail_turns`/`prune`, agent `name` trong JSON, MCP entry chỉ có `enabled` không có `type`, các experimental v1 (`batch_tool`, `openTelemetry`, `primary_tools`, `continue_loop_on_deny`), provider field `id`/`whitelist`/`blacklist`, và nhiều field model v1 (`release_date`, `attachment`, `reasoning`, `temperature`...). Ngoài ra `lsp` vẫn được đọc nhưng **không chạy** language server.

**Làm thế nào:**

1. Chạy v2, mở log: `tail -f ~/.local/share/opencode/log/opencode.log`.
2. Lọc warning về config: `grep -i 'warn' ~/.local/share/opencode/log/opencode.log`.
3. Với mỗi field bị bỏ qua, tra trang docs tương ứng để tìm thay thế v2 (vd `small_model` → `agents.title.model`).

**Nếu vẫn lỗi:** nghi ngờ field được hỗ trợ mà hành vi sai → báo compatibility issue kèm `opencode --version`, đây là cam kết docs: "treat it as a compatibility bug rather than an expected migration requirement".

## Q7: "Dọn dẹp cài đặt cũ thế nào cho sạch?"

**Trả lời 1 câu:** `opencode uninstall` (có `--dry-run` để xem trước) — gỡ đúng package manager đã cài, nhưng không bao giờ xóa session/config/state.

**Giải thích:** `opencode uninstall --dry-run` in ra những gì sẽ bị xóa; chạy thật thì dừng background service và terminal persistent trước khi xóa global cache. Session, config và state **không bao giờ bị xóa** ([docs CLI](https://opencode.ai/v2/docs/cli), verify 28/10/2026). Cài bằng package manager thì uninstall qua chính package manager đó; cài curl thì tool in ra lệnh xóa thủ công.

**Làm thế nào:**

```bash
opencode uninstall --dry-run   # xem truoc se xoa gi
opencode uninstall             # xac nhan go bo
# -f de bo qua confirm, dung cho script/CI
```

**Nếu vẫn lỗi:** binary nào còn sót ở PATH khác (`which -a opencode`) — xóa tay file đó; session data nằm ở `~/.local/share/opencode/` nên đừng đụng khi chỉ muốn đổi version.

## Q8: "Sau khi migrate, làm sao biết mọi thứ đã lành lặn?"

**Trả lời 1 câu:** Chạy checklist verify của docs trong một project thật trước khi tin v2 cho việc chính.

**Làm thế nào:** (theo [migrate-v1 — Verify your setup](https://opencode.ai/v2/docs/migrate-v1), verify 28/10/2026)

1. Model + credentials: `/models` hiện model bạn dùng, `/connect` còn hợp lệ.
2. Agents: `/agents` đủ agent custom, description hiện đúng.
3. Permissions: thử 1 lệnh `ask`, 1 lệnh `deny` — đúng ý.
4. MCP: `opencode mcp list` — trạng thái `connected`, không `needs authentication` nhảy lên lạ.
5. Plugins: `opencode plugin list` — plugin đã port hiện trong list (plugin v1 không load là đúng ý thiết kế, xem FAQ 06).

**Nếu vẫn lỗi:** giữ bộ v1 song song (bản copy) cho tới khi mục nào cũng tick — và đừng trỏ v1 về config đã convert, vì v1 đọc hiểu sai shape v2.

## Q9: "Cài cho CI/Docker thì dùng gì?"

**Trả lời 1 câu:** Docker dùng tag version (`ghcr.io/anomalyco/opencode:2.0.0`), còn CI không có Docker thì tải binary standalone theo platform.

**Giải thích:** "Docker images use versioned tags" — tag chung kiểu `latest` không an toàn khi hai dòng 1.x/2.x đang song song ([docs](https://opencode.ai/v2/docs/), verify 28/10/2026). Binary standalone có cho macOS (arm64/x64), Windows (arm64/x64), Linux glibc/musl — tải từ `opencode.ai/update/api/latest/cli/opencode/...`.

**Làm thế nào:**

```yaml
# CI workflow (neu dung Docker): pin tag version, khong dung tag chung
# image: ghcr.io/anomalyco/opencode:2.2.3
opencode run --model anthropic/claude-sonnet-5-5 "Run tests"
```

1. CI runner có OpenCode rồi → dùng trực tiếp, `--version` xác nhận trước.
2. Cần Web trong môi trường headless → `opencode pair` in link một-lần (hết hạn sau 5 phút).
3. Pin version image/tag trong pipeline — đừng tag trôi.

**Nếu vẫn lỗi:** Windows package manager không được hỗ trợ — trong CI Windows dùng binary zip từ trang docs thay vì package manager.

## Q10: "Muốn dùng Desktop/Web app thì cài thế nào?"

**Trả lời 1 câu:** Desktop tải riêng cho từng nền tảng; Web UI có sẵn trong server — mở bằng `opencode pair` để lấy link đăng nhập dùng một lần.

**Giải thích:** Desktop có bản macOS (dmg), Windows (.exe), Linux (.deb/.rpm/AppImage); web UI chạy từ cùng server với TUI, mặc định chỉ nghe localhost và có password ([docs](https://opencode.ai/v2/docs/), [cli/web](https://opencode.ai/v2/docs/cli/web), verify 28/10/2026). Link từ `opencode pair` chỉ dùng được một lần và hết hạn sau 5 phút.

**Làm thế nào:**

1. `opencode pair` — in link (hết hạn 5 phút, dùng một lần).
2. Mở link trong browser hoặc quét QR từ app → đăng nhập, session cookie 30 ngày.
3. Ra khỏi localhost → SSH tunnel (`ssh -L 49374:127.0.0.1:49374 ...`) hoặc `opencode pair --remote` (có prompt xác nhận).

**Nếu vẫn lỗi:** `pair` không chạy khi đã tắt shared service (`service set disabled true`) — pairing cần shared service; bật lại bằng `opencode service unset disabled`.

## Q11: "Chọn kênh nào — stable, beta hay next?"

**Trả lời 1 câu:** Cả 3 kênh dùng chung service/database nên session không mất — dùng stable cho việc chính, beta/next khi muốn thử sớm.

**Giải thích:** "Stable, beta and next share these files, so switching between them keeps your sessions. Dev builds run their own server with their own files" ([troubleshooting — Service files](https://opencode.ai/v2/docs/troubleshooting), verify 28/10/2026). Kênh ảnh hưởng cả default port của server (stable/beta/next: 49374; dev: 49376).

**Làm thế nào:**

1. Hằng ngày → stable.
2. Đang chờ fix cụ thể → beta/next, báo lỗi kèm `opencode --version`.
3. Phát triển plugin/SDK → dev build để không đụng server shared của bạn.

**Nếu vẫn lỗi:** hành vi khác nhau giữa các kênh là bình thường — báo bug luôn ghi `opencode --version` và kênh đang dùng.

---

> **Chốt nhanh:** kẹt ở đâu trước tiên cũng kiểm tra `opencode --version` — chín trong mười chuyện cài đặt/upgrade v2 là do còn binary của kênh v1.
