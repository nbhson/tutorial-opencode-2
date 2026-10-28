# Tips 06 — Tiết kiệm tiền model (não đắt chỉ cho việc khó)

> **Dành cho:** người trả bill · **Vấn đề:** mọi task đều sonnet/opus đắt nhất · **Đọc xong:** phân tầng model + set limit + dùng Free khi được · **Thời gian:** ~10 phút.

## Mục tiêu

- Phân tầng model: rẻ cho việc nhẹ, đắt cho việc khó.
- Set limit trước khi hết tháng, không đợi bill giật mình.

## Ba tầng

| Tầng | Model ví dụ | Việc |
|---|---|---|
| Rẻ (haiku/Free Zen) | explain, summarize, explore, research nền | 70% task |
| Giữa (sonnet) | code + review thường | 25% task |
| Đắt (opus/mạnh nhất) | kiến trúc khó, bug hiểm | 5% task |

**Vì sao quan trọng?** Bill agent = số tokens × giá — mà 70% tokens là việc nhẹ không cần não đắt. Explore/research nền chạy cả ngày thì 1 loại đắt = nhân bill lên bội số.
**Nếu làm sai?** Dùng model đắt nhất cho việc summarize docs — chênh 5–10× giá cho chất lượng như nhau. Ngược lại, dùng model rẻ cho bug hiểm → sửa sai → tốn hơn cả model đắt.

## Ví dụ copy-paste

### 1. Config 2 tầng (mặc định giữa + nhỏ cho việc phụ)

```jsonc
{ "model": "anthropic/claude-sonnet-4-5", "small_model": "anthropic/claude-haiku-4-5" }
```

`small_model` là key hợp lệ trong schema config (verify: opencode.ai/config.json, 28/10/2026) — dùng cho việc nền như title, summary, compaction.

### 2. Đổi model nhanh theo tình huống (không sửa config)

```text
Session đang chạy:
  Ctrl+X M  (<leader>m / model.list)  -> mo dialog chon model
  F2 (model.cycle_recent)             -> quay lai model vua dung truoc do
Terminal:
  opencode run --model anthropic/claude-sonnet-5-5 "Refactor parseToken"
```

Đổi model session không ghi vào config — config giữ tầng mặc định, session đổi tạm theo vụ (verify docs/models).

### 3. Giấu free models khi không muốn team dùng bừa

```bash
# Chay server voi bien moi truong
OPENCODE_DISABLE_FREE_MODELS=1 opencode serve
```

Chi tiết Zen/Console: bật **Free models** cho task nhẹ (free = model không giá input); set **budget** theo workspace/member; theo dõi ở **Activity › Overview**. Budget tính tháng USD, reset 00:00 UTC ngày 1 hàng tháng, chạm limit → request mới lỗi HTTP `429` (verify: docs/console/budgets, 28/10/2026). Go/Go Plus: $10/$40 mỗi tháng, usage trong hạn mức Go không tính vào budget, dùng quá trả bằng credits.

## Phân tầng theo loại việc

| Việc | Tầng | Lý do |
|---|---|---|
| "summarize PR này", "giải thích module X" | Rẻ | Đọc + tóm tắt, sai nhẹ không tốn tiền sửa |
| Research nền cho parallel (tips 04) | Rẻ | Không ai đọc chi tiết, chỉ cần đủ hướng |
| Code feature + review thường | Giữa | Đủ não cho code, giá ~nửa model đắt |
| Kiến trúc, bug hiểm, migration DB | Đắt | Làm sai 1 lần đắt hơn chênh giá |

## Walkthrough theo phút (10 phút)

- **0–2′** Mở `opencode.jsonc`, thêm `small_model` tầng rẻ (ví dụ trên) — file agent/tom tat se dung no.
- **2–4′** Đổi default model sang tầng giữa (`<leader>m` chọn 1 lần để thử, nếu thấy ổn mới ghi vào config).
- **4–6′** Tạo habit: mỗi task mới, hỏi "việc này tầng nào?" trước khi gửi prompt; đổi nhanh bằng Ctrl+X M / F2, không cần sửa file.
- **6–8′** Console: set budget cho workspace + từng member ngay hôm nay (Controls → Add policy → Budget).
- **8–10′** Cuối ngày xem **Activity › Overview** — bạn bao nhiêu % tokens nằm ở tầng đắt? > 20% là đang dùng đắt cho việc nhẹ.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Đổi model theo việc | `Ctrl+X M` / F2 trong phiên | chọn model trong UI | `/model` |
| Model phụ rẻ | `small_model` trong config | không tương đương trực tiếp | haiku cho sub-tasks |
| Giới hạn chi tiêu | Console budget (policy, reset đầu tháng) | theo plan Copilot | theo plan Anthropic |

## Lỗi thường gặp

```text
❌ SAI: de mac dinh model dat nhat cho ca tuan "cho chac"
✅ ĐÚNG: mac dinh tam trung, ha xuong khi viec nhe, chi tang khi tac
```
**Bài học:** "cho chắc" là cách đốt tiền êm nhất.

### Budget dính 429 giữa sprint

```text
❌ SAI: set budget workspace = $20 khi team 10 nguoi, ngay thu 3 ca doi dung phep
✅ ĐÚNG: tinh budget theo: so nguoi x tokens/ngay thuc te 1 tuan truoc x gia
```
**Bài học:** budget chạm là đứng ngay (429) — set thấp hơn mức cần là tự bó tay cả team giữa sprint.

## Best practices (kèm "vì sao")

- Mặc định tầng giữa, hạ xuống rẻ khi việc nhẹ, chỉ lên đắt khi tắc. **Vì sao?** 70% việc nhẹ không cần não đắt — hạ tầng này là tiết kiệm lớn nhất với ít rủi ro nhất.
- Background research ép model rẻ (đặt `model` riêng cho agent explore/reviewer). **Vì sao?** Nền chạy dài, token nhiều, output chỉ là tóm tắt — không cần não đắt.
- Xem bill hàng tuần chứ đừng đợi cuối tháng. **Vì sao?** Budget reset ngày 1 — phát hiện đốt tiền ngày 20 còn kịp chỉnh.

## Bài tập nhỏ

1. (1 tuần) 1 ngày chỉ dùng tầng rẻ cho mọi việc nhẹ — cuối ngày so bill/cảm nhận. Kết quả đạt: có số % chi phí tầng đắt trước vs sau (từ Activity › Overview), mục tiêu giảm ≥30% chi ngày.

> **Chốt tips 06:** rẻ là mặc định, đắt là ngoại lệ có lý do. Limit set trước, bill xem hàng tuần.

Reference: [console/budgets](https://opencode.ai/v2/docs/console/budgets/), [models](https://opencode.ai/v2/docs/models/), [keybinds](https://opencode.ai/v2/docs/cli/keybinds/) — verify 28/10/2026, v2.2.0.
