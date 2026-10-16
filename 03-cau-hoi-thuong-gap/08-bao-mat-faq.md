# FAQ 08 — Bảo mật

## Q1: "Agent có đọc `.env` / push bừa không?"

**Trả lời 1 câu:** Không nếu bạn viết luật: base đã `ask` `.env`, bạn nên `deny` hẳn + `deny git push`.

```jsonc
{ "permissions": [
  { "action": "read", "resource": "*.env", "effect": "deny" },
  { "action": "shell", "resource": "git push *", "effect": "deny" }
],
  "policies": [{ "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" }] }
```

Team thì đưa vào `policies` tầng cao (project sửa không mở được).

## Q2: "Secrets để đâu cho đúng?"

**Trả lời 1 câu:** Env + `{env:NAME}` trong config, không hardcode, không commit.

**Làm thế nào:** headers MCP, OAuth `client_secret`, provider keys đều qua `{env:}`. Kèm `.env.example`, debug config bằng output đã redact credentials.

## Q3: "Plugin/MCP lạ có an toàn không?"

**Trả lời 1 câu:** Không mặc định — plugin chạy với quyền user, MCP remote nhận cả session ID.

**Làm thế nào:** chỉ add server cần, `disabled` khi xong, deny tools không dùng; plugin pin version + review local; `external_directory ask` để hỏi trước khi agent ra khỏi project. Remote server log được session ID — đừng coi nó là bí mật/auth.
