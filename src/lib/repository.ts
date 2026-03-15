import { Subscription } from '@/types/subscription';

const STORAGE_KEY = 'subkeeper_subscriptions';

export interface SubscriptionRepository {
  getAll(): Subscription[];
  getById(id: string): Subscription | null;
  create(subscription: Subscription): void;
  update(subscription: Subscription): void;
  delete(id: string): void;
}

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const localStorageRepository: SubscriptionRepository = {
  getAll(): Subscription[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return safeParseJSON<Subscription[]>(raw, []);
  },

  getById(id: string): Subscription | null {
    return this.getAll().find((s) => s.id === id) ?? null;
  },

  create(subscription: Subscription): void {
    const all = this.getAll();
    all.push(subscription);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  update(subscription: Subscription): void {
    const all = this.getAll();
    const index = all.findIndex((s) => s.id === subscription.id);
    if (index !== -1) {
      all[index] = subscription;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  },

  delete(id: string): void {
    const all = this.getAll().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },
};
