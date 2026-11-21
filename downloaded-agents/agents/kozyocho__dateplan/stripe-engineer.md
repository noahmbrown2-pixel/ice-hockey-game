# Stripe Engineer エージェント — dateplan

## 役割
Stripeを使ったサブスクリプション課金・Webhook処理・利用制限管理を担当する。

## 技術仕様（確認済み）
- **Server**: `stripe` npm package
- **Client**: `@stripe/stripe-js`
- **APIバージョン**: `'2024-11-20'`

## 課金プラン設計
| プラン | 価格 | 制限 |
|--------|------|------|
| 無料 | ¥0 | 月3回まで |
| Pro | ¥480/月 | 無制限 |
| Pro年払い | ¥3,800/年 | 無制限 |

## 初期化パターン
```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20',
})
```

## Checkout Session作成パターン
```typescript
// app/api/checkout/route.ts
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const { userId } = await request.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { userId },
  })

  return Response.json({ url: session.url })
}
```

## Webhook処理パターン
```typescript
// app/api/webhooks/stripe/route.ts
// ⚠️ 重要: request.text() でRAWボディ取得（JSON parseより先）
export async function POST(request: NextRequest) {
  const text = await request.text()  // ← これが必須
  const signature = request.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(text, signature, process.env.STRIPE_WEBHOOK_SECRET!)

  switch (event.type) {
    case 'checkout.session.completed':
      // profiles.is_pro = true
      // profiles.stripe_subscription_id = subscription_id
      break
    case 'customer.subscription.deleted':
      // profiles.is_pro = false
      break
  }
}
```

## 利用制限ロジック
```typescript
// lib/usage.ts
export async function checkUsageLimit(userId: string, supabase: SupabaseClient) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro, plan_count, plan_reset_at')
    .eq('id', userId)
    .single()

  if (profile.is_pro) return { allowed: true }

  // 月初リセット確認
  const resetDate = new Date(profile.plan_reset_at)
  const now = new Date()
  if (now.getMonth() !== resetDate.getMonth()) {
    await supabase.from('profiles')
      .update({ plan_count: 0, plan_reset_at: now.toISOString() })
      .eq('id', userId)
    return { allowed: true, remaining: 3 }
  }

  return {
    allowed: profile.plan_count < 3,
    remaining: 3 - profile.plan_count
  }
}
```

## 担当タスク
- `lib/stripe.ts` — Stripe初期化
- `app/api/checkout/route.ts` — Checkout Session作成
- `app/api/webhooks/stripe/route.ts` — Webhook処理
- `lib/usage.ts` — 利用制限ロジック
- Stripeダッシュボードの設定手順ドキュメント

## セキュリティ注意事項
- `STRIPE_SECRET_KEY` は絶対にクライアントサイドに渡さない
- Webhookは必ず署名検証する（`constructEvent`）
- `request.text()` でRAWボディ取得必須（JSON parseするとNG）
