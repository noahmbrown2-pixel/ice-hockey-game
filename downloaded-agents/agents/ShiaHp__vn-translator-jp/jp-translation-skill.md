# JP→VI Translation Skill

> Đọc file này trước khi chỉnh sửa bất kỳ code liên quan translation.

## Mục tiêu
Người dùng vừa chơi VN vừa học tiếng Nhật N5–N1. Bản dịch phải:
1. **Chính xác** — tin tưởng, không cần tra lại
2. **Tự nhiên tiếng Việt** — đọc như người Việt viết
3. **Học được** — hiểu tiếng Nhật qua context

## System Prompt Template

```
Bạn là trợ lý dịch thuật chuyên dịch visual novel tiếng Nhật sang tiếng Việt.
Người dùng đang học tiếng Nhật (N5-N1) — giúp họ vừa hiểu nội dung vừa học.

QUY TẮC:
1. Dịch tự nhiên tiếng Việt — không dịch từng chữ
2. Giữ nguyên tên nhân vật (không Việt hóa)
3. Giữ honorifics: -san, -kun, -chan, -senpai, -sama (note lần đầu)
4. Giữ tone: tsundere/keigo/casual/yankee thể hiện qua từ dùng tiếng Việt
5. Từ N2-N1 khó: thêm "(= nghĩa)" trong ngoặc lần đầu gặp
6. Cultural reference: [Chú thích: ...] khi cần
7. Onomatopoeia: dịch sáng tạo hoặc giữ kèm giải thích

CONTEXT (10 lines trước): {previous_lines}

OUTPUT JSON:
{
  "translation": "bản dịch VI",
  "notes": ["note nếu có"],
  "new_words": [{"jp":"単語","reading":"たんご","vi":"nghĩa","jlpt":"N3"}]
}
```

## Tone Mapping

| Nhân vật | Tiếng Việt |
|----------|-----------|
| Tsundere | "Tao không thèm...", "Đừng hiểu lầm!" |
| Keigo | "Xin phép...", "Tôi hiểu rồi ạ" |
| Yankee | "Tao", "Mày", thô lỗ |
| Kawaii | "Uề~", "Được mà~" |
| Kuudere | Câu ngắn, ít cảm xúc |

## Grammar N2–N1 Cần Giải Thích

| Pattern | Nghĩa VI |
|---------|---------|
| 〜ざるを得ない | "không thể không làm" |
| 〜に過ぎない | "chẳng qua chỉ là" |
| 〜ものの | "dù rằng... nhưng" |
| 〜わけだ | "điều đó có nghĩa là" |
| 〜かねない | "có nguy cơ..." |
| 〜ならではの | "chỉ có ... mới có" |
| 〜に他ならない | "không gì khác ngoài" |
| 〜いかんによっては | "tùy theo... mà" |

## JLPT Color Codes (UI)
- N5 = xanh lá
- N4 = xanh dương
- N3 = vàng
- N2 = cam
- N1 = đỏ
- Unknown = xám

## Lỗi Phổ Biến — TRÁNH

```
❌ "Tôi cũng, muốn gần hơn không tệ không?"  ← dịch từng chữ
✅ "Chúng ta không nên gần nhau hơn sao?"

❌ 灯華 → "Đèn Hoa"  ← Việt hóa tên
✅ Giữ nguyên: Touka

❌ Bỏ qua ドキドキ
✅ "tim đập thình thịch" hoặc "hồi hộp (ドキドキ)"

❌ Dịch -kun → "bạn"
✅ Giữ: "Souta-kun" + note lần đầu
```

## Context Strategy
- Gửi 10 lines trước, đánh dấu `[CURRENT]`
- Thêm character glossary nếu có tên mới

## Cost
- Haiku 4.5: single-line translation
- Sonnet 4.6: grammar explanation (reasoning sâu hơn)
- Batch 50 lines khi pre-translate
- `cache_control: ephemeral` trên system prompt — bắt buộc
