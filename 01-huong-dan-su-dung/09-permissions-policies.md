# 09 — Permissions + Policies (luật chặn cuối, đừng trông chờ prompt)

> **Dành cho:** người sợ agent `rm -rf` / đọc `.env` / push bừa · **Vấn đề:** không phân biệt `permissions` (linh hoạt) vs `policies` (khóa cứng) · **Đọc xong:** viết rules `action/resource/effect` + policy org đúng · **Thời gian:** ~15 phút.

## Mục tiêu

- Viết `permissions[]` last-match-wins với `shell/edit/read/subagent/skill/...`.
- Dùng `ask` + saved approvals đúng cách.
- Viết `policies` khóa cứng (`tool.use`, `provider.use`).

## Khái niệm cốt lõi

### 1. `permissions`: ai được làm gì với cái gì

```jsonc
{ "permissions": [
  { "action": "shell", "resource": "*", "effect": "ask" },
  { "action": "shell", "resource": "git status *", "effect": "allow" },
  { "action": "shell", "resource": "git diff *", "effect": "allow" },
  { "action": "shell", "resource": "git push *", "effect": "deny" }
] }
```

Mỗi rule: `action` (tool/việc) + `resource` (path/lệnh/URL/skillID/agentID, wildcard `*`/`?`) + `effect` (`allow`/`ask`/`deny`). **Rule khớp cuối cùng thắng.** Không rule nào khớp → `ask`. Một op chạm nhiều resources: 1 `deny` là tạch, còn lại 1 `ask` là hỏi.

Actions hay dùng: `shell` (lệnh), `edit` (edit/write/patch), `read`/`glob`/`grep`, `subagent`, `skill`, `question`, `webfetch`/`websearch`, `external_directory` (đọc/ghi ngoài worktree), `<server>_<tool>` (MCP), `execute` (deny là gỡ Code Mode của server đó).

Base policy mọi agent đã có: allow hết, nhưng `read *.env` → `ask`. `plan` deny edit, `explore` chỉ cho đọc/search/shell, `title/summary/compaction` deny gần hết.

**Nôm na:** permissions như nội quy nhà — "khách được vào phòng khách (allow), vào bếp thì hỏi (ask), cấm vào két sắt (deny)". Quy định viết sau (cụ thể hơn) thắng quy định chung viết trước.

**Vì sao quan trọng?** Không viết luật = mọi lệnh nguy hiểm đều `ask` giữa chừng, task dài đứt liên tục; viết ẩu = agent bị chặn oan.
**Nếu làm sai?** `allow shell *` cho tiện → mất phanh; `deny` quá rộng → agent bất lực, bạn ngồi gỡ từng cái.

### 2. Approvals (`ask` → once/always/reject)

Khi `ask`: Allow once (1 lần), **Allow always** (lưu pattern allow cho project, vd `shell: git status *`), Reject (từ chối + kill các pending còn lại). Saved allow **không bao giờ thắng `deny`** đã config. Non-interactive (`run`): không ai bấm → phải allow/deny trước.

Ngoại lệ thư mục ngoài: default `external_directory` đang allow — muốn hỏi khi agent ra khỏi project thì thêm rule `ask` + allow hẹp cho thư mục tin cậy.

### 3. `policies`: luật công ty thắng nội quy phòng

```jsonc
{ "policies": [
  { "action": "provider.use", "resource": "openai", "effect": "deny" },
  { "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" }
] }
```

`policies` chạy **sau** permissions + saved approvals, chỉ biến allow/ask → deny (không mở thêm). Thứ tự rộng thắng: Console workspace/org → system managed → global → project. Muốn org chỉ cho 1 gateway:

```jsonc
{ "policies": [
  { "action": "provider.use", "resource": "*", "effect": "deny" },
  { "action": "provider.use", "resource": "company-ai", "effect": "allow" }
] }
```

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Luật linh hoạt | `permissions[]` last-match-wins | permissions picker / allowlist | permissions + allowlist |
| Khóa cứng org | `policies` (Console/system thắng) | policy/branch protection | managed policy/hooks |
| Tên action cũ | v1 `bash/task` → v2 `shell/subagent` | — | — |

## Lỗi thường gặp

### 1. Viết `bash`/`task` kiểu v1 sang v2

```text
❌ SAI: { "action": "bash", ... } tren v2 -> khong khop rule nao -> roi ve ask mo
✅ ĐÚNG: doi sang shell / subagent; edit gom write+patch
```
**Bài học:** rename này là breaking nhẹ nhưng gây fail-open về `ask`. Grep config cũ trước khi migrate.

### 2. Allow always rồi tưởng thắng deny

```text
❌ SAI: bam Allow always cho `sudo ...` roi bao "da allow sao van bi chan"
✅ ĐÚNG: policy deny luon thang saved approval; muon mo phai sua policy (neu co quyen), khong phai bam lai
```
**Bài học:** saved approval là tiện ích, không phải chìa khóa vạn năng.

## Best practices (kèm "vì sao")

- Template tối thiểu mọi project: `shell * ask` + allow `git status/diff` + deny `git push` + deny `*.env`. **Vì sao?** Đủ an toàn mà không chặn oan việc thường ngày.
- Rule nguy hiểm (`sudo`, `rm -rf`, push, đọc secrets) cho vào `policies` ở tầng cao nếu quản team. **Vì sao?** `permissions` project ai cũng sửa được; `policies` mới là khóa.

## Bài tập nhỏ

1. (10 phút) Áp template trên, thử `git status` (phải qua), `cat .env` (phải chặn/hỏi), `git push --dry-run` (phải deny).
2. (5 phút) Bấm Allow always 1 lệnh an toàn, tìm xem pattern lưu ở đâu cho project.

> **Chốt bài 09:** permissions viết từ rộng → hẹp (hẹp sau thắng), policies khóa cái không được phép. Prompt là lời nhờ, luật mới là phanh.
