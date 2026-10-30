# 06 — Commands (slash tái dùng, khỏi gõ lại prompt dài)

> **Dành cho:** người lặp đi lặp lại 1 prompt · **Vấn đề:** mỗi lần review/test/release lại gõ lại đoạn prompt 10 dòng · **Đọc xong:** tạo `/review` của riêng bạn + truyền args + chạy nền + biết command khác skill/agent ở đâu · **Thời gian:** ~15 phút.

## Mục tiêu

- Tạo command markdown ở global vs project, gọi `/ten` + truyền args.
- Biết `$ARGUMENTS`, `$1/$2`, shell block `` !`...` ``, và cảnh báo bảo mật của shell block.
- Dùng frontmatter `agent`/`model`/`subagent` + định nghĩa command bằng JSON.
- Biết command khác skill/agent ở đâu.

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

**1 câu:** Command là prompt đóng gói thành slash command (`/review`) để gọi 1 phát thay vì gõ lại.

**Nôm na:** như phím tắt món tủ ở quán — thay vì đọc cả công thức, bạn nói "cho 1 phần như mọi khi".

Tạo file `.opencode/commands/review.md`:

```md
---
description: Review staged changes for correctness and missing tests
---
Review `git diff --staged`. List findings in severity order.
Check: correctness, security (secrets, injection), missing tests.
End with: merge / fix-first verdict.
```

Gọi trong TUI: `/review`. Scope: `~/.config/opencode/commands/` (mọi project) vs `.opencode/commands/` (project này). Discovery chỉ quét file `.md`, quét từ cwd lên root như agents.

**Vì sao quan trọng?** Workflow lặp (review, viết test theo mẫu, release notes...) mà không đóng gói thì mỗi lần prompt một kiểu, chất lượng bấp bênh.
**Nếu làm sai?** Nhồi 20 commands ít dùng vào project → list `/` dài, model phân tâm. Chỉ đóng gói việc lặp ≥3 lần/tuần.

### 1. Arguments: `$ARGUMENTS` và `$1 $2` (verify 28/10/2026 — [docs/commands](https://opencode.ai/v2/docs/commands/))

```md
<!-- .opencode/commands/component.md -->
Create a typed React component named $ARGUMENTS.
```

```text
/component Account Settings
-> OpenCode submit: "Create a typed React component named Account Settings."
```

`$ARGUMENTS` = toàn bộ chuỗi argument y nguyên. Còn `$1`, `$2`... là vị trí tách sẵn — quote đơn/đôi chỉ để gộp chữ, bị bỏ sau khi parse:

```md
<!-- .opencode/commands/check.md -->
Check $1. Focus on $2.
```

```text
/check src/auth.ts "error handling"
-> $1 = src/auth.ts, $2 = error handling
```

Ba luật cần nhớ:

- Placeholder **số cao nhất** nuốt luôn phần còn lại: `/compare api stable branch` với template `Compare $1 with $2.` → `Compare api with stable branch.` (vì `$2` là số cao nhất, ăn `stable branch`).
- Vị trí thiếu → chuỗi rỗng.
- Template **không có** placeholder nào → đối số không rỗng được nối vào sau 1 dòng trống (`/explain src/cache.ts` → prompt gốc + dòng `src/cache.ts`).

### 2. Shell blocks: `` !`...` `` — chèn output lệnh vào prompt

```md
<!-- .opencode/commands/review-diff.md -->
Review this diff:

!`git diff --stat && git diff`
```

Mỗi block chạy bằng shell đã config, tại project đang mở, output được **chèn vào prompt trước khi gửi**. Argument được expand trước — `/history 5` với `!`git log --oneline -$1`` chạy `git log --oneline -5`.

⚠️ **Cảnh báo docs (copy nguyên văn ý):** shell blocks chạy khi OpenCode đánh giá command — **ngoài luồng permissions của agent**. Nghĩa là rule `permissions` không chặn được nó; chỉ dùng lệnh từ nguồn bạn tin.

**Vì sao quan trọng?** Shell block là đường tắt tiện nhất của command — cũng là lỗ hổng lớn nhất nếu bạn copy command lạ từ internet.
**Nếu làm sai?** Một command tải về từ internet với `` !`curl ... | sh` `` là bạn đã chạy mã không qua phanh nào.

### 3. Fields: `agent`, `model`, `subagent`

Frontmatter markdown và entry JSON nhận cùng bộ field:

| Field | Bắt buộc | Ý nghĩa |
|---|---|---|
| `template` | chỉ JSON | Prompt template (markdown lấy từ body, đừng đưa vào frontmatter) |
| `description` | không | Text hiện trong list command + discovery |
| `agent` | không | Agent được chọn khi command chạy |
| `model` | không | `provider/model` hoặc `provider/model#variant` |
| `subagent` | không | `true` chạy session con nền; `false` ép session hiện tại |
| `subtask` | không | Tên cũ (deprecated) của `subagent`; cả hai cùng có thì `subagent` thắng |

