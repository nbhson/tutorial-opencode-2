# `/models` — đổi model giữa session

> **Dành cho:** việc lúc dễ lúc khó trong cùng session · **Đọc xong:** đổi não không mất context (~2 phút)

## 1 câu nôm na

Như đổi đầu bếp giữa bữa — món khai vị cần nhanh rẻ, món chính cần tay nghề cao, khách (context) vẫn ngồi nguyên bàn.

## Vì sao dùng `/models`?

Việc nhẹ (explain, summarize) không cần não đắt; kiến trúc khó cần não mạnh. Đổi giữa session thay vì `/new` giữ được context đang dở.

## Khi nào dùng / khi nào đừng

- Dùng khi: task đổi tính chất (research xong → code; code xong → review).
- ĐỪNG dùng khi: model hiện tại đã hợp — đổi liên tục làm output thiếu nhất quán.

## Cách gọi (copy-paste)

```text
/models
```
Phím tắt: `Ctrl+X` rồi `M`; `F2` xoay nhanh model gần đây. Gõ `/models` thấy list theo credentials + policies hiện tại của bạn.

## Ví dụ thật

```text
explore bang haiku (re) xong -> /models -> chon sonnet -> "code theo ban do vua ve"
```

**Kết quả mong đợi:** session tiếp tục, model mới trả lời từ turn sau.
**✅ Verify:** turn sau ghi đúng model mới (footer/TUI hiện tên model).

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: doi /models roi tuong config file cung doi theo
✅ ĐÚNG: session thang config file; muon doi mac dinh thi sua "model" trong opencode.jsonc
```
**Bài học:** `/models` là đổi bữa này, config là đổi thực đơn quán.

## So sánh với Copilot / Claude Code

| Việc | OpenCode (`/models`) | Copilot | Claude Code |
|---|---|---|---|
| Đổi não giữa việc | `/models` mọi provider | `/model` đổi GPT/Claude/Gemini | đổi model Anthropic tương tự |
| Model rẻ cho việc nhẹ | small_model + Zen Free | Auto tier rẻ | haiku cho nhẹ tương tự |

## Best practices (kèm "vì sao")

- Mặc định tầng giữa, hạ khi việc nhẹ, tăng khi tắc. **Vì sao?** 70% task không cần não đắt nhất — đổi đúng lúc là tiết kiệm trực tiếp.

## Bài tập nhỏ

1. (3 phút) `/models` đếm máy bạn thấy bao nhiêu model — ghi ra 3 cái sẽ dùng cho nhẹ/vừa/khó.

## Tham khảo

- Bài models: [../../04-models-zen-go-byok.md](../../04-models-zen-go-byok.md) · Anh em: [../agents/README.md](../agents/README.md)

> Câu chốt: đổi não theo việc, không theo thói quen — `/models` là cần số rẻ nhất trong TUI.
