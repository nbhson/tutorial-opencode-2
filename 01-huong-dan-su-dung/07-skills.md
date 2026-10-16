# 07 — Skills (`SKILL.md`: kiến thức nạp khi cần, không nhồi prompt)

> **Dành cho:** người có quy trình nội bộ (release, migration, review chuẩn) · **Vấn đề:** nhồi mọi quy ước vào `AGENTS.md` làm context phình · **Đọc xong:** viết skill có `description` để model tự phát hiện + tự nạp · **Thời gian:** ~15 phút.

## Mục tiêu

- Viết `SKILL.md` + scripts/references đi kèm.
- Hiểu discovery (global/project/compat/HTTP catalog) + precedence.
- Gắn `skill` permissions + gọi tay `@skill-id`.

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

### 2. Discovery + precedence (ai thắng ai)

| Scope | Nguồn |
|---|---|
| Global | `~/.config/opencode/skills` (+ compat `~/.claude/skills`, `~/.agents/skills`) |
| Project | `.opencode/skills` (+ compat `.claude/skills`, `.agents/skills`), quét từ cwd lên root |
| Mở rộng | `skills: ["./team-skills", "~/shared/skills", "https://example.com/skills/"]` trong config |

Hai dạng file: `skills/review.md` (flat, ID = tên file) hoặc `skills/git-release/SKILL.md` (dir, ID = tên thư mục). **ID từ path, phân biệt hoa thường** — frontmatter `name` chỉ là label hiển thị.

Trùng ID → nguồn đăng ký **sau thắng**: builtin → `.claude` → `.agents` → global → project (root→cwd) → `skills[]` config. HTTP catalog cần `index.json` + tăng `version` khi đổi file.

### 3. Permissions cho skill

```jsonc
{ "permissions": [
  { "action": "skill", "resource": "*", "effect": "allow" },
  { "action": "skill", "resource": "internal-*", "effect": "deny" },
  { "action": "skill", "resource": "experimental-*", "effect": "ask" }
] }
```

`deny` = giấu khỏi model + chặn load. Muốn skill chỉ đọc tay: `metadata.opencode/autoinvoke: false` (vẫn load được khi gọi ID tường minh).

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Gói kiến thức theo vụ | Skills (`.opencode/skills/`) | Agent Skills (`SKILL.md`, chuẩn 2026) | Skills (`.claude/skills/`) |
| Tương thích | đọc luôn `.claude/skills`, `.agents/skills` | port prompt→skill | đọc `AGENTS.md`-style tương tự |
| Catalog remote | HTTP `index.json` | marketplace/plugins | plugin/marketplace tùy bản |

## Lỗi thường gặp

### 1. Skill load nhầm / không thấy

```text
❌ SAI: file de sau 3 cap (skills/teams/release/SKILL.md) roi goi @git-release theo frontmatter name
✅ ĐÚNG: ID = release (ten thu muc cuoi, khong phai name); goi @release; muon ID dep thi giu dir = ID kebab-case
```
**Bài học:** ID từ path, `name` chỉ để trưng. Đặt dir = ID muốn gọi.

## Best practices (kèm "vì sao")

- Mỗi skill 1 việc + `description` bắt đầu bằng động từ + khi nào dùng. **Vì sao?** Model match theo description; viết mơ hồ thì gọi nhầm.
- Script/reference để cạnh `SKILL.md`, skill body chỉ giữ workflow. **Vì sao?** Body nạp vào context, file kèm chỉ đọc khi cần — nhẹ hơn nhiều.

## Bài tập nhỏ

1. (15 phút) Viết skill `review-pr` (check correctness/security/tests + verdict), gọi `@review-pr` lên 1 diff thật.
2. (5 phút) Thử `autoinvoke: false` rồi gọi tay — cảm nhận khác biệt.

> **Chốt bài 07:** AGENTS.md giữ luật chung, skill giữ cẩm nang theo vụ. Có description thì model tự tìm, không thì bạn gọi tay.
