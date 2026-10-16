# Tips 06 — Tiết kiệm tiền model (não đắt chỉ cho việc khó)

> **Dành cho:** người trả bill · **Vấn đề:** mọi task đều sonnet/opus đắt nhất · **Đọc xong:** phân tầng model + set limit + dùng Free khi được · **Thời gian:** ~10 phút.

## Ba tầng

| Tầng | Model ví dụ | Việc |
|---|---|---|
| Rẻ (haiku/Free Zen) | explain, summarize, explore, research nền | 70% task |
| Giữa (sonnet) | code + review thường | 25% task |
| Đắt (opus/mạnh nhất) | kiến trúc khó, bug hiểm | 5% task |

```jsonc
{ "model": "anthropic/claude-sonnet-4-5", "small_model": "anthropic/claude-haiku-4-5" }
```

- Session: `Ctrl+X M` / `F2` đổi nhanh; background research ép model rẻ.
- Zen: bật Free models cho task nhẹ; set monthly + per-member limit ngày đầu; cân nhắc tắt auto-reload nếu team chưa kỷ luật.
- Go/Go Plus: nhớ hạn mức $/model/tháng — hết là đứng dù còn ngày.

**Vì sao quan trọng?** Bill agent = số tokens × giá — mà 70% tokens là việc nhẹ không cần não đắt.

## Lỗi thường gặp

```text
❌ SAI: de mac dinh model dat nhat cho ca tuan "cho chac"
✅ ĐÚNG: mac dinh tam trung, ha xuong khi viec nhe, chi tang khi tac
```
**Bài học:** "cho chắc" là cách đốt tiền êm nhất.

## Bài tập nhỏ

1. (1 tuần) 1 ngày chỉ dùng tầng rẻ cho mọi việc nhẹ — cuối ngày so bill/cảm nhận.

> **Chốt tips 06:** rẻ là mặc định, đắt là ngoại lệ có lý do. Limit set trước, bill xem hàng tuần.
