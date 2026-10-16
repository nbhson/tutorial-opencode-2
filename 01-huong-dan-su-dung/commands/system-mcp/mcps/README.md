# `/mcps` — xem / connect / auth MCP servers trong TUI

> **Dành cho:** server báo `needs authentication` hoặc muốn bật/tắt tool ngoài · **Đọc xong:** auth OAuth + kiểm tra kết nối (~3 phút)

## 1 câu nôm na

Như bảng điện tổng của gian hàng ngoài — xem gian nào có điện (connected), gian nào cần chìa (auth), gian nào cúp tạm (disabled).

## Vì sao dùng `/mcps`?

Thêm server bằng CLI (`opencode mcp add`) mới là khai báo; OAuth sign-in + kiểm tra sống/chết làm trong `/mcps` nhanh hơn gõ lệnh.

## Khi nào dùng / khi nào đừng

- Dùng khi: `needs authentication`, nghi tool ngoài chết, muốn disconnect tạm 1 server.
- ĐỪNG dùng khi: sửa OAuth client settings/timeout (cái đó sửa `opencode.jsonc`).

## Cách gọi (copy-paste)

```text
/mcps
-> chon server -> sign in (browser) / disconnect
```
CLI kèm: `opencode mcp list`, `opencode mcp auth <name>`, `opencode mcp logout <name>`.

## Ví dụ thật

```text
opencode mcp add sentry --url https://mcp.sentry.dev/mcp
/mcps -> sentry: needs authentication -> Sign in -> browser OK
-> opencode mcp list: "sentry connected"
```

**Kết quả mong đợi:** `✓ <name> connected`.
**✅ Verify:** hỏi 1 câu bắt dùng tool của server đó ("dùng sentry liệt kê issues mới nhất").

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: sua URL trong config hoai ma van needs authentication
✅ ĐÚNG: credential OAuth nam ngoai config -> /mcps auth lai hoac mcp logout roi auth
```
**Bài học:** sửa địa chỉ nhà không mở được ổ khóa cũ — phải làm chìa mới.

## So sánh

| Việc | OpenCode (`/mcps`) | Copilot | Claude Code |
|---|---|---|---|
| Quản MCP trong luồng | `/mcps` + CLI `mcp *` | MCP view trong settings | `/mcp` tương tự |

## Best practices (kèm "vì sao")

- Xong việc thì disconnect/`disabled: true` thay vì để connected. **Vì sao?** Server thừa vẫn tốn catalog + instructions mỗi turn.

## Bài tập nhỏ

1. (5 phút) `/mcps` chụp nhanh: mấy connected, mấy needs auth, mấy disabled.

## Tham khảo

- Bài MCP: [../../08-mcp-codemode.md](../../08-mcp-codemode.md)

> Câu chốt: khai báo bằng CLI, mở điện bằng `/mcps` — và cúp điện khi không dùng.
