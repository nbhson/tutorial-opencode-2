# `/btw` — hỏi nhanh ngoài lề, không nhiễm context

> **Dành cho:** thắc mắc giữa chừng · **Đọc xong:** hỏi phụ mà không làm bẩn task chính (~2 phút)

## 1 câu nôm na

Như hỏi nhỏ bạn cùng bàn trong giờ làm bài — nghe xong quay lại làm tiếp, không ghi vào bài thi.

## Vì sao dùng `/btw`?

Hỏi xen ("sao test bước 2 fail?") trong luồng chính sẽ thành 1 turn context, kéo task lệch. `/btw` trả lời từ context + model hiện tại nhưng **không thêm vào hội thoại** — task chính không bị nhiễm.

## Khi nào dùng / khi nào đừng

- Dùng khi: thắc mắc phụ, giải thích khái niệm, kiểm tra hiểu biết giữa task.
- ĐỪNG dùng khi: câu hỏi ảnh hưởng quyết định tiếp theo (thì hỏi thẳng trong luồng để lưu lại).

## Cách gọi (copy-paste)

```text
/btw why did the test in step 2 fail?
```
Đáp án mở trong dialog (footer hiện chỉ báo `/btw` khi đang chạy); `C` để copy.

## Ví dụ thật

```text
dang lam "them rate-limit" -> /btw "429 vs 503 khac gi nhau?"
-> doc xong, task chinh van sach, khong them turn rac
```

**Kết quả mong đợi:** dialog trả lời, hội thoại chính không dài thêm.
**✅ Verify:** sau `/btw`, luồng chính vẫn tiếp tục đúng chỗ cũ.

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: moi thac mac phu deu hoi thang -> 30 turns rac, task chinh lac huong
✅ ĐÚNG: phu thi /btw; cai gi can luu cho buoc sau thi hoi thang
```
**Bài học:** context là tiền — đừng trả tiền cho câu hỏi tò mò.

## So sánh

OpenCode `/btw` không có tương đương trực tiếp 1-1 ở Copilot Chat / Claude Code — gần nhất là mở chat phụ/quick question, nhưng `/btw` tiện ở chỗ dùng đúng context + model hiện tại mà không ghi vào lịch sử.

## Best practices (kèm "vì sao")

- `/btw` xong mà thấy câu trả lời quan trọng → tóm 1 dòng vào luồng chính. **Vì sao?** Cái gì quyết định bước sau phải nằm trong context, không thể ở dialog đã đóng.

## Bài tập nhỏ

1. (3 phút) Giữa 1 task, `/btw` 1 câu phụ rồi kiểm tra luồng chính còn sạch không.

## Tham khảo

- Index nhóm: [README.md](README.md)

> Câu chốt: tò mò thì `/btw` — giữ luồng chính ăn kiêng.
