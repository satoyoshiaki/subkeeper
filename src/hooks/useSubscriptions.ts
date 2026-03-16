'use client';

import { useState, useEffect, useCallback } from 'react';
import { Subscription } from '@/types/subscription';
import { createClient } from '@/lib/supabase/client';
import { createSupabaseRepository } from '@/lib/supabase/repository';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const load = useCallback(async (uid: string) => {
    const supabase = createClient();
    const repo = createSupabaseRepository(supabase, uid);
    const data = await repo.getAllAsync();
    setSubscriptions(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (userId) load(userId);
  }, [userId, load]);

  const getRepo = useCallback(() => {
    if (!userId) throw new Error('Not authenticated');
    const supabase = createClient();
    return createSupabaseRepository(supabase, userId);
  }, [userId]);

  const create = useCallback(async (sub: Subscription) => {
    await getRepo().createAsync(sub);
    if (userId) await load(userId);
  }, [getRepo, userId, load]);

  const update = useCallback(async (sub: Subscription) => {
    await getRepo().updateAsync(sub);
    if (userId) await load(userId);
  }, [getRepo, userId, load]);

  const remove = useCallback(async (id: string) => {
    await getRepo().deleteAsync(id);
    if (userId) await load(userId);
  }, [getRepo, userId, load]);

  const createBulk = useCallback(async (subs: Subscription[]): Promise<{ added: number; skipped: number }> => {
    const repo = getRepo();
    const existingIds = new Set(subscriptions.map((s) => s.id));
    let added = 0;
    let skipped = 0;
    for (const sub of subs) {
      if (existingIds.has(sub.id)) {
        skipped++;
      } else {
        await repo.createAsync({ ...sub, updatedAt: new Date().toISOString() });
        added++;
      }
    }
    if (userId) await load(userId);
    return { added, skipped };
  }, [getRepo, subscriptions, userId, load]);

  return {
    subscriptions,
    isLoaded,
    userId,
    create,
    update,
    remove,
    createBulk,
    reload: () => (userId ? load(userId) : Promise.resolve()),
  };
}
