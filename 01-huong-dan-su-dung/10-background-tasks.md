# 10 — Background tasks (việc lâu cho ra nền, bạn prompt tiếp)

> **Dành cho:** người chạy task >1 phút (install, test, research) · **Vấn đề:** để mọi thứ foreground là ngồi nhìn · **Đọc xong:** spawn background subagent + background shell đúng cách · **Thời gian:** ~12 phút.

## Mục tiêu

- Spawn background subagent (kể cả model khác) và bám kết quả qua `sessionID`.
- Chạy background shell cho lệnh lâu, xem output, kill khi cần.
- Đẩy tool foreground đang ì ra background giữa chừng bằng phím tắt.
- Biết ranh giới: việc nào cho ra nền, việc nào giữ lại session chính.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Ba đường chạy nền](#ba-đường-chạy-nền)
- [Luồng hoạt động](#luồng-hoạt-động-flow)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [Giải thích từng phần](#giải-thích-từng-phần)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

**1 câu:** V2 cho primary agent thuê "đệ" (subagent) và "lò" (shell) chạy nền, xong thì báo — bạn không bị block.

**Nôm na:** như quán ăn — bếp (background) nấu món lâu, phục vụ (bạn) vẫn nhận order bàn khác; món xong thì chuông reo (notify về session chính).

```text
Ban: "spawn background explore subagent ve ban do auth (dung model re), toi lam tiep phan login"
Agent: child session chay nen voi fresh context -> xong notify + tom tat
```

```text
Ban: "chay npm test o background, toi review code tiep"
Agent: shell async -> ban prompt tiep -> xong bao pass/fail
```

Lệnh/tool foreground chạy lâu quá → phím `ctrl+b` (`session.background` — "Background blocking session tools") đẩy ra background, rồi bạn prompt tiếp. Background subagent có thể **khác model** session chính (vd chính sonnet code, nền haiku research cho rẻ) — subagent dùng model nó được cấu hình sẵn, không cấu hình thì kế thừa model của session cha.

**Vì sao quan trọng?** Model mới mạnh ở orchestration — không cho chạy nền là phí tiền não đắt để ngồi đợi. Trong khi agent nền chạy research 5 phút, bạn đã xong được nửa task chính.
**Nếu làm sai?** Spawn 5 background cùng sửa 1 file → conflict + context phân mảnh. Nền chỉ cho việc **độc lập** (research, review, test suite khác nhau).

Giới hạn nhớ 3 dòng:

- Subagent có **fresh context** — không thấy hết chat cha, phải giao việc rõ ràng trong prompt.
- Độ sâu lồng mặc định là 1 (subagent không tự spawn subagent cháu); muốn hơn phải bật `experimental.subagent_depth`.
- Chỉ agent ở chế độ `mode: subagent` (hoặc `all`) mới dùng được cho child session.

## Ba đường chạy nền

V2 có 3 cách đưa việc ra nền — chọn theo việc, không chọn theo thói quen:

### 1. Subagent nền (`subagent` với `background: true`)

Tool `subagent` khởi chạy child session với một agent đã cấu hình. Gọi bình thường (foreground) thì chờ kết quả; thêm `background: true` thì trả lời ngay bằng `sessionID` và **notify về session cha khi child xong**. Giữ `sessionID` này thì bạn (hoặc agent) có thể quay lại tiếp tục chính cuộc hội thoại con đó, thay vì mở child mới.

**Vì sao quan trọng?** Child session là context mới, rẻ hơn và không làm "nước đục" session chính. Đây đúng cách v2 làm orchestration: cha ra đề, con làm việc, cha quyết.
**Nếu làm sai?** Nhờ child "xem lại các tin nhắn phía trên rồi làm" — nó không thấy gì; nó chỉ có prompt bạn gửi.

### 2. Background shell (`shell` với `background: true`)

Tool `shell` chạy lệnh trong shell của user. Foreground mặc định timeout 2 phút — dev server hay test suite dài là chết chắc. Đặt `background: true` cho dev server, watcher, test dài: lệnh trả về ngay, chạy không giới hạn timeout (trừ khi bạn tự đặt), và **session nhận thông báo khi lệnh kết thúc**.

Trong TUI, các shell đang chạy nằm trong tab **Shell** của composer: chọn 1 lệnh bằng `↑/↓` rồi `Enter` (`composer.shell.select`) để xem stdout/stderr, cuộn `Page Up/Down`, `End` để bám output mới, `Esc` để thoát mà không dừng lệnh. Muốn giết hẳn: `ctrl+d` (`composer.shell.kill`).

### 3. Đẩy tool đang chạy ra nền (`ctrl+b`)

Tool nào đang block session (vd 1 lệnh install chưa xong) mà bạn thấy "thôi để nó chạy, tôi làm việc khác" → nhấn `ctrl+b` (`session.background`). Tool chuyển sang chạy nền, session chính trả tay cho bạn ngay. Đây là nút "giải cứu" cho lần quên spawn nền từ đầu.

**Vì sao quan trọng?** Bạn không phải đoán trước lệnh nào lâu. Chạy foreground bình thường, thấy ì mới đẩy ra — rẻ hơn phải hủy chạy lại.
**Nếu làm sai?** Đẩy cả đống lệnh phụ thuộc nhau ra nền cùng lúc rồi đợi — không biết cái nào xong trước để cái sau chạy. Lệnh nối tiếp thì cứ để foreground.

### Còn non-interactive: `opencode run`

Khi không cần TUI (script, CI), dùng `opencode run`:

```bash
# gui 1 prompt, in ket qua ra stdout roi thoat
opencode run "Explain this repository"

# CI: chay standalone nhan API key rieng, chon model, tu approve permission khong bi deny
opencode run --standalone --model anthropic/claude-sonnet-5-5 "Review this repository"
```

`opencode run` không phải "background" — nhưng cùng phục vụ một mục tiêu: tách việc chạy dài khỏi màn hình bạn đang nhìn. Phần nền phía sau là background service: server chung do OpenCode tự quản, sở hữu sessions, config, permissions, tool execution; mọi local client (TUI, mini, `run`) đều nối vào đó. Script/CI chạy `--standalone` để có private server nhận riêng API key từ secret.

## Luồng hoạt động (Flow)

1. **Xác định việc có độc lập không** — không đụng file session chính đang sửa, không phụ thuộc kết quả việc khác đang chạy. Lỗi hay gặp ở bước này: chọn nghiên cứu việc mà chính bạn đang sửa — kết quả nền lỗi thời ngay khi ra đời.
2. **Chọn đường**: nghiên cứu/review → subagent nền; lệnh máy (test, server, install) → background shell; lệnh đang treo → `ctrl+b`.
3. **Giao đề bài đầy đủ** — ngữ cảnh, phạm vi, định dạng output, điều cấm. Lỗi hay gặp: gõ 1 dòng rồi thắc mắc "sao nó làm tào lao".
4. **Làm tiếp task chính** — session cha không bị block; thông báo sẽ tự đến.
5. **Gom kết quả** — notify về session cha; cần đào sâu thì dùng lại `sessionID` của child hoặc mở tab Shell xem output.

### Bảng quyết định: foreground hay background?

| Tình huống | Chọn | Lý do |
|---|---|---|
| Test suite chạy 5 phút | Background shell | Timeout 2 phút foreground là cat mất |
| Dev server / watcher | Background shell | Chạy mãi không dứt, không thuộc foreground |
| Review 1 diff lớn | Background subagent | Đọc nhiều, trả ít — không đốt context chính |
| Sửa code thực tế | Session chính | Quyết định + edit không nên tách khỏi bạn |
| Research bản đồ module | Background explore subagent | Kết quả dạng danh sách, độc lập |
| Chuỗi lệnh phụ thuộc nhau | Foreground | Bước sau cần kết quả bước trước |
| Lệnh đang chạy ì giữa chừng | `ctrl+b` | Giải cứu không cần hủy chạy lại |

## Ví dụ chi tiết

### Kịch bản: refactor auth trong lúc research + test chạy nền

```text
Ban: "background explore subagent: ve ban do toan bo code auth trong src/auth,
      tra ve danh sach file + vai tro cua tung file. Khong sua code."
# -> agent tra ve sessionID cua child, ban prompt tiep ngay:

Ban: "trong do, doi ham verifyToken dang viet tay sang jsonwebtoken"

Ban: "background shell: npm test -- --filter auth, chay xong bao ket qua"

# khi ca hai bao xong, ban hop ket qua:
Ban: "doc ket qua test background va ban do auth tu subagent,
      chi ra file nao test do vung"
```

### Tự định nghĩa agent nền rẻ tiền (file `.opencode/agents/research.md`)

```md
---
description: Research doc sach, khong sua file
mode: subagent
model: openai/gpt-5-mini        # chon model re cho viec nen
permissions:
  - action: edit
    resource: "*"
    effect: deny                 # cam sua file
  - action: shell
    resource: "*"
    effect: deny                 # cam chay lenh
---

Tim hieu theo de bai. Tra ve tom tat co so du kien (file:line).
```

**Vì sao cấu hình như vậy?** Comment trong file đã nói: edit/shell `deny` là chốt cửa cho agent nền — research không bao giờ có lý do chạm tay vào repo.

### Cấu hình agent nền bằng JSONC (thay vì file .md)

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "agents": {
    "qa-research": {
      "description": "Research doc sach, khong sua file",   // model chon agent dua vao dong nay
      "mode": "subagent",
      "model": "openai/gpt-5-mini",
      "permissions": [
        { "action": "edit", "resource": "*", "effect": "deny" },
        { "action": "shell", "resource": "*", "effect": "deny" }
      ],
      "steps": 12                  // gioi han so step: de khong chay lan qua lau
    }
  }
}
```

**Vì sao định nghĩa sẵn agent nền?** Prompt "spawn background explore" mỗi lần là lặp lại mô tả vai trò. Định nghĩa 1 lần, đời sau chỉ cần gọi tên agent + đề bài.

### Kéo agent cha ra làm giám sát (permission 2 tầng)

```jsonc title="opencode.jsonc"
{
  "agents": {
    "orchestrator": {
      "permissions": [
        { "action": "subagent", "resource": "*", "effect": "deny" },
        { "action": "subagent", "resource": "qa-research", "effect": "allow" }  // chi duoc thue agent nay
      ]
    }
  }
}
```

**Vì sao quan trọng?** Permission `subagent` là cổng ai được thuê đệ. Không chỉnh thì agent nào cũng spawn được gì đó; chỉnh đúng thì orchestrator chỉ gọi được đúng agent nền bạn duyệt.

## Giải thích từng phần

- **`sessionID` của child** — chìa khóa để "bám" việc nền. Không lưu thì child xong là mất dấu, muốn hỏi thêm phải spawn lại từ đầu.
- **Notify khi xong** — kết quả về đúng session cha, bạn không phải ngồi poll. Kèm tóm tắt; chi tiết đầy đủ ở child session.
- **Fresh context** — con không kế thừa lịch sử chat. Tốt (rẻ, sạch) và xấu (phải giao đề bài đầy đủ). Hãy viết prompt nền như viết issue cho đồng nghiệp mới đến.
- **Depth 1** — chặn chuỗi đệ quy vô hạn đốt tiền. Bật `experimental.subagent_depth` chỉ khi thật sự cần agent trung gian điều phối.
- **Permission 2 tầng** — cha cần `subagent` permission để launch (vd `deny` agent nào đó), con dùng permission của chính nó khi làm việc. Khác v1 ở chỗ không còn khái niệm "con thừa kế hết quyền cha".

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Chạy nền trong máy bạn | background subagent + background shell, notify về session | coding agent cloud (async qua PR) | background tasks/bash tương tự |
| Model riêng cho việc nền | có (mỗi agent 1 model, không cấu hình thì kế thừa cha) | chọn model/alloc riêng | có, tùy bản |
| Đẩy việc đang chạy ra nền | `ctrl+b` giữa chừng | không có tương đương trực tiếp | không có tương đương trực tiếp |
| Chạy không cần TUI | `opencode run` (--standalone cho CI) | CLI/Actions | `claude -p` headless |

Ghi chú: bảng này đối chiếu theo khả năng tổng quát, từng bản của Copilot/Claude Code thay đổi nhanh — kiểm chứng lại khi bạn đọc.

## Lỗi thường gặp

### 1. Giao việc nền mơ hồ

```text
❌ SAI: "review code giup" (background, khong noi review cai gi, branch nao)
✅ ĐÚNG: "background general subagent: review diff branch feat/login vs main, chi liet ke severity + file:line, khong sua code"
```
**Bài học:** child có context mới — giao việc mơ hồ thì nhận kết quả mơ hồ.

### 2. Nhiều background đụng chung tài nguyên

```text
❌ SAI: 3 background cung chay `npm test` + 2 agent cung sua src/api.ts
✅ ĐÚNG: 1 background test, 1 background research doc-only, session chinh lam phan sua duy nhat
```
**Bài học:** tách theo tài nguyên — ai có quyền ghi file thì chỉ một đứa.

### 3. Quên foreground shell có timeout

```text
❌ SAI: chay dev server foreground roi ngoi cho (2 phut sau bi cat timeout)
✅ ĐÚNG: dev server/test suite dai -> background ngay tu dau, hoac ctrl+b khi thay roi
```
**Bài học:** cái "chạy mãi không dứt" (server, watcher) không bao giờ thuộc về foreground.

## Best practices (kèm "vì sao")

- Mỗi background 1 owner + 1 output (file/tóm tắt). **Vì sao?** Không là lúc gộp không biết đứa nào làm gì.
- Review/test cho ra nền, quyết định giữ ở session chính. **Vì sao?** Nền thu thập, chính quyết — đỡ loạn.
- Lưu `sessionID` child vào ghi chú khi việc nền kéo dài nhiều lượt. **Vì sao?** Tiếp tục child cũ rẻ hơn và giữ được ngữ cảnh, so với spawn lại từ đầu.
- Giao việc nền bằng prompt tự đủ (ngữ cảnh + phạm vi + định dạng kết quả + điều cấm). **Vì sao?** Con không đọc được đoạn chat bạn tưởng "nó chắc biết".
- Chỉ nên tăng `subagent_depth` khi có agent điều phối thật sự. **Vì sao?** Mỗi tầng lồng là một lớp context gián tiếp + chi phí nhân lên.

## Bài tập nhỏ

1. (10 phút) Spawn 1 background explore vẽ bản đồ 1 module, trong lúc đó bạn làm 1 task khác ở session chính — cảm nhận không-block. Xong thử dùng lại `sessionID` để hỏi thêm child.
2. (5 phút) Chạy 1 shell lâu ở background (lint/test), mở tab Shell xem output, rồi kill bằng `ctrl+d`.
3. (5 phút) Chạy 1 lệnh install foreground, chờ đến khi thấy ì, nhấn `ctrl+b` đẩy ra nền và prompt tiếp.

## Reference

Nguồn chính thức (đã verify 28/10/2026):

- Tools — `shell` background, `subagent` background, timeout 2 phút: https://opencode.ai/v2/docs/tools/
- Agents — subagent mode, fresh context, permission `subagent`: https://opencode.ai/v2/docs/agents/
- Config — `experimental.subagent_depth`: https://opencode.ai/v2/docs/config/
- Keybinds — `session.background` (ctrl+b), `composer.shell.*`: https://opencode.ai/v2/docs/cli/keybinds/
- CLI — `opencode run`, `--standalone`, ví dụ CI: https://opencode.ai/v2/docs/cli/commands/

Bài liên quan: [11 — Sessions & undo](./11-sessions-undo-compaction.md) (child session + snapshot), [05 — Agents](./05-agents-build-plan-custom.md) (định nghĩa subagent), [09 — Permissions & policies](./09-permissions-policies.md) (permission 2 tầng), tips [04 — Parallel & background](../02-tips-thuc-chien/04-parallel-background.md) (quy trình song song thực chiến).

> **Chốt bài 10:** việc độc lập + lâu → nền. Session chính giữ quyết định, không ôm việc càn quét.
