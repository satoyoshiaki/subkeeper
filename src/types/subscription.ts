export type BillingCycle = 'monthly' | 'yearly' | 'other';
export type Currency = 'JPY' | 'USD' | 'EUR' | 'GBP';
export type SubscriptionStatus = 'active' | 'canceling' | 'canceled';

export interface Subscription {
  id: string;
  serviceName: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  billingCycle: BillingCycle;
  amount: number;
  currency: Currency;
  nextBillingDate: string | null; // YYYY-MM-DD
  trialEndDate: string | null;    // YYYY-MM-DD
  cancellationDeadline: string | null; // YYYY-MM-DD
  paymentCard: string;
  status: SubscriptionStatus;
  memo: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type SubscriptionFormData = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>;

export const CATEGORIES = [
  '動画配信',
  '音楽',
  'ゲーム',
  'クラウドストレージ',
  'ソフトウェア',
  '雑誌・書籍',
  'ニュース',
  'フィットネス',
  'ショッピング',
  'その他',
] as const;

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '月額',
  yearly: '年額',
  other: 'その他',
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: '利用中',
  canceling: '解約予定',
  canceled: '解約済み',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  JPY: '¥',
  USD: '$',
  EUR: '€',
  GBP: '£',
};
