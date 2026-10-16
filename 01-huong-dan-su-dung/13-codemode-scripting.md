# 13 — Code Mode scripting (vũ khí bí mật của v2)

> **Dành cho:** người có nhiều MCP/OpenAPI · **Vấn đề:** gọi tool từng cái tốn round-trip + context · **Đọc xong:** hiểu runtime Code Mode + nhờ agent viết script gộp calls · **Thời gian:** ~12 phút.

## Mục tiêu

- Kể được Code Mode làm gì (JS interpreter tối giản, `@opencode/codemode`).
- Biết tools nào vào catalog, permission vẫn check từng tool.
- Ra lệnh để agent viết script thay vì gọi lẻ.

## Khái niệm cốt lõi

**1 câu:** Code Mode biến MCP servers/OpenAPI thành functions trong 1 JS runtime tối giản — agent viết script gọi gộp nhiều tools 1 lần.

**Nôm na:** thay vì bạn đứng giữa chợ hét từng món, bạn đưa người đi chợ 1 tờ giấy: "lấy A, lọc cái còn hạn, rồi lấy B theo từng cái A". Một chuyến xong.

- Mọi MCP server **default opt-in** Code Mode. Muốn tool hiện native: `"codemode": false`.
- Runtime **không** có filesystem/import/timers/`fetch` trực tiếp — chỉ gọi tools trong catalog. Mỗi nested tool vẫn check permissions riêng; `deny execute` là gỡ cả Code Mode của server đó.
- Trong prompt bạn không cần viết JS tay — hãy bảo agent: `"dùng Code Mode gộp: search 5 issues sentry rồi với mỗi issue lấy chi tiết, 1 script duy nhất"`.

**Vì sao quan trọng?** Đây là lý do "add 1000 MCP mà context không phình": model thấy functions gọn, không thấy 1000 schemas.
**Nếu làm sai?** Bắt agent gọi 20 tools lẻ cho việc gom được trong 1 script → 20 round-trips, bill + latency nhân 20.

## So sánh

| Việc | OpenCode 2 (Code Mode) | Copilot / Claude (native MCP) |
|---|---|---|
| Thấy gì | functions gọn theo server | từng tool schema |
| Gọi gộp | 1 script nhiều calls | từng call 1 round-trip |
| Chặn | `execute` deny gỡ cả cụm + từng tool vẫn check | deny từng tool |

Claude/Copilot không có runtime tương đương trực tiếp — đây là món riêng của OpenCode 2.

## Lỗi thường gặp

```text
❌ SAI: viet script trong Code Mode doi doc file truc tiep / fetch internet
✅ ĐÚNG: chi goi tools trong catalog (doc file bang read tool, fetch bang webfetch/websearch/MCP tool)
```
**Bài học:** Code Mode là "tờ giấy đi chợ", không phải máy tính tự do. Cần gì thì gọi đúng tool.

## Best practices (kèm "vì sao")

- Gom theo server (`tools.sentry.*` trong 1 script) thay vì nhảy 5 servers 1 script khó debug. **Vì sao?** Lỗi ở server nào thì log server đó.
- Thêm `worktree_*` vào Code Mode khi làm Git (bài 14). **Vì sao?** Agent tự tạo/move/remove worktree có approve như edit thường.

## Bài tập nhỏ

1. (10 phút) Với 1 MCP có ≥2 tools, bảo agent "gộp 3 calls thành 1 Code Mode script" — đếm round-trip giảm được.
2. (5 phút) Thử `deny execute` 1 server rồi quan sát tools nó biến mất khỏi model.

> **Chốt bài 13:** đừng gọi lẻ khi gộp được. Code Mode là cách v2 biến "nhiều tool" thành lợi thế thay vì gánh nặng.
