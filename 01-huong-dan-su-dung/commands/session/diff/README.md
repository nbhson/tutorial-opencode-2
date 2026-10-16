# `/diff` — xem diff cạnh session đang làm

> **Dành cho:** trước khi accept bất cứ sửa nào · **Đọc xong:** review diff không rời TUI (~2 phút)

## 1 câu nôm na

Như đứng cạnh thợ xem từng viên gạch vừa xây — đẹp thì giữ, lệch thì bảo đập ngay.

## Vì sao dùng `/diff`?

Agent báo "xong" bằng chữ rất thuyết phục; diff mới là sự thật. Xem cạnh session giúp đối chiếu yêu cầu ↔ thay đổi từng hunk.

## Khi nào dùng / khi nào đừng

- Dùng khi: sau mỗi phase agent sửa, trước khi commit/merge.
- ĐỪNG dùng khi: chưa có thay đổi file nào (chỉ hỏi đáp).

## Cách gọi (copy-paste)

```text
/diff
```
Bấm `f` chuyển side panel ↔ fullscreen (layout tự co theo terminal hẹp).

## Ví dụ thật

```text
Agent: "da them rate-limit" -> /diff -> thay them file session.ts ngoai pham vi
-> /undo hoac bao "bo thay doi o session.ts, giu lai auth/*"
```

**Kết quả mong đợi:** cây file + patch từng hunk bên cạnh chat.
**✅ Verify:** mỗi hunk trả lời được "vì sao đổi" — hunk nào không thì revert.

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: agent noi xong la commit luon, khong /diff
✅ ĐÚNG: /diff moi phase; hunk la thi giu, hunk thua thi undo/sua
```
**Bài học:** tin chữ không tin diff là cách merge rác nhanh nhất.

## So sánh với Copilot / Claude Code

| Việc | OpenCode (`/diff`) | Copilot | Claude Code |
|---|---|---|---|
| Xem diff trong luồng | `/diff` cạnh session | diff view trong IDE | diff trong terminal tương tự |

## Best practices (kèm "vì sao")

- Review theo hunk, không theo file. **Vì sao?** 1 file có thể lẫn hunk đúng + hunk sai — accept cả file là nuốt cả sai.

## Bài tập nhỏ

1. (5 phút) Sau 1 task agent, `/diff` + `f` fullscreen, chỉ ra 1 hunk giữ + 1 hunk bỏ (nếu có).

## Tham khảo

- Anh em: [../undo/README.md](../undo/README.md) · Bài tổng: [../../11-sessions-undo-compaction.md](../../11-sessions-undo-compaction.md)

> Câu chốt: không diff thì chưa xong — chữ của agent là quảng cáo, diff là hàng thật.
