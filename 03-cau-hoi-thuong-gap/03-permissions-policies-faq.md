# FAQ 03 — Permissions & Policies

## Q1: "Viết `allow` rồi sao vẫn bị chặn?"

**Trả lời 1 câu:** `policies deny` (org/system/Console) luôn thắng `permissions allow` + saved approvals.

**Giải thích:** Thứ tự: permissions + saved approvals chạy trước, policies chạy sau và chỉ deny thêm. Global rules append trước agent rules (agent refine được global).

**Làm thế nào:**

```jsonc
// kiem tra tu duoi len: agent perms -> global perms -> policies (global/system/Console)
{ "policies": [{ "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" }] }
```

**Nếu vẫn lỗi:** hỏi admin org — project không mở được khóa org.

## Q2: "Rule nào thắng khi nhiều rule cùng khớp?"

**Trả lời 1 câu:** Rule khớp **cuối cùng** thắng — viết từ rộng → hẹp.

```jsonc
{ "permissions": [
  { "action": "shell", "resource": "*", "effect": "ask" },
  { "action": "shell", "resource": "git status *", "effect": "allow" }
] }
```

Lưu ý: `git status *` match cả `git status` không args. Không rule khớp → `ask`.

## Q3: "`run` non-interactive treo đợi approve?"

**Trả lời 1 câu:** Không ai bấm Allow — phải allow/deny trước cho mọi lệnh task cần.

**Làm thế nào:** task `run` chỉ dùng lệnh đã allow + deny sẵn cái nguy hiểm; hoặc giới hạn `run` cho task read-only.
