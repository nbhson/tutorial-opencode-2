# FAQ 07 — Lỗi & Troubleshooting

> Tra nhanh khi session, undo, compaction, service gặp trục trặc. Link chéo: [Bài 11 — Sessions/Undo/Compaction](../01-huong-dan-su-dung/11-sessions-undo-compaction.md), [Bài 14 — Worktree](../01-huong-dan-su-dung/14-worktree-git-ide-acp.md), [FAQ 04](./04-mcp-codemode-faq.md).
> Nguồn chính thức: [snapshots](https://opencode.ai/v2/docs/snapshots) · [compaction](https://opencode.ai/v2/docs/compaction) · [troubleshooting](https://opencode.ai/v2/docs/troubleshooting) (verify 28/10/2026, OpenCode 2.2.0).

## Q1: "Agent sửa hỏng 5 files — cứu sao?"

**Trả lời 1 câu:** `/undo` ngay (hoặc `/redo` nếu undo nhầm) — rollback stage lại file + conversation và trả prompt về composer để bạn sửa rồi chạy lại.

**Giải thích:** `/undo` (phím `<leader>u`) stage rollback: phục hồi file bị đụng, đưa prompt bị gỡ về composer; chạy `/redo` (`<leader>r`) trước khi submit để hủy rollback ([snapshots](https://opencode.ai/v2/docs/snapshots), verify 28/10/2026). Scope của snapshot: chỉ file trong **active directory** trong Git worktree; git-ignored file và file > 2MiB không capture; ngoài Git repo thì chỉ rollback được conversation, không khôi phục file.

**Làm thế nào:**

1. `/diff` xem hỏng đâu → `/undo` khôi phục file + prompt.
2. Sửa prompt đã restore rồi submit lại; hối hận thì `/redo`.
3. Sai từ giai đoạn plan → `/new` làm lại plan (bài 02).
4. Task rủi ro cao → worktree riêng từ đầu (bài 14).

**Nếu vẫn lỗi:** `/undo` không khôi phục được file — snapshot chỉ là "convenience, not a transaction": shell command đổi DB/process/network/Git state **không** được hoàn tác; quan trọng thì commit Git trước khi dùng `/undo` trên worktree bẩn.

## Q2: "Model quên yêu cầu đầu task dài?"

**Trả lời 1 câu:** Context bị compaction (nén thành summary, giữ ~15,000 token gần nhất) — session mới cho task mới, và ghi quyết định quan trọng ra file trước khi máy nén.

**Giải thích:** Compaction tự chạy gần context limit: thay đoạn hội thoại cũ bằng summary + giữ ~15k token gần nhất (mặc định `keep.tokens: 15000`) — và nó **mất mát** ([compaction](https://opencode.ai/v2/docs/compaction), verify 28/10/2026). Mục tiêu + quyết định + việc dở → tự ghi (file kế hoạch, commit message) trước khi máy nén. Muốn tắt auto thì dùng config `compaction.auto: false` (đã verify); biến môi trường `OPENCODE_DISABLE_AUTOCOMPACT=1` từ FAQ cũ — cần verify trên bản của bạn trước khi tin (cần verify 28/10/2026).

**Làm thế nào:**

```jsonc
// giu nhieu chi tiet gan day hon, hoac tat auto
{ "compaction": { "auto": false, "keep": { "tokens": 24000 } } }
```

1. Trước session dài: tóm tắt tay 5 gạch (mục tiêu, quyết định, việc dở).
2. Session dài cần tiếp → chủ động compact (`<leader>c` hoặc API `POST /api/session/{id}/compact`) trước khi máy tự nén.
3. Muốn summary do model khác viết: `agents.compaction.model`.

**Nếu vẫn lỗi:** task dài mà model vẫn "quên" → tăng `keep.tokens`; compaction không cứu được session mà context gần như toàn fixed instructions + tool schemas (nó cần hội thoại cũ để thay thế).

## Q3: "MCP connect fail / timeout?"

**Trả lời 1 câu:** Check 3 tầng: command/URL đúng chưa → `disabled`/`timeout` cấu hình thế nào → `protocol` (server revision 2026-07-28 cần `"protocol": "auto"`).

**Giải thích:** Lớp 1: lệnh/URL chạy được không (thử `npx ...` tay ngoài OpenCode để loại trừ mạng). Tầng 2: config — `disabled: true`, timeout startup/catalog. Tầng 3: protocol revision — default `legacy` không nói chuyện được với server 2026-07-28 ([mcp-servers](https://opencode.ai/v2/docs/mcp-servers), verify 28/10/2026). Timeout có 3 mức riêng: startup (mặc định 30s), catalog (30s), execution (12h).

```jsonc
{ "mcp": {
  "timeout": { "startup": 45000, "catalog": 30000, "execution": 600000 }
} }
```

**Làm thế nào:**

1. `opencode mcp list` + `/mcps` xem trạng thái từng server (`connected` / `needs authentication` / `failed`).
2. Local: chạy `npx -y <server>` tay ngoài OpenCode để loại trừ lỗi mạng.
3. Server mới theo revision 2026-07-28 → thêm `"protocol": "auto"` cho server đó.

**Nếu vẫn lỗi:** `needs authentication` → đó là OAuth chứ không phải timeout (FAQ 04 Q1); remote endpoint chết → thử `curl` endpoint, rồi mới nghi OpenCode.

## Q4: "TUI/client hành xử lạ — server bị kẹt?"

**Trả lời 1 câu:** Kiểm tra shared background server trước: `opencode service status` → `opencode api get /api/info` → `opencode service restart` nếu unhealthy.

**Giải thích:** OpenCode là kiến trúc client-server: một background server dùng chung giữ session, plugins, permissions; client chỉ là vỏ ([troubleshooting](https://opencode.ai/v2/docs/troubleshooting), verify 28/10/2026). Trước tiên phải xác định lỗi nằm ở client, server chung, hay một project cụ thể.

**Làm thế nào:**

```bash
opencode service status          # server con song khong?
opencode api get /api/info       # API con healthy khong?
opencode service restart         # ket thi restart
```

**Nếu vẫn lỗi:** vẫn lạ sau restart → thử `opencode --standalone` để tách client khỏi shared service; nếu standalone chạy tốt thì lỗi nằm ở service chung, đọc tiếp Q5.

## Q5: "Xem log ở đâu khi cần bằng chứng?"

**Trả lời 1 câu:** `~/.local/share/opencode/log/opencode.log` — lọc theo `role=server` cho hoạt động session/tool, theo `run=<id>` để bám một lần chạy.

**Giải thích:** Mỗi dòng log có process `run` ID và `role` field; `role=server` chứa hoạt động session, provider, plugin, permission, tool ([troubleshooting — Read logs](https://opencode.ai/v2/docs/troubleshooting), verify 28/10/2026).

```bash
tail -f ~/.local/share/opencode/log/opencode.log
grep 'role=server' ~/.local/share/opencode/log/opencode.log
grep 'run=8fc3b1d5' ~/.local/share/opencode/log/opencode.log
```

**Nếu vẫn lỗi:** debug sâu hơn có `opencode debug heap-dump` (heap snapshot) — nhớ snapshot chứa prompt/nội dung file/credentials, **đừng share công khai**.

## Q6: "Model vẫn dùng được ở project A nhưng project B báo unavailable?"

**Trả lời 1 câu:** Availability theo project/location — model phải enabled, provider phải available, credentials không tự carry over giữa các project.

**Giải thích:** "Credentials and configuration from another project do not carry over automatically" ([models](https://opencode.ai/v2/docs/models), verify 28/10/2026). Model unavailable có thể do: thiếu credentials ở project đó, bị `policies provider.use deny`, hoặc catalog data khác nhau theo location.

**Làm thế nào:**

1. Chạy `/connect` trong project B (credentials không tự sang từ project A).
2. `opencode api get /api/model` xem catalog đang thấy gì (hoặc `/models`).
3. Check policy `provider.use` trong config các tầng.

**Nếu vẫn lỗi:** vẫn bí → `opencode api get /api/provider` so sánh giữa 2 location; đây thường là config scope chứ không phải lỗi mạng.

## Q7: "Sửa config mà hành vi không đổi?"

**Trả lời 1 câu:** Config và file định nghĩa reload tự động — nếu không đổi thì bạn đang sửa nhầm tầng config hoặc field bị cảnh báo trong log.

**Giải thích:** Nhiều layer stack lên nhau (system → global → project xa → project gần → `.opencode`), mỗi lớp có precedence riêng; còn policies thì ngược lại — tầng rộng thắng ([config](https://opencode.ai/v2/docs/config), [policies](https://opencode.ai/v2/docs/policies), verify 28/10/2026). Field sai validation bị drop kèm warning trong server log, không làm chết cả file. Request model đang chạy giữ settings lúc bắt đầu — sửa config không áp ngược vào request đang bay.

**Làm thế nào:**

1. `opencode service status` + sửa xong `location.reload` hoặc `opencode service restart`.
2. `grep -i warn ~/.local/share/opencode/log/opencode.log` tìm field bị bỏ qua.
3. Giữ `$schema` trong file để editor bắt lỗi trước khi lưu.

**Nếu vẫn lỗi:** nghi precedence → đọc lại bảng precedence trong [config](https://opencode.ai/v2/docs/config); và nhớ `cli.json` (TUI) tách biệt `opencode.jsonc` (server/project).

## Q8: "Không hiểu lỗi — nhờ ai debug giúp?"

**Trả lời 1 câu:** Nhờ chính OpenCode debug nó: mô tả vấn đề và bảo nó đọc trang troubleshooting — nó tự đọc steps, soi service + logs.

**Giải thích:** Trang [troubleshooting](https://opencode.ai/v2/docs/troubleshooting) (verify 28/10/2026) mở đầu bằng tip chính thức này: OpenCode có thể đọc trang đó, kiểm tra service + logs và giúp nhận diện vấn đề. Khi tự report, kèm: `opencode --version`, `opencode service status`, steps tái hiện, lỗi thuộc shared service / client / project nào, log lines có `run` + `role` — và **xóa key/header/prompt/file contents** trước khi share.

**Làm thế nào:**

1. Trong TUI: mô tả vấn đề + yêu cầu agent dùng trang troubleshooting của docs.
2. Tự soi: `opencode service status` + `opencode api get /api/info`.
3. Report kèm `opencode --version`, `opencode service status`, steps tối thiểu, log có `run`/`role`.

**Nếu vẫn lỗi:** report lên GitHub Issues của repo; nhớ redact API keys và dữ liệu nhạy cảm trong log trước khi dán lên issue.

## Q9: "Session data nằm ở đâu, đổi kênh có mất không?"

**Trả lời 1 câu:** Database ở `~/.local/share/opencode/opencode.db`; stable/beta/next **dùng chung** file nên đổi kênh giữ nguyên session — riêng dev build có file riêng.

**Giải thích:** Service đăng ký tại `~/.local/state/opencode/service.json`, config riêng tại `~/.config/opencode/service.json`, database có thể đổi chỗ bằng `OPENCODE_DB` ([troubleshooting — Service files](https://opencode.ai/v2/docs/troubleshooting), verify 28/10/2026). Stable/beta/next: port mặc định 49374 (28894 Windows); dev build: 49376, file `-dev` riêng, không đụng shared service.

**Làm thế nào:**

1. Xem đường dẫn: `opencode debug paths db` (hoặc `home`/`data`/`log`...).
2. Backup DB trước khi mò bằng sqlite: `sqlite3 "$(opencode debug paths db)"`.
3. Đổi kênh stable/beta/next thoải mái — session không mất.

**Nếu vẫn lỗi:** đừng xóa/sửa service file hay database khi đang troubleshoot — quản daemon bằng `opencode service ...`, backup trước khi xem dữ liệu bằng tool ngoài.

## Q10: "Web client từ origin khác không connect được?"

**Trả lời 1 câu:** Là CORS — thêm origin của client vào service config bằng `opencode service set cors`.

**Giải thích:** Browser client chạy ở origin khác sẽ bị chặn CORS; danh sách origin là exact origin (kèm port nếu có, không path, không trailing slash) ([troubleshooting — Allow a browser origin](https://opencode.ai/v2/docs/troubleshooting), verify 28/10/2026). Set/unset cors sẽ dừng background service — start lại để ăn config mới.

```bash
opencode service set cors "http://192.168.1.10:3001, https://app.example.com"
opencode service get cors
opencode service unset cors        # xoa danh sach
```

**Nếu vẫn lỗi:** server foreground thì dùng `--cors` lặp lại mỗi origin; `serve --service` với `--cors` sẽ ghi đè danh sách persisted cho process đó; CORS không đổi địa chỉ lắng nghe hay bỏ qua authentication của server.

## Q11: "Đang chạy nhiều client cùng lúc — có xung đột không?"

**Trả lời 1 câu:** Không — nhiều client cùng nối một server chung; thay đổi config đánh giá ở tầng server, nhưng session data và permissions per-client không xung đột.

**Giải thích:** Shared background server giữ session, plugins, permissions; client chỉ là giao diện TUI/Desktop/Web. Hai client cùng session: model chạy một lượt tại một thời điểm, client nào gửi prompt trước thì được đáp. Session list `<leader>l` xem tất cả. Config thay đổi áp dụng cho mọi client cùng server.

**Làm thế nào:**

1. Mở nhiều tab/client cùng session → hợp tác, nhưng gửi prompt đầu tiên được xử lý.
2. Muốn tách hoàn toàn → `opencode --standalone` chạy server riêng (process mới, port khác).
3. Muốn session riêng nhưng cùng server → `/new` trong TUI (session mới trên cùng server).

**Nếu vẫn lỗi:** hai client cùng session thấy "permission request" nhảy ở một client → đó là hành vi bình thường; approval từ bất kỳ client nào đều hợp lệ.

## Q12: "Đổi port/hostname server mặc định thế nào?"

**Trả lời 1 câu:** `opencode service set port <số>` / `hostname <địa chỉ>` — đổi service chung; hoặc `opencode serve --port 4096 --hostname 0.0.0.0` cho server foreground đơn lẻ.

**Giải thích:** Mặc định server nghe localhost, port phụ thuộc platform ([cli/web](https://opencode.ai/v2/docs/cli/web), verify 28/10/2026). Đổi setting → service restart áp dụng.

```bash
opencode service set port 49374     # macOS/Linux
opencode service set hostname 0.0.0.0  # nghe moi interface
opencode service start              # khoi dong lai
```

**Làm thế nào:**

1. Thay đổi service config → service restart.
2. `opencode serve` chạy foreground, chỉ định port/hostname trên command line.
3. CORS origin cần đặt riêng qua `service set cors` — không cùng command.

**Nếu vẫn lỗi:** đổi port mà port bận → kiểm tra port đó có process nào đang dùng; foreground server dùng port khác với shared service không đụng nhau.
