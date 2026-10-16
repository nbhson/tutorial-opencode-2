# Tips 04 — Parallel background (song song mà không giẫm chân)

> **Dành cho:** người ôm ≥2 việc cùng lúc · **Vấn đề:** spawn nền bừa → conflict file · **Đọc xong:** chia việc độc lập + mỗi nền 1 owner/output · **Thời gian:** ~10 phút.

## Ma trận chia việc

| Cho ra nền | Giữ ở chính |
|---|---|
| research (explore), review (general/reviewer), test suite, thám thính docs | quyết định, sửa file tranh chấp, merge cuối |

```text
Tot: "background explore ve ban do payments; background general review diff login; toi sua auth o session chinh"
Te: "3 background cung sua 3 file chung auth.ts"
```

Kết hợp worktree (bài 14): mỗi nền 1 worktree khi đụng code — rollback = xóa worktree.

**Vì sao quan trọng?** Background chỉ nhanh khi việc độc lập; việc coupled mà song song thì gộp lại lâu hơn làm tuần tự.

## Lỗi thường gặp

```text
❌ SAI: spawn 3 nen roi khong dat ten/output, luc xong khong biet dua nao lam gi
✅ ĐÚNG: moi nen: ten + pham vi + output (file/tom tat 5 gach)
```
**Bài học:** song song không nhãn = hỗn loạn có tổ chức.

## Bài tập nhỏ

1. (10 phút) Chạy 2 nền độc lập + 1 việc chính, tổng kết thời gian vs làm tuần tự.

> **Chốt tips 04:** nền thu thập, chính quyết định. Độc lập thì song song, tranh chấp thì xếp hàng.
