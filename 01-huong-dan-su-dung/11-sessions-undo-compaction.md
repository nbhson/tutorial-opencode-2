# 11 — Sessions: new / continue / undo / compaction (đừng để context thối)

> **Dành cho:** người làm task dài · **Vấn đề:** 1 session ôm 3 task → context loạn, agent quên đầu bài · **Đọc xong:** quản vòng đời session + undo an toàn + sống với compaction · **Thời gian:** ~12 phút.

## Mục tiêu

- Biết khi nào `/new` vs tiếp tục vs fork — và phím/lệnh tương ứng.
- Dùng `/undo`/`/redo` đúng cơ chế snapshot (biết nó hồi được gì, không hồi được gì).
- Hiểu compaction (nén context) + cách tắt/chỉnh tự động bằng config.
- Quản session bằng CLI: `session list/export/import`, `run --continue/--session`.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Luồng hoạt động](#luồng-hoạt-động)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. Vòng đời session

- Mới: `<leader>n` (`session.new`; leader mặc định `ctrl+x`) hoặc `/new` — task mới = session mới.
- Tiếp: `<leader>l` (`session.list`), `ctrl+o` (`open.menu` mở session + project gần đây); từ CLI: `opencode run --continue` (tiếp session cuối) hoặc `opencode run --session ses_xxx` (tiếp session chỉ định); TUI `opencode mini --continue` cũng vậy.
- Fork: chọn 1 message cũ rồi fork (`session.fork`, không gán phím mặc định) để rẽ nhánh không phá bản gốc.
- Đổi tên: `ctrl+r` (`session.rename`). Xóa session: `ctrl+d` (`session.delete`) hoặc `opencode session delete ses_xxx`.
- Tiêu đề/tóm tắt do agents ẩn (`title`, `summary`) lo — bạn không cần đặt tay; muốn đổi thì `ctrl+r`. Danh sách agent ẩn gồm `compaction`, `title`, `summary` — chúng làm việc bảo trì và không chọn được trực tiếp; muốn model khác viết summary thì cấu hình `agents.compaction.model` (bài về compaction bên dưới).
- Xếp hàng prompt: khi agent đang chạy mà bạn muốn gửi trước ý tiếp theo, dùng `prompt.queue` (`<leader>return`) và quản bằng `<leader>q` (`session.queued_prompts`); trong hàng đợi có undo (`ctrl+u`) và xóa (`ctrl+d`).

**Nôm na:** session như vở làm bài — mỗi đề 1 vở mới; viết 3 đề chung 1 vở thì chấm không nổi.

**Vì sao quan trọng?** Mọi thứ bạn làm dở ở bài 11 đều quy về một câu: session nào chứa task nào. Khi context bẩn, "mở session mới" là nút reset rẻ nhất — rẻ hơn cả `/undo`.
**Nếu làm sai?** Ôm 3 task chung 1 session: agent trộn yêu cầu, diff của `/undo` lẫn lộn 3 task, compaction tóm tắt sai trọng tâm.

### 2. Undo + Snapshot (lưới an toàn)

Cơ chế v2 gọi là **snapshot**: trước và sau mỗi model step, OpenCode chụp trạng thái file; assistant message ghi lại đường dẫn nào đổi giữa 2 mốc đó.

- `/undo` (phím `<leader>u`): **staged rollback** — lùi checkpoint, hồi các file bị ảnh hưởng, và đưa prompt bị gỡ **về lại ô soạn thảo** để bạn sửa rồi gửi lại.
- Chưa gửi lại mà đổi ý → `/redo` (phím `<leader>r`): hủy rollback đã stage, trả conversation + file về như trước `/undo`.
- Hoặc chọn một message cũ hơn và chọn **Revert** để stage rollback về đúng điểm đó.
- `/diff` mở diff cạnh session (phím `f` toggle fullscreen trong diff viewer) để review trước khi chấp nhận.

Phạm vi snapshot — biết để không tưởng sai:

| Nội dung | Snapshot được? |
|---|---|
| File tracked trong thư mục active của session | Có |
| File untracked chưa bị ignore, ≤2 MiB mỗi file | Có |
| File bị git ignore, file >2 MiB, ngoài thư mục active | Không |
| Side effect ngoài file: commit, branch, database, process | Không |

Snapshot cần **git repo**. Ngoài git, `/undo` vẫn lùi hội thoại nhưng không hồi được file. Snapshot lưu trong object database riêng của OpenCode, không tạo commit, không đụng index của bạn.

**Vì sao quan trọng?** Đây là phanh khẩn cấp rẻ nhất: sai ở bước 3 thì lùi về bước 2, không cần `git reset` tay và đoán file nào đổi.
**Nếu làm sai?** Coi snapshot là backup — không phải. Shell command đã chạy (đã push, đã xóa database) không hoàn ngược được.

### 3. Compaction (nén khi đầy)

Context gần chạm giới hạn → OpenCode tự tóm tắt toàn bộ hội thoại (summary) và giữ lại ~15.000 token hội thoại gần nhất bên cạnh — bạn vẫn nói tiếp được.

Cấu hình (đây là cách chính thức của v2):

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "compaction": {
    "auto": true,        // tat di bang false neu muon tu chu
    "keep": { "tokens": 15000 },  // giu lai bao nhieu token hoi thoai gan nhat
    "buffer": 16000,     // de truoc gioi han context bao nhieu token thi bat dau nen
  },
}
```

- Nén thủ công bất cứ lúc nào: `<leader>c` (`session.compact`) trong TUI, hoặc từ terminal: `opencode api post /api/session/ses_xxx/compact --data '{}'`.
- Muốn model khác viết summary: đặt `agents.compaction.model`.
- Summary có cấu trúc (Objective / Next Move / quyết định / việc dở / file liên quan) để agent khác nhảy vào làm tiếp được.
- Sau compaction, bản hiện tại của các file hướng dẫn (`AGENTS.md`...) trở thành baseline của session.

Về `OPENCODE_DISABLE_AUTOCOMPACT`: biến môi trường này từng được nhắc cho v1; trong tài liệu v2 (verify 28/10/2026) không thấy xác nhận — **cần verify**. Cách chuẩn v2 là `compaction.auto: false` ở config; hãy dùng cách đó thay vì dựa vào env var không chắc còn hiệu lực.

**Vì sao quan trọng?** Session dài không compaction thì vừa đắt vừa lú; compaction ẩu thì mất quyết định quan trọng. Compaction là mất mát (lossy) — tăng `keep.tokens` khi chi tiết gần đây quan trọng.
**Nếu làm sai?** Ôm 2 giờ trong 1 session rồi hỏi "sao nó quên yêu cầu đầu" — vì yêu cầu đầu đã bị nén vào summary.

### 4. Compaction nâng cao (đọc khi session thực sự dài)

- **Background compaction (experimental):** mặc định, tự động nén làm session dừng trong lúc viết summary. Bật `experimental.background_compaction: true` thì OpenCode viết summary **trước** (từ mốc ~85% ngưỡng), giữ sẵn, và swap vào đúng lúc tới hạn — session gần như không bị pause. Đổi giá: summary chưa dùng vẫn tốn token; held summary nằm trong RAM, mất khi restart.
- **Native compaction (provider-side):** với OpenAI Responses models, có thể gửi hội thoại tới endpoint compaction của provider — nhận về checkpoint mã hóa đứng thay phần hội thoại cũ. Bật per-provider/model bằng `settings.compaction` (`native` hoặc `summary`); model setting override provider setting. Checkpoint mã hóa chỉ dùng được với cùng provider + model — đổi model là session quay về hội thoại gốc.
- **Giới hạn phải biết:** compaction không cứu nổi session mà gần như toàn bộ là instructions + tool schemas (vd 128k context = 120k fixed + 8k hội thoại) — nó cần "hội thoại cũ" để thay thế. Recover chỉ tự thử 1 lần: bị chê quá dài lần 2 là trả lỗi.
- Tin nhắn cũ sau compaction vẫn nằm trong storage — chỉ là không còn được gửi tới model.

**Vì sao quan trọng?** Chọn sai loại compaction là mất tiền oan (summary chưa dùng vẫn tốn token) hoặc mất quyền di chuyển (checkpoint khóa vào 1 provider/model).
**Nếu làm sai?** Đặt `keep.tokens` khổng lồ cho model 128k — hội thoại gần chiếm hết chỗ, phần "mới" không còn đất.

## Luồng hoạt động (Flow)

1. **Bắt đầu task** → `<leader>n` (session mới). Lỗi hay gặp: mở mới nhưng cứ lập lại yêu cầu cũ vì tưởng context còn.
2. **Làm việc, checkpoint tự động** — mỗi model step có snapshot A (trước) và B (sau). Nếu một mốc capture thất bại, step đó có thể không hồi file được (best effort).
3. **Thấy sai hướng** → `/undo` ngay → sửa prompt → gửi lại. Đổi ý trước khi gửi lại → `/redo`. Nhớ phím: `<leader>u` = undo, `<leader>r` = redo.
4. **Session dài dần** → theo dõi; thấy summary chuẩn bị chạy, tự ghi 5 gạch quan trọng hoặc chủ động `<leader>c` nén lúc bạn còn kiểm soát.
5. **Task xong hoặc hết phần việc bẩn** → `/new`. Cần chứng tích → `opencode session export ses_xxx [--sanitize]`.

### Checklist mở session mới (20 giây, tiết kiệm 2 giờ)

- [ ] Session này có 1 mục tiêu không? Hơn 1 mục tiêu là chia.
- [ ] `AGENTS.md` đúng nơi cần, lệnh test đã ghi vào?
- [ ] Task này có cần worktree riêng không (bài 14)?
- [ ] Có snapshot đang staged (`/undo` cũ) chưa xử lý không? — xử lý trước khi mở mới.

### Phím tắt nhanh (session management)

| Phím | Lệnh | Dùng khi |
|---|---|---|
| `<leader>n` | `session.new` | Tạo session mới |
| `<leader>l` | `session.list` | Xem/danh sach session |
| `ctrl+o` | `open.menu` | Mở session hoặc project gần đây |
| `<leader>u` | `session.undo` | Lùi 1 checkpoint |
| `<leader>r` | `session.redo` | Hủy rollback đã staged |
| `<leader>c` | `session.compact` | Nén tay |
| `ctrl+r` | `session.rename` | Đổi tên session |
| `ctrl+d` | `session.delete` | Xóa session (hỏi xác nhận) |
| `<leader>q` | `session.queued_prompts` | Xem prompt đang xếp hàng |

**Ghi nhớ:** leader mặc định là `ctrl+x`. `<leader>` trong keybind nghĩa là "ấn leader trước".

## Ví dụ chi tiết

### Cứu một lần sửa hỏng

```text
Ban: "them rate-limit vao middleware"
# agent sua 5 file, ban doc diff thay no di sai huong

