# Tips 04 — Parallel background (song song mà không giẫm chân)

> **Dành cho:** người ôm ≥2 việc cùng lúc · **Vấn đề:** spawn nền bừa → conflict file · **Đọc xong:** chia việc độc lập + mỗi nền 1 owner/output · **Thời gian:** ~10 phút.

## Mục tiêu

- Chọn đúng việc đưa ra nền, việc nào giữ ở session chính.
- Đặt tên + pham vi + output cho mỗi nền để tổng hợp không lộn.

## Ma trận chia việc

| Cho ra nền | Giữ ở chính |
|---|---|
| research (explore), review (general/reviewer), test suite, thám thính docs | quyết định, sửa file tranh chấp, merge cuối |

**Vì sao quan trọng?** Background chỉ nhanh khi việc độc lập; việc coupled mà song song thì gộp lại lâu hơn làm tuần tự. Nền (subagent) có fresh context — nó không biết bạn vừa quyết gì ở chính.
**Nếu làm sai?** 2 nền cùng sửa `auth.ts` → last-write-wins, mất code. Giữa các subagent không có khóa file.

## Ví dụ copy-paste

### 1. Ra lệnh phân việc ngay trong TUI

```text
Tot: "background explore ve ban do payments; background general review diff login; toi sua auth o session chinh"
Te: "3 background cung sua 3 file chung auth.ts"
```

### 2. Command chạy nền định sẵn (không cần nhớ cú pháp)

```md title=".opencode/commands/audit-bg.md"
---
description: Audit diff hien tai trong nen, khong cham code
agent: general
subagent: true
---

Audit $ARGUMENTS for bugs and missing tests.
Khong sua file. Tra ve danh sach findings theo muc do nghiem trong.
```

`subagent: true` → command chạy trong **child session nền**; parent vẫn dùng được, kết quả child gửi về khi xong (verify docs/commands, 28/10/2026).

### 3. Worktree riêng cho mỗi nền đụng code

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "worktree": { "directory": "../worktrees" }
}
```

Khi task nền đụng file trùng task chính, chuyển session sang worktree riêng (session move / worktree dialog, `<leader>l` hoặc dialog move) — rollback = xóa worktree, repo chính sạch bóng.

## Phím cần nhớ (verify docs/cli/keybinds, 28/10/2026)

| Phím | Tác dụng |
|---|---|
| `ctrl+b` (`session.background`) | Đưa tool đang block xuống nền, làm tiếp việc khác |
| `<leader>l` | Danh sách session — xem nền nào xong |
| `alt+shift+down/up` | Nhảy tới session tab chưa đọc tiếp theo |
| `down` (khi có child) | Mở subagent picker xem con nào đang chạy |

## Walkthrough theo phút (10 phút)

- **0–2′** Liệt kê việc trong đầu, xếp 2 cột: độc lập (nền) vs quyết định/sửa code (chính).
- **2–4′** Spawn nền: 1 explore "ban do module payments" + 1 review diff "general review login". Nền nào cũng ghi rõ phạm vi + output mong muốn.
- **4–6′** Làm việc chính ở session tab hiện tại; nền chạy, bạn không phải đợi.
- **6–8′** Ctrl+B nếu tool nào đang block; `<leader>l` xem nền nào xong.
- **8–10′** Tổng hợp: mỗi nền 1 tóm tắt 5 gạch; so tổng thời gian với làm tuần tự — ghi lại con số thật (thường 2 nền độc lập tiết kiệm ~30–50% wall time, số của bạn mới là chuẩn).

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Chạy việc phụ nền | subagent/background (ctrl+b, command `subagent: true`) | — (chính 1 luồng) | background bash / Task tool |
| Sửa file song song an toàn | worktree riêng mỗi nền | không tương đương | worktree tự quản |

## Lỗi thường gặp

### 1. Nền không nhãn

```text
❌ SAI: spawn 3 nen roi khong dat ten/output, luc xong khong biet dua nao lam gi
✅ ĐÚNG: moi nen: ten + pham vi + output (file/tom tat 5 gach)
```
**Bài học:** song song không nhãn = hỗn loạn có tổ chức.

### 2. Đưa việc coupled ra nền

```text
❌ SAI: 2 nen sua cung 1 file vi "chay nhanh hon"
✅ ĐÚNG: gop thanh 1 task o session chinh, hoac cho moi nen 1 worktree rieng
```
**Bài học:** tranh chấp file thì xếp hàng — song song chỉ dành cho việc thật sự độc lập.

## Best practices (kèm "vì sao")

- Nền = thu thập, chính = quyết định. **Vì sao?** Explore/review chỉ đọc — không thể giẫm chân nhau.
- Mỗi nền yêu cầu output dạng file hoặc tóm tắt 5 gạch. **Vì sao?** Đọc 5 gạch nhanh hơn đọc lại 50 tool calls.
- Đụng code chung → worktree. **Vì sao?** Isolate rẻ hơn merge conflict.

## Bài tập nhỏ

1. (10 phút) Chạy 2 nền độc lập (1 explore + 1 review) + 1 việc chính, bấm giờ tổng; sau đó làm lại tuần tự cùng 3 việc. Kết quả đạt: có con số so sánh thực tế (vd: song song 12′ vs tuần tự 20′) và không có file nào bị 2 nền sửa.

> **Chốt tips 04:** nền thu thập, chính quyết định. Độc lập thì song song, tranh chấp thì xếp hàng.

Reference: [commands subagent](https://opencode.ai/v2/docs/commands/), [agents](https://opencode.ai/v2/docs/agents/), [keybinds](https://opencode.ai/v2/docs/cli/keybinds/) — verify 28/10/2026, v2.2.0.
