'use client';

import { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadCsv, importFromCsv } from '@/lib/csv';
import { Subscription } from '@/types/subscription';

interface Props {
  subscriptions: Subscription[];
  createBulk: (subs: Subscription[]) => Promise<{ added: number; skipped: number }>;
}

export function CsvButtons({ subscriptions, createBulk }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    downloadCsv(subscriptions);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const { imported, errors } = importFromCsv(text);

      if (imported.length === 0 && errors.length > 0) {
        setMessage({ type: 'error', text: `エラー: ${errors.slice(0, 2).join(' / ')}` });
        return;
      }

      setImporting(true);
      try {
        const { added, skipped } = await createBulk(imported);

        if (errors.length > 0) {
          setMessage({
            type: 'error',
            text: `${added}件インポート、${skipped}件スキップ。警告: ${errors.slice(0, 2).join(' / ')}`,
          });
        } else {
          setMessage({
            type: 'success',
            text: `${added}件インポートしました（${skipped}件は重複スキップ）`,
          });
        }
      } catch {
        setMessage({ type: 'error', text: 'インポートに失敗しました' });
      } finally {
        setImporting(false);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setMessage(null), 5000);
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={handleExport} disabled={subscriptions.length === 0}>
        <Download className="h-4 w-4 mr-1" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleImportClick} disabled={importing}>
        <Upload className="h-4 w-4 mr-1" />
        {importing ? '...' : 'インポート'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      {message && (
        <div
          className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}
