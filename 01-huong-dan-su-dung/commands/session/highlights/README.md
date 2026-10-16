# `/highlights` — xem lại changelog sau update

> **Dành cho:** vừa update OpenCode · **Đọc xong:** biết bản mới có gì (~1 phút)

## 1 câu nôm na

Như bảng tin dán ở cửa sau kỳ nghỉ — về lại thì đọc xem có gì mới.

## Vì sao dùng `/highlights`?

Sau update, TUI hiện release notes 1 lần trên home rồi thôi. Muốn xem lại (hoặc bỏ lỡ) thì `/highlights`. Đọc 1 phút đỡ dùng feature cũ theo thói quen.

## Khi nào dùng / khi nào đừng

- Dùng khi: vừa update, thấy hành vi lạ sau update.
- ĐỪNG dùng khi: đang giữa task gấp (đọc sau).

## Cách gọi (copy-paste)

```text
/highlights
```
Tắt auto-hiện: `"highlights": false` trong `~/.config/opencode/cli.json`.

## Ví dụ thật

```text
update len 2.0.30 -> /highlights -> thay "/share bi go, them Figma plugin" -> khoi di tim nut share da mat
```

**Kết quả mong đợi:** dialog tóm tắt thay đổi bản mới.
**✅ Verify:** kể được 1 thay đổi ảnh hưởng workflow của bạn.

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: update xong khong doc gi, bao loi "sao mat nut X" von da ghi trong changelog
✅ ĐÚNG: /highlights sau moi update minor/major
```
**Bài học:** 1 phút đọc changelog rẻ hơn 30 phút debug cái đã được thông báo.

## Best practices (kèm "vì sao")

- Pro rồi thì tắt auto (`highlights: false`), chủ động `/highlights` khi rảnh. **Vì sao?** Màn chắn mỗi lần update làm đứt mạch vào việc.

## Bài tập nhỏ

1. (2 phút) `/highlights` ngay bây giờ — ghi ra 1 dòng ảnh hưởng bạn.

## Tham khảo

- Changelog online: https://opencode.ai/changelog

> Câu chốt: update xong thì `/highlights` — đừng dùng bản mới bằng thói quen bản cũ.
