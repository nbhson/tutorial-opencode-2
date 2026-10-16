# STYLE.md — Khuôn viết "dễ hiểu" cho mọi file .md

Khuôn này áp cho toàn bộ tutorial OpenCode 2. Mục tiêu: mỗi file đọc như **một người giải thích cho bạn**, không phải máy liệt kê.

## 1. Nguyên tắc vàng (áp cho MỌI file)

1. **Ba lớp cho mỗi khái niệm then chốt:**
   - **1 câu định nghĩa** (nói thẳng nó là gì).
   - **Nôm na** (so sánh đời thường: quán ăn, công trường, trợ lý...).
   - **Ví dụ copy-paste** (chạy được, cụ thể cho file đó).
2. **Vì sao quan trọng?** — nếu không hiểu cái này thì hậu quả là gì.
3. **Nếu làm sai thì sao?** — mặt trái + cách tránh.
4. **So sánh với Copilot / Claude Code** — mỗi file có ít nhất 1 bảng đối chiếu khi có cái tương ứng tự nhiên. Không có thì ghi rõ "không có tương đương trực tiếp" — không bịa.
5. **Pitfall viết dạng ❌ SAI / ✅ ĐÚNG + "Bài học:"**.
6. **Best practices kèm chữ "Vì sao?"**.
7. **Bài tập ngắn** có thời gian, kiểm chứng được (chạy/sờ thấy kết quả).

## 2. Từ cấm (mùi robot)

- ❌ "Section này trả lời: ...", "Phần này nói về ...", "Nội dung dưới đây gồm ...".
- ❌ "làm đúng theo khối dưới đây", "đổi phần tên file/task cho đúng việc của bạn".
- ❌ Một câu "Tham khảo" và "Mẹo 1 dòng" giống y hệt mọi file. Mỗi file phải có câu chốt riêng.
- ❌ Liệt kê gạch đầu dòng không có lý do ("Vì sao?").
- ❌ Bảng "Nguyên nhân/Fix" trùng nhau giữa các file.
- ❌ Câu dài không mang thông tin, nhét cho đủ dòng.
- ❌ Dịch máy móc word-by-word. Thuật ngữ giữ tiếng Anh khi phổ biến (TUI, subagent, Code Mode, policies...), câu giải thích phải tự nhiên.

## 3. Template — bài học (`01-`, `02-`, `03-`)

```
# NN — Tên Bài (...)

> **Dành cho:** ai · **Vấn đề:** đang đau ở đâu · **Đọc xong:** làm được gì · **Thời gian:** ~N phút.

## Mục tiêu bài học
- ... (2–4 gạch, kiểm chứng được)

## Mục lục
- link tới các mục

## Khái niệm cốt lõi
### 1. <khái niệm>
<nôm na + ví dụ copy-paste>
**Vì sao quan trọng?** ... **Nếu làm sai?** ...

## Luồng hoạt động (Flow)
1. ... (từng bước + lỗi hay gặp ở bước đó)

## Ví dụ chi tiết
<code chạy được, comment tiếng Việt không dấu trong code>

## Giải thích từng phần
- từng khối quan trọng: làm gì, vì sao vậy, sai thì lỗi gì

## So sánh với Copilot / Claude Code
| Việc | OpenCode 2 | Copilot / Claude | Ghi chú |

## Lỗi thường gặp (❌ SAI / ✅ ĐÚNG)
### 1. <triệu chứng>
❌ SAI: ... ✅ ĐÚNG: ... **Bài học:** ...

## Best practices (kèm "vì sao")
- Mẹo. **Vì sao?** ...

## Bài tập nhỏ
1. (N phút) ...

## Reference
- link nguồn chính thức (opencode.ai/v2/docs/...)
```

## 4. Checklist trước khi lưu

- [ ] Có "Vì sao quan trọng?" + "Nếu làm sai thì sao?" cho khái niệm chính.
- [ ] Có ít nhất 1 pitfall ❌/✅ + "Bài học:".
- [ ] Có bảng so sánh Copilot/Claude (hoặc ghi rõ không tương đương).
- [ ] Best practices đều có "Vì sao?".
- [ ] Không còn câu trong danh sách cấm.
- [ ] Câu chốt cuối file là câu riêng của file này.
- [ ] Code block copy-paste được; secrets qua `{env:...}`.
