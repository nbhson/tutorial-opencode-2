# Tips 05 — Code Mode hiệu quả (đừng gọi lẻ khi gộp được)

> **Dành cho:** người dùng ≥2 MCP tools/task · **Vấn đề:** 20 calls lẻ = 20 round-trips · **Đọc xong:** ra lệnh gộp script + debug theo server · **Thời gian:** ~10 phút.

## Công thức ra lệnh

```text
"Dung Code Mode gop thanh 1 script: search 5 issues sentry moi nhat, voi moi issue lay chi tiet + dem comments. Tra ve bang."
```

- Gom theo server trước,跨 server sau (dễ debug).
- Script fail → thu hẹp: chạy 1 server trước, pass mới mở rộng.
- Tool nào bắt buộc native mới `codemode: false` riêng nó.

**Vì sao quan trọng?** Mỗi round-trip là tiền + latency + cơ hội model quên. Gộp 20→1 là thắng 3 mặt.

## Lỗi thường gặp

```text
❌ SAI: bat agent goi 10 tools lan luot roi hoi "sao lau the"
✅ ĐÚNG: mo dau task da noi "gop Code Mode", cuoi task dem so round-trip
```
**Bài học:** mặc định agent có thể gọi lẻ cho "chắc" — bạn phải chỉ đích danh gộp.

## Bài tập nhỏ

1. (10 phút) Lấy 1 task 3+ tool calls, chạy 2 cách (lẻ vs gộp) — so latency + output.

> **Chốt tips 05:** thấy ≥3 calls là nghĩ gộp. Code Mode là xe tải — đừng chở từng gói bằng xe máy.