Ưu tiên model khi command chạy:

1. Command có `model` → thắng tất cả.
2. Không thì agent của command có model riêng → thắng model đang chọn.
3. Còn không → giữ model hiện tại của session.

### 4. JSON commands — cùng registry với markdown

```jsonc
// opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "commands": {
    "audit": {
      "template": "Audit $ARGUMENTS.",
      "description": "Audit a package",
      "agent": "general",
      "model": "anthropic/claude-sonnet-5-5#high",
      "subagent": true
    }
  }
}
```

JSON cần `template`; markdown không cần (body chính là template). Markdown + JSON chung 1 registry.

### 5. Loading: ai thắng ai + hot reload

```text
~/.config/opencode/commands/review.md   # uu thuan thap hon
.opencode/commands/review.md            # de len command global
```

- Markdown và JSON chung 1 registry; nguồn đăng ký **sau cùng** thay command trùng tên.
- Project thắng global; project **gần hơn** (cwd) thắng tổ tiên. Custom command cũng thay được built-in command.
- Sửa file command / config **reload tự động**, không cần restart TUI.
- Chỉ file `.md` được discovery; thư mục `command/` số ít (legacy) vẫn được đọc nhưng dùng `commands/` cho file mới.
- Path lồng nhau thành tên lồng: `.opencode/commands/team/review.md` → gọi `/team/review src/auth.ts`.

### 6. Built-in commands mới (2.2.1+): `/goal` + `/schedule`

Ngoài slash command tự viết, v2.2.1 thêm 2 lệnh built-in đáng nhớ:

- `/goal <mục tiêu>` — đặt mục tiêu **xuyên turn**: agent tự làm tiếp qua nhiều lượt đến khi đạt điều kiện hoàn thành; pause/resume/clear để điều khiển vòng đời của goal. Hợp task dài kiểu "chạy đến khi toàn bộ test xanh".
- `/schedule` — scheduled prompts (**opt-in**): lên lịch prompt chạy định kỳ (cron-style) không cần người ngồi. Tính năng experimental; từ 2.2.3, Code Mode script trong schedule được kiểm tra tĩnh trước — schedule sai sẽ fail ngay lúc tạo thay vì chạy hỏng âm thầm. (verify 30/10/2026 — changelog v2.2.1/v2.2.3)

## Luồng hoạt động

1. **Viết file** `.opencode/commands/<ten>.md` — Lỗi hay gặp: đặt trong `command/` (số ít, legacy vẫn đọc nhưng đừng dùng mới).
2. **Gõ `/ten` trong TUI** — autocomplete hiện `description`. Lỗi hay gặp: quên `description` → list hiện trống, không nhớ lệnh làm gì.
3. **Truyền args** — `$ARGUMENTS`/$1/$2 được expand. Lỗi hay gặp: template không có placeholder → args nối sau dòng trống, dễ ngỡ "không nhận args".
4. **Shell block chạy trước submit** — output được chèn vào prompt. Lỗi hay gặp: đặt argument không tin cậy vào shell block → injection.
5. **Prompt được submit như 1 user message** trong session hiện tại (trừ khi `subagent: true`).

## Ví dụ chi tiết

Bộ 3 command thực dụng cho một repo: review staged, kiểm tra test theo file chỉ định, và tóm tắt commit gần đây.

```md
<!-- .opencode/commands/review.md -->
---
description: Review staged changes for correctness and missing tests
---
Review the staged changes below.

!`git diff --cached`

Check: correctness, security (secrets, injection), missing tests.
End with a verdict: merge / fix-first.
```

```md
<!-- .opencode/commands/test-file.md -->
---
description: Write or fix tests for one file
---
For $1: write or fix tests so they cover the failure cases.
Run the test command after editing and report results.
```

```md
<!-- .opencode/commands/audit.md -->
---
description: Audit mot package o nhom con nen
agent: general
subagent: true
---
Audit $ARGUMENTS for known vulnerability patterns and dangerous defaults.
Report findings with severity. Do not modify files.
```

Giải thích từng phần:

- `review.md` dùng shell block lấy diff thật — command luôn review thứ **đang staged**, không phụ thuộc bạn paste.
- `test-file.md` dùng `$1` để nhắm đúng 1 file — gọi `/test-file src/auth.ts`.
- `audit` đặt `subagent: true` → chạy session con nền, parent vẫn dùng được; kết quả/failure được gửi ngược về parent khi child xong.

`subagent` theo bảng sau (verify 28/10/2026):

| Giá trị | Hành vi |
|---|---|
| `true` | Luôn dùng child, kể cả agent được chọn là `mode: primary` |
| `false` | Luôn dùng session hiện tại, kể cả agent là `mode: subagent` |
| Bỏ trống | Dùng child chỉ khi agent được chọn có `mode: subagent` |

### Attachments: `@path` không được expand trong stored template

