# 14 — Worktree + Git + IDE/ACP (làm song song, không giẫm chân)

> **Dành cho:** người làm nhiều task song song / dùng editor khác · **Vấn đề:** 2 task chung 1 working tree là conflict + agent sửa nhầm · **Đọc xong:** dùng worktree isolation + `AGENTS.md` + ACP · **Thời gian:** ~12 phút.

## Mục tiêu

- Tạo/list/remove worktree qua Code Mode (`worktree_*`).
- Viết `AGENTS.md` tối thiểu (vì v2 chỉ đọc file này).
- Hiểu ACP (`opencode acp`) cho editor tích hợp.

## Khái niệm cốt lõi

### 1. Worktree isolation

Nhờ agent trong Code Mode: `worktree_create` (tạo cây Git riêng), `session_move`/`worktree` move session vào đó, `worktree_remove` dọn. Mỗi task 1 worktree + 1 session → không giẫm file nhau, `/undo` cũng an toàn hơn.

```text
Ban: "tao worktree cho feat/login, move session nay vao do roi code"
Agent: worktree_create -> session_move -> code + test trong worktree rieng
```

**Vì sao quan trọng?** Song song 3 features chung 1 tree = agent A sửa file agent B đang sửa. Worktree là vách ngăn vật lý.
**Nếu làm sai?** Task rủi ro cao (migration, refactor lớn) làm thẳng trên `main` — sai là mất đường lui.

### 2. `AGENTS.md` (file luật duy nhất v2 đọc)

V2 **chỉ** discover `AGENTS.md` (không fallback `CLAUDE.md`). Đặt ở root (và sub-dir nếu cần luật riêng). Nội dung tối thiểu: stack + lệnh dev/build/test đã chạy thử + quy ước không được phá (xem tips 01 + `templates/AGENTS.md`).

### 3. ACP cho editor (`opencode acp`)

`opencode acp` chạy Agent Client Protocol server qua stdin/stdout để editor (VS Code extension...) lái OpenCode v2 (fix vụ extension gọi `--port` cũ đã bị gỡ). IDE chỉ là mặt tiền — luật vẫn từ service.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Song song | git worktree + session riêng | worktrees + checkpoints | worktree tương tự |
| Luật repo | `AGENTS.md` duy nhất | `copilot-instructions.md` + `AGENTS.md` | `CLAUDE.md` |
| Editor lái agent | ACP (`opencode acp`) | extension chính chủ | extension/LSP |

## Lỗi thường gặp

```text
❌ SAI: de CLAUDE.md cu tu thoi Claude Code roi bao "sao OpenCode khong doc luat"
✅ ĐÚNG: doi/mirror sang AGENTS.md; giu 1 nguon that, con lai chi tro duong
```
**Bài học:** sai tên file = mù luật. V2 không đoán hộ bạn.

## Best practices (kèm "vì sao")

- Task >30 phút hoặc đụng schema/migration → worktree riêng. **Vì sao?** Rollback = xóa worktree, rẻ hơn revert commit lỗi.
- Extension VS Code báo lỗi ` --port`: update extension lên bản nói ACP v2. **Vì sao?** Flag cũ đã gỡ — cố dùng là fail.

## Bài tập nhỏ

1. (10 phút) Nhờ agent tạo worktree cho 1 task thử, code xong thì remove — đi hết vòng đời.
2. (5 phút) Viết `AGENTS.md` 15 dòng cho 1 repo thật (stack + 3 lệnh + 3 điều cấm).

> **Chốt bài 14 + cả nhóm 01:** worktree cách ly việc, AGENTS.md cách ly luật, ACP cách ly mặt tiền. Ba vách ngăn này là dáng pro của OpenCode 2.
