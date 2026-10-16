# `/editor` — sửa prompt dài trong editor ruột

> **Dành cho:** prompt >5 dòng · **Đọc xong:** soạn prompt trong `$EDITOR` rồi gửi (~2 phút)

## 1 câu nôm na

Như nháp thư dài trong Word rồi dán vào chat — gõ thẳng 20 dòng trong ô nhỏ vừa mỏi vừa sai.

## Vì sao dùng `/editor`?

Prompt phức tạp (5 mảnh: bối cảnh + việc + không đụng + verify + output) soạn trong vim/nvim/vscode sướng hơn ô composer 1 dòng. Save + thoát là text về lại composer, Enter để gửi.

## Khi nào dùng / khi nào đừng

- Dùng khi: prompt dài, cần copy/dán nhiều đoạn, cần suy nghĩ khi viết.
- ĐỪNG dùng khi: câu hỏi 1 dòng (gõ thẳng nhanh hơn).

## Cách gọi (copy-paste)

```bash
export VISUAL="nvim"   # hoac EDITOR, dat truoc khi mo TUI
```
```text
/editor
```
Phím tắt: `Ctrl+X` rồi `E`.

## Ví dụ thật

```text
/editor
# trong nvim soan:
# Context: branch feat/login...
# Viec: ...
# Verify: pnpm test auth (xanh moi xong)
# :wq -> text ve composer -> Enter
```

**Kết quả mong đợi:** prompt dài nguyên vẹn trong composer, sẵn gửi.
**✅ Verify:** đọc lại trong composer trước Enter — đủ 5 mảnh tips 02 chưa.

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: chua dat EDITOR, go /editor roi bao "sao khong mo gi"
✅ ĐÚNG: export EDITOR="nvim" (hoac code --wait) truoc khi mo opencode
```
**Bài học:** TUI không đoán editor ruột của bạn — phải khai báo.

## So sánh

| Việc | OpenCode (`/editor`) | Copilot / Claude |
|---|---|---|
| Soạn prompt ngoài | `/editor` + `$EDITOR` | ô chat lớn trong IDE / terminal tương tự |

## Best practices (kèm "vì sao")

- Prompt quan trọng thì soạn trong editor + lưu 1 bản vào command (bài 06). **Vì sao?** Prompt hay gõ 1 lần rồi mất là phí; đóng gói thì lần sau `/` là có.

## Bài tập nhỏ

1. (3 phút) Đặt `EDITOR`, `/editor` soạn prompt 5 mảnh cho 1 task thật rồi gửi.

## Tham khảo

- Bài prompt: [../../../02-tips-thuc-chien/02-prompt-plan-first.md](../../../02-tips-thuc-chien/02-prompt-plan-first.md)

> Câu chốt: prompt dài thì ra editor soạn — ô chat nhỏ không phải chỗ viết văn bản quan trọng.