```md
<!-- .opencode/commands/readme.md -->
Review @README.md.
```

`@README.md` **giữ nguyên là text** — stored template không tự đính file. Muốn đính kèm file, thêm qua composer lúc gọi command; OpenCode giữ attachment đó khi submit prompt đã expand.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Slash tự tạo | `.opencode/commands/*.md` + JSON `commands` | prompt files (legacy) / Skills | `.claude/commands/` |
| Gọi | `/ten` trong TUI, `/team/review` cho nested | `/ten` trong Chat | `/ten` trong terminal |
| Args | `$ARGUMENTS` + `$1 $2` + fallback | `$INPUT`/`$ARGS` tùy bản | `$ARGUMENTS` tương tự |
| Chèn shell output | `` !`cmd` `` (chạy ngoài permission flow) | không có | `!` trong allowed-tool |
| Chạy nền | `subagent: true` → child session | agent panel | `/agent` tương tự |

## Lỗi thường gặp

### 1. Command không có `description`, tên chung chung

```text
❌ SAI: viet command khong co description, dat ten chung chung (do.md)
✅ ĐÚNG: ten kebab ro viec (review-pr.md), description 1 dong noi khi nao goi
```
**Bài học:** command không tên rõ = không ai nhớ để gọi.

### 2. Đặt argument không tin cậy vào shell block

```text
❌ SAI: !`grep $ARGUMENTS -r .` -> /x "; rm -rf ~" thi shell nhan chuoi do
✅ ĐÚNG: chi dan argument vao shell block khi ban kiem soat gia tri; hoac de args cho model xu ly qua placeholder o phan prompt
```
**Bài học:** shell block chạy ngoài permission flow — argument expand trước rồi shell chạy luôn, không ai hỏi bạn.

### 3. Đặt `template` vào frontmatter của markdown

```text
❌ SAI: frontmatter co "template: ..." trong file .md -> bi bo qua
✅ ĐÚNG: markdown lay template tu body; template chi bat buoc voi JSON command
```
**Bài học:** hai định dạng hai quy ước; body = template là luật riêng của markdown.

## Best practices (kèm "vì sao")

- Command kết thúc bằng **verdict + checklist verify** (test nào phải xanh). **Vì sao?** Không có verify thì command chỉ là văn mẫu.
- Command việc ồn ào dùng `subagent: true` (audit, quét lớn). **Vì sao?** Session chính giữ quyết định, việc càn quét để session con, parent vẫn dùng được.
- Tên file kebab-case rõ việc (`review-pr.md`), đặt trong project nếu chỉ project đó dùng, global nếu mọi repo cần. **Vì sao?** Global lạm dụng sẽ thành đống command chết theo bạn tới mọi repo.
- Command duyệt code luôn neo vào diff cụ thể (`git diff --staged`, `$1`) thay vì "nhìn chung repo". **Vì sao?** Neo rõ phạm vi thì output so sánh được giữa các lần chạy.
- Shell block chỉ dùng lệnh bạn đã đọc kỹ. **Vì sao?** Nó chạy ngoài permission flow — không có phanh nào khác.

## Bài tập nhỏ

1. (10 phút) Tạo `/review` như mẫu trên, chạy lên 1 staged diff thật, so chất lượng với prompt tay bạn hay gõ.
2. (5 phút) Tạo `/summarize-branch` dùng `!`git log --oneline -10`` + `$ARGUMENTS`, in 5 gạch đầu dòng về branch hiện tại.
3. (5 phút) Tạo `/explain` không có placeholder, gọi `/explain src/utils.ts` — quan sát args bị nối sau dòng trống.

## Reference

- Commands docs: https://opencode.ai/v2/docs/commands/ (verify 28/10/2026)
- Agents (field `agent`): https://opencode.ai/v2/docs/agents/ (verify 28/10/2026)
- Models (format `provider/model#variant`): https://opencode.ai/v2/docs/models/ (verify 28/10/2026)

## Đọc tiếp

- [05-agents-build-plan-custom.md](05-agents-build-plan-custom.md) — `agent:` trong frontmatter chọn vai nào.
- [07-skills.md](07-skills.md) — khi nào đóng gói thành skill thay vì command.
- [09-permissions-policies.md](09-permissions-policies.md) — tại sao shell block của command nằm ngoài phanh này.
- [10-background-tasks.md](10-background-tasks.md) — command `subagent: true` chạy nền giống background task.
- [commands/README.md](commands/README.md) — bộ command mẫu kèm khóa học.
- [../03-cau-hoi-thuong-gap/05-agents-skills-faq.md](../03-cau-hoi-thuong-gap/05-agents-skills-faq.md) — phân vân command/skill/agent? Đọc FAQ.

> **Chốt bài 06:** việc lặp thì đóng gói thành `/`; command chạy ngoài permission flow thì shell block chỉ dùng với nguồn tin cậy — và đừng để prompt hay nằm rải rác trong lịch sử chat.
