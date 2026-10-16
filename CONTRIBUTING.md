# Đóng góp cho Khóa Học OpenCode 2

Cảm ơn bạn muốn đóng góp! Repo này là tài liệu tiếng Việt, mọi code block đều copy-paste được.
Đọc 5 phút file này + [`STYLE.md`](./STYLE.md) trước khi mở PR.

## Cách thêm bài mới đúng format

### Bài trong `01-huong-dan-su-dung/` (`NN-ten-bai.md`)

- Đặt tên: số tiếp theo + slug tiếng Việt không dấu, vd `15-acp-editor-integration.md`.
- Độ dài: 250–450 dòng. Bắt buộc: mục lục, mạch why → how → ví dụ copy-paste → pitfalls ❌/✅ → bài tập (có thời gian) → link chéo (≥3, đường dẫn tương đối).
- Code block phải chạy được trên OpenCode 2.0.x (ghi version đã verify trong PR). Secrets luôn qua `{env:NAME}`, không hardcode.

### Bài trong `02-tips-thuc-chien/` / `03-cau-hoi-thuong-gap/`

- Tips: lý thuyết gọn + ≥3 ví dụ copy-paste + walkthrough theo phút + pitfalls + bài tập.
- FAQ: cấu trúc 5 phần — **Hỏi ngắn gọn → Trả lời 1 câu → Giải thích chi tiết + ví dụ → Làm thế nào (steps) → Nếu vẫn lỗi thì...**

## Quy ước

- File kebab-case không dấu: `NN-ten-tieng-viet.md`.
- Tiếng Việt, xưng "bạn", comment trong code tiếng Việt không dấu.
- Tiêu đề bài 01: `# NN — Tên Bài (...)`. Tips: `# Tips NN — Tên (...)`.
- Mọi sự thật về version/pricing lấy từ `opencode.ai/v2/docs`, `opencode.ai/zen`, announcement 2.0 — ghi link + ngày verify. Không đoán model roster từ trí nhớ.
- Không sửa nội dung file `.md` hiện có khi thêm bài mới (trừ index ở đợt dọn riêng, ghi rõ trong PR + CHANGELOG).

## PR checklist

- [ ] Tên file/số thứ tự đúng (không trùng, không nhảy số).
- [ ] Đủ số dòng (`wc -l`).
- [ ] Code block đã chạy thử (ghi rõ verify ở đâu).
- [ ] Có pitfalls ❌/✅ + bài tập (có thời gian) + link chéo (≥3, không 404).
- [ ] Workflow YAML parse được, secrets qua env.
