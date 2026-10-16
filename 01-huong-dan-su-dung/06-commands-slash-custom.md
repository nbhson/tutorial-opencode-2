# 06 — Commands (slash tái dùng, khỏi gõ lại prompt dài)

> **Dành cho:** người lặp đi lặp lại 1 prompt · **Vấn đề:** mỗi lần review/test/release lại gõ lại đoạn prompt 10 dòng · **Đọc xong:** tạo `/review` của riêng bạn + truyền args · **Thời gian:** ~10 phút.

## Mục tiêu

- Tạo command markdown ở global vs project.
- Gọi `/ten` + truyền args.
- Biết command khác skill/agent ở đâu.

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

Gọi trong TUI: `/review`. Scope: `~/.config/opencode/commands/` (mọi project) vs `.opencode/commands/` (project này). Discovery quét từ cwd lên root như agents.

**Vì sao quan trọng?** Workflow lặp (review, viết test theo mẫu, release notes...) mà không đóng gói thì mỗi lần prompt một kiểu, chất lượng bấp bênh.
**Nếu làm sai?** Nhồi 20 commands ít dùng vào project → list `/` dài, model phân tâm. Chỉ đóng gói việc lặp ≥3 lần/tuần.

### Command vs Skill vs Agent

| Cái | Dùng khi | Ví dụ |
|---|---|---|
| Command | bạn **chủ động gọi**, workflow cố định | `/review`, `/write-tests` |
| Skill | model **tự thấy + tự nạp** khi liên quan (có `description`) | skill `git-release` |
| Agent | **vai diễn** có model + permissions riêng | `reviewer` subagent |

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Slash tự tạo | `.opencode/commands/*.md` | prompt files (legacy) / Skills | `.claude/commands/` |
| Gọi | `/ten` trong TUI | `/ten` trong Chat | `/ten` trong terminal |

## Lỗi thường gặp

```text
❌ SAI: viet command khong co description, dat ten chung chung (do.md)
✅ ĐÚNG: ten kebab ro viec (review-pr.md), description 1 dong noi khi nao goi
```
**Bài học:** command không tên rõ = không ai nhớ để gọi.

## Best practices (kèm "vì sao")

- Command kết thúc bằng **verdict + checklist verify** (test nào phải xanh). **Vì sao?** Không có verify thì command chỉ là văn mẫu.
- Command gọi subagent cho việc ồn ào (`dùng explore thu thập context rồi review`). **Vì sao?** Session chính giữ quyết định, việc càn quét để subagent.

## Bài tập nhỏ

1. (10 phút) Tạo `/review` như mẫu, chạy lên 1 PR thật, so chất lượng với prompt tay.
2. (5 phút) Tạo `/summarize-branch` in 5 gạch đầu dòng về branch hiện tại.

> **Chốt bài 06:** việc lặp thì đóng gói thành `/`. Đừng để prompt hay nằm rải rác trong lịch sử chat.
