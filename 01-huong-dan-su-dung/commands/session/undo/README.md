# `/undo` — lùi checkpoint khi agent làm hỏng

> **Dành cho:** agent vừa sửa sai · **Đọc xong:** lùi 1 bước, prompt về composer để sửa (~2 phút)

## 1 câu nôm na

Như Ctrl+Z có trí nhớ — không chỉ lùi file mà còn lùi cả đoạn hội thoại dẫn tới sai lầm.

## Vì sao dùng `/undo`?

Agent sửa hỏng 5 files mà bạn cố sửa tiếp trong cùng hướng sai thì càng lún. `/undo` đưa prompt gốc về composer để bạn sửa yêu cầu rồi đi lại từ chỗ đúng.

## Khi nào dùng / khi nào đừng

- Dùng khi: agent hiểu sai, sửa sai file, hướng sai từ đầu.
- ĐỪNG dùng khi: chỉ sai 1 dòng nhỏ (sửa tay/command nhỏ nhanh hơn).

## Cách gọi (copy-paste)

```text
/undo
```
Phím tắt: `Ctrl+X` rồi `U`. Lỡ tay: `/redo`.

## Ví dụ thật

```text
Agent sua sai auth.ts -> /undo -> prompt ve composer
-> sua lai: "chi dung apps/api/src/auth/*, khong dung session.ts" -> Enter
```

**Kết quả mong đợi:** files về checkpoint trước đó, prompt cũ nằm sẵn để edit.
**✅ Verify:** `/diff` không còn thay đổi sai; files đúng như trước khi agent chạy.

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: agent sua sai 5 files van co keo them 10 prompt "sua lai giup"
✅ ĐÚNG: /undo ngay khi thay sai huong, sua prompt cho ro roi moi chay lai
```
**Bài học:** lùi sớm rẻ hơn chữa muộn.

## So sánh với Copilot / Claude Code

| Việc | OpenCode (`/undo`) | Copilot | Claude Code |
|---|---|---|---|
| Lùi thay đổi agent | `/undo` checkpoint | checkpoints/undo | undo tương tự |

## Best practices (kèm "vì sao")

- Sai hướng 2 lần liên tiếp → `/undo` + `/new` + đi qua `plan` trước. **Vì sao?** Lỗi lặp là lỗi ở yêu cầu, không phải ở code.

## Bài tập nhỏ

1. (5 phút) Cố ý bảo agent sửa sai 1 file rồi `/undo` — sờ lưới an toàn 1 lần cho nhớ tay.

## Tham khảo

- Anh em: [../redo/README.md](../redo/README.md) · Bài tổng: [../../11-sessions-undo-compaction.md](../../11-sessions-undo-compaction.md)

> Câu chốt: thấy sai hướng là `/undo` — đừng nuôi lỗi bằng thêm prompt.
