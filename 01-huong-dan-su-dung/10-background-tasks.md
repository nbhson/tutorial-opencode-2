# 10 — Background tasks (việc lâu cho ra nền, bạn prompt tiếp)

> **Dành cho:** người chạy task >1 phút (install, test, research) · **Vấn đề:** để mọi thứ foreground là ngồi nhìn · **Đọc xong:** spawn background subagent + background shell đúng cách · **Thời gian:** ~10 phút.

## Mục tiêu

- Spawn background subagent (kể cả model khác).
- Chạy background shell cho lệnh lâu.
- Đẩy task foreground ì ra background giữa chừng.

## Khái niệm cốt lõi

**1 câu:** V2 cho primary agent thuê "đệ" (subagent) và "lò" (shell) chạy nền, xong thì báo — bạn không bị block.

**Nôm na:** như quán ăn — bếp (background) nấu món lâu, phục vụ (bạn) vẫn nhận order bàn khác; món xong thì chuông reo.

```text
Ban: "spawn background explore subagent ve ban do auth (dung model re), toi lam tiep phan login"
Agent: child session chay nen voi fresh context -> xong notify + tom tat
```

```text
Ban: "chay npm test o background, toi review code tiep"
Agent: shell async -> ban prompt tiep -> xong bao pass/fail
```

Lệnh foreground chạy lâu quá → hotkey đẩy ra background, prompt tiếp. Background subagent có thể **khác model** session chính (vd chính sonnet code, nền haiku research cho rẻ).

**Vì sao quan trọng?** Model mới mạnh ở orchestration — không cho chạy nền là phí tiền não đắt để ngồi đợi.
**Nếu làm sai?** Spawn 5 background cùng sửa 1 file → conflict + context phân mảnh. Nền chỉ cho việc **độc lập** (research, review, test suite khác nhau).

Giới hạn nhớ: subagent có fresh context (không thấy hết chat cha — phải giao việc rõ), depth mặc định 1.

## So sánh

| Việc | OpenCode 2 | Copilot | Claude Code |
|---|---|---|---|
| Chạy nền | background subagent + shell, notify | coding agent cloud (async PR) | background tasks tương tự |
| Model khác cho nền | có (vd nền haiku rẻ) | chọn model/alloc riêng | có, tùy bản |

## Lỗi thường gặp

```text
❌ SAI: "review code giup" (background, khong noi review cai gi, branch nao)
✅ ĐÚNG: "background general subagent: review diff branch feat/login vs main, chi liet ke severity + file:line, khong sua code"
```
**Bài học:** child có context mới — giao việc mơ hồ thì nhận kết quả mơ hồ.

## Best practices (kèm "vì sao")

- Mỗi background 1 owner + 1 output (file/tóm tắt). **Vì sao?** Không là lúc gộp không biết đứa nào làm gì.
- Review/test cho ra nền, quyết định giữ ở session chính. **Vì sao?** Nền thu thập, chính quyết — đỡ loạn.

## Bài tập nhỏ

1. (10 phút) Spawn 1 background explore vẽ bản đồ 1 module, trong lúc đó bạn làm 1 task khác ở session chính — cảm nhận không-block.
2. (5 phút) Chạy 1 shell lâu ở background (lint/test), xem notify khi xong.

> **Chốt bài 10:** việc độc lập + lâu → nền. Session chính giữ quyết định, không ôm việc càn quét.