/diff          # review lai, phím f de xem fullscreen
/undo          # stage rollback: file ve trang thai truoc, prompt quay lai o composer

# sua lai de bai ro hon roi submit
Chi ap dung rate-limit cho /api/*, dung cham vao static handler.
```

### CLI: quản session khi không mở TUI

```bash
# liet ke session gan day
opencode session list --max-count 20

# tiep tuc dung session hom qua, khong mo TUI
opencode run --continue "lam tiep phan con du"

# xuat transcript de luu / cho nguoi khac doc (co lua loc du lieu nham cam)
opencode session export ses_4f2a1c --sanitize > log-ses-4f2a1c.json
```

### Mẫu "5 gạch" trước khi nén (bạn tự viết, 1 phút)

```text
MUC TIEU: migration auth sang jsonwebtoken, con 1 endpoint
QUYET DINH: dung jsonwebtoken thay thu viet; khong doi public API
DA XONG: middleware, 3/4 endpoint; test auth pass
DANG DO: handler /api/refresh chua doi
DANG LO: bien JWT_SECRET phai qua {env:...}, khong hardcode
```

**Vì sao mẫu này cứu được bạn?** Sau compaction, summary của máy giữ chữ nhưng có thể lệch trọng tâm. 5 gạch của bạn là bản kiểm để đối chiếu: "summary nó viết có trùng ý mình không?" — thiếu thì nói bổ sung ngay, còn kịp.

### Tắt snapshot khi cần (và cái giá phải trả)

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "snapshots": false   // ngung chup snapshot tu bay gio; snapshot cu khong bi xoa
}
```

Tắt xong, `/undo` vẫn lùi hội thoại nhưng **không còn file để hồi**. Đó là lý do mục này nằm dưới cùng: tắt chỉ khi lý do bảo mật nghiêm trọng hơn tiện ích rollback.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Session mới/tiếp/fork | `/new`, `<leader>l`, `ctrl+o`, `run --continue/--session` | `/new`, `/clear`, checkpoints | `/clear`, continue/resume tương tự |
| Undo | `/undo` + snapshot hồi file + prompt về composer | checkpoints/undo | undo/checkpoint tùy bản |
| Nén context | autocompact mặc định + chỉnh `keep.tokens`/`buffer` + nén tay | summarize | compact/summarize |
| Nén bên provider | native compaction cho OpenAI Responses (checkpoint mã hóa) | không có tương đương trực tiếp | không có tương đương trực tiếp |
| Export/import session | `session export/import` (JSON, có `--sanitize`) | tùy bản | tùy bản |

## Lỗi thường gặp

### 1. Sửa sai hướng cứ ép đi tiếp

```text
❌ SAI: thay agent sua sai 5 files van co sua tiep trong cung session
✅ ĐÚNG: /undo ngay, hoac /new + mo bai 05 (plan truoc) neu huong sai tu dau
```
**Bài học:** sửa sai hướng càng đi càng lún. Lùi sớm rẻ hơn chữa muộn.

### 2. Tin rằng `/undo` hoàn tác cả thế giới

```text
❌ SAI: agent da chay "git push" + "drop table" roi mong /undo tra tat ca
✅ ĐÚNG: viec pha huy (push, migration, xoa data) phai di qua review/confirm truoc khi chay
```
**Bài học:** snapshot chỉ hồi file trong thư mục active. Mọi thứ đi qua shell là "ra khỏi lưới".

### 3. Nhầm compaction là mất sạch

```text
❌ SAI: thay session bi nen -> hoang mang, nop /new va lam lai tu dau
✅ ĐÚNG: doc phan summary (Objective/Next Move), kiem tra giu lai 15k token cuoi, bo sung thieu thi noi them
```
**Bài học:** compaction giữ ý chính + hội thoại gần; mất chi tiết xa. Hỏi lại thay vì làm lại.

### 4. Undo rồi nhưng vẫn cảm giác "bẩn"

```text
❌ SAI: /undo xong khong review, tiep tuc go prompt moi ngay
✅ ĐÚNG: sau khi commit rollback, chay `git diff --stat` xem lai trang thai, roi moi tiep tuc
```
**Bài học:** rollback chỉ chịu trách nhiệm các path nó ghi nhận — edit tay bên ngoài session (editor khác, lệnh shell) có thể vẫn còn sót. 10 giây `git diff` rẻ hơn 1 giờ debug "tại sao file lạ này ở đây".

## Best practices (kèm "vì sao")

- Trước compaction tự ghi 5 gạch: mục tiêu + quyết định + việc dở. **Vì sao?** Bản nén của máy giữ chữ, bản của bạn giữ ý.
- Task dài then chốt thì tăng `keep.tokens` (vd 24000). **Vì sao?** Nén là mất mát — giữ đuôi dài hơn là mua bảo hiểm cho chi tiết gần nhất.
- Không đặt `keep.tokens` gần sát giới hạn context của model. **Vì sao?** Đuôi giữ lại chiếm chỗ của công việc mới — giữ nhiều chi tiết quá thì session "đầy" sớm hơn, nén liên tục.
- Bật `experimental.background_compaction` chỉ cho session dài quen thuộc. **Vì sao?** Nó là experimental — có thể đổi/bị bỏ bất cứ release nào; summary chưa dùng vẫn tốn token.
- `/share` không còn (backend bỏ từ v1.19.1) — cần share thì `opencode session export ses_xxx [--sanitize]` rồi gửi file. **Vì sao?** Đừng tìm nút đã khai tử.
- Review `git diff --stat` sau khi rollback. **Vì sao?** Rollback ghi đè nội dung hiện tại của đúng các path nó chịu trách nhiệm — edit tay của bạn có thể bị ghi đè.
- Việc dài, rủi ro cao → kết hợp bài 14: worktree riêng cho session đó. **Vì sao?** Undo là phanh trong 1 tree; worktree là vách ngăn cả không gian làm việc.
- Bật `snapshots: false` chỉ khi repo chứa dữ liệu cực nhạy cảm. **Vì sao?** Snapshot object có thể chứa toàn bộ nội dung file — coi data directory của OpenCode là dữ liệu nhạy cảm; nhưng tắt đi là mất luôn khả năng hồi file của `/undo`.

## Bài tập nhỏ

1. (5 phút) Làm hỏng cố ý 1 file bằng agent rồi `/undo` — xem prompt quay về composer, sửa đề bài rồi submit lại; thử `/redo` giữa chừng.
2. (5 phút) Làm 1 task dài đến khi compact (hoặc `<leader>c` chủ động), đọc bản summary xem mất gì, tự viết 5 gạch rồi so.
3. (5 phút) `opencode session list` rồi `session export` 1 session ra JSON — sờ thấy dữ liệu session tồn tại ngoài TUI.

## Reference

Nguồn chính thức (đã verify 28/10/2026):

- Snapshots — `/undo`/`/redo`, phạm vi, giới hạn: https://opencode.ai/v2/docs/snapshots/
- Compaction — `compaction.auto/keep/buffer`, manual, background compaction: https://opencode.ai/v2/docs/compaction/
- Keybinds — `session.*`, `open.menu`, `session.compact`: https://opencode.ai/v2/docs/cli/keybinds/
- CLI commands — `session list/export/import`, `run --continue/--session`: https://opencode.ai/v2/docs/cli/commands/
- Instructions — baseline sau compaction: https://opencode.ai/v2/docs/instructions/

Bài liên quan: [10 — Background tasks](./10-background-tasks.md) (child session), [05 — Agents](./05-agents-build-plan-custom.md) (plan trước khi đi tiếp), [14 — Worktree + Git + IDE/ACP](./14-worktree-git-ide-acp.md) (cách ly task rủi ro).

> **Chốt bài 11:** task mới vở mới, sai thì undo sớm, dài thì tóm tắt trước khi máy nén hộ.
