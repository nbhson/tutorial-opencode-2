# `/connect` — login provider / Zen / Go ngay trong TUI

> **Dành cho:** thêm key, hết hạn mức, dùng máy mới · **Đọc xong:** login không cần thoát session (~3 phút)

## 1 câu nôm na

Như nạp thêm thẻ vào ví giữa chợ — hết tiền model thì nạp, không cần về nhà.

## Vì sao dùng `/connect`?

Model availability = catalog × credentials × policies. Thêm key/đổi account ngay trong TUI đỡ đứt mạch hơn ra terminal `opencode auth login`.

## Khi nào dùng / khi nào đừng

- Dùng khi: thêm provider mới, dán Zen API key, đổi account, key hết hạn.
- ĐỪNG dùng khi: config sai model id (lỗi đó sửa `opencode.jsonc`, không phải login lại).

## Cách gọi (copy-paste)

```text
/connect
-> chon provider (Anthropic/OpenAI.../Zen) -> dan key
```
Ngoài TUI: `opencode auth login [provider]`, `opencode auth list`, `opencode auth logout`. Key lưu `~/.local/share/opencode/auth.json`.

## Ví dụ thật

```text
/connect -> OpenCode Zen -> dan API key (lay tu dashboard Zen sau khi nap $20)
-> /models -> thay opencode/gpt-5.5 hien ra
```

**Kết quả mong đợi:** provider connected, models của nó hiện trong `/models`.
**✅ Verify:** `/models` thấy model mới + hỏi thử 1 câu rẻ tiền.

## Nếu làm sai (❌ SAI / ✅ ĐÚNG)

```text
❌ SAI: login Zen xong doi thay model BYOK cu (2 vi khac nhau)
✅ ĐÚNG: Zen prefix opencode/*, BYOK prefix provider/*; muon dung cai nao thi /models chon dung cai do
```
**Bài học:** login là mở thêm ngăn ví — trả bằng ngăn nào thì chọn ngăn đó.

## So sánh

| Việc | OpenCode (`/connect`) | Copilot | Claude Code |
|---|---|---|---|
| Login model | `/connect` trong TUI | sign-in GitHub/VS Code | `/login` + API key tương tự |

## Best practices (kèm "vì sao")

- Key cá nhân để global, key dự án để env dự án. **Vì sao?** Trộn là rò key team hoặc thiếu key máy mới.

## Bài tập nhỏ

1. (5 phút) `/connect` kiểm tra providers nào đang connected, `opencode auth list` đối chiếu ngoài terminal.

## Tham khảo

- Bài models: [../../04-models-zen-go-byok.md](../../04-models-zen-go-byok.md)

> Câu chốt: hết não thì `/connect` nạp — đừng đổ lỗi cho tool khi ví rỗng.
