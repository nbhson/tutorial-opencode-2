# Tips 02 — Prompt + Plan-first (giao việc rõ, duyệt trước khi code)

> **Dành cho:** người giao task >15 phút · **Vấn đề:** prompt mơ hồ + lao vào build ngay → làm lại · **Đọc xong:** viết prompt đủ scope/verify + ép Plan trước Build · **Thời gian:** ~10 phút.

## Công thức prompt 5 mảnh

`Bối cảnh + Việc + Không đụng + Verify + Output` — vd:

```text
Context: branch feat/login, file apps/api/src/auth/*.
Viec: them rate-limit 5 req/phut cho POST /api/login.
Khong dung: schema DB, file ngoai auth/.
Verify: pnpm test auth + demo curl 6 req (5 pass, 1 bi 429).
Output: diff + cach test lai.
```

**Vì sao quan trọng?** Subagent/background có fresh context — thiếu bối cảnh là nó đoán.
**Nếu làm sai?** `"fix login giup"` → agent sửa cả auth + session + UI, review muốn khóc.

## Plan-first (Shift+Tab sang `plan`)

```text
1. Shift+Tab sang plan: "ve plan refactor auth, chua sua code"
2. Duyet plan (chia phase, moi phase co test)
3. Shift+Tab sang build: "lam phase 1 theo plan da duyet"
```

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Ép plan | agent `plan` read-only | Plan persona / Ask mode | plan mode tương tự |

## Lỗi thường gặp

```text
❌ SAI: duyet plan mieg ("ok lam di") roi bat buil ca 5 phase 1 luc
✅ ĐÚNG: duyet tung phase + bat verify sau moi phase
```
**Bài học:** plan duyệt ẩu = không plan.

## Bài tập nhỏ

1. (10 phút) Lấy 1 task thật, viết prompt 5 mảnh + đi qua plan rồi mới build — so số lần sửa lại với cách cũ.

> **Chốt tips 02:** rõ từ đầu rẻ hơn sửa cuối. Plan là bản vẽ — không xây nhà từ lời nói.
