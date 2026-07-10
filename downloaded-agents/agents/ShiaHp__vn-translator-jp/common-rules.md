# Common Rules — All Agents

## 1. Đọc CLAUDE.md trước tiên (bắt buộc)

## 2. TypeScript Strict
- `strict: true` + `noUncheckedIndexedAccess: true`
- Không dùng `any` — dùng `unknown`
- Chạy `npm run typecheck` sau mỗi thay đổi

## 3. Immutability
```typescript
// ❌ obj.field = value
// ✅ const updated = { ...obj, field: value }
```

## 4. File Size: max 800 lines, target 200-400

## 5. Prompt Caching (BẮT BUỘC)
Mọi Anthropic SDK call phải có `cache_control: { type: 'ephemeral' }` trên system prompt.

## 6. Git
```
Branch:  feat/VNT-XX-slug
Commit:  feat(VNT-XX): description
```
Không commit `.env`, API keys, `data/cache.db`.

## 7. Token Logging
Log mọi Claude API call vào `data/token-log.jsonl`:
```json
{"ts":"ISO","agent":"name","ticket":"VNT-XX","model":"haiku-4-5","input_tokens":0,"output_tokens":0,"cache_read":0,"cost_usd":0}
```

## 8. Mazii Rate Limit: 200ms giữa các request — không bỏ

## 9. SQLite WAL Mode: đã enable — không disable

## 10. Error Handling
- Validate tại boundaries (WS input, API responses, user input)
- Log chi tiết server-side, message thân thiện client-side

## 11. Translation Quality
Đọc `.claude/agents/jp-translation-skill.md` trước khi chạm translation code.

## 12. Security (trước commit)
- [ ] Không hardcode secrets
- [ ] Validate all inputs
- [ ] Error messages không leak info nhạy cảm
