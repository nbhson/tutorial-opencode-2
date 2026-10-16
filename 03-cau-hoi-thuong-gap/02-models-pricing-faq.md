# FAQ 02 — Models & Pricing (BYOK / Go / Zen)

## Q1: "OpenCode có miễn phí không?"

**Trả lời 1 câu:** Tool miễn phí (OSS MIT), model thì trả tiền riêng.

**Giải thích:** 3 đường: BYOK (trả provider trực tiếp), Go $10 / Go Plus $40/tháng (curated catalog, khác hạn mức $/model), Zen pay-as-you-go (per-1M-tokens, nạp $20, có model Free). Zen dùng được với mọi agent, không riêng OpenCode.

**Làm thế nào:** mới bắt đầu → Zen Free models hoặc Go; đã có key → `/connect` BYOK; team → set monthly + per-member limit Zen ngay.

**Nếu vẫn lỗi:** check bill ở provider/Zen dashboard, không phải trong TUI.

## Q2: "Đổi model giữa session thế nào?"

**Trả lời 1 câu:** `Ctrl+X M` hoặc `/models` (không sửa config file).

**Giải thích:** Selector `provider/model#variant` (vd `anthropic/claude-sonnet-4-5#high`, Zen `opencode/gpt-5.5`). Session đang chọn thắng config. `F2` xoay nhanh model gần đây.

**Nếu vẫn lỗi:** model unavailable = thiếu credentials, bị `policies provider.use deny`, hoặc khác location scope.

## Q3: "Sao hết hạn mức Go giữa tháng?"

**Trả lời 1 câu:** Go/Go Plus giới hạn $/model/tháng (cửa sổ 5h 20% / tuần 50% / tháng 100%) — model hot hết sớm.

**Làm thế nào:** đổi sang model khác còn hạn mức, hoặc việc nhẹ chuyển Zen Free/BYOK rẻ. Heavy user thì Go Plus thay vì Go.

**Nếu vẫn lỗi:** sang Zen pay-as-you-go cho phần vượt, đừng cố 1 model.
