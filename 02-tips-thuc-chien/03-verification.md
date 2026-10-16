# Tips 03 — Verification (không agent nào tự chịu đúng/sai)

> **Dành cho:** người merge code agent viết · **Vấn đề:** tin diff đẹp mắt mà không chạy gì · **Đọc xong:** bắt mọi task kết thúc bằng lệnh verify xanh · **Thời gian:** ~10 phút.

## Quy tắc

Mọi task phải có **lệnh verify chạy được trên máy** (test/lint/typecheck/build), không chấp nhận "em nghĩ là đúng".

```text
Prompt mau: "Sau khi sua, chay `pnpm test auth && pnpm lint`. Chi bao xong khi ca hai xanh. Dan output."
```

Kết hợp: `/diff` review + `/undo` khi đỏ + command `/review` gói sẵn checklist.

**Vì sao quan trọng?** V2 không chạy LSP/diagnostics — agent không có lưới an toàn ngôn ngữ. Lưới duy nhất là lệnh của bạn.
**Nếu làm sai?** Merge code "nhìn đúng" mà test đỏ → nợ kỹ thuật mang tên agent.

## So sánh

| Việc | OpenCode 2 | Copilot / Claude |
|---|---|---|
| Ai verify | bạn (chạy test) | bạn (chạy test) — không agent nào chịu thay |

## Lỗi thường gặp

```text
❌ SAI: agent bao "da test" nhung khong dan output
✅ ĐÚNG: bat dan output + chay lai 1 lenh quan trong nhat bang tay
```
**Bài học:** "đã test" không có output = chưa test.

## Bài tập nhỏ

1. (10 phút) Thêm dòng verify vào 2 commands hay dùng nhất của bạn.

> **Chốt tips 03:** không xanh thì chưa xong. Verify là chữ ký nghiệm thu, không phải thủ tục.
