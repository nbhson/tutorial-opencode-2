# FAQ 05 — Agents, Commands & Skills

## Q1: "Subagent không được gọi / skill không hiện?"

**Trả lời 1 câu:** Thiếu `description` (model chọn theo đó) hoặc bị `skill/subagent` permissions deny.

**Làm thế nào:** subagent phải có `description`; skill phải có `description` (trừ khi cố ý `autoinvoke: false` để gọi tay `@id`). Check `permissions` + trùng ID (nguồn sau thắng).

## Q2: "Đổi agent mà model không đổi?"

**Trả lời 1 câu:** Agent ID và session model là 2 thứ riêng — đổi model bằng `Ctrl+X M`.

**Giải thích:** Subagent không set model thì thừa hưởng model cha. Root `model` không giữ variant.

## Q3: "Command vs skill vs agent — dùng cái nào?"

**Trả lời 1 câu:** Việc lặp bạn chủ động gọi → command (`/review`); kiến thức model tự nạp khi cần → skill; vai diễn có model+permissions riêng → agent.

**Nếu vẫn lỗi:** đừng đóng gói việc dùng 1 lần — list `/` dài làm model phân tâm.
