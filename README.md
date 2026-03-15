# SubKeeper

サブスクリプションを一元管理する個人用Webアプリ（MVP）

## 機能

- サブスクリプション一覧表示（カード形式）
- 新規追加 / 編集 / 削除
- サービス名検索
- カテゴリ / カード / ステータスで絞り込み
- 月額合計 / 年額合計 / 実質月額合計の表示
- 次回請求日が近い契約の警告（7日以内）
- 無料体験終了日が近い契約の警告（3日以内）
- 解約期限が近い契約の警告（3日以内）
- データは localStorage に保存（リロード後も保持）
- サンプルデータ読み込み機能
- PC / スマホ両対応

## セットアップ・起動

### 必要環境

- Node.js 18以上
- npm 9以上

### 手順

```bash
git clone https://github.com/satoyoshiaki/subkeeper.git
cd subkeeper
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く

### ビルド確認

```bash
npm run build
```

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 14 (App Router) | フレームワーク |
| TypeScript | 型安全性 |
| Tailwind CSS | スタイリング |
| shadcn/ui | UIコンポーネント |
| React Hook Form | フォーム管理 |
| date-fns | 日付処理 |
| localStorage | データ保存（MVP） |

## ディレクトリ構成

```
src/
  types/subscription.ts       # 型定義・定数
  lib/
    repository.ts             # 保存層（localStorage実装）
    subscription.ts           # ビジネスロジック・サンプルデータ
  components/
    ui/                       # shadcn/ui コンポーネント
    subscription/
      SubscriptionCard.tsx    # カード表示
      SubscriptionForm.tsx    # 追加・編集フォーム
      SummaryCards.tsx        # 合計表示
      AlertSection.tsx        # 警告表示
  app/
    page.tsx                  # メインページ
    layout.tsx
```

## 将来の拡張

保存層は `SubscriptionRepository` インターフェースで抽象化されており、
`src/lib/repository.ts` の実装を差し替えるだけで Supabase / PostgreSQL に移行できます。

- [ ] Supabase / PostgreSQL 移行
- [ ] ログイン機能
- [ ] 通知機能（メール・プッシュ通知）
- [ ] PWA対応
- [ ] カレンダー表示
- [ ] CSVインポート / エクスポート
- [ ] カテゴリ別 / カード別集計
