# `/agents` — đổi agent primary giữa session

> **Dành cho:** chuyển pha plan ↔ build · **Đọc xong:** đổi vai không mất context (~2 phút)

## 1 câu nôm na

Như đổi mũ bảo hộ trên công trường — lúc cần kiến trúc sư (plan), lúc cần đội thi công (build), người vẫn là đội đó.

## Vì sao dùng `/agents`?

Quy trình chuẩn là plan → duyệt → build trong cùng task. `/agents` đổi vai ngay trong session, giữ nguyên context bản vẽ vừa duyệt.

## Khi nào dùng / khi nào đừng

- Dùng khi: chuyển pha (duyệt plan xong → build; build lạc → plan lại).
- ĐỪNG dùng khi: cần việc ồn ào (research/review) — cái đó gọi subagent trong prompt, không phải đổi ghế chính.

## Cách gọi (copy-paste)

```text
/agents
```
Phím tắt: `Shift+Tab` xoay vòng. Thấy `build`/`plan` + custom primary của bạn.

## Ví dụ thật

```text
Shift+Tab sang plan: "ve plan refactor auth" -> duyet xong
Shift+Tab sang build: "lam phase 1 theo plan vua duyet"
```

**Kết quả mong đợi:** agent mới tiếp tục đúng context cũ.
**✅ Verify:** sang `plan` rồi bảo "sửa file" — nó phải từ chối/khuyên (read-only).

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: doi sang plan roi tuong model cung doi theo
✅ ĐÚNG: agent = vai, model = nao; doi nao bang /models rieng
```
**Bài học:** đổi mũ không đổi đầu.

## So sánh với Copilot / Claude Code

| Việc | OpenCode (`/agents`) | Copilot | Claude Code |
|---|---|---|---|
| Đổi persona | `/agents`, Shift+Tab | Ask/Edit/Agent switch | subagent/model switch tương tự |

## Best practices (kèm "vì sao")

- Mỗi lần đổi pha nói rõ 1 câu ("giờ là build phase 1 theo plan trên"). **Vì sao?** Agent không tự biết bạn đổi pha để làm gì — nói ra thì nó mới theo.

## Bài tập nhỏ

1. (5 phút) Trong 1 session: plan 1 việc nhỏ → `/agents` sang build làm → cảm nhận context được giữ.

## Tham khảo

- Bài agents: [../../05-agents-build-plan-custom.md](../../05-agents-build-plan-custom.md)

> Câu chốt: plan vẽ, build làm — `/agents` là công tắc chuyển pha.
