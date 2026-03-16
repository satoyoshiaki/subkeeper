import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

interface Subscription {
  id: string;
  service_name: string;
  amount: number;
  currency: string;
  next_billing_date: string | null;
  trial_end_date: string | null;
  cancellation_deadline: string | null;
}

interface NotificationItem {
  type: 'billing' | 'trial' | 'cancellation';
  subscription: Subscription;
  daysUntil: number;
  dateStr: string;
}

Deno.serve(async (_req) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all active/canceling subscriptions with user emails
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        service_name,
        amount,
        currency,
        next_billing_date,
        trial_end_date,
        cancellation_deadline,
        auth.users!inner(email)
      `)
      .in('status', ['active', 'canceling']);

    if (subError) {
      console.error('Failed to fetch subscriptions:', subError);
      return new Response(JSON.stringify({ error: subError.message }), { status: 500 });
    }

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('notifications_enabled', true);

    const prefMap = new Map(
      (preferences ?? []).map((p) => [p.user_id, p])
    );

    // Group notifications by user
    const userNotifications = new Map<string, { email: string; items: NotificationItem[] }>();

    for (const sub of subscriptions ?? []) {
      const pref = prefMap.get(sub.user_id) ?? {
        notify_billing_days: 7,
        notify_trial_days: 3,
        notify_cancellation_days: 3,
      };

      const email = (sub as Record<string, unknown>)['users']?.['email'] as string;
      if (!email) continue;

      if (!userNotifications.has(sub.user_id)) {
        userNotifications.set(sub.user_id, { email, items: [] });
      }
      const notif = userNotifications.get(sub.user_id)!;

      const checkDate = (dateStr: string | null, type: NotificationItem['type'], thresholdDays: number) => {
        if (!dateStr) return;
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= thresholdDays) {
          notif.items.push({ type, subscription: sub, daysUntil, dateStr });
        }
      };

      checkDate(sub.next_billing_date, 'billing', pref.notify_billing_days);
      checkDate(sub.trial_end_date, 'trial', pref.notify_trial_days);
      checkDate(sub.cancellation_deadline, 'cancellation', pref.notify_cancellation_days);
    }

    const typeLabels: Record<NotificationItem['type'], string> = {
      billing: '請求予定',
      trial: 'トライアル終了',
      cancellation: '解約期限',
    };

    let sentCount = 0;

    for (const [, { email, items }] of userNotifications) {
      if (items.length === 0) continue;

      const itemsHtml = items
        .map(({ type, subscription, daysUntil, dateStr }) => {
          const dayText = daysUntil === 0 ? '本日' : `${daysUntil}日後`;
          return `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${subscription.service_name}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${typeLabels[type]}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${formatDate(dateStr)}（${dayText}）</td>
            </tr>
          `;
        })
        .join('');

      const html = `
        <!DOCTYPE html>
        <html lang="ja">
        <body style="font-family:sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="color:#2563eb;font-size:20px">SubKeeper 通知</h1>
          <p>以下のサブスクリプションについてお知らせがあります：</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="padding:8px 12px;text-align:left">サービス名</th>
                <th style="padding:8px 12px;text-align:left">種別</th>
                <th style="padding:8px 12px;text-align:left">日付</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="margin-top:24px;color:#6b7280;font-size:12px">
            このメールはSubKeeperから自動送信されています。
          </p>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: 'SubKeeper <noreply@yourdomain.com>',
        to: email,
        subject: `SubKeeper: ${items.length}件のお知らせがあります`,
        html,
      });

      sentCount++;
    }

    return new Response(
      JSON.stringify({ success: true, sentCount }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
