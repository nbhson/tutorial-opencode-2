# `/redo` — tiến lại sau khi undo nhầm

> **Dành cho:** undo xong tiếc · **Đọc xong:** khôi phục đúng 1 bước (~1 phút)

## 1 câu nôm na

Như Ctrl+Shift+Z — undo nhầm thì tiến lại, khỏi làm lại từ đầu.

## Vì sao dùng `/redo`?

`/undo` lùi cả hội thoại; nếu nhận ra bản vừa lùi thực ra đúng (vd prompt cũ hay hơn), `/redo` khôi phục thay vì gõ lại.

## Khi nào dùng / khi nào đừng

- Dùng khi: vừa `/undo` và muốn lấy lại.
- ĐỪNG dùng khi: đã gửi prompt mới sau undo (lúc này revert đã được chấp nhận, đi tiếp thay vì redo).

## Cách gọi (copy-paste)

```text
/redo
```
Phím tắt: `Ctrl+X` rồi `R`.

## Ví dụ thật

```text
/undo  -> "oi ban vua lui dung roi" -> /redo -> cong viec hien lai
```

**Kết quả mong đợi:** đúng trạng thái trước `/undo`.
**✅ Verify:** `/diff` hiện lại thay đổi vừa mất.

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: undo -> gui prompt moi -> doi redo lay lai ban cu
✅ ĐÚNG: gui prompt moi = chap nhan revert; muon ban cu thi mo lai lich su/diff chep tay
```
**Bài học:** redo chỉ sống trước khi bạn đi tiếp. Đi rồi thì đường cũ khép lại.

## So sánh

| Việc | OpenCode (`/redo`) | Copilot / Claude |
|---|---|---|
| Tiến lại | `/redo` | redo/checkpoint tương tự |

## Best practices (kèm "vì sao")

- Phân vân undo/redo → `/diff` xem trước 10 giây rồi quyết. **Vì sao?** Mắt thấy diff đỡ tiếc hơn đoán.

## Bài tập nhỏ

1. (2 phút) `/undo` rồi `/redo` 1 lần cho thuộc tay.

## Tham khảo

- Anh em: [../undo/README.md](../undo/README.md) · Bài tổng: [../../11-sessions-undo-compaction.md](../../11-sessions-undo-compaction.md)

> Câu chốt: redo là phao cứu undo nhầm — nhưng chỉ nổi trước khi bạn bơi tiếp.
