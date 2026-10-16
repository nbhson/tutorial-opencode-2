# `/review` — mẫu command tự tạo (đóng gói workflow lặp)

> **Dành cho:** việc lặp ≥3 lần/tuần · **Đọc xong:** tự tạo 1 slash của riêng bạn (~10 phút)

## 1 câu nôm na

Như món tủ đặt 1 câu là có — thay vì đọc công thức 10 dòng mỗi lần review, gọi `/review` là xong.

## Vì sao dùng command tự tạo?

Prompt hay nằm rải rác trong history thì mỗi lần 1 kiểu, chất lượng bấp bênh. Đóng gói thành `/tên` thì cả team gọi 1 kiểu.

## Khi nào dùng / khi nào đừng

- Dùng khi: review/test/release theo checklist cố định, việc lặp weekly.
- ĐỪNG dùng khi: việc chỉ làm 1 lần (gõ thẳng nhanh hơn, đỡ rác list `/`).

## Cách gọi (copy-paste)

File `.opencode/commands/review.md` (project) hoặc `~/.config/opencode/commands/` (global):

```md
---
description: Review staged changes for correctness and missing tests
---
Review `git diff --staged`. List findings in severity order.
Check: correctness, security (secrets, injection), missing tests.
End with: MERGE or FIX-FIRST verdict + re-verify command.
```

```text
/review
```

## Ví dụ thật

```text
git add -p
/review
-> nhan: 3 findings (1 missing test) + verdict FIX-FIRST + lenh chay lai
```

**Kết quả mong đợi:** output theo đúng khung file định nghĩa.
**✅ Verify:** checklist cuối có verdict + lệnh verify chạy được (không phải văn mẫu).

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: viet 20 commands it dung, dat ten chung chung (do.md, check.md)
✅ ĐÚNG: chi dong goi viec lap that; ten kebab ro viec (review-pr.md) + description 1 dong
```
**Bài học:** command không ai nhớ tên thì chết trong list `/`.

## So sánh với Copilot / Claude Code

| Việc | OpenCode (`/review` custom) | Copilot | Claude Code |
|---|---|---|---|
| Slash tự tạo | `.opencode/commands/*.md` | prompt files (legacy) / Skills | `.claude/commands/` |
| Prompt MCP thành slash | `/<server>:<prompt>` | tương tự MCP prompts | tương tự |

## Best practices (kèm "vì sao")

- Command kết thúc bằng verdict + lệnh verify. **Vì sao?** Không có verify thì command chỉ là văn mẫu đẹp.
- Việc ồn ào trong command thì gọi subagent (`dùng explore thu thập rồi review`). **Vì sao?** Session chính giữ quyết định.

## Bài tập nhỏ

1. (10 phút) Tạo `/review` từ mẫu, chạy lên 1 diff thật, so với prompt tay lần trước.
2. (5 phút) Tạo thêm `/summarize-branch` (5 gạch về branch hiện tại).

## Tham khảo

- Bài commands: [../../06-commands-slash-custom.md](../../06-commands-slash-custom.md) · Template: [../../../../templates/.opencode/commands/review.md](../../../../templates/.opencode/commands/review.md)

> Câu chốt: việc lặp thì đóng gói thành `/` — đừng để prompt hay chết trong history.
