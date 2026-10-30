# FAQ 02 — Models & Pricing (BYOK / Go / Zen)

> Tra nhanh khi kẹt chuyện chọn model, tiền bạc, hạn mức. Link chéo: [Bài 04 — Models/Zen/Go/BYOK](../01-huong-dan-su-dung/04-models-zen-go-byok.md), [Tips 06 — Tiết kiệm tiền model](../02-tips-thuc-chien/06-tiet-kiem-tien-model.md).
> Nguồn chính thức: [models](https://opencode.ai/v2/docs/models) · [console/go](https://opencode.ai/v2/docs/console/go) · [console/models](https://opencode.ai/v2/docs/console/models) (verify 28/10/2026, OpenCode 2.2.0).

## Q1: "OpenCode có miễn phí không?"

**Trả lời 1 câu:** Tool miễn phí (open source), model thì trả tiền riêng — trừ khi bạn dùng các model Free đang mở có hạn.

**Giải thích:** Tool open source, dùng với bất kỳ model nào. Tiền model có 3 đường: **BYOK** (trả provider trực tiếp, key của bạn), **Go $10 / Go Plus $40/tháng** (catalog model open curated, hạn mức theo $/model/tháng), **Console pay-as-you-go** (per-1M-tokens, nạp credits; mua credit có phí xử lý 4.6% + $0.31) ([console/models](https://opencode.ai/v2/docs/console/models), [console/go](https://opencode.ai/v2/docs/console/go), verify 28/10/2026). Console/Go có các model **Free** đúng nghĩa (GLM-5.3-Flash Free, DeepSeek V4.1 Flash Free, Beam Free, Big Pickle... — "limited time", có thể thay đổi). Free models chỉ dùng được qua OpenCode, không gọi trực tiếp từ client khác. Muốn ẩn free models khỏi catalog: set `OPENCODE_DISABLE_FREE_MODELS=1` cho server.

**Làm thế nào:**

1. Mới bắt đầu → dùng free models (`opencode/glm-5.3-flash-free`...) hoặc đăng ký Go.
2. Đã có key Anthropic/OpenAI → `/connect` BYOK.
3. Team, cần kiểm soát chi tiêu → Console workspace + [budgets](https://opencode.ai/v2/docs/console/models).

```bash
# an free models khoi catalog (chay cho server process)
opencode service set env OPENCODE_DISABLE_FREE_MODELS 1
```

**Nếu vẫn lỗi:** check bill ở provider/Console dashboard, không phải trong TUI; free model bỗng biến mất = hết giai đoạn khuyến mãi, chọn model khác trong `/models`.

## Q2: "Đổi model giữa session thế nào?"

**Trả lời 1 câu:** `/models` hoặc `<leader>m` (Ctrl+X M) — đổi cho session hiện tại, không đụng config file.

**Giải thích:** Selector chọn theo dạng `provider/model#variant` (vd `anthropic/claude-sonnet-5-5#high`, Console `opencode/gpt-6.1-sol`, Go `opencode-go/kimi-k3`). Session đang chọn **thắng** config default, và đổi model session không ghi lại vào config ([models](https://opencode.ai/v2/docs/models), verify 28/10/2026). Phím tắt hữu ích: `F2` xoay model gần đây, `Shift+F2` xoay ngược, `Ctrl+T` xoay variant của model hiện tại ([keybinds](https://opencode.ai/v2/docs/cli/keybinds)). Chạy ngoài TUI thì dùng `--model` cho một lệnh duy nhất:

```bash
opencode run --model anthropic/claude-sonnet-5-5 "Refactor parseToken"
```

**Nếu vẫn lỗi:** model không hiện = model bị disabled, provider chưa connect, credentials/thuộc project khác (availability theo location), hoặc bị `policies provider.use deny`.

## Q3: "Sao hết hạn mức Go giữa tháng?"

**Trả lời 1 câu:** Go/Go Plus giới hạn **$/model/tháng**, mỗi model có 3 cửa sổ chồng nhau (5 giờ — 20%, tuần — 50%, tháng — 100% của hạn mức model đó) — model bạn dùng nặng là hết sớm nhất.

**Giải thích:** Mỗi model có monthly limit riêng (vd Go: GLM-5.3-Flash $60, Kimi K3 $15, Grok 4.7 $15; Go Plus cao gấp ~3–4 lần) — chi tiêu theo cửa sổ 5h/tuần/tháng, không phải "ngân sách chung" ([console/go](https://opencode.ai/v2/docs/console/go), verify 28/10/2026). Nếu bật **Extra Usage** trên trang Go và có credits trong balance, phần vượt sẽ tự chuyển sang pay-as-you-go thay vì chặn request.

**Làm thế nào:**

1. Xem hạn mức từng model trong Console (`model.dialog.usage` từ model dialog, hoặc `usage.show`).
2. Hết hạn mức model này → đổi sang model khác còn hạn mức (`F2` xoay nhanh model gần đây).
3. Việc nhẹ → free model; heavy dùng đều → Go Plus thay vì Go.

**Nếu vẫn lỗi:** cần hạn mức khác cho từng member → đừng chia sẻ 1 API key Go (vi phạm thiết kế workspace đơn thành viên), dùng Console workspace với budgets thay thế.

## Q9: "`#high` sau tên model là gì, tự đặt được không?"

**Trả lời 1 câu:** Đó là **variant** — tùy chọn đặt tên của một model (thường là reasoning effort/token budget); không phải model nào cũng có `high`, đặt sai là lỗi resolve model.

**Giải thích:** Chọn variant bằng `provider/model#variant`; variant names lấy từ catalog metadata hiện tại của model — `low`/`high`/`max` không có trên mọi model, variant lạ → model-resolution error ([models — Variants](https://opencode.ai/v2/docs/models), verify 28/10/2026). Bạn có thể định nghĩa variant mới, hoặc thay variant catalog cùng ID, qua mảng `variants` của model (mỗi entry có `id` + `settings`/`headers`/`body`).

**Làm thế nào:**

```jsonc
{ "providers": { "openai": { "models": { "gpt-6.1-sol": {
  "variants": [
    { "id": "fast", "settings": { "reasoningEffort": "low" } },
    { "id": "deep", "settings": { "reasoningEffort": "high" } }
  ] } } } } }
```

1. Dùng sẵn: `/models` chọn entry có variant, hoặc chạy `--model openai/gpt-6.1-sol#high`.
2. Tự đặt: khai `variants` trong model config như trên.
3. Chọn nhanh trong TUI: `Ctrl+T` xoay variant của model hiện tại.

**Nếu vẫn lỗi:** lỗi "variant unknown" → tên không tồn tại trong catalog của model đó; nhớ root `model` không giữ được variant — đặt ở agent/command hoặc chọn ở session.

## Q10: "Model cũ biến mất/đổi giá — có báo trước không?"

**Trả lời 1 câu:** Catalog model thay đổi liên tục; Console có bảng "deprecated models" công bố ngày chấm dứt — đừng ghim công việc vào một model duy nhất.

**Giải thích:** Trang [console/models](https://opencode.ai/v2/docs/console/models) (verify 28/10/2026) liệt kê các model sắp bỏ kèm ngày (vd DeepSeek V4 Flash — 26/10/2026, GLM 5 — 14/05/2026). Giá cũng có thể giảm/khuyến mãi giới hạn (vd Gemini 4 Argon giảm 50% tới 30/11/2026). Model deprecate vẫn được gọi cho tới ngày công bố, sau đó biến mất khỏi catalog.

**Làm thế nào:**

1. Kiểm tra danh sách deprecated trước khi để script chạy dài với 1 model.
2. Trong config, set `disabled: true` cho model bạn muốn ẩn khỏi catalog thay vì chờ nó biến mất.
3. Set `model` default thành model ổn định, đổi khi catalog đổi.

**Nếu vẫn lỗi:** session giữa chừng model bị deprecate → đổi model trong session (`/models`), request đang chạy giữ nguyên settings lúc bắt đầu.

## Q11: "Catalog model lấy từ đâu, thêm model lạ thế nào?"

**Trả lời 1 câu:** Catalog ghép từ models.dev, tích hợp provider và config của bạn — muốn thêm model riêng thì khai trong `providers` với `modelID`, capabilities và limit.

**Giải thích:** `/models` liệt kê từ [models.dev](https://models.dev), tích hợp provider và config của bạn; selector chỉ hiện model enabled mà provider available trong project ([models](https://opencode.ai/v2/docs/models), verify 28/10/2026). Provider OpenAI-compatible riêng thì khai `package` (v2 dùng `@opencode/ai/providers/...`, AI SDK package nhận prefix `aisdk:`) + `settings.baseURL` + `models` entries ([migrate-v1 — Providers](https://opencode.ai/v2/docs/migrate-v1)).

**Làm thế nào:**

```jsonc
{ "providers": { "local": {
  "package": "@opencode/ai/providers/openai-compatible",
  "settings": { "baseURL": "http://127.0.0.1:1234/v1" },
  "models": { "coder": {
    "modelID": "model-name-tren-server",
    "limit": { "context": 32768, "output": 8192 }
} } } } }
```

1. Provider phổ biến → chỉ cần credentials (`/connect` hoặc `{env:...}`).
2. Server lạ → khai provider + model như trên; key qua `{env:LOCAL_API_KEY}`.
3. Model lạ chưa có trong catalog → khai capabilities/limit thủ công.

**Nếu vẫn lỗi:** model mới tự khai sẽ dùng giá trị fallback (200k context, 32k output, tools on) — set đúng `capabilities`/`limit` nếu server của bạn khác.

## Q4: "Đã có API key của provider riêng thì cài thế nào?"

**Trả lời 1 câu:** `/connect` trong TUI để đăng nhập nhanh, hoặc khai `settings.apiKey: "{env:...}"` trong `providers` — đừng hardcode key vào config.

**Làm thế nào:**

```jsonc
// opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "providers": {
    "anthropic": {
      "settings": { "apiKey": "{env:ANTHROPIC_API_KEY}" }
    }
  }
}
```

1. Export key trong shell profile hoặc file env riêng.
2. `/connect` nếu muốn đăng nhập tương tác (provider catalog, Console, Go). Từ v2.2.3 có provider **Claude Agent** builtin: cài Claude Code, chạy `claude auth login`, rồi chọn **Claude Agent** trong `/connect` — dùng login + models của Claude Code subscription, không cần API key riêng (`OPENCODE_CLAUDE_PATH` override đường dẫn executable).
3. `/models` xác nhận model đã hiện.

**Nếu vẫn lỗi:** `{env:NAME}` biến không set sẽ thành **chuỗi rỗng** (không lỗi to) — model "biến mất" thường là do key rỗng, không phải do catalog.

## Q5: "`opencode/...` khác `opencode-go/...` chỗ nào?"

**Trả lời 1 câu:** `opencode/` = Console pay-as-you-go (trả theo token từ credits), `opencode-go/` = gói Go/Go Plus tháng (hạn mức theo $/model).

**Giải thích:** Console = gateway trả theo mức dùng, mua credits một lần, chọn model catalog được benchmark ([console/models](https://opencode.ai/v2/docs/console/models), verify 28/10/2026). Go là subscription $10/$40/tháng với danh sách model open riêng, chọn theo `opencode-go/<model-id>` ([console/go](https://opencode.ai/v2/docs/console/go)). Hai provider này tính tiền và hạn mức khác nhau nên đừng nhầm prefix khi set `model`.

```jsonc
// tra token theo thang - Console
{ "model": "opencode/gpt-6.1-sol" }
// subscription Go - danh sach model rieng
{ "model": "opencode-go/kimi-k3" }
```

**Nếu vẫn lỗi:** model tồn tại ở Console nhưng không thấy trong Go (hoặc ngược lại) — đây là 2 catalog khác nhau, check đúng endpoint `opencode.ai/inference/go/...` so với `opencode.ai/inference/...`.

## Q6: "Chạy model local được không?"

**Trả lời 1 câu:** Có — OpenCode tự dò Ollama, LM Studio, vLLM ở địa chỉ mặc định, chọn bằng provider `ollama/`, `lmstudio/`, `vllm/`.

**Giải thích:** Không cần cấu hình gì khi server chạy ở port chuẩn ([models](https://opencode.ai/v2/docs/models), verify 28/10/2026). Model local tự phát hiện capabilities từ server (Ollama/LM Studio), còn vLLM quảng cáo text-only trừ khi bạn bật tool calling bằng flag server.

```jsonc
{ "model": "ollama/gemma3:4b" }
// host khac: provider.ollama.settings.baseURL = "http://127.0.0.1:5678/v1"
```

**Làm thế nào:**

1. Bật Ollama/LM Studio/vLLM trên máy.
2. Mở `/models` — model local tự xuất hiện với provider ID tương ứng.
3. Muốn tắt auto-discovery: `"plugins": ["-opencode.provider.ollama"]` (tương tự lmstudio/vllm).

**Nếu vẫn lỗi:** host/port khác mặc định thì set `settings.baseURL` trỏ tới endpoint OpenAI-compatible; model embedding bị loại khỏi catalog là chủ ý.

## Q7: "Sao hóa đơn cao hơn con số nhìn thấy?"

**Trả lời 1 câu:** Bạn đang quên tính chi phí cached read/write, model phụ (title/compaction), hoặc phí nạp credits.

**Giải thích:** Bảng giá có cột **cached read/write** riêng — session dài tái dùng cache rẻ hơn nhiều nhưng vẫn tính tiền. Ngoài model chính, OpenCode gọi model giá rẻ để **sinh tiêu đề session** ("You may notice low-cost models... in your usage history" — [console/models](https://opencode.ai/v2/docs/console/models), verify 28/10/2026). Nạp credits Console bị cộng phí xử lý 4.6% + $0.31. Go thì chi tiêu nằm trong hạn mức tháng của model — không cộng thêm nếu chưa bật Extra Usage.

**Làm thế nào:**

1. Kiểm tra usage trong Console dashboard, không phải trong TUI.
2. So sánh usage history với các model Flash/Nano/Haiku nhỏ — đó là title model.
3. Bật auto-recharge/budget ở Console nếu muốn chặn trần chi tiêu.

**Nếu vẫn lỗi:** hóa đơn lệch thật → đối chiếu với console usage logs trước khi liên hệ support; agent không biết số dư ví của bạn.

## Q8: "Go cho cả team dùng chung được không?"

**Trả lời 1 câu:** Không — Go/Go Plus chỉ cho workspace một thành viên (kiểu Personal), workspace đang có Go không mời thêm thành viên được.

**Giải thích:** Callout chính thức trên trang Go: "Go and Go Plus are for workspaces with a single member... A workspace with a Go subscription cannot invite members" ([console/go](https://opencode.ai/v2/docs/console/go), verify 28/10/2026). Muốn chia sẻ model cho team thì dùng Console workspace: mời members, bật/tắt model theo tab **Models**, set budget cho workspace và từng thành viên.

**Làm thế nào:** team → Console workspace + budgets; cá nhân thử nghiệm → Go; dùng đều lượng lớn → Go Plus.

**Nếu vẫn lỗi:** cần hạn mức khác cho từng member → đừng chia sẻ 1 API key Go (vi phạm thiết kế workspace đơn thành viên), dùng Console workspace với budgets thay thế.
