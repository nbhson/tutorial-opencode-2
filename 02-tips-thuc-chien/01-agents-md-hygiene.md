# Tips 01 — `AGENTS.md` hygiene (context là bottleneck, không phải model)

> **Dành cho:** mọi repo dùng OpenCode · **Vấn đề:** `AGENTS.md` 200 dòng nhồi mọi thứ → context nào cũng đầy · **Đọc xong:** viết `AGENTS.md` ≤40 dòng + đẩy chi tiết sang skills · **Thời gian:** ~10 phút.

## Mục tiêu

- Viết `AGENTS.md` gọn: stack + lệnh đã thử + 3–5 điều cấm + trỏ skills.
- Biết cái gì thuộc `AGENTS.md` vs skill vs command.

## Khái niệm cốt lõi

**1 câu:** `AGENTS.md` là luật nạp **mọi lần** — càng gọn càng rẻ; chi tiết theo vụ đẩy sang skills.

**Nôm na:** AGENTS.md như bảng nội quy dán cửa (ai vào cũng đọc) — dán cả cuốn sổ tay 50 trang lên cửa thì không ai đọc.

Mẫu 15 dòng dùng được ngay (xem `templates/AGENTS.md`):

```md
# Project X — AGENTS.md
Stack: Node 22 + pnpm + Postgres. Chay moi thu qua `pnpm --filter api ...`.
Lenh: dev `pnpm dev`, test `pnpm test`, lint `pnpm lint`. Chi tin test xanh tren may.
Cam: khong push main truc tiep; khong doc .env; migration phai co rollback.
Skills: release -> @git-release; review -> @review-pr.
```

**Vì sao quan trọng?** V2 chỉ đọc `AGENTS.md` (không fallback `CLAUDE.md`) — file này mù là agent mù.
**Nếu làm sai?** 2 repo 2 `AGENTS.md` mâu thuẫn (1 bảo npm, 1 bảo pnpm) khi mở nested → agent chạy bừa.

## Ví dụ: tách 200 dòng thành 30 + 2 skills

- Giữ: stack, 3 lệnh, 5 cấm, 2 trỏ skill.
- Đẩy `release 80 dòng` → skill `git-release`; `review checklist 60 dòng` → skill `review-pr`.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Luật luôn nạp | `AGENTS.md` | `copilot-instructions.md` + `AGENTS.md` | `CLAUDE.md` |
| Cẩm nang theo vụ | skills | Skills | skills |

## Lỗi thường gặp

```text
❌ SAI: AGENTS.md ghi "chay npm test" trong khi repo dung pnpm (copy tu repo cu)
✅ ĐÚNG: moi lenh trong AGENTS.md phai chay tay 1 lan truoc khi ghi
```
**Bài học:** luật sai còn tệ hơn không luật — agent tin bạn tuyệt đối.

## Best practices (kèm "vì sao")

- Mỗi rule Miss 2 lần → mới đưa vào `AGENTS.md`. **Vì sao?** Luật sinh từ lỗi thật mới đáng context.
- Sub-dir có luật riêng thì đặt `AGENTS.md` ở đó. **Vì sao?** Discovery từ cwd lên root — luật gần thắng.

## Bài tập nhỏ

1. (10 phút) Rút gọn `AGENTS.md` 1 repo thật xuống ≤40 dòng, chạy `opencode run "tom tat luat repo"` xem agent hiểu đúng không.

> **Chốt tips 01:** cửa chỉ dán nội quy, sổ tay để trong tủ (skills). Gọn là rẻ, rẻ là nhanh.
