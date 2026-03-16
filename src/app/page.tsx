'use client';

import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Subscription, SubscriptionFormData, CATEGORIES, STATUS_LABELS } from '@/types/subscription';
import { SAMPLE_SUBSCRIPTIONS } from '@/lib/subscription';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { SubscriptionForm } from '@/components/subscription/SubscriptionForm';
import { SummaryCards } from '@/components/subscription/SummaryCards';
import { AlertSection } from '@/components/subscription/AlertSection';
import { MigrationDialog } from '@/components/MigrationDialog';
import { CsvButtons } from '@/components/csv/CsvButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, LayoutDashboard, Database } from 'lucide-react';

export default function Home() {
  const { subscriptions, isLoaded, create, update, remove, createBulk } = useSubscriptions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCard, setFilterCard] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const allCards = useMemo(() => {
    const cards = subscriptions.map((s) => s.paymentCard).filter(Boolean);
    return Array.from(new Set(cards));
  }, [subscriptions]);

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      if (searchQuery && !sub.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      if (filterCategory !== 'all' && sub.category !== filterCategory) return false;
      if (filterCard !== 'all' && sub.paymentCard !== filterCard) return false;
      if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
      return true;
    });
  }, [subscriptions, searchQuery, filterCategory, filterCard, filterStatus]);

  const handleAdd = async (data: SubscriptionFormData) => {
    setIsSaving(true);
    const now = new Date().toISOString();
    const newSub: Subscription = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    try {
      await create(newSub);
      setIsFormOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (data: SubscriptionFormData) => {
    if (!editTarget) return;
    setIsSaving(true);
    const updated: Subscription = { ...editTarget, ...data, updatedAt: new Date().toISOString() };
    try {
      await update(updated);
      setEditTarget(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  const loadSampleData = async () => {
    await createBulk(SAMPLE_SUBSCRIPTIONS);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">SubKeeper</h1>
          </div>
          <div className="flex items-center gap-2">
            <CsvButtons subscriptions={subscriptions} createBulk={createBulk} />
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">集計</h2>
          <SummaryCards subscriptions={subscriptions} />
        </section>

        {subscriptions.length > 0 && (
          <section>
            <AlertSection subscriptions={subscriptions} />
          </section>
        )}

        <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="サービス名で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCard} onValueChange={setFilterCard}>
              <SelectTrigger>
                <SelectValue placeholder="カード" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカード</SelectItem>
                {allCards.map((card) => (
                  <SelectItem key={card} value={card}>{card}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            サブスクリプション一覧（{filtered.length}件）
          </h2>

          {subscriptions.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <LayoutDashboard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                サブスクリプションがありません
              </h3>
              <p className="text-gray-500 mb-6">「追加」から最初のサブスクを登録しましょう</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  追加する
                </Button>
                <Button variant="outline" onClick={loadSampleData}>
                  <Database className="h-4 w-4 mr-1" />
                  サンプルデータを読み込む
                </Button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">該当なし</h3>
              <p className="text-gray-500">検索条件に一致するサブスクリプションがありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Migration Dialog */}
      <MigrationDialog onMigrate={createBulk} />

      {/* Add Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>サブスクリプションを追加</DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            onSubmit={handleAdd}
            onCancel={() => setIsFormOpen(false)}
            disabled={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>サブスクリプションを編集</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <SubscriptionForm
              initialData={editTarget}
              onSubmit={handleEdit}
              onCancel={() => setEditTarget(null)}
              disabled={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除の確認</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.serviceName}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
