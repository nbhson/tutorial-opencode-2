# 07 — Skills (`SKILL.md`: kiến thức nạp khi cần, không nhồi prompt)

> **Dành cho:** người có quy trình nội bộ (release, migration, review chuẩn) · **Vấn đề:** nhồi mọi quy ước vào `AGENTS.md` làm context phình · **Đọc xong:** viết skill có `description` để model tự phát hiện + tự nạp, hiểu discovery/precedence + permissions · **Thời gian:** ~15 phút.

## Mục tiêu

- Viết `SKILL.md` + scripts/references đi kèm.
- Hiểu discovery (global/project/compat/HTTP catalog) + precedence (ai thắng ai).
- Gắn `skill` permissions + gọi tay `@skill-id`.
- Biết cơ chế loading: model thấy gì, đọc gì, khi nào.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Discovery + precedence](#discovery--precedence-ai-thắng-ai)
- [Loading: model nạp skill thế nào](#loading-model-nạp-skill-thế-nào)
- [Permissions cho skill](#permissions-cho-skill)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. Skill là gì

**1 câu:** Skill là gói hướng dẫn tái dùng (Markdown + scripts + references) mà model **chỉ nạp khi liên quan**, thay vì nhồi vào mọi prompt.

```markdown
.opencode/skills/git-release/SKILL.md
---
name: Git Release
description: Prepare release notes, version bumps, and GitHub releases
---

## Workflow
1. Read `references/release-policy.md`.
2. Summarize merged changes since previous tag.
3. Propose version bump BEFORE changing files.
4. Run `scripts/changelog.ts` only after user approves.
```

Cấu trúc khuyên dùng:

```text
.opencode/skills/
└── git-release/
    ├── SKILL.md
    ├── scripts/changelog.ts
    └── references/release-policy.md
```

Đường dẫn trong skill tính từ **thư mục chứa `SKILL.md`**. Gọi tay: `@git-release` hoặc `"dùng skill git-release chuẩn bị release"`.

**Vì sao quan trọng?** `AGENTS.md` là "luật luôn đúng" (nạp mọi lần), skill là "cẩm nang theo vụ" (chỉ nạp khi cần). Đảo hai cái là context lúc nào cũng đầy.
**Nếu làm sai?** Skill không có `description` → model không thấy → skill chết. Không description = sách không có mục lục.

Cơ chế "quảng cáo" (verify 28/10/2026 — [docs/skills](https://opencode.ai/v2/docs/skills/)): ở mỗi bước của model, OpenCode liệt kê các skill **được phép + có description + không đặt `autoinvoke: false`** — nhưng chỉ liệt kê `ID + name + description`, **không** gửi nguyên body. Model muốn dùng thì tự gọi tool `skill` với ID chính xác, lúc đó body mới được thêm vào hội thoại. Đây chính là chỗ tiết kiệm context: 20 skills có thể cùng "chờ" với giá của 20 dòng mô tả.

### 2. Hai dạng file + giới hạn quét

```text
skills/
├── review.md              # dang flat: ID = review (ten file)
└── git-release/
    └── SKILL.md           # dang thu muc: ID = git-release (ten thu muc)
```

Luật quét (verify 28/10/2026):

- File markdown phải nằm **ngay gốc nguồn** (`skills/review.md`); file tên đúng `SKILL.md` được lồng trong thư mục gom nhóm (`skills/teams/release/SKILL.md` — ID là `release`, thư mục cuối).
- Thư mục chứa `SKILL.md` là **một** skill — OpenCode không quét sâu hơn vào trong nó tìm skill nữa.
- Bỏ qua hidden files/thư mục và `node_modules`.
- Quét dừng ở **sáu cấp thư mục** dưới gốc nguồn.

## Discovery + precedence (ai thắng ai)

| Scope | Nguồn |
|---|---|
| Global | `~/.config/opencode/skills` (+ compat `~/.claude/skills`, `~/.agents/skills`) |
| Project | `.opencode/skills` (+ compat `.claude/skills`, `.agents/skills`), quét từ cwd lên root, **mọi cấp đều nhận** |
| Mở rộng | `skills: [...]` trong config — đường dẫn tương đối tính từ **cwd**, `~/` từ home, tuyệt đối dùng y nguyên, `http(s)://` là HTTP catalog |

```jsonc
// opencode.jsonc — mo rong nguon skills
{
  "$schema": "https://opencode.ai/config.json",
  "skills": [
    "./team-skills",              // tuong doi tu cwd
    "~/shared/opencode-skills",   // tu home
    "/opt/company-skills",        // tuyet doi
    "https://example.com/opencode/skills/"  // HTTP catalog
  ]
}
```

Mọi config file đều đóng góp entry `skills` — các mảng được **gộp lại**, không replace nhau.

**ID từ path, phân biệt hoa thường** — frontmatter `name` chỉ là label hiển thị:

| File | ID |
|---|---|
| `<source>/git-release.md` | `git-release` |
| `<source>/git-release/SKILL.md` | `git-release` |
| `<source>/teams/release/SKILL.md` | `release` |

Trùng ID → nguồn đăng ký **sau thắng**, theo thứ tự thấp → cao:

1. Built-in skills
2. `.claude/skills` (global trước, rồi từ tổ tiên xa về cwd)
3. `.agents/skills` (global trước, rồi từ tổ tiên xa về cwd)
4. `~/.config/opencode/skills`
5. Project `.opencode/skills` (từ project root về cwd)
6. `skills[]` trong config (theo ưu tiên config + thứ tự mảng)

ID khuyên dùng cho skill tương thích đa nền tảng: chữ thường kebab-case 1–64 ký tự, regex `^[a-z0-9]+(-[a-z0-9]+)*$`, trùng tên thư mục — V2 hiện **không ép** pattern này, chỉ là khuyến nghị.

**Vì sao quan trọng?** Hiểu precedence để không tự hỏi "tôi sửa skill này sao nó chạy cái cũ" — thường là có bản trùng ID ở nguồn cao hơn.
**Nếu làm sai?** Đặt skill trùng ID builtin mà không biết → vài nơi chạy bản của bạn, vài nơi chạy builtin — debug cực.

### HTTP catalog

Catalog = base URL có `index.json`:

```json
{
  "skills": [
    { "name": "git-release", "version": "3",
      "files": ["git-release.md", "references/release-policy.md"] }
  ]
}
```

Mỗi file tải từ `<base-url>/git-release/<file>`. Luật: đường dẫn phải an toàn/tương đối/**cùng origin**; entry phải chứa `SKILL.md` hoặc `<name>.md`; **đổi file thì tăng `version`** để cache được refresh. Thư mục tải về trở thành source root theo tên entry — cả `git-release.md` lẫn `SKILL.md` đều cho ID `git-release`.

## Loading: model nạp skill thế nào

Khi model gọi `skill` tool với `{"id": "git-release"}`, OpenCode:

1. Chọn định nghĩa hiện tại của ID đó (theo precedence).
2. Kiểm tra `skill` permission của agent đang chạy.
3. Thêm **body markdown (đã bỏ frontmatter)** vào hội thoại.
4. Cung cấp **base directory** + danh sách mẫu **tối đa 10 file** hỗ trợ.

Nội dung file hỗ trợ (script/reference) **không tự nạp** — agent đọc khi skill chỉ dẫn (qua tool read). Skill dạng flat `.md` không được nhận danh sách file kèm. Bạn gọi tay bằng cách nhắc `@skill-id` trong prompt.

Frontmatter điều khiển:

| Field | Ý nghĩa |
|---|---|
| `name` | Tên hiển thị; mặc định = ID từ path |
| `description` | Tóm tắt để model phát hiện; thiếu thì không được quảng cáo |
| `metadata.opencode/autoinvoke: false` | Ẩn khỏi danh sách của model (vẫn gọi tay được bằng ID) |
| `disable-model-invocation: true` | Cùng tác dụng; cả hai cùng đặt thì `autoinvoke` thắng |
| `license`, `compatibility` | V2 chấp nhận (portability) nhưng **không diễn giải** |

## Permissions cho skill

```jsonc
{ "permissions": [
  { "action": "skill", "resource": "*", "effect": "allow" },
  { "action": "skill", "resource": "internal-*", "effect": "deny" },
  { "action": "skill", "resource": "experimental-*", "effect": "ask" }
] }
```

| Effect | Hành vi |
|---|---|
| `allow` | Quảng cáo + nạp không cần duyệt |
| `ask` | Vẫn quảng cáo, nhưng nạp phải hỏi |
| `deny` | **Giấu khỏi model + chặn nạp** |

Rule theo thứ tự, **khớp cuối thắng**. Đặt cùng bộ rule dưới `agents.<id>.permissions` để chỉ áp cho 1 agent. Toàn bộ `policies` `integration.use` với `skill:<id>` cũng chặn được skill ở tầng cứng hơn — xem [09-permissions-policies.md](09-permissions-policies.md).

| `deny` | Giấu skill khỏi model + từ chối nạp |

**Vì sao quan trọng?** Bạn muốn team chỉ dùng skill chuẩn của công ty, không nhặt skill random từ internet — `deny` giấu chúng khỏi model.
**Nếu làm sai?** Đặt `deny *` rồi quên allow skill bạn cần → model không bao giờ thấy skill nào.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Gói kiến thức theo vụ | Skills (`.opencode/skills/`) | Agent Skills (`SKILL.md`, chuẩn 2026) | Skills (`.claude/skills/`) |
| Tương thích | đọc luôn `.claude/skills`, `.agents/skills` | port prompt→skill | đọc `AGENTS.md`-style tương tự |
| Catalog remote | HTTP `index.json` | marketplace/plugins | plugin/marketplace tùy bản |
| Cơ chế nạp | model gọi tool `skill` khi cần | theo agent config | tự động khi match |
| Permissions kiểm soát | `skill` action với ID | hạn chế hơn | hạn chế hơn |

## Lỗi thường gặp

### 1. Skill load nhầm / không thấy

```text
❌ SAI: file de sau 3 cap (skills/teams/release/SKILL.md) roi goi @git-release theo frontmatter name
✅ ĐÚNG: ID = release (ten thu muc cuoi, khong phai name); goi @release; muon ID dep thi giu dir = ID kebab-case
```
**Bài học:** ID từ path, `name` chỉ để trưng. Đặt dir = ID muốn gọi. Đừng bao giờ gọi skill bằng `name` nếu path không match.

### 2. Nhầm skill với AGENTS.md

```text
❌ SAI: dat moi thu vao AGENTS.md roi than "context day, model cham"
✅ ĐÚNG: AGENTS.md = luật chung (nạp mọi lần); skill = cẩm nang theo vụ (chỉ nạp khi gọi)
```
**Bài học:** AGENTS.md là luật phổ quát; chỉ quy trình đặc thù mới tách thành skill.

### 3. Quên tăng `version` sau khi sửa HTTP catalog

```text
❌ SAI: sua skill tren server, client van load ban cu
✅ ĐÚNG: tang "version": 3 -> "version": 4 trong index.json; V2 cache theo version
```
**Bài học:** HTTP catalog cache theo `version` — sửa file không đủ, phải bump version.

### 4. File supporting không nạp tự động

```text
❌ SAI: dat instructions vao references/ rồi cho model tu dong doc
✅ ĐÚNG: model chi biết base directory + danh sách mẫu 10 file; phải có chỉ dẫn "Read references/x" trong SKILL.md body
```
**Bài học:** `references/` không tự động đọc — skill body phải chỉ định rõ bằng `Read` tool hoặc lệnh shell.

## Best practices (kèm "vì sao")

- Mỗi skill 1 việc + `description` bắt đầu bằng **động từ** + khi nào dùng. **Vì sao?** Model match theo description; viết mơ hồ thì gọi nhầm. Ví dụ tốt: `"Prepare a release: bump version, generate changelog, create GitHub release"` — rõ việc, rõ điều kiện.
- Script/reference để cạnh `SKILL.md`, skill body chỉ giữ workflow. **Vì sao?** Body nạp vào context, file kèm chỉ đọc khi cần — nhẹ hơn nhiều.
- Gắn `autoinvoke: false` cho skill nội bộ (chỉ dùng tay `@skill-id`). **Vì sao?** Nếu model tự nhặt skill nội bộ (quy trình công ty), nó có thể dùng sai ngữ cảnh.
- Skill cho team đặt ở `~/.config/opencode/skills` hoặc catalog HTTP, không dính vào 1 repo cụ thể. **Vì sao?** Team dùng skill đó ở mọi repo mà không copy lại.
- Tên dir kebab-case, lowercase, không có khoảng trắng — trùng với `name` trong frontmatter để tránh nhầm. **Vì sao?** ID = tên dir, model gọi đúng thì không phải nhớ `name` hiển thị.

## Bài tập nhỏ

1. (15 phút) Viết skill `review-pr` (check correctness/security/tests + verdict), gọi `@review-pr` lên 1 diff thật. Sau đó thử gọi tên sai (không đúng ID) — xem model phản ứng ra sao.
2. (5 phút) Thử `autoinvoke: false` rồi gọi tay `@skill-id` và bằng mô tả mơ hồ — cảm nhận khác biệt giữa gọi tay và model tự nhặt.
3. (10 phút) Đặt 1 skill trùng ID với builtin (nếu có) ở project để xem precedence hoạt động thế nào.
4. (5 phút) Thử thêm 1 skill vào `skills[]` trong `opencode.jsonc` — đọc file đó từ `./team-skills`, verify nó xuất hiện trong `/models` hay agent.

## Reference

- Skills toàn bộ: https://opencode.ai/v2/docs/skills/ (verify 28/10/2026)
- Permissions `skill` action: https://opencode.ai/v2/docs/permissions/ (verify 28/10/2026)
- Policies `integration.use` (khóa skill): https://opencode.ai/v2/docs/policies/ (verify 28/10/2026)

## Đọc tiếp

- [05-agents-build-plan-custom.md](05-agents-build-plan-custom.md) — gắn permissions/agent vào skill workflow.
- [06-commands-slash-custom.md](06-commands-slash-custom.md) — khi nào dùng command thay vì skill.
- [09-permissions-policies.md](09-permissions-policies.md) — `deny` + `integration.use skill:<id>` khóa skill.
- [10-background-tasks.md](10-background-tasks.md) — skill gọi subagent chạy nền.
- [../03-cau-hoi-thuong-gap/05-agents-skills-faq.md](../03-cau-hoi-thuong-gap/05-agents-skills-faq.md) — FAQ agent/skill/command.

> **Chốt bài 07:** AGENTS.md giữ luật chung, skill giữ cẩm nang theo vụ — có description thì model tự tìm, không thì bạn gọi tay. Nhớ: ID từ path, name chỉ trưng.
