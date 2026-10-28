# Tips 02 — Prompt + Plan-first (giao việc rõ, duyệt trước khi code)

> **Dành cho:** người giao task >15 phút · **Vấn đề:** prompt mơ hồ + lao vào build ngay → làm lại · **Đọc xong:** viết prompt đủ scope/verify + ép Plan trước Build · **Thời gian:** ~10 phút.

## Mục tiêu

- Viết prompt có 5 mảnh để subagent không phải đoán.
- Dùng agent `plan` (Shift+Tab) trước agent `build` cho task lớn.

## Công thức prompt 5 mảnh

`Bối cảnh + Việc + Không đụng + Verify + Output` — vd:

```text
Context: branch feat/login, file apps/api/src/auth/*.
Viec: them rate-limit 5 req/phut cho POST /api/login.
Khong dung: schema DB, file ngoai auth/.
Verify: pnpm test auth && demo curl 6 req (5 pass, 1 bi 429).
Output: diff + cach test lai.
```

**Vì sao quan trọng?** Subagent/background có fresh context — thiếu bối cảnh là nó đoán. "fix login giup" → agent sửa cả auth + session + UI, review muốn khóc.
**Nếu làm sai?** Đoán scope → làm sai việc → sửa lại tốn 3× thời gian gốc. Mỗi vòng lặp là tokens × giá, không phải thời gian free.

## Ví dụ copy-paste

### 1. Prompt cho API task nhỏ (5 mảnh đủ)

```
Context: branch feat/payments, file services/payment/*
Viec: them idempotency key vao POST /api/checkout. Moi request can header Idempotency-Key, luu vao bang idempotency_keys voi expire 24h.
Khong dung: khong sua webhook handler; khong them migration; chi sua services/payment/
Verify: pnpm test payment (co 1 test hien tai) + them 2 test: co key va khong co key.
Output: file da sua + 2 test moi.
```

### 2. Prompt cho refactor lớn (dùng kèm plan)

```
Context: file src/auth/* (login, logout, token refresh), dung JWT RS256, hien khong co test.
Viec: refactor JWT thanh module rieng biet theo Single Responsibility, them unit test cho moi ham public.
Khong dung: khong sua API routes; khong them DB migration; chi src/auth/
Verify: pnpm lint && pnpm test auth. Tat ca xanh truoc khi bao xong.
Output: danh sach file thay doi + output pnpm test.
```

### 3. Prompt dạng config để dùng lại

```jsonc title=".opencode/commands/api-task.md"
---
description: Them 1 API moi voi rate limit + test
agent: build
model: anthropic/claude-sonnet-5-5#high
---

$ARGUMENTS

Verify: pnpm test $ARGUMENTS && pnpm lint. Chi bao xong khi ca hai xanh.
Output: diff + cach test lai.
```

Dùng: `/api-task them endpoint POST /api/orders voi rate-limit 10 req/phut cho user`.

## Plan-first: Shift+Tab sang agent `plan`

Docs xác nhận: agent `plan` builtin, mode primary, **denies edits ngoài `~/.opencode/plan`** (verify: opencode.ai/v2/docs/agents/, 28/10/2026).

```text
1. Shift+Tab sang plan (hoac go <leader>a roi chon Plan): "ve plan refactor auth, chua sua code"
2. Duyet plan (chia phase, moi phase co test)
3. Shift+Tab sang build: "lam phase 1 theo plan da duyet"
```

Lệnh keybind: `<leader>a` → agent list → chọn Plan. Hoặc Shift+Tab để cycle agent (keybind `agent.cycle` = `shift+tab`).

### Lệnh built-in thay thế plan nhanh

```bash
# Chạy plan trong terminal mà không cần TUI
opencode run --model anthropic/claude-sonnet-5-5 "Plan: refactor services/payment/*.ts thanh modules, chi ra cac phase, moi phase co verify command"
```

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Ép plan trước | `plan` agent (Shift+Tab / `<leader>a`) | Plan persona / Ask mode | `/plan` mode tương tự |
| Prompt mẫu có sẵn | Command file +5 mảnh | Snippet | Instructions |
| Duyệt theo phase | Từng lượt, tự tạo checkpoint | Ask trước mỗi bước | Ask trước mỗi bước |

## Walkthrough theo phút (10 phút)

- **0–2′** Xác định scope: viết 5 mảnh (Context → Việc → Không đụng → Verify → Output).
- **2–4′** Nếu task > 1 giờ, nhấn Shift+Tab → chọn `plan` → gửi prompt.
- **4–6′** Đọc plan, gạch phê: "phase 1 + 2 OK, phase 3 chưa rõ verify → hỏi lại".
- **6–8′** Shift+Tab → `build` → "thực hiện phase 1 theo plan đã duyệt, dừng sau phase 1".
- **8–10′** Chạy verify command tay (không tin "đã test" không output). Lặp 6–8 cho phase tiếp theo.

## Lỗi thường gặp

### 1. Duyệt plan ẩu

```text
❌ SAI: duyet plan vong e ("ok lam di") roi bat build ca 5 phase 1 luc
✅ ĐÚNG: duyet tung phase + bat verify sau moi phase
```
**Bài học:** plan duyệt ẩu = không plan. Mỗi phase tự chịu verify.

### 2. Không giới hạn scope "Không đụng"

```text
❌ SAI: "fix bug" khong noi gioi han sua file nao
✅ ĐÚNG: "fix bug chi trong src/auth/login.ts, khong sua session hay token"
```
**Bài học:** agent không có ranh giới — bạn phải vẽ nó.

## Best practices (kèm "vì sao")

- Với task > 1 giờ, luôn qua `plan` trước. **Vì sao?** Plan agent denies edits, an toàn để thảo luận mà không lỡ tay đổi code.
- Prompt lưu lại thành command: `.opencode/commands/refactor.md` + `agent: build`. **Vì sao?** Tái sử dụng công thức mà không gõ lại 5 mảnh mỗi lần.
- Mỗi phase cần 1 verify command cụ thể. **Vì sao?** Không verify = không biết phase nào lỗi khi tổng hợp.

## Bài tập nhỏ

1. (10 phút) Lấy 1 task thật đang có trong head (xem `git diff --name-only`), viết prompt 5 mảnh → đi qua plan (Shift+Tab → plan → duyệt → Shift+Tab → build) → so số lần sửa lại sau build với cách giao việc cũ.
   - **Kết quả đạt:** plan duyệt đúng scope + verify chạy xanh trên máy.

> **Chốt tips 02:** rõ từ đầu rẻ hơn sửa cuối. Plan là bản vẽ — không xây nhà từ lời nói.

Reference: [agents plan](https://opencode.ai/v2/docs/agents/), [keybinds](https://opencode.ai/v2/docs/cli/keybinds/) — verify 28/10/2026, v2.2.0.
