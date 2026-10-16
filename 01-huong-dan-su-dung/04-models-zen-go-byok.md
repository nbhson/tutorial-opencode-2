# 04 — Models: Zen / Go / BYOK (trả tiền cho "bộ não", không phải tool)

> **Dành cho:** người lo hóa đơn · **Vấn đề:** OpenCode free nhưng model thì không — 3 đường trả tiền dễ chọn sai · **Đọc xong:** chọn BYOK vs Go vs Zen + viết selector `provider/model#variant` đúng · **Thời gian:** ~12 phút.

## Mục tiêu

- Phân biệt BYOK / Go ($10) / Go Plus ($40) / Zen pay-as-you-go.
- Viết `model`, `small_model`, `provider/model#variant` đúng.
- Biết Zen free models + spend limits ở đâu.

## Khái niệm cốt lõi

### 1. Ba đường trả tiền (tool free, não trả phí)

**1 câu:** OpenCode OSS miễn phí; bạn trả cho model theo 1 trong 3 đường: key của bạn (BYOK), subscription Go/Go Plus, hoặc gateway Zen trả theo token.

| Đường | Giá (10/2026, verify) | Khi nào dùng |
|---|---|---|
| BYOK | trả provider trực tiếp, không markup | đã có key Anthropic/OpenAI..., muốn bill quen thuộc |
| Go $10/tháng | curated catalog (GLM/Kimi/DeepSeek/MiniMax + Grok/Claude Haiku/GPT Luna/Gemini Argon...), hạn mức $/model/tháng thấp | dùng vừa, single-member |
| Go Plus $40/tháng | cùng catalog Go, hạn mức cao hơn | dùng nặng |
| Zen pay-as-you-go | per-1M-tokens pass-through, nạp $20 mở đầu, có model Free, auto-reload khi <$5, set monthly limit | muốn thử nhiều model / dùng agent khác cũng được |

**Nôm na:** OpenCode như xe ôm công nghệ miễn phí app — bạn trả tiền xăng (model) theo: đổ xăng nhà (BYOK), gói tháng (Go), hoặc thẻ trả trước nhiều loại xăng (Zen).

**Vì sao quan trọng?** Chọn sai = hoặc cháy bill API không ai chặn, hoặc hết hạn mức Go giữa sprint.
**Nếu làm sai?** Bật auto-reload Zen + không set monthly limit cho team → bill trôi không phanh.

### 2. Selector `provider/model#variant`

```jsonc
{
  "model": "anthropic/claude-sonnet-4-5",       // mac dinh session moi
  "small_model": "anthropic/claude-haiku-4-5"   // viec nhe
}
// doi giua session: Ctrl+X M hoac /models (khong sua file)
// agent cu the: model: "anthropic/claude-sonnet-4-5#high"
```

Quy tắc: model của session đang chọn **thắng** config file. Root `model` không giữ variant (variant set ở session/agent/command). Zen dùng prefix `opencode/` (vd `opencode/gpt-5.5`).

Login nhanh: trong TUI `/connect` → chọn provider/Zen → dán key. `opencode auth login` làm tương tự ngoài terminal (lưu `~/.local/share/opencode/auth.json`).

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Đổi não | `provider/model` bất kỳ + Zen catalog | đổi trong Chat (GPT/Claude/Gemini) | gắn Anthropic |
| Free tier | nhiều Zen Free models (Big Pickle, Exo Free, Kimi K3...) | completion free, agent tốn credits | theo gói |
| Chặn bill | Zen spend limit/member limit, Go hạn mức/model | `/usage` + AI Credits | usage window |

## Lỗi thường gặp

### 1. Model có trong catalog nhưng báo unavailable

```text
❌ SAI: thay model id trong config roi bao "model loi"
✅ ĐÚNG: kiem tra credentials cua provider do + policies provider.use co deny khong + location scope (model o project A chua chac co o project B)
```
**Bài học:** availability = catalog × credentials × policies × scope. Thiếu 1 là fail.

## Best practices (kèm "vì sao")

- Việc nhẹ (explain, summarize) → small/haiku rẻ; kiến trúc khó → sonnet/opus mạnh. **Vì sao?** 80% task không cần não đắt nhất.
- Set monthly limit Zen cho team ngay ngày đầu. **Vì sao?** Rẻ hơn xin lại tiền bill.

## Bài tập nhỏ

1. (10 phút) `/connect` 1 provider + `/models` đếm xem máy bạn thấy bao nhiêu model.
2. (5 phút) Set 1 Zen Free model làm default 1 buổi, so bill với model mạnh.

> **Chốt bài 04:** tiền nằm ở model, không ở tool. BYOK cho quen, Go cho gọn, Zen cho linh hoạt — và luôn set limit.
