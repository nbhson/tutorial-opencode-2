# Tips 01 — `AGENTS.md` hygiene (context là bottleneck, không phải model)

> **Dành cho:** mọi repo dùng OpenCode · **Vấn đề:** `AGENTS.md` 200 dòng nhồi mọi thứ → context nào cũng đầy · **Đọc xong:** viết `AGENTS.md` ≤40 dòng + đẩy chi tiết sang skills · **Thời gian:** ~10 phút.

## Mục tiêu

- Viết `AGENTS.md` gọn: stack + lệnh đã thử + 3–5 điều cấm + trỏ skills.
- Biết cái gì thuộc `AGENTS.md` vs skill vs command.

## Khái niệm cốt lõi

**1 câu:** `AGENTS.md` là luật nạp **mọi lần** — càng gọn càng rẻ; chi tiết theo vụ đẩy sang skills.

**Nôm na:** AGENTS.md như bảng nội quy dán cửa (ai vào cũng đọc) — dán cả cuốn sổ tay 50 trang lên cửa thì không ai đọc.

**Vì sao quan trọng?** V2 chỉ đọc `AGENTS.md` (không fallback `CLAUDE.md` — verify: docs/instructions, ngày 28/10/2026) — file này mù là agent mù. Nó được ghép vào **mọi model request**, nên mỗi dòng thừa là tiền lặp lại mỗi lượt.
**Nếu làm sai?** 2 repo 2 `AGENTS.md` mâu thuẫn (1 bảo npm, 1 bảo pnpm) khi mở nested → agent chạy bừa. Docs ghi rõ: OpenCode **ghép file chứ không phân xử mâu thuẫn** — rule nào sai, agent tin rule đó.

### Ba ngăn xếp: thứ gì để ở đâu

| Nội dung | Để đâu | Vì sao |
|---|---|---|
| Stack, 3 lệnh, điều cấm | `AGENTS.md` gốc | Nạp mọi lần, phải ≤40 dòng |
| Luật riêng 1 thư mục | `AGENTS.md` trong thư mục đó | Nạp khi agent đọc vùng đó, không tốn trước |
| Checklist dài theo vụ | `.opencode/skills/<id>/SKILL.md` | Chỉ load khi đúng việc (qua tool `skill`) |
| Prompt chạy nhanh | `.opencode/commands/<ten>.md` | Gõ `/ten` chứ không chiếm context nền |

## Ví dụ copy-paste

### 1. Mẫu 15 dòng dùng được ngay (xem `templates/AGENTS.md`)

```md
# Project X — AGENTS.md
Stack: Node 22 + pnpm + Postgres. Chay moi thu qua `pnpm --filter api ...`.
Lenh: dev `pnpm dev`, test `pnpm test`, lint `pnpm lint`. Chi tin test xanh tren may.
Cam: khong push main truc tiep; khong doc .env; migration phai co rollback.
Skills: release -> @git-release; review -> @review-pr.
```

### 2. Luật riêng cho thư mục con (`packages/web/AGENTS.md`)

```md
# AGENTS.md — packages/web
Chi sua code trong thu muc nay. Component moi phai co test .*/*.test.tsx.
Chay `pnpm --filter web test` truoc khi bao xong.
```

**Vì sao?** Docs: file nested chỉ nạp khi agent đọc tới vùng đó (nearest-first) — đặt gần code thì luật "thắng" đúng lúc, và không đè context của repo khác.

### 3. Bổ sung luật mà không sửa `AGENTS.md` — qua config

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["docs/guidelines/*.md", "CONTRIBUTING.md"]
}
```

**Vì sao?** `instructions` nạp thêm file/glob/URL cạnh `AGENTS.md` — dùng cho luật dài theo chủ đề mà không muốn nhét vào AGENTS.md gốc.

## Ví dụ: tách 200 dòng thành 30 + 2 skills

- Giữ: stack, 3 lệnh, 5 cấm, 2 trỏ skill.
- Đẩy `release 80 dòng` → skill `git-release`; `review checklist 60 dòng` → skill `review-pr`.

Skill load theo yêu cầu, không nền:

```md title=".opencode/skills/review-pr/SKILL.md"
---
name: Review PR
description: Checklist review PR theo chuan team - dung khi duoc hoi review code
---

