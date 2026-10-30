# 18 — `/init` + Rules + `AGENTS.md` (luật dự án, một file duy nhất)

> **Dành cho:** dev muốn agent "nghe lời" ngay từ prompt đầu tiên · **Vấn đề:** gõ lại lệnh build/test mỗi session, hoặc để rules sai tên file rồi thắc mắc "sao agent không nghe" · **Đọc xong:** dùng `/init` sinh `AGENTS.md`, hiểu cơ chế Rules (`AGENTS.md` + `instructions`), viết `AGENTS.md` cho monorepo đúng cách, biết vì sao phải commit file này · **Thời gian:** ~12 phút.

## Mục tiêu bài học

- Dùng `/init` để sinh bản nháp `AGENTS.md` từ codebase thật.
- Hiểu cơ chế nạp instructions: global → project → nested, thứ tự gộp không override.
- Biết `AGENTS.md` là file luật **duy nhất** v2 đọc (không fallback `CLAUDE.md`).
- Dùng `instructions[]` để nạp thêm file/glob/URL, và nạp `AGENTS.md` lồng nhau cho monorepo.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Luồng hoạt động](#luồng-hoạt-động-flow)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. `/init`: sinh `AGENTS.md` từ chính repo của bạn

**1 câu:** `/init` là lệnh trong TUI hỏi agent đọc project rồi sinh/nâng cấp `AGENTS.md` — bản kê khai lệnh build, quy ước, vùng cấm.

**Nôm na:** như viết sổ tay onboarding cho nhân viên mới, nhưng thay vì bạn ngồi viết, bạn nhờ chính agent liệt kê những gì nó cần biết. Bạn ngồi đọc, sửa, rồi approve — agent là thư ký soạn thảo, bạn là người ký.

```text
/init
```

Chạy trong TUI ở thư mục gốc project. Agent đọc cấu trúc repo (package.json, Makefile, README...), rồi đề xuất nội dung `AGENTS.md`. **Luôn xem lại** trước khi commit — agent có thể ghi sai lệnh build hoặc bỏ sót quy ước quan trọng.

**Vì sao quan trọng?** Không có `AGENTS.md` = mỗi session agent phải đoán lại lệnh test, quy ước code, vùng cấm — và đoán sai là nó tự chế cách build. Một file luật tốt là đòn đầu tư rẻ nhất cho chất lượng output.
**Nếu làm sai?** Tin nguyên văn nội dung `/init` sinh ra mà không kiểm chứng → agent chạy sai lệnh, hoặc còn tệ: chạy lệnh phá dữ liệu vì luật không cấm.

> Lưu ý: `/init` không được liệt kê trong trang slash commands của docs v2 (verify 28/10/2026 — [docs/cli/tui](https://opencode.ai/v2/docs/cli/tui/) chỉ liệt kê `/new`, `/sessions`, `/models`, `/agents`, `/undo`, `/redo`, `/editor`, `/themes`...). Gõ `/` trong TUI để xem danh sách lệnh thật của bản bạn đang chạy; nếu bản của bạn không có `/init`, hãy tự viết `AGENTS.md` theo mẫu phần 3 — kết quả như nhau.

### 2. Rules = `AGENTS.md` + `instructions[]`

**1 câu:** "Rules" trong OpenCode v2 không phải config riêng — đó là cách gọi của cộng đồng cho bộ file hướng dẫn agent nạp mỗi session: `AGENTS.md` (discovered) + mảng `instructions` trong config.

**Nôm na:** rules là "quy ước văn phòng" — viết ra giấy, dán lên tường, ai vào phòng cũng đọc. OpenCode đọc các "tấm giấy" này trước mỗi phiên làm việc và cộng chúng vào system prompt (không ghi đè nhau — gộp lại).

Điều quan trọng nhất v2: **chỉ đọc `AGENTS.md`, không fallback `CLAUDE.md`** (verify 28/10/2026 — [docs/instructions](https://opencode.ai/v2/docs/instructions/)). Để `CLAUDE.md` cũ từ thời Claude Code thì OpenCode chưa từng đọc nó.

```md
# AGENTS.md
- Run `bun typecheck` after changing TypeScript.
- Keep database queries in `src/database`.
- Do not edit generated files directly.
```

Đây chính là ví dụ docs dùng — ngắn, hành động được, mỗi dòng là một luật kiểm chứng được.

### 3. Thứ tự nạp và phạm vi

Cấu trúc nạp (verify 28/10/2026 — [docs/instructions](https://opencode.ai/v2/docs/instructions/)):

```text
~/.config/opencode/AGENTS.md      ← global, cho mọi project
~/code/my-project/AGENTS.md       ← root repo
~/code/my-project/packages/AGENTS.md
~/code/my-project/packages/web/AGENTS.md  ← workspace hiện tại
```

Thứ tự gộp:

```text
1. Agent hoặc provider system prompt
2. Code Mode tool guidance (khi bật)
3. MCP server / reference / skill guidance
4. Global + project AGENTS.md, rồi instructions khai báo trong config
5. Built-in date + environment context
6. Session-specific instructions từ API
```

Các nguồn này **gộp lại, không override nhau**. File `AGENTS.md` lồng nhau nạp nearest-first (gần workspace trước), có dedupe.

File ở thư mục con (nested) không nạp ngay từ đầu — nạp **khi agent đọc tới vùng đó**:

```text
my-project/
├── AGENTS.md                 ← nạp ngay khi mở session
└── packages/
    └── web/
        ├── AGENTS.md         ← nạp khi agent đọc vùng này
        └── src/
            └── app.ts        ← target agent đọc
```

**Vì sao quan trọng?** Cơ chế "lazy load theo vùng đọc" chính là cách monorepo tránh nhồi cả nghìn dòng luật của mọi package vào context ngay từ đầu — chỉ luật của vùng agent đang đụng tới mới nạp.
**Nếu làm sai?** Đặt luật "luôn chạy `bun test` trước khi commit" trong `packages/web/AGENTS.md` nhưng agent chủ yếu làm việc ở `packages/api` — luật đó sẽ không bao giờ được nạp.

### 4. `instructions[]`: nạp thêm file ngoài `AGENTS.md`

**1 câu:** Mảng `instructions` trong `opencode.jsonc` khai báo thêm file, glob, hoặc URL HTTP(S) để nạp cùng `AGENTS.md`.

```jsonc
// opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "CONTRIBUTING.md",          // file trong repo
    "docs/guidelines/*.md",     // glob
    "~/rules/opencode.md",      // file global ngoai repo
    "https://example.com/instructions.md"  // URL, fetch khi load config
  ]
}
```

| Entry | Cách resolve |
|---|---|
| Relative path/glob | Tìm từ workspace lên project root |
| `~/` path | Từ home directory |
| Absolute path | Dùng nguyên văn; tên file có thể là glob |
| `http(s)://` | Fetch khi config load, timeout 5 giây |

File local cập nhật giống `AGENTS.md` (tự reload khi đổi); file khớp glob mới nạp ở lần config đổi kế tiếp; file thiếu bị bỏ qua; URL lỗi fetch bị bỏ qua hoặc giữ nội dung lần fetch cuối.

Configured instructions nạp **sau** `AGENTS.md`, theo thứ tự liệt kê; entry từ mọi config document đều gộp.

### 5. Vì sao phải commit `AGENTS.md`?

**1 câu:** Commit `AGENTS.md` để mọi người làm việc trong repo — kể cả CI bot và máy đồng nghiệp — nhận cùng bộ luật mà không cần copy tay.

**Nôm na:** `AGENTS.md` như README cho máy móc. Nếu bạn chỉ để local, mỗi người một luật, CI chạy một luật khác — code review sẽ toàn "máy nó tự sinh code kiểu lạ". Commit lên = luật là của repo, không phải của ai cả.

Docs ghi rõ: "Commit project instruction files so everyone working in the repository receives the same guidance" (verify 28/10/2026 — [docs/instructions](https://opencode.ai/v2/docs/instructions/)).

- CI bot chạy `opencode run` (bài 17) trong checkout repo → nó cũng đọc `AGENTS.md` đã commit, hành vi giống dev.
- Dev mới onboard: pull repo là có luật, không cần hỏi "project này test kiểu gì".
- Sửa luật là một PR — review được, revert được, có lịch sử.

## Luồng hoạt động

1. Session mới mở → nạp global `~/.config/opencode/AGENTS.md` + project `AGENTS.md` từ workspace lên tới root/home.
2. Agent đọc file trong project → `AGENTS.md` ở thư mục giữa target và workspace được nạp nearest-first (lazy, có dedupe).
3. Config `instructions[]` nạp sau `AGENTS.md`, theo thứ tự khai báo.
4. Tất cả **gộp** vào instruction block của session, không override.
5. Session đang chạy, bạn sửa `AGENTS.md` → OpenCode phát hiện và nạp "instruction update" **trước prompt kế tiếp**:

```text
AGENTS.md changes
→ instruction update
→ next prompt
```

Lỗi hay gặp theo bước:

- Bước 1: file đặt sai tên (`CLAUDE.md`, `Agents.md`, `agents.md` ở nơi không discover) → không nạp, không warning.
- Bước 2: luật nằm ở thư mục agent không bao giờ đọc → luật không kích hoạt.
- Bước 3: URL instructions không fetch được → bị bỏ qua, tưởng "đã nạp".
- Bước 5: sửa nested `AGENTS.md` sau khi nó đã nạp → **không** được tự phát hiện (docs ghi rõ: "Edits to a nested file are not detected automatically after it loads") → phải mở session mới.

## Ví dụ chi tiết

Monorepo 3 package — mỗi package một `AGENTS.md` riêng, root chỉ đặt luật chung:

```text
my-monorepo/
├── AGENTS.md                       # luat chung ca repo
├── packages/
│   ├── web/
│   │   ├── AGENTS.md               # luat rieng frontend
│   │   └── src/
│   ├── api/
│   │   ├── AGENTS.md               # luat rieng backend
│   │   └── src/
│   └── shared/
│       └── AGENTS.md
└── opencode.jsonc
```

```md
# AGENTS.md (root)
- Package manager: pnpm. Do not use npm or yarn.
- Run `pnpm lint` and `pnpm typecheck` before saying done.
- Never edit files under `packages/shared/generated/`.
- Commit messages follow conventional commits.
```

```md
# packages/web/AGENTS.md
- Use React Server Components by default.
- Styling: Tailwind only. No inline style objects.
- Run `pnpm --filter web test` after changing tests.
```

```md
# packages/api/AGENTS.md
- All endpoints return the envelope { data, error }.
- Database access only via src/db (Drizzle). No raw SQL strings.
- Run `pnpm --filter api test` after changing handlers.
```

Điểm mấu chốt: luật đặt **gần code nó điều chỉnh**. Agent làm việc ở `packages/api/src/handler.ts` sẽ nạp root + `packages/api/AGENTS.md` — không thấy luật của `web`, đỡ tốn context và không "ám ảnh" nhầm.

Kèm config mở rộng bằng `instructions[]`:

```jsonc
// opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "CONTRIBUTING.md",
    "docs/security-rules.md"
  ]
}
```

- `CONTRIBUTING.md` thường đã có sẵn trong repo — tái dùng thay vì viết lại trong `AGENTS.md`.
- `docs/security-rules.md` tách riêng để team security duy trì, không đụng file `AGENTS.md` của dev.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | GitHub Copilot | Claude Code |
|---|---|---|---|
| File luật repo | `AGENTS.md` (duy nhất, không fallback) | `.github/copilot-instructions.md` + `AGENTS.md` | `CLAUDE.md` |
| Tự sinh bản nháp | `/init` (TUI; cần verify trên bản đang chạy) | Không có lệnh riêng | `/init` (sinh `CLAUDE.md`) |
| Nested theo thư mục | Có — lazy load nearest-first, dedupe | Chỉ 1 file root | Có — `CLAUDE.md` lồng nhau |
| Nạp thêm file khác | `instructions[]` (file/glob/URL) | Không | `@file` trong `CLAUDE.md` |
| Sửa luật giữa session | Ambient/upward file được phát hiện, nạp trước prompt kế | Cần restart | Cần restart |
| Global rules | `~/.config/opencode/AGENTS.md` | VS Code settings | `~/.claude/CLAUDE.md` |

Điểm khác mốc: OpenCode chỉ đọc **một** tên file (`AGENTS.md`) — chuẩn mở, công cụ nào cũng hiểu; Copilot đọc 2, Claude đọc 1 nhưng tên khác. Nếu repo của bạn đã có `CLAUDE.md`, phải copy/sang `AGENTS.md`, không có fallback tự động.

## Lỗi thường gặp

### 1. Giữ `CLAUDE.md` và tưởng OpenCode đọc nó

```text
❌ SAI: de CLAUDE.md tu thoi Claude Code roi bao "sao OpenCode khong nghe loi"
✅ ĐÚNG: v2 chi discover AGENTS.md, khong fallback CLAUDE.md;
   copy/sang AGENTS.md (hoac de ca hai va dong bo bang tay neu van dung Claude Code song song)
```
**Bài học:** sai tên file = luật không tồn tại. Đây là lỗi số một khi migrate từ Claude Code sang OpenCode.

### 2. Nhồi mọi luật vào root cho monorepo

```text
❌ SAI: 500 dong AGENTS.md o root gom luat cua ca 5 package
✅ ĐÚNG: root chi luat chung; package AGENTS.md rieng, nạp lazy khi agent doc vung do
```
**Bài học:** luật xa vùng làm việc vừa tốn context vừa gây nhiễu — agent làm service A bị luật service B ám ảnh (chạy lệnh sai package...).

### 3. Sửa nested `AGENTS.md` giữa session rồi ngỡ tự cập nhật

```text
❌ SAI: sua packages/web/AGENTS.md giua session dang chay bao "sao luat moi khong an"
✅ ĐÚNG: nested file da load thi edit khong duoc tu dong phat hien; mo session moi
   (rieng file ambient/upward thi duoc phat hien truoc prompt ke tiep)
```
**Bài học:** phân biệt 2 loại: file nạp từ đầu (global/root — edit được tự phát hiện) và nested file (lazy — phải session mới).

### 4. Tin nguyên văn output `/init`

```text
❌ SAI: chay /init xong commit luôn, khong doc
✅ ĐÚNG: doc lai tung dong; kiem chung lenh build/test that su chay duoc;
   bo sung quy uoc an toan (deny git push, khong sua file generated...)
```
**Bài học:** `/init` là bản nháp do agent đoán từ codebase — nó có thể ghi lệnh sai hoặc thiếu luật quan trọng. Bạn là người ký, không phải agent.

## Best practices (kèm "vì sao")

- `AGENTS.md` ngắn, mỗi dòng một hành động kiểm chứng được. **Vì sao?** File dài khiến luật quan trọng bị chìm; agent xử lý instruction theo từng dòng — dòng rườm rà dễ bị bỏ qua.
- Đặt luật gần code nó điều chỉnh (nested cho monorepo), luật chung ở root. **Vì sao?** Cơ chế lazy load chỉ nạp file trên đường agent đọc — luật đúng chỗ thì đúng lúc được dùng.
- Luôn viết lệnh **đã chạy thử** vào file, không viết lệnh "lý thuyết là đúng". **Vì sao?** Một lệnh build sai trong `AGENTS.md` khiến agent lặp lại sai cả session — tốn tiền và thời gian hơn cả khi không có luật.
- Commit `AGENTS.md` vào repo, không đưa vào `.gitignore`. **Vì sao?** Docs ghi rõ để mọi người + CI bot nhận cùng guidance; để local thì luật của mỗi người một kiểu.
- Dùng `instructions[]` cho file luật đã tồn tại (`CONTRIBUTING.md`, security docs) thay vì copy vào `AGENTS.md`. **Vì sao?** Một nguồn sự thật — sửa một chỗ, cả agent lẫn con người đều thấy.
- Sau khi đổi luật quan trọng, chạy `/init` lại hoặc tự review file để đồng bộ. **Vì sao?** `AGENTS.md` lỗi thời nguy hiểm hơn không có — agent tin tưởng tuyệt đối những gì ghi trong đó.

## Bài tập nhỏ

1. (5 phút) Mở TUI ở 1 repo thật, chạy `/init` (nếu bản của bạn không có, tự viết `AGENTS.md` theo mẫu root ở trên). Đọc từng dòng, sửa lại chỗ sai.
2. (5 phút) Chạy lệnh build/test mà `AGENTS.md` ghi — nếu lỗi, sửa file rồi commit. Xác nhận file đã vào git (`git log --oneline -- AGENTS.md`).
3. (7 phút) Với monorepo: tạo `AGENTS.md` ở 1 package con với 1 luật đặc thù, mở session ở package đó và hỏi agent "quy ước package này là gì?" — xác nhận agent trả lời đúng luật (chứng tỏ lazy load hoạt động).
4. (4 phút) Thêm `instructions: ["CONTRIBUTING.md"]` vào `opencode.jsonc`, sửa 1 dòng trong CONTRIBUTING.md giữa session — xác nhận instruction update xuất hiện trước prompt kế.
5. (3 phút) Đổi tên `AGENTS.md` thành `Agents.md` (hoa thường khác) trong 1 repo thử — xác nhận agent không còn nạp luật (chứng minh discover phân biệt hoa thường theo tên chính xác).

## Reference

- Instructions + `AGENTS.md`: https://opencode.ai/v2/docs/instructions/ (verify 28/10/2026)
- TUI commands (`/themes`, `/models`... — `/init` không được liệt kê chính thức): https://opencode.ai/v2/docs/cli/tui/ (verify 28/10/2026)
- Config `instructions`: https://opencode.ai/v2/docs/config/ (verify 28/10/2026)
- Migrate v1: chỉ discover `AGENTS.md`, không fallback `CLAUDE.md`: https://opencode.ai/v2/docs/migrate-v1/ (verify 28/10/2026)
- Commit instruction files: https://opencode.ai/v2/docs/instructions/ (verify 28/10/2026)

## Đọc tiếp

- [14-worktree-git-ide-acp.md](./14-worktree-git-ide-acp.md) — `AGENTS.md` trong bối cảnh worktree + thứ tự nạp ban đầu chi tiết.
- [03-config-opencode-jsonc.md](./03-config-opencode-jsonc.md) — `instructions[]` nằm trong tầng config nào, merge ra sao.
- [05-agents-build-plan-custom.md](./05-agents-build-plan-custom.md) — `system` prompt của agent riêng đi trước `AGENTS.md`.
- [17-cicd-github-gitlab.md](./17-cicd-github-gitlab.md) — CI bot cũng đọc `AGENTS.md` đã commit.
- [../02-tips-thuc-chien/01-agents-md-hygiene.md](../02-tips-thuc-chien/01-agents-md-hygiene.md) — hygiene sâu: giữ file gọn, tránh mâu thuẫn.
- [../templates/](../templates/) — template `AGENTS.md` copy-paste dùng ngay.

> **Chốt bài 18:** `AGENTS.md` là hợp đồng giữa bạn và agent — `/init` giúp soạn nháp, nhưng người ký và chịu trách nhiệm nội dung vẫn là bạn; sai một dòng luật là agent sai một nghìn lần giống nhau.
