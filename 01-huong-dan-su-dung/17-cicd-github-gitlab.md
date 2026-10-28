# 17 — CI/CD với OpenCode 2 (chạy agent trong pipeline, không cần GitHub Action)

> **Dành cho:** dev muốn review tự động khi merge PR / CI pipeline chạy agent trên code mới · **Vấn đề:** v2.2.0 đã bỏ GitHub Action — dùng action cũ sẽ lỗi; phải dùng `opencode run` đúng cách mới chạy được · **Đọc xong:** viết pipeline GitHub Actions + GitLab CI dùng `opencode run --standalone`, truyền secrets đúng cách, biết flags phù hợp cho CI · **Thời gian:** ~15 phút.

## Mục tiêu bài học

- Hiểu vì sao v2.2.0 bỏ GitHub Action và cách thay thế.
- Viết workflow GitHub Actions dùng `opencode run` đúng cách (`--standalone`).
- Viết `.gitlab-ci.yml` cùng pattern.
- Truyền secrets qua `{env:NAME}` hoặc biến môi trường pipeline đúng cách.

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Lưu ý quan trọng: GitHub Action đã bị bỏ](#lưu-ý-quan-trọng-github-action-đã-bị-bỏ)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [Luồng hoạt động](#luồng-hoạt-động-flow)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. `opencode run`: agent cho non-interactive

**1 câu:** `opencode run` gửi prompt và in reply ra terminal mà không mở TUI — thiết kế cho script, CI jobs, và workflow tự động (verify 28/10/2026 — [docs/cli](https://opencode.ai/v2/docs/cli/)).

**Nôm na:** TUI là bạn ngồi nói chuyện trực tiếp với agent; `run` là nhắn tin cho agent mà không cần mở cửa — phục vụ cho máy móc (CI pipeline, script, cron job). Người đọc là bạn (qua log) chứ không phải terminal.

```bash
# Cơ bản
opencode run "Review this repository for correctness and summarize any issues."

# Với model cụ thể
opencode run --model anthropic/claude-sonnet-5-5 "Refactor parseToken"

# Nối tiếp session trước
opencode run --continue "Now handle the expired case"

# JSON cho script parse
opencode run --format json "List the TODO comments"

# Đính kèm file
opencode run --file src/server.ts --file src/client.ts "Review these for bugs"

# Chạy với agent khác
opencode run --agent build "Fix the failing test"

# Nối session cụ thể
opencode run --session ses_4f2a1c "Check edge cases"

# Auto-approve permissions (khong co ai bam approve trong CI)
opencode run --auto "Fix the failing test"
```

Flags quan trọng cho CI:

| Flag | Dùng khi nào |
|---|---|
| `--standalone` | Chạy private server (không phụ thuộc background service đang chạy) — **bắt buộc trong CI**. |
| `--model provider/model` | Chọn model cụ thể thay vì mặc định. |
| `--continue` | Nối prompt vào session cuối cùng. |
| `--agent build/plan/general` | Chọn agent. |
| `--format json` | Output newline-delimited JSON cho script. |
| `--file path` | Đính kèm file vào prompt (nhiều `--file` được). |
| `--auto` | Auto-approve permissions không explicitly deny. |

**Vì sao quan trọng?** Không dùng `--standalone` trong CI = lệnh không tìm thấy server (vì CI runner không có background service OpenCode), và mọi prompt đều treo chờ TUI. Flags `--auto` vì trong CI không ai bấm Allow cho permission request.
**Nếu làm sai?** Không `--standalone` → `opencode run` gọi background service mà runner không có → lỗi "no server running". Không `--auto` → lệnh shell nào đó cần permission và pipeline chờ mãi.

### 2. Secrets trong CI: `{env:}` hay biến môi trường

**1 câu:** Truyền API key qua biến môi trường pipeline (GitHub Secrets / GitLab CI Variables), không bao giờ hardcode trong workflow YAML.

**Nôm na:** key API giống chìa khóa nhà — đừng bao giờ dán lên cửa kính. Cho vào két (secrets/variables) rồi truyền qua biến môi trường vào CI job.

```yaml
# GitHub Actions
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

```yaml
# GitLab CI
variables:
  ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY  # tu GitLab CI variable
```

Hoặc truyền qua `{env:NAME}` trong config:

```jsonc
// opencode.jsonc (khong dua vao CI — chi dung khi CI co file config nay)
{
  "providers": {
    "anthropic": {
      "settings": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

Trong CI pipeline thường không có file config project, nên cách đúng nhất là truyền env var trực tiếp khi chạy `opencode run` — OpenCode tự nhận biến môi trường cho provider credentials.

## Lưu ý quan trọng: GitHub Action đã bị bỏ

**Quan trọng — verify 28/10/2026:** OpenCode v2.2.0 (27/10/2026) đã **bỏ GitHub Action** như một trong 3 breaking changes. Action cũ không còn được duy trì và không chạy đúng trên v2.2.0+. Có thể tìm thấy action cũ trên GitHub Marketplace — **đừng dùng**. Cảm ơn `opencode run --standalone` chính là cách CI được khuyến nghị chính thức từ docs (verify 28/10/2026 — [docs/cli/commands](https://opencode.ai/v2/docs/cli/commands)).

**Nôm na:** action cũ như một chiếc áo phao cũ — không còn được bảo trì, không còn đúng size, và có thể chìm. Dùng `opencode run` như cách tiếp cận chính thức và duy trì được.

Nếu pipeline cần chạy `opencode run` nhiều lần, hãy cài CLI rồi gọi command — pattern này docs chính thức dùng trong ví dụ CI.

## Ví dụ chi tiết

### GitHub Actions: review tự động khi có PR

Workflow lấy từ docs chính thức (verify 28/10/2026 — [docs/cli/commands](https://opencode.ai/v2/docs/cli/commands)):

```yaml
# .github/workflows/opencode-review.yml
name: OpenCode review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install --global @opencode/cli
      - run: opencode run --standalone --model anthropic/claude-sonnet-5-5 "Review this repository for correctness and summarize any issues."
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Giải thích từng phần:

- `actions/checkout@v4` — checkout code trước; agent cần code để review.
- `npm install --global @opencode/cli` — cài CLI vào runner. Bản npm dùng postinstall script để chọn native binary cho platform.
- `--standalone` — chạy **private server** trong job này, không phụ thuộc background service (runner nào cũng không có sẵn).
- `env: ANTHROPIC_API_KEY` — key được truyền qua biến môi trường; OpenCode đọc env var cho provider. **Không hardcode key trong YAML.**
- Model: `--model anthropic/claude-sonnet-5-5` — chọn model rõ ràng, không phụ thuộc config.

Biến thể review từng diff thay vì cả repo (sửa theo nhu cầu của bạn — đây là template, cần verify prompt phù hợp project):

```yaml
      - name: Review diff
        run: |
          git fetch origin main
          DIFF=$(git diff origin/main...HEAD)
          opencode run --standalone --model anthropic/claude-sonnet-5-5 "Review this diff for correctness and security issues:

          $DIFF"
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### GitLab CI: cùng pattern, khác runner

Docs chính thức chỉ có ví dụ GitHub Actions; `.gitlab-ci.yml` dưới đây là **phóng tác theo cùng pattern** (cần verify prompt/model của bạn — không phải ví dụ chính thức từ docs):

```yaml
# .gitlab-ci.yml
opencode-review:
  stage: test
  image: node:22
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  script:
    - npm install --global @opencode/cli
    - opencode run --standalone --model anthropic/claude-sonnet-5-5 "Review changes in this merge request for correctness, list issues with file:line."
  variables:
    ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY  # dat trong GitLab CI/CD Variables (masked)
```

- `rules: if: $CI_PIPELINE_SOURCE == "merge_request_event"` — chỉ chạy khi có MR, đừng đốt tiền model cho mọi push.
- Biến masked trong GitLab CI/CD Settings → CI/CD → Variables không hiện trong log job.
- GitLab runner không có terminal tương tác → `opencode run` non-interactive là lựa chọn duy nhất, giống GitHub.

### Truyền config project cho CI (nếu cần permissions/MCP)

```yaml
      # Neu can permissions/MCP server, CI phai co file config.
      # Truyen qua bien moi truong thay vi commit secrets.
      - run: opencode run --standalone --model anthropic/claude-sonnet-5-5 "Review the new API endpoint"
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          MCP_API_KEY: ${{ secrets.MCP_API_KEY }}
```

Nếu config `opencode.jsonc` của bạn có `{env:MCP_API_KEY}` trong `mcp.servers.*.headers`, giá trị env var của pipeline sẽ được thay vào `{env:NAME}` khi config load.

## Luồng hoạt động

1. CI checkout code → install `@opencode/cli` (npm global).
2. Chạy `opencode run --standalone --model ... "..."` với env vars cho secrets.
3. OpenCode khởi private server trong runner, load config project (nếu có), chạy agent.
4. Agent dùng `read`/`grep`/`shell`... làm việc; `--auto` auto-approve permissions; output in stdout.
5. Parse JSON (`--format json`) nếu script cần, hoặc để output trực tiếp trong job log.

Lỗi hay gặp theo bước:

- Bước 2: quên `--global` flag nếu dùng npm → `command not found: opencode`.
- Bước 3: quên env var → provider báo authentication error; không `--standalone` → lỗi "no server".
- Bước 3: quên `--auto` → agent kêu permission và treo (nếu nó cần chạy shell).

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | GitHub Copilot | Claude Code |
|---|---|---|---|
| Chạy trong CI | `opencode run --standalone` | GitHub Copilot CLI / coding agent | `claude -p` (non-interactive) |
| GitHub Action | **Đã bị bỏ ở v2.2.0** | Có Copilot Action | Có Claude GitHub Action |
| GitLab CI | Chạy như script thường qua CLI | Không chính thức | Không chính thức |
| Secrets | Env var / `{env:NAME}` | Repo secrets | Env var |
| Kết quả vào PR | Log output / script tự xử lý | PR comment tự động | PR comment |

Điểm khác: Copilot và Claude Code có GitHub Action chính thức được duy trì; OpenCode v2.2.0 đã bỏ theirs — cách chính thức là dùng `opencode run` trực tiếp. Điều này đồng nghĩa bạn phải tự cài CLI trong pipeline và tự xử lý output, đổi lại bạn kiểm soát hoàn toàn.

## Lỗi thường gặp

### 1. Dùng GitHub Action cũ trên v2.2.0+

```text
❌ SAI: giu action cu (uses: anomalyco/opencode-action@...) trong workflow va bao "khong chay"
✅ ĐÚNG: v2.2.0 da bo GitHub Action; thay bang job chay `opencode run --standalone`
   (install npm --global @opencode/cli roi goi command)
```
**Bài học:** breaking change 2.2.0 — action không còn được duy trì. Pipeline cũ dùng action sẽ fail hoặc hành vi không đảm bảo. Xem [../README.md](../README.md) — phiên bản 2.2.0 ghi rõ GitHub Action bị bỏ.

### 2. Quên `--standalone` trong CI

```text
❌ SAI: opencode run "review" trong CI job -> khong co background service -> fail
✅ ĐÚNG: opencode run --standalone ... de chay private server trong chinh job do
```
**Bài học:** CI runner là môi trường sạch, không có background service như máy dev. `--standalone` là cách docs chính thức chỉ cho CI.

### 3. Hardcode API key trong workflow

```text
❌ SAI: env: ANTHROPIC_API_KEY: sk-ant-abc...  (hardcode trong YAML)
✅ ĐÚNG: env: ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }} (GitHub) hoac
   $ANTHROPIC_API_KEY (GitLab, dat trong CI/CD Variables voi mask)
```
**Bài học:** key hardcode trong YAML sẽ vào git history mãi mãi — kể cả xoá file cũng không xoá được lịch sử commit. Secrets là biện pháp duy nhất an toàn.

### 4. Không `--auto` và pipeline treo

```text
❌ SAI: opencode run "fix the failing test" trong CI -> agent chay shell can permission -> treo
✅ ĐÚNG: opencode run --auto "..." de auto-approve permission khong bi deny;
   hoac define permissions allow/deny truoc trong opencode.jsonc
```
**Bài học:** CI không ai bấm Allow. Chỉ có `--auto` hoặc config permissions rõ ràng trước. Lưu ý: `--auto` vẫn tôn trọng rule `deny` explicit.

## Best practices (kèm "vì sao")

- Trong CI luôn dùng `--standalone`. **Vì sao?** Runner không có background service dùng chung; `--standalone` tự chạy private server rồi exit sạch sẽ.
- Đặt review agent ở ngưỡng `plan` hoặc dùng model rẻ. **Vì sao?** Review mỗi PR cần 1 model gọi; dùng model đắt như Opus cho review thường xuyên là lãng phí.
- Cho phép `--auto` chỉ khi permissions config đã deny rõ những gì nguy hiểm. **Vì sao?** `--auto` không vượt được rule `deny` — vẫn an toàn nếu `deny` được viết đúng, nhưng đừng trông chờ nó thay phanh.
- Kết quả review nên ghi vào file hoặc dùng `--format json` để script parse. **Vì sao?** Output text tự do khó parse; JSON cho phép CI job tiếp theo (post comment, đánh giá) hoạt động có kiểm soát.
- Secrets luôn qua CI secrets, không hardcode trong YAML hay config file. **Vì sao?** Config file đi vào git; một khi key lộ thì phải revoke + rotate — chi phí cao hơn nhiều so với đặt secrets đúng chỗ từ đầu.
- Không dùng GitHub Action cũ trên v2.2.0. **Vì sao?** v2.2.0 đã bỏ nó như một breaking change (verify 28/10/2026) — chạy tiếp là đứng trước nguy cơ lỗi không được fix.

## Bài tập nhỏ

1. (5 phút) Cài `@opencode/cli` local rồi chạy `opencode run --standalone --model anthropic/claude-sonnet-5-5 "Summarize this repository"` — xác nhận có output, không cần TUI.
2. (7 phút) Tạo workflow GitHub Actions như ví dụ trên, thêm secret `ANTHROPIC_API_KEY`, tạo PR thử — xem log job có output review.
3. (7 phút) Viết `.gitlab-ci.yml` theo template trên, chạy trên 1 MR — xác nhận log job có output.
4. (3 phút) Thử `opencode run --format json "list TODO comments"` rồi pipe qua `jq` — xác nhận parse được.
5. (5 phút) So sánh thời gian và cost giữa `--model anthropic/claude-sonnet-5-5` và model rẻ hơn cho cùng một review — ghi lại vào 1 bảng nhỏ.

## Reference

- `opencode run` + flags: https://opencode.ai/v2/docs/cli/commands/ (verify 28/10/2026)
- `run` thiết kế cho CI + ví dụ GitHub Actions: https://opencode.ai/v2/docs/cli/ (verify 28/10/2026)
- `--standalone`: https://opencode.ai/v2/docs/cli/ (verify 28/10/2026)
- GitHub Action bị bỏ (breaking change v2.2.0): theo README khóa học + changelog 2.2.0 ngày 27/10/2026 (verify 28/10/2026)
- Secrets `{env:NAME}`: https://opencode.ai/v2/docs/config/#variables (verify 28/10/2026)
- Không có trang docs riêng cho GitLab CI — ví dụ GitLab ở trên là phóng tác theo pattern docs GitHub Actions.

## Đọc tiếp

- [02-tui-desktop-web-cli.md](./02-tui-desktop-web-cli.md) — `run` là 1 trong 4 bề mặt; so sánh khi nào dùng non-interactive.
- [09-permissions-policies.md](./09-permissions-policies.md) — `--auto` hoạt động ra sao với permissions + policies.
- [11-sessions-undo-compaction.md](./11-sessions-undo-compaction.md) — session lifecycle, `--continue` nối tiếp session nào.
- [14-worktree-git-ide-acp.md](./14-worktree-git-ide-acp.md) — editor tích hợp song song với CI.
- [../03-cau-hoi-thuong-gap/08-bao-mat-faq.md](../03-cau-hoi-thuong-gap/08-bao-mat-faq.md) — quản lý secrets và bảo mật khi chạy agent tự động.
- [../03-cau-hoi-thuong-gap/07-loi-troubleshooting-faq.md](../03-cau-hoi-thuong-gap/07-loi-troubleshooting-faq.md) — khi pipeline không chạy được.

> **Chốt bài 17:** trong CI không có ai bấm "Allow" — hãy chạy `opencode run --standalone` với secrets qua env, và đừng chờ một GitHub Action đã bị bỏ v2.2.0.