## Checklist
1. Ten branch + commit message dung convention.
2. Moi API moi co test. Chay `pnpm test` truoc khi bao ket qua.
3. Khong commit secret; env moi phai cap nhat .env.example.
```

Gọi thẳng khi cần: gõ `@review-pr` trong prompt — model cũng tự load nếu `description` khớp việc.

## Walkthrough theo phút (10 phút)

- **0–2′** Đếm dòng `AGENTS.md` hiện tại: `wc -l AGENTS.md`. Gạch đầu dòng nào chưa từng giúp agent → đánh dấu cắt.
- **2–4′** Chạy thử **từng lệnh** còn giữ lại (npm vs pnpm sai 1 chữ là agent chạy sai suốt ngày).
- **4–6′** Cắt: nhóm checklist dài nhất thành `.opencode/skills/<id>/SKILL.md` (frontmatter `name` + `description`).
- **6–8′** Kiểm tra nested: đặt file `AGENTS.md` ở 1 thư mục con có luật riêng.
- **8–10′** Chạy kiểm tra hiểu luật:
  ```bash
  opencode run "doc AGENTS.md va liet ke: stack, lenh chinh, dieu cam. Khong lam gi khac."
  ```
  So output với file gốc — sai chỗ nào là chỗ bạn viết chưa rõ.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Luật luôn nạp | `AGENTS.md` (chỉ nhận file này, verify 28/10/2026) | `copilot-instructions.md` + `AGENTS.md` | `CLAUDE.md` |
| Cẩm nang theo vụ | skills (`.opencode/skills/`) | Skills | skills (`.claude/skills`) |
| Đọc file của "hàng xóm" | Không fallback `CLAUDE.md` — repo trộn 2 file sẽ mất luật | — | — |

## Lỗi thường gặp

### 1. Lệnh chép từ repo cũ

```text
❌ SAI: AGENTS.md ghi "chay npm test" trong khi repo dung pnpm (copy tu repo cu)
✅ ĐÚNG: moi lenh trong AGENTS.md phai chay tay 1 lan truoc khi ghi
```
**Bài học:** luật sai còn tệ hơn không luật — agent tin bạn tuyệt đối.

### 2. Sửa `AGENTS.md` nested mà kỳ vọng áp dụng ngay

```text
❌ SAI: sua .opencode/skills/../AGENTS.md thu muc con xong hoi ngay "lam theo luat moi"
✅ ĐÚNG: bat session moi, hoac sua file AGENTS.md phat hien tu dau (global/cap tren)
```
**Bài học:** docs ghi rõ — nested file nạp 1 lần vào phiên; sửa xong nên mở session mới.

## Best practices (kèm "vì sao")

- Mỗi rule Miss 2 lần → mới đưa vào `AGENTS.md`. **Vì sao?** Luật sinh từ lỗi thật mới đáng context.
- Sub-dir có luật riêng thì đặt `AGENTS.md` ở đó. **Vì sao?** Discovery từ cwd lên root — luật gần thắng.
- Không ghi trạng thái ("đang migrate sang X") vào AGENTS.md. **Vì sao?** Trạng thái hết hạn trong 1 tuần, luật sai gây hiểu nhầm lâu hơn không luật.

## Bài tập nhỏ

1. (10 phút) Rút gọn `AGENTS.md` 1 repo thật xuống ≤40 dòng, chạy `opencode run "tom tat luat repo"` xem agent hiểu đúng không. Kết quả đạt: `wc -l` ≤ 40 **và** agent liệt kê đúng đủ 3 lệnh + điều cấm khi so với file.

> **Chốt tips 01:** cửa chỉ dán nội quy, sổ tay để trong tủ (skills). Gọn là rẻ, rẻ là nhanh.

Reference: [instructions](https://opencode.ai/v2/docs/instructions/), [skills](https://opencode.ai/v2/docs/skills/) — verify 28/10/2026, v2.2.0.
