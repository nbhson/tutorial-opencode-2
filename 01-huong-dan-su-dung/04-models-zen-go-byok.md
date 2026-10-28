# 04 — Models: Zen / Go / BYOK (trả tiền cho "bộ não", không phải tool)

> **Dành cho:** người lo hóa đơn · **Vấn đề:** OpenCode free nhưng model thì không — 3 đường trả tiền dễ chọn sai · **Đọc xong:** chọn BYOK vs Go vs Zen + viết selector `provider/model#variant` đúng · **Thời gian:** ~15 phút.

## Mục tiêu

- Phân biệt BYOK / Go ($10) / Go Plus ($40) / Console (Zen) pay-as-you-go.
- Viết `provider/model#variant` đúng, biết chỗ nào giữ variant, chỗ nào không.
- Biết danh sách model Free hiện tại + cách ẩn/hiện, và các van chặn bill (budgets, auto-recharge).

## Mục lục

- [Khái niệm cốt lõi](#khái-niệm-cốt-lõi)
- [Luồng: chọn đường trả tiền](#luồng-chọn-đường-trả-tiền)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [So sánh với Copilot / Claude Code](#so-sánh-với-copilot--claude-code)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Best practices](#best-practices-kèm-vì-sao)
- [Bài tập nhỏ](#bài-tập-nhỏ)
- [Reference](#reference)

## Khái niệm cốt lõi

### 1. Ba đường trả tiền (tool free, não trả phí)

**1 câu:** OpenCode OSS miễn phí; bạn trả cho model theo 1 trong 3 đường: key của bạn (BYOK), subscription Go/Go Plus, hoặc gateway của OpenCode Console (docs v2 gọi là Console, cộng đồng quen gọi Zen) trả theo token.

| Đường | Giá (verify 28/10/2026) | Khi nào dùng |
|---|---|---|
| BYOK | trả provider trực tiếp, không markup | đã có key Anthropic/OpenAI..., muốn bill quen thuộc |
| Go $10/tháng | catalog curated, hạn mức theo $/model: 5 giờ = 20% hạn mức tháng, tuần 50%, tháng 100% | dùng vừa, workspace **single-member** |
| Go Plus $40/tháng | cùng catalog Go, hạn mức cao hơn (thường gấp 3–4 lần) | dùng nặng |
| Console pay-as-you-go | per-1M-tokens, nạp credits, bán giá gốc chỉ cộng phí xử lý | thử nhiều model / team qua workspace |

Giá lấy từ [console/go](https://opencode.ai/v2/docs/console/go/) và [console/models](https://opencode.ai/v2/docs/console/models/) — verify 28/10/2026.

**Nôm na:** OpenCode như xe ôm công nghệ miễn phí app — bạn trả tiền xăng (model) theo: đổ xăng nhà (BYOK), gói tháng (Go), hoặc thẻ trả trước nhiều loại xăng (Console/Zen).

**Vì sao quan trọng?** Chọn sai = hoặc cháy bill API không ai chặn, hoặc hết hạn mức Go giữa sprint.
**Nếu làm sai?** Bật auto-recharge mà không set budget cho workspace → bill trôi không phanh.

Chi tiết từng đường:

**BYOK** — key của chính bạn, trả provider trực tiếp. Cắm bằng `/connect` (chọn provider, dán key) hoặc `opencode auth login anthropic --method key` ngoài TUI. V2 lưu credential trong **SQLite** của server (`~/.local/share/opencode/opencode.db` — in đúng đường bằng `opencode debug paths db`); file `auth.json` cũ của v1 chỉ được import 1 lần lúc migrate, V2 không ghi ngược lại. (verify 28/10/2026 — [docs/cli/providers](https://opencode.ai/v2/docs/cli/providers/))

**Go / Go Plus** — subscription của OpenCode Console: $10 và $40/tháng. Catalog curated gồm Grok 4.7, GLM-5.3-Flash/5.3/5.2, GPT 6 Luna, GPT 5.6 Luna, Claude Haiku 5.5, Gemini 4 Argon, Kimi K3.1 Pro / K3 / K2.7 Code, LongCat-2.0, Step 5 Preview, DeepSeek V4.1 Flash / V4 Pro, Qwen3.8 Max/Flash/3.7 Plus, MiniMax M3.1 Flash/M3, MiMo-V2.6/2.5, Hy4/Hy3... (danh sách thay đổi — verify 28/10/2026, [console/go](https://opencode.ai/v2/docs/console/go/)). Cái cần nhớ:

- Hạn mức tính theo **dollar mỗi model**: 5 giờ = 20% hạn mức tháng của model đó, tuần = 50%, tháng = 100%. Hết hạn mức vẫn dùng tiếp các **model Free**.
- Go/Go Plus chỉ cho workspace **single-member** (workspace đang Go không mời member được) — team cần workspace pay-as-you-go.
- **Extra Usage**: bật trên trang Go để khi hết hạn mức thì trừ vào số dư credits thay vì chặn request.
- Trong OpenCode, Go là provider `opencode-go`: `"model": "opencode-go/kimi-k3"`.
- Privacy đáng chú ý: Muse Spark Contributor dùng data để train (đổi lấy giá rẻ); hầu hết model còn lại "not used for training".

**Console (Zen) pay-as-you-go** — gateway bán nhiều model đã test/benchmark, prefix `opencode/<model-id>`:

```jsonc
{ "model": "opencode/gpt-6.1-sol" }        // qua Console gateway
{ "model": "opencode-go/kimi-k3" }         // qua Go subscription
```

Nạp credits, tính theo 1M tokens. Console **bán giá gốc**, chỉ cộng phí xử lý khi mua credits: **4.6% + $0.31** mỗi lần nạp (verify 28/10/2026 — [console/models](https://opencode.ai/v2/docs/console/models/)). Van chặn bill: auto-recharge (tự mua credits khi Balance thấp) và **budgets** — cap chi tiêu theo tháng cho cả workspace và từng member. Con số "$20 nạp mở đầu / auto-reload khi <$5" trong tài liệu cũ **cần verify lại** — docs v2 không ghi số cụ thể.

Model Free (lưu ý: **Kimi K3 không free** — nó là model trả phí $3/$15; cái này file cũ viết nhầm): hiện tại gồm Big Pickle, GLM-5.3-Flash Free, DeepSeek V4.1 Flash Free, Beam Free, Flint 40B Free, MiMo-V2.6-Flash Free, Nemotron 3 Ultra/Lightning/Super VL Free, Jev 1.13 Free — đều "free limited time". Ẩn free models đi:

```bash
# cho server process dang chay moi lan lenh
OPENCODE_DISABLE_FREE_MODELS=1 opencode serve

# cho shared service (dung lai thi unset)
opencode service set env OPENCODE_DISABLE_FREE_MODELS 1
```

Ẩn rồi thì chọn model Free tường minh sẽ fail với `Model unavailable`.

### 2. Selector `provider/model#variant`

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-5-5",      // mac dinh cho session moi
  "small_model": "anthropic/claude-haiku-5-5"  // viec nhe (can verify key nay tren /v2/docs/config)
}
```

Quy tắc (verify 28/10/2026 — [docs/models](https://opencode.ai/v2/docs/models/)):

- Cú pháp: `provider/model` + tùy chọn `#variant`. Provider kết thúc ở dấu `/` đầu tiên; model có thể chứa thêm `/`; **provider và model phân biệt hoa thường**.
- Model đã chọn cho session **thắng** config file; đổi model session không ghi ngược config.
- Root `model` **không giữ variant** — muốn `#high` thì set ở session/agent/command hoặc `run --model`.
- Variant không tồn tại → model-resolution error. Tên variant (`low`/`high`/`max`) không có ở mọi model.
- Đổi giữa session: `Ctrl+X M` hoặc `/models` — không sửa file.

Tự định nghĩa variant cho model (vd reasoning effort thấp cho việc rẻ):

```jsonc
{
  "providers": {
    "openai": {
      "models": {
        "gpt-6.1-sol": {
          "settings": { "reasoningEffort": "medium" },
          "variants": [
            { "id": "fast", "settings": { "reasoningEffort": "low" } },
            { "id": "deep", "settings": { "reasoningEffort": "high" } }
          ]
        }
      }
    }
  }
}
// luc chon: openai/gpt-6.1-sol#fast
```

### 3. Availability + model local (Ollama / LM Studio / vLLM)

**1 câu:** Model hiện trong `/models` = model enabled × provider có credentials × provider được policies cho phép × đang ở đúng project — thiếu 1 là "Model unavailable".

Availability là **theo project**: credentials/config của project khác không tự chuyển sang. (verify 28/10/2026 — [docs/models](https://opencode.ai/v2/docs/models/))

```bash
opencode auth list        # provider nao da co account/environment
opencode auth switch anthropic work   # doi account active
```

Local models được **tự discovery** ở địa chỉ mặc định — Ollama (11434), LM Studio (1234), vLLM (8000):

```text
ollama/gemma3:4b
lmstudio/google/gemma-4-26b-a4b
vllm/Qwen/Qwen3-Coder-30B-A3B-Instruct
```

Host khác-port thì set `settings.baseURL` của provider tương ứng; tắt discovery bằng `"plugins": ["-opencode.provider.ollama"]` (tương tự `lmstudio`, `vllm`). Server OpenAI-compatible khác thì khai provider `openai-compatible` thủ công với `baseURL` + `models` (key qua `"apiKey": "{env:LOCAL_API_KEY}"` — đừng commit key).

### 4. Policies `provider.use` — khóa provider cấp tổ chức

**1 câu:** `policies` chạy **sau** permissions + saved approvals, chỉ biến allow/ask → deny, không bao giờ mở thêm quyền.

```jsonc
{
  "policies": [
    { "action": "provider.use", "resource": "openai", "effect": "deny" }  // an openai
  ]
}
```

Provider bị deny **biến mất khỏi catalog và `/models`** dù còn credentials hợp lệ. `policies` từ Console workspace/global thắng config project — repo không thể tự mở lại provider bị deny ở tầng cao. Chi tiết ở [09-permissions-policies.md](09-permissions-policies.md).

**Vì sao quan trọng?** Muốn org chỉ chạy 1 gateway duy nhất (vd `company-ai`) → `deny *` + `allow company-ai` trong policy là cách duy nhất không bị lật.
**Nếu làm sai?** `deny` cty mà định nghĩa thiếu → repo khác vẫn chạy provider cấm mà bạn không hay.

## Luồng: chọn đường trả tiền

1. **Đã có key provider** (công ty cấp, card cá nhân) → BYOK: `/connect` → chọn provider → dán key. Chi phí = bill provider, không trung gian. Lỗi hay gặp: key đặt trong env của **server process** mới có tác dụng — `opencode service set env ANTHROPIC_API_KEY ...`, không phải env của terminal TUI.
2. **Cá nhân, dùng vừa, muốn bill cố định** → Go $10. Đăng ký Console → copy API key → `/connect` → OpenCode Go → `/models` chọn. Lỗi hay gặp: mời member vào workspace Go → không được, Go là single-member.
3. **Team / muốn thử nhiều model** → Console pay-as-you-go: nạp credits, `/connect` chọn OpenCode, dán key, mời member, set budgets + bật models tab nào được dùng.
4. **Dùng nặng theo tháng, model open-source** → Go Plus $40.

## Ví dụ chi tiết

Setup "cá nhân tiết kiệm": Go $10 làm mặc định + Free model cho việc vặt.

```jsonc
// opencode.jsonc — verify 28/10/2026
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode-go/glm-5.3-flash",   // re, han muc $60/thang (Go), phu hop viec thuong ngay
  "providers": {
    "anthropic": { /* key cu cua ban qua /connect hoac auth login */ }
  },
  "agents": {
    "reviewer": {
      "description": "Review nang, can nao manh",
      "mode": "subagent",
      "model": "anthropic/claude-opus-5-5"   // agent nay dung nao dat, chu dong chi dinh
    }
  }
}
```

Giải thích:

- Mặc định cả session chạy `opencode-go/...` — đi theo hạn mức Go, không lo bill ngoài.
- Việc review quan trọng: gọi subagent `reviewer` — nó dùng Opus đắt nhưng chỉ khi bạn thật sự cần.
- Đừng ghi variant vào root `model` — V2 catalog default không giữ `#variant`.

## So sánh với Copilot / Claude Code

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Đổi não | `provider/model` bất kỳ + Console catalog | đổi trong Chat (GPT/Claude/Gemini) | gắn Anthropic |
| Free tier | nhiều model Free (Big Pickle, GLM-5.3-Flash Free, Nemotron...) | completion free, agent tốn credits | theo gói |
| Chặn bill | Console budgets/member limit, Go hạn mức/model | `/usage` + AI Credits | usage window |
| Gói rẻ open-model | Go $10/Go Plus $40 | không có tương đương | không có tương đương |
| Local model | Ollama/LM Studio/vLLM tự discovery | cần extension/setup | cần proxy tự dựng |

## Lỗi thường gặp

### 1. Model có trong catalog nhưng báo unavailable

```text
❌ SAI: thay model id trong config roi bao "model loi"
✅ ĐÚNG: kiem tra credentials cua provider do (opencode auth list) + policies provider.use co deny khong + location scope (model o project A chua chac co o project B)
```
**Bài học:** availability = catalog × credentials × policies × scope. Thiếu 1 là fail.

### 2. Đặt variant ở root `model` rồi thắc mắc sao không hiệu lực

```text
❌ SAI: { "model": "openai/gpt-6.1-sol#high" } roi bao "sao no van chay medium"
✅ ĐÚNG: variant dat o session (--model, Ctrl+X M + Ctrl+T), agent, hoac command; root model khong giu variant
```
**Bài học:** root `model` chỉ giữ provider+model; variant phải đặt ở nơi thực sự chạy (session/run/agent/command).

### 3. Gọi `auth.json` là nơi lưu key v2

```text
❌ SAI: sua ~/.local/share/opencode/auth.json roi doan "da doi key"
✅ ĐÚNG: v2 luu credential trong SQLite (opencode debug paths db); auth.json chi duoc import mot lan khi migrate
```
**Bài học:** quản key bằng `/connect` hoặc `opencode auth login/logout/switch` — đừng đụng database tay.

## Best practices (kèm "vì sao")

- Việc nhẹ (explain, summarize) → model rẻ/Free; kiến trúc khó → model mạnh. **Vì sao?** 80% task không cần não đắt nhất.
- Set budget Console + tắt auto-recharge nếu chưa cần. **Vì sao?** Rẻ hơn xin lại tiền bill; budgets cap theo tháng cho workspace lẫn từng member.
- Dùng Go cho cá nhân (single-member), Console workspace cho team. **Vì sao?** Workspace Go không mời được member — team cần workspace Console.
- Đọc Privacy trước khi đẩy code kín vào model lạ: Muse Spark Contributor và Iceman Contributor Free dùng data để train. **Vì sao?** Giá rẻ/free đôi khi đổi bằng dữ liệu của bạn.
- Model Free chỉ để thử/việc không nhạy cảm. **Vì sao?** Một số free model thu data để cải thiện trong thời gian free (Big Pickle, Flint 40B Free...).

## Bài tập nhỏ

1. (10 phút) `/connect` 1 provider + `/models` đếm xem máy bạn thấy bao nhiêu model; ghi lại model nào là Free.
2. (5 phút) Set 1 Zen/Console Free model làm default 1 buổi (`opencode/big-pickle`), so bill với model mạnh.
3. (7 phút) Viết 1 policy deny `openai` trong project, mở `/models` xác nhận OpenAI biến mất, rồi xóa policy.

## Reference

- Models + selector + variant + local: https://opencode.ai/v2/docs/models/ (verify 28/10/2026)
- Go / Go Plus: https://opencode.ai/v2/docs/console/go/ (verify 28/10/2026)
- Console pay-as-you-go + free models + phí: https://opencode.ai/v2/docs/console/models/ (verify 28/10/2026)
- Console tổng quan: https://opencode.ai/v2/docs/console/ (verify 28/10/2026)
- Auth/providers: https://opencode.ai/v2/docs/cli/providers/ (verify 28/10/2026)
- Policies `provider.use`: https://opencode.ai/v2/docs/policies/ (verify 28/10/2026)

## Đọc tiếp

- [02-tui-desktop-web-cli.md](02-tui-desktop-web-cli.md) — đổi model giữa session bằng `Ctrl+X M`/`F2`.
- [05-agents-build-plan-custom.md](05-agents-build-plan-custom.md) — gắn `model#variant` cho từng agent.
- [06-commands-slash-custom.md](06-commands-slash-custom.md) — command có thể ép model riêng.
- [09-permissions-policies.md](09-permissions-policies.md) — `policies` khóa provider từ trên xuống.
- [../02-tips-thuc-chien/06-tiet-kiem-tien-model.md](../02-tips-thuc-chien/06-tiet-kiem-tien-model.md) — chiến thuật tiêu model ít tiền.
- [../03-cau-hoi-thuong-gap/02-models-pricing-faq.md](../03-cau-hoi-thuong-gap/02-models-pricing-faq.md) — FAQ pricing.

> **Chốt bài 04:** tiền nằm ở model, không ở tool. BYOK cho quen, Go cho gọn, Zen/Console cho linh hoạt — và luôn set limit trước khi set model.
