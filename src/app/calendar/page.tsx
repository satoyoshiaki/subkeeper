'use client';

import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createSupabaseRepository } from '@/lib/supabase/repository';
import { Subscription } from '@/types/subscription';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      createSupabaseRepository(supabase, user.id)
        .getAllAsync()
        .then(setSubscriptions);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">カレンダー</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <CalendarView subscriptions={subscriptions} />
      </main>
    </div>
  );
}
