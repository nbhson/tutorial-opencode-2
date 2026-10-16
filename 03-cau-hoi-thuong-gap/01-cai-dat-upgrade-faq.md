# FAQ 01 — Cài đặt & Upgrade v1→v2

## Q1: "Cài theo docs mà `opencode --version` vẫn ra 1.x?"

**Trả lời 1 câu:** Bạn cài nhầm kênh v1 (`opencode-ai` / `opencode.ai/install`) — v2 có kênh riêng.

**Giải thích:** Giữa 10/2026 kênh cũ bị ghim ở line 1.x (1.19.x). V2: `curl -fsSL https://opencode.ai/v2/install | bash`, `brew install anomalyco/tap/opencode-v2`, `npm i -g @opencode/cli`, WinGet `Anomaly.OpenCode`.

**Làm thế nào:**

```bash
which opencode && opencode --version
# neu 1.x: go ban cu (neu cai bang package manager), cai lai bang 1 kenh v2
curl -fsSL https://opencode.ai/v2/install | bash
opencode --version  # phai 2.0.x
```

**Nếu vẫn lỗi:** kiểm tra `mise` (<2026.10.9 không hiểu v2), PATH trỏ binary cũ, hoặc Docker tag nhầm `:latest` line 1.

## Q2: "`upgrade --major` báo không có gì mới dù đang v1?"

**Trả lời 1 câu:** Phải lên latest 1.x (1.19.x) trước, offer 2.0 mới hiện.

**Làm thế nào:** mở TUI v1 → `/update` lên 1.19.x → `opencode upgrade --major` → `opencode --version` verify 2.0.x.

**Nếu vẫn lỗi:** xem có phải Homebrew Core install (giờ track v2) hay yarn-managed (v1.19.2 fix riêng) không — đổi kênh cho khớp.

## Q3: "Config v1 có phải viết lại hết không?"

**Trả lời 1 câu:** Không — v2 đọc + normalize config cũ trong bộ nhớ, convert là optional.

**Giải thích:** Chỉ 3 thứ bắt buộc port: plugin v1, script gọi server API v1, `tui.json` (auto-migrate sang `cli.json` lần đầu). Còn lại V1+V2 coexist được (V2 thắng khi trùng), nhưng mỗi nested entry giữ thuần 1 format. Muốn convert: nhờ chính OpenCode v2 (`"Migrate my OpenCode configuration..."`).

**Nếu vẫn lỗi:** grep config tìm field retired (`permission` số ít, `bash`, `task`, `enabled` cho MCP...) rồi đổi theo bảng bài 01.
