'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isValid,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Subscription } from '@/types/subscription';

interface CalendarEvent {
  subscription: Subscription;
  type: 'billing' | 'trial' | 'cancellation';
  label: string;
  color: string;
  dotColor: string;
}

function getEventsForDay(subscriptions: Subscription[], day: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const sub of subscriptions) {
    if (sub.nextBillingDate) {
      const d = parseISO(sub.nextBillingDate);
      if (isValid(d) && isSameDay(d, day)) {
        events.push({
          subscription: sub,
          type: 'billing',
          label: `${sub.serviceName} 請求`,
          color: 'text-blue-700 bg-blue-50',
          dotColor: 'bg-blue-500',
        });
      }
    }
    if (sub.trialEndDate) {
      const d = parseISO(sub.trialEndDate);
      if (isValid(d) && isSameDay(d, day)) {
        events.push({
          subscription: sub,
          type: 'trial',
          label: `${sub.serviceName} トライアル終了`,
          color: 'text-orange-700 bg-orange-50',
          dotColor: 'bg-orange-500',
        });
      }
    }
    if (sub.cancellationDeadline) {
      const d = parseISO(sub.cancellationDeadline);
      if (isValid(d) && isSameDay(d, day)) {
        events.push({
          subscription: sub,
          type: 'cancellation',
          label: `${sub.serviceName} 解約期限`,
          color: 'text-red-700 bg-red-50',
          dotColor: 'bg-red-500',
        });
      }
    }
  }

  return events;
}

interface Props {
  subscriptions: Subscription[];
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function CalendarView({ subscriptions }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return startOfMonth(d);
    });
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return startOfMonth(d);
    });
    setSelectedDay(null);
  };

  const today = new Date();
  const selectedEvents = selectedDay ? getEventsForDay(subscriptions, selectedDay) : [];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'yyyy年 M月', { locale: ja })}
        </h2>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`py-2 text-center text-xs font-semibold ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const events = getEventsForDay(subscriptions, day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const dayOfWeek = day.getDay();

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-[72px] p-1.5 border-b border-r border-gray-100 text-left transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-blue-50/30'
                } ${isSelected ? 'ring-2 ring-inset ring-blue-400' : ''}`}
              >
                <div
                  className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : !isCurrentMonth
                      ? 'text-gray-300'
                      : dayOfWeek === 0
                      ? 'text-red-500'
                      : dayOfWeek === 6
                      ? 'text-blue-500'
                      : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                {/* Event dots */}
                {events.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {events.slice(0, 4).map((ev, i) => (
                      <span
                        key={i}
                        className={`inline-block w-1.5 h-1.5 rounded-full ${ev.dotColor}`}
                      />
                    ))}
                    {events.length > 4 && (
                      <span className="text-[9px] text-gray-400">+{events.length - 4}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          請求日
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
          トライアル終了
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          解約期限
        </span>
      </div>

      {/* Selected Day Events */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            {format(selectedDay, 'M月d日 (EEE)', { locale: ja })} のイベント
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400">イベントはありません</p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((ev, i) => (
                <li key={i} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${ev.color}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.dotColor}`} />
                  {ev.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
