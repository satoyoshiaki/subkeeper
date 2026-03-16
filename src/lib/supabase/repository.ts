import { SupabaseClient } from '@supabase/supabase-js';
import { Subscription } from '@/types/subscription';

function toRow(sub: Subscription, userId: string) {
  return {
    id: sub.id,
    user_id: userId,
    service_name: sub.serviceName,
    category: sub.category,
    start_date: sub.startDate,
    billing_cycle: sub.billingCycle,
    amount: sub.amount,
    currency: sub.currency,
    next_billing_date: sub.nextBillingDate,
    trial_end_date: sub.trialEndDate,
    cancellation_deadline: sub.cancellationDeadline,
    payment_card: sub.paymentCard,
    status: sub.status,
    memo: sub.memo,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Subscription {
  return {
    id: row.id,
    serviceName: row.service_name,
    category: row.category,
    startDate: row.start_date,
    billingCycle: row.billing_cycle,
    amount: Number(row.amount),
    currency: row.currency,
    nextBillingDate: row.next_billing_date,
    trialEndDate: row.trial_end_date,
    cancellationDeadline: row.cancellation_deadline,
    paymentCard: row.payment_card ?? '',
    status: row.status,
    memo: row.memo ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface AsyncSubscriptionRepository {
  getAllAsync(): Promise<Subscription[]>;
  getByIdAsync(id: string): Promise<Subscription | null>;
  createAsync(subscription: Subscription): Promise<void>;
  updateAsync(subscription: Subscription): Promise<void>;
  deleteAsync(id: string): Promise<void>;
}

export function createSupabaseRepository(
  supabase: SupabaseClient,
  userId: string
): AsyncSubscriptionRepository {
  return {
    async getAllAsync(): Promise<Subscription[]> {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(fromRow);
    },

    async getByIdAsync(id: string): Promise<Subscription | null> {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) return null;
      return data ? fromRow(data) : null;
    },

    async createAsync(subscription: Subscription): Promise<void> {
      const { error } = await supabase
        .from('subscriptions')
        .insert(toRow(subscription, userId));
      if (error) throw error;
    },

    async updateAsync(subscription: Subscription): Promise<void> {
      const { error } = await supabase
        .from('subscriptions')
        .update({ ...toRow(subscription, userId), updated_at: new Date().toISOString() })
        .eq('id', subscription.id)
        .eq('user_id', userId);
      if (error) throw error;
    },

    async deleteAsync(id: string): Promise<void> {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
  };
}
