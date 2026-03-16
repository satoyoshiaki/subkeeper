'use client';

import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Subscription } from '@/types/subscription';

const STORAGE_KEY = 'subkeeper_subscriptions';
const MIGRATED_KEY = 'subkeeper_migrated';

interface Props {
  onMigrate: (subs: Subscription[]) => Promise<unknown>;
}

export function MigrationDialog({ onMigrate }: Props) {
  const [open, setOpen] = useState(false);
  const [pendingData, setPendingData] = useState<Subscription[]>([]);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(MIGRATED_KEY)) return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as Subscription[];
      if (data.length > 0) {
        setPendingData(data);
        setOpen(true);
      }
    } catch {
      // invalid JSON — skip
    }
  }, []);

  const handleConfirm = async () => {
    setMigrating(true);
    try {
      await onMigrate(pendingData);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(MIGRATED_KEY, '1');
    } finally {
      setMigrating(false);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    localStorage.setItem(MIGRATED_KEY, '1');
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            既存データのインポート
          </AlertDialogTitle>
          <AlertDialogDescription>
            ローカルに保存された <strong>{pendingData.length} 件</strong> のサブスクリプションが見つかりました。
            アカウントにインポートしますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={migrating}>
            スキップ
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={migrating}>
            {migrating ? 'インポート中...' : `${pendingData.length}件をインポート`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
