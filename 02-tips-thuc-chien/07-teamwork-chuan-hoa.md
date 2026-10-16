# Tips 07 — Teamwork chuẩn hóa (một cách dùng chung)

> **Dành cho:** tech lead · **Vấn đề:** mỗi người 1 config, 1 model, 1 kiểu prompt · **Đọc xong:** dựng bộ khung team: config + AGENTS + skills + policies · **Thời gian:** ~15 phút.

## Bộ khung tối thiểu (commit vào repo)

```
opencode.jsonc            # model mac dinh + permissions co ban + mcp team
.opencode/agents/         # reviewer, planner chuan team
.opencode/commands/       # /review, /write-tests theo mau team
.opencode/skills/         # git-release, review-pr...
AGENTS.md                 # stack + lenh + cam + tro skills
```

Org khóa cứng: `policies` ở system/Console (`deny provider` lạ, `deny shell:sudo *`, `deny *.pem`), secrets qua `{env:}` + `.env.example` (không commit `.env`).

Onboard member mới: cài v2 → `/connect` → `opencode mcp list` phải xanh hết → chạy thử `/review` lên 1 PR mẫu.

**Vì sao quan trọng?** Agent nhân mọi thói quen lên số người — 1 config ẩu × 10 dev = 10 cách phá repo.
**Nếu làm sai?** Mỗi người BYOK model khác nhau, không pin → "máy tôi chạy, máy bạn fail" phiên bản agent.

## Lỗi thường gặp

```text
❌ SAI: commit opencode.jsonc kem token that
✅ ĐÚNG: "{env:MCP_API_KEY}" + .env.example + docs onboard ghi export gi
```
**Bài học:** key lộ trong git là lộ vĩnh viễn (history giữ mãi).

## Bài tập nhỏ

1. (15 phút) Dựng bộ khung trên cho 1 repo thật, nhờ 1 đồng nghiệp onboard từ 0 — ghi lại chỗ họ vấp.

> **Chốt tips 07 + cả nhóm 02:** pro không phải prompt hay hơn — pro là hệ thống khiến người thường cũng ra kết quả ổn.
