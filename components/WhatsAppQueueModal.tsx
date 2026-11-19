'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  X,
  SkipForward,
  CheckCircle2,
  Phone,
  Users,
} from 'lucide-react';
import { Lang } from '@/lib/useLanguage';

export interface QueueItem {
  id: string;
  studentName: string;
  className: string;
  parentName?: string;
  phone: string;
  message: string;
}

interface WhatsAppQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: QueueItem[];
  lang: Lang;
}

export function WhatsAppQueueModal({
  isOpen,
  onClose,
  title,
  items,
  lang,
}: WhatsAppQueueModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSentCount(0);
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const isCompleted = currentIndex >= items.length;
  const currentItem = items[currentIndex];

  const handleSendAndNext = () => {
    if (!currentItem) return;

    let cleanPhone = currentItem.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentItem.message)}`,
      '_blank'
    );

    setSentCount((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {title}
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi'
                  ? `कुल लिस्ट: ${items.length} • भेजे गए: ${sentCount}`
                  : `Total Queue: ${items.length} • Sent: ${sentCount}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-600">
              {lang === 'hi'
                ? 'इस लिस्ट में अभी कोई स्टूडेंट नहीं है।'
                : 'No students in this list right now.'}
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 h-10 bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
            >
              {lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        ) : isCompleted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {lang === 'hi' ? 'सभी मैसेज पूरे हुए!' : 'All Messages Completed!'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'hi'
                ? `आपने ${items.length} में से ${sentCount} पेरेंट्स को WhatsApp भेजा।`
                : `You sent WhatsApp notifications to ${sentCount} of ${items.length} parents.`}
            </p>
            <button
              onClick={onClose}
              className="w-full h-11 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
            >
              {lang === 'hi' ? 'ठीक है (Done)' : 'Done'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-600">
                  {lang === 'hi'
                    ? `स्टूडेंट ${currentIndex + 1} / ${items.length}`
                    : `Student ${currentIndex + 1} of ${items.length}`}
                </span>
                <span className="text-slate-400">
                  {Math.round(((currentIndex + 1) / items.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / items.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Current Student Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {currentItem.studentName}{' '}
                    <span className="text-xs font-semibold text-indigo-600">
                      ({currentItem.className})
                    </span>
                  </h3>
                  {currentItem.parentName && (
                    <p className="text-xs text-slate-500">
                      {lang === 'hi' ? 'अभिभावक:' : 'Parent:'}{' '}
                      {currentItem.parentName}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {currentItem.phone}
                </span>
              </div>

              {/* Message Preview */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-600 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                {currentItem.message}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition"
              >
                <SkipForward className="w-4 h-4" />
                {lang === 'hi' ? 'छोड़ें' : 'Skip'}
              </button>

              <button
                type="button"
                onClick={handleSendAndNext}
                className="flex-1 h-12 rounded-xl bg-emerald-600 active:scale-[0.98] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {lang === 'hi'
                    ? 'WhatsApp भेजें & अगला →'
                    : 'Send WhatsApp & Next →'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}