# Tips 03 — Verification (không agent nào tự chịu đúng/sai)

> **Dành cho:** người merge code agent viết · **Vấn đề:** tin diff đẹp mắt mà không chạy gì · **Đọc xong:** bắt mọi task kết thúc bằng lệnh verify xanh · **Thời gian:** ~10 phút.

## Mục tiêu

- Đưa verify command vào **mọi** prompt/task agent.
- Biết cách `/undo` (snapshot) khi verify đỏ, dùng diff viewer để review nhanh.

## Quy tắc

Mọi task phải có **lệnh verify chạy được trên máy** (test/lint/typecheck/build), không chấp nhận "em nghĩ là đúng".

**Vì sao quan trọng?** Agent không có lưới an toàn tự nhiên — nó không tự chạy test trừ khi bạn bắt. Lưới duy nhất là lệnh của bạn. V2 không chạy LSP/diagnostics làm check ngôn ngữ tự động — lưới an toàn là lệnh của bạn (cần verify chi tiết theo version).
**Nếu làm sai?** Merge code "nhìn đúng" mà test đỏ → nợ kỹ thuật mang tên agent. Snapshots chỉ khôi phục **file trong git repo** — DB, process, network agent đã đụng thì không undo được.

## Ví dụ copy-paste

### 1. Prompt mẫu ép verify

```text
Prompt mau: "Sau khi sua, chay `pnpm test auth && pnpm lint`. Chi bao xong khi ca hai xanh. Dan output."
```

### 2. Ép verify trong command dùng lại

```md title=".opencode/commands/verify-task.md"
---
description: Thuc hien task va bat verify cuoi cung
agent: build
---

Thuc hien: $ARGUMENTS

Sau khi sua xong, bat buoc chay: `pnpm test && pnpm lint`.
Chi bao xong khi ca hai xanh. Dan output cua ca 2 lenh vao cuoi tra loi.
Neu test do: sua lai toi khi xanh hoac bao ro loi va dung.
```

Gọi: `/verify-task them endpoint POST /api/orders voi test`. Verify đi theo task, không phụ thuộc nhớ.

### 3. Luật verify ghi trong `AGENTS.md` (áp mọi task)

```md
# AGENTS.md (them vao cuoi)
Quy tac ket thuc task: sau moi thay doi code phai chay `pnpm lint && pnpm test`.
Chi bao "xong" khi 2 lenh do xanh va dan output thuc te. Khong chap nhan "em nghi la dung".
```

## Kết hợp công cụ có sẵn

| Việc | Cách | Verify |
|---|---|---|
| Review diff sau khi build | mở Diff viewer (`diff.open`), phím `d` đổi scope All/Committed/Uncommitted/Last turn, `m` mark reviewed | verify 28/10/2026, docs/cli/keybinds |
| Sai → lùi lại | `/undo` (hoặc `<leader>u`) — khôi phục file + đưa prompt về composer để sửa lại | snapshots — verify docs/snapshots |
| Đổi ý giữa chừng | `/redo` (`<leader>r`) hủy staged rollback | verify docs/snapshots |
| Checklist review gói sẵn | tự tạo `.opencode/commands/review.md` | docs/commands |

Lưu ý snapshots: chỉ hoạt động trong **git repo**, khôi phục chỉ file agent đã sửa trong active directory — DB/process/network **không** rollback được. Quan trọng: **commit tay trước** khi thử `/undo` trên worktree bẩn.

## So sánh

| Việc | OpenCode 2 | Copilot / Claude |
|---|---|---|
| Ai verify | bạn (chạy test) | bạn (chạy test) — không agent nào chịu thay |
| Lùi lại khi đỏ | `/undo` snapshot (git repo) | Không tương đương trực tiếp |

## Walkthrough theo phút (10 phút)

- **0–2′** Chọn 1 task nhỏ, viết prompt có mảnh **Verify** rõ ràng (tên lệnh + tiêu chí xanh).
- **2–4′** Để agent chạy; đọc output cuối — bắt buộc phải có output lệnh, không phải lời khoe.
- **4–6′** Chạy lại **bằng tay** 1 lệnh quan trọng nhất: `pnpm test auth`. Đỏ → bước 6.
- **6–8′** Đỏ: `<leader>u` (hoặc `/undo`) → sửa prompt → gửi lại. Xanh: mở Diff viewer phím `d` review từng file, `m` mark reviewed.
- **8–10′** Lưu pattern này thành command `.opencode/commands/verify-task.md` (ví dụ ở trên).

## Lỗi thường gặp

### 1. Tin "đã test" không output

```text
❌ SAI: agent bao "da test" nhung khong dan output
✅ ĐÚNG: bat dan output + chay lai 1 lenh quan trong nhat bang tay
```
**Bài học:** "đã test" không có output = chưa test.

### 2. Nhầm `/undo` là backup

```text
❌ SAI: de agent chay migration DB, test do thi go /undo tuong la moi thu ve nhu cu
✅ ĐÚNG: /undo chi khoi phuc FILE trong git repo; DB va side effect phai rollback tay
```
**Bài học:** snapshot không phải transaction — shell effect ngoài file không hoàn ngược được.

## Best practices (kèm "vì sao")

- Verify command đặt trong `AGENTS.md` (mục "Lenh"). **Vì sao?** Nạp mọi request — agent không có cớ "quên" chạy.
- Task kết thúc khi verify xanh + output dán vào chat. **Vì sao?** Đó là bằng chứng duy nhất bạn có trước khi merge.
- Lệnh quan trọng tự chạy tay 1 lần. **Vì sao?** Output model dán có thể là tưởng tượng; terminal của bạn không nói dối.

## Bài tập nhỏ

1. (10 phút) Thêm dòng verify vào 2 commands hay dùng nhất của bạn. Kết quả đạt: mở `.opencode/commands/*.md` thấy mỗi file có dòng "chay lenh X va dan output"; chạy thử 1 command và thấy output lệnh thật trong reply.

> **Chốt tips 03:** không xanh thì chưa xong. Verify là chữ ký nghiệm thu, không phải thủ tục.

Reference: [snapshots](https://opencode.ai/v2/docs/snapshots/), [commands](https://opencode.ai/v2/docs/commands/), [keybinds](https://opencode.ai/v2/docs/cli/keybinds/) — verify 28/10/2026, v2.2.0.
