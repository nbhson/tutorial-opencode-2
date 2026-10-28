# Tips 05 — Code Mode hiệu quả (đừng gọi lẻ khi gộp được)

> **Dành cho:** người dùng ≥2 MCP tools/task · **Vấn đề:** 20 calls lẻ = 20 round-trips · **Đọc xong:** ra lệnh gộp script + debug theo server · **Thời gian:** ~10 phút.

## Mục tiêu

- Ra lệnh cho agent gộp MCP calls thành 1 script Code Mode thay vì gọi lẻ từng tool.
- Debug khi script fail: theo server, thu hẹp dần.

## Khái niệm cốt lõi

**1 câu:** Code Mode là chế độ mặc định của V2 — tool MCP không nằm trong tool list mà được gọi qua script (execute), nên gộp N calls thành 1 script là gộp N round-trips model thành 1.

**Nôm na:** tool lẻ như gọi Grab từng chuyến đi chợ; Code Mode như đi 1 chuyến mua hết cả tuần. Mỗi round-trip là tiền + latency + cơ hội model quên giữa chừng.

**Vì sao quan trọng?** Gộp 20→1 thắng 3 mặt: bill rẻ hơn (ít request), nhanh hơn (ít round-trip), ổn hơn (script 1 lần, không lo model mất mạch giữa 20 bước).
**Nếu làm sai?** Mặc định agent vẫn có thể gọi từng tool "cho chắc" — nếu bạn không nói gộp, 1 task 20 calls vẫn tốn 20 lượt. Tool nào bắt buộc native mà dùng script sẽ mất tính năng riêng của nó (streaming progress, elicitation...).

## Ví dụ copy-paste

### 1. Ra lệnh gộp ngay từ đầu task

```text
"Dung Code Mode gop thanh 1 script: search 5 issues sentry moi nhat, voi moi issue lay chi tiet + dem comments. Tra ve bang."
```

### 2. Gộp nhiều server theo thứ tự (dễ debug)

```text
Dung Code Mode, viet 1 script lam tat ca:
1. Server context7: lay docs cho "react server components"
2. Server sentry: list 3 issues gan nhat
3. Gop ket qua thanh 1 bang: docs | issue | trang thai
Chay tung buoc, neu buoc 1 fail thi dung va bao loi, chua chay buoc 2.
```

Gom theo server trước, server khác sau — script fail thì biết ngay server nào lỗi.

### 3. Loại tool native khỏi Code Mode (khi cần)

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "context7": {
        "type": "remote",
        "url": "https://mcp.context7.com/mcp",
        "codemode": false
      }
    }
  }
}
```

`codemode: false` chỉ đặt **riêng từng server** khi tool đó bắt buộc native (verify: docs/mcp-servers — `codemode` là field của từng server, mặc định `true`).

## Debug khi script fail

1. Thu hẹp: chạy 1 server trước, pass mới mở rộng (ví dụ trên: tách bước 1, 2).
2. Kiểm tra server còn nối: `opencode mcp list` → `✓ sentry  connected`.
3. Kiểm tra quyền: nếu agent không thấy tool nào của server, xem `permissions` có deny action `execute` hoặc `<server>_<tool>` (deny `execute` gỡ luôn Code Mode của server đó).
4. Tool tên gì trong script? Theo chuẩn `<server>_<tool>` → trong script là `tools.<server>.<tool>(...)`, vd `tools.context_7.resolve_library_id(...)`.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Gọi MCP | Code Mode mặc định (script gộp) | gọi từng tool lẻ | gọi từng tool lẻ (MCP) |
| Tắt gộp cho 1 server | `codemode: false` per server | không tương đương | không tương đương |

## Walkthrough theo phút (10 phút)

- **0–2′** Đếm: task này cần mấy MCP calls? ≥3 → áp tips này.
- **2–4′** Viết prompt gộp theo mẫu 1, nêu rõ thứ tự + output dạng bảng.
- **4–6′** Chạy; đếm round-trips trong transcript (mỗi block tool = 1 lượt).
- **6–8′** Fail? Tách script theo server, chạy server lỗi trước — `opencode mcp list` xác nhận xanh.
- **8–10′** So 2 kiểu chạy: latency (bấm giờ) + số round-trips + chất lượng output. Ghi lại con số để lần sau "thấy ≥3 calls là nghĩ gộp".

## Lỗi thường gặp

### 1. Gọi lẻ rồi trách chậm

```text
❌ SAI: bat agent goi 10 tools lan luot roi hoi "sao lau the"
✅ ĐÚNG: mo dau task da noi "gop Code Mode", cuoi task dem so round-trip
```
**Bài học:** mặc định agent có thể gọi lẻ cho "chắc" — bạn phải chỉ đích danh gộp.

### 2. Gộp ập hết mọi server vào 1 script khi chưa test

```text
❌ SAI: script dung 4 server cung luc, fail khong biet server nao loi
✅ ĐÚNG: chay 1 server truoc, pass roi them server ke
```
**Bài học:** gộp để nhanh, debug bằng tách — 2 thao tác đi cặp.

## Best practices (kèm "vì sao")

- Ra lệnh "gộp" ngay câu đầu của task. **Vì sao?** Nếu không chỉ đích danh, agent chọn gọi lẻ — cách an toàn hơn theo nó.
- Server nào hay lỗi timeout thì set riêng: `mcp.timeout.execution` (mặc định 12h, server chậm nên hạ). **Vì sao?** 1 call treo không nên khóa cả script.
- Tool nào bắt buộc native mới `codemode: false` riêng nó. **Vì sao?** Mặc định gộp là rẻ; trừ nếu tool cần stream UI/elicitation đặc biệt.

## Bài tập nhỏ

1. (10 phút) Lấy 1 task 3+ tool calls (vd: search issues + lấy chi tiết + đếm comments), chạy 2 cách (lẻ vs gộp), bấm giờ. Kết quả đạt: có số round-trips mỗi cách + bảng output đầy đủ; script gộp không fail.

> **Chốt tips 05:** thấy ≥3 calls là nghĩ gộp. Code Mode là xe tải — đừng chở từng gói bằng xe máy.

Reference: [mcp-servers](https://opencode.ai/v2/docs/mcp-servers/) — verify 28/10/2026, v2.2.0.
