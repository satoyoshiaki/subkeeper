'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Subscription,
  SubscriptionFormData,
  CATEGORIES,
  BILLING_CYCLE_LABELS,
  STATUS_LABELS,
  BillingCycle,
  Currency,
  SubscriptionStatus,
} from '@/types/subscription';

// フォームの生の値（HTMLフォームはすべて文字列）
interface FormValues {
  serviceName: string;
  category: string;
  startDate: string;
  billingCycle: BillingCycle;
  amount: string;
  currency: Currency;
  nextBillingDate: string;
  trialEndDate: string;
  cancellationDeadline: string;
  paymentCard: string;
  status: SubscriptionStatus;
  memo: string;
}

interface Props {
  initialData?: Subscription;
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
}

export function SubscriptionForm({ initialData, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      serviceName: initialData?.serviceName ?? '',
      category: initialData?.category ?? '',
      startDate: initialData?.startDate ?? '',
      billingCycle: initialData?.billingCycle ?? 'monthly',
      amount: initialData?.amount?.toString() ?? '0',
      currency: initialData?.currency ?? 'JPY',
      nextBillingDate: initialData?.nextBillingDate ?? '',
      trialEndDate: initialData?.trialEndDate ?? '',
      cancellationDeadline: initialData?.cancellationDeadline ?? '',
      paymentCard: initialData?.paymentCard ?? '',
      status: initialData?.status ?? 'active',
      memo: initialData?.memo ?? '',
    },
  });

  const handleFormSubmit = (values: FormValues) => {
    // バリデーション
    if (!values.serviceName.trim()) {
      alert('サービス名は必須です');
      return;
    }
    if (!values.category) {
      alert('カテゴリは必須です');
      return;
    }
    if (!values.startDate) {
      alert('契約開始日は必須です');
      return;
    }
    const amount = parseFloat(values.amount);
    if (isNaN(amount) || amount < 0) {
      alert('金額は0以上の数値を入力してください');
      return;
    }

    onSubmit({
      serviceName: values.serviceName.trim(),
      category: values.category,
      startDate: values.startDate,
      billingCycle: values.billingCycle,
      amount,
      currency: values.currency,
      nextBillingDate: values.nextBillingDate || null,
      trialEndDate: values.trialEndDate || null,
      cancellationDeadline: values.cancellationDeadline || null,
      paymentCard: values.paymentCard,
      status: values.status,
      memo: values.memo,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* サービス名 */}
        <div className="md:col-span-2">
          <Label htmlFor="serviceName">サービス名 *</Label>
          <Input
            id="serviceName"
            {...register('serviceName')}
            placeholder="例: Netflix"
            className="mt-1"
          />
        </div>

        {/* カテゴリ */}
        <div>
          <Label>カテゴリ *</Label>
          <Select
            onValueChange={(v) => setValue('category', v)}
            defaultValue={initialData?.category}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ステータス */}
        <div>
          <Label>ステータス</Label>
          <Select
            onValueChange={(v) => setValue('status', v as SubscriptionStatus)}
            defaultValue={initialData?.status ?? 'active'}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 契約開始日 */}
        <div>
          <Label htmlFor="startDate">契約開始日 *</Label>
          <Input id="startDate" type="date" {...register('startDate')} className="mt-1" />
        </div>

        {/* 請求サイクル */}
        <div>
          <Label>請求サイクル</Label>
          <Select
            onValueChange={(v) => setValue('billingCycle', v as BillingCycle)}
            defaultValue={initialData?.billingCycle ?? 'monthly'}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BILLING_CYCLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 金額 */}
        <div>
          <Label htmlFor="amount">金額 *</Label>
          <Input
            id="amount"
            type="number"
            {...register('amount')}
            placeholder="0"
            min="0"
            className="mt-1"
          />
        </div>

        {/* 通貨 */}
        <div>
          <Label>通貨</Label>
          <Select
            onValueChange={(v) => setValue('currency', v as Currency)}
            defaultValue={initialData?.currency ?? 'JPY'}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JPY">JPY（円）</SelectItem>
              <SelectItem value="USD">USD（ドル）</SelectItem>
              <SelectItem value="EUR">EUR（ユーロ）</SelectItem>
              <SelectItem value="GBP">GBP（ポンド）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 次回請求日 */}
        <div>
          <Label htmlFor="nextBillingDate">次回請求日</Label>
          <Input
            id="nextBillingDate"
            type="date"
            {...register('nextBillingDate')}
            className="mt-1"
          />
        </div>

        {/* 無料体験終了日 */}
        <div>
          <Label htmlFor="trialEndDate">無料体験終了日</Label>
          <Input
            id="trialEndDate"
            type="date"
            {...register('trialEndDate')}
            className="mt-1"
          />
        </div>

        {/* 解約期限 */}
        <div>
          <Label htmlFor="cancellationDeadline">解約期限</Label>
          <Input
            id="cancellationDeadline"
            type="date"
            {...register('cancellationDeadline')}
            className="mt-1"
          />
        </div>

        {/* 決済カード */}
        <div>
          <Label htmlFor="paymentCard">決済カード名</Label>
          <Input
            id="paymentCard"
            {...register('paymentCard')}
            placeholder="例: 三井住友カード"
            className="mt-1"
          />
        </div>

        {/* メモ */}
        <div className="md:col-span-2">
          <Label htmlFor="memo">メモ</Label>
          <Input
            id="memo"
            {...register('memo')}
            placeholder="備考など"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">{initialData ? '更新する' : '追加する'}</Button>
      </div>
    </form>
  );
}
