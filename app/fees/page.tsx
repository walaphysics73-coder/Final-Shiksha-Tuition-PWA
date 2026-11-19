'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/useLanguage';
import { useAppSettings } from '@/lib/useAppSettings';
import { SettingsModal } from '@/components/PinLockAndSettings';
import { WhatsAppQueueModal, QueueItem } from '@/components/WhatsAppQueueModal';
import {
  Users,
  CheckSquare,
  Wallet,
  GraduationCap,
  Languages,
  IndianRupee,
  Search,
  MessageCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Bell,
  X,
  Settings,
  ClipboardList,
  Send,
} from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  parent_name: string;
  class: string;
  parent_phone: string;
  monthly_fee: number;
  fee_due_day: number;
}

interface FeePayment {
  id: string;
  student_id: string;
  amount_paid: number;
  payment_date: string;
  month: string;
}

const MONTHS_LIST = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
  'January 2027',
  'February 2027',
  'March 2027',
];

const translations = {
  en: {
    subtitle: 'Fees & Receipts',
    tabStudents: 'Students',
    tabAttendance: 'Attendance',
    tabFees: 'Fees',
    tabTests: 'Tests',
    collectedLabel: 'Collected',
    pendingLabel: 'Pending',
    sendAllPaid: 'Send Paid Receipts',
    sendAllDue: 'Send Due Reminders',
    queueTitlePaid: 'Send All Paid Receipts',
    queueTitleDue: 'Send All Due Reminders',
    filterAll: 'All',
    filterPending: 'Pending',
    filterPaid: 'Paid',
    searchPlaceholder: 'Search student or parent...',
    paidBadge: 'Paid',
    partialBadge: 'Partial',
    pendingBadge: 'Due',
    collectBtn: 'Collect Fee',
    sendReceiptBtn: 'Send Receipt',
    sendReminderBtn: 'Reminder',
    resetTitle: 'Reset Payment',
    modalTitle: 'Collect Tuition Fee',
    amountLabel: 'Amount Received (₹) *',
    dateLabel: 'Payment Date',
    cancel: 'Cancel',
    confirmPay: 'Save Payment',
    saving: 'Saving...',
    loading: 'Loading fee records...',
    noStudents: 'No students found for this filter.',
    parentPrefix: 'Parent:',
    dueDayPrefix: 'Due:',
    thSuffix: 'th',
    confirmReset: (name: string) => `Reset fee payment record for ${name}?`,
    whatsappReceipt: (
      s: Student,
      paid: number,
      month: string,
      date: string,
      tuitionName: string
    ) =>
      `✅ *FEE RECEIPT - ${tuitionName}*\n\n• Student: *${s.full_name}* (${s.class})\n• Parent: ${s.parent_name || 'Parent'}\n• Month: *${month}*\n• Amount Paid: *₹${paid}* (Total Fee: ₹${s.monthly_fee})\n• Date: ${date}\n\nThank you!`,
    whatsappReminder: (
      s: Student,
      due: number,
      month: string,
      tuitionName: string,
      upiId: string
    ) =>
      `🔔 *FEE REMINDER - ${tuitionName}*\n\nHello *${s.parent_name || 'Parent'}*, tuition fee of *₹${due}* for *${s.full_name}* (${s.class}) for *${month}* is pending (Due date: ${s.fee_due_day || 5}th).${
        upiId ? `\n\n• Pay via UPI: *${upiId}*` : ''
      }\n\nKindly submit at your earliest convenience. Thank you!`,
  },
  hi: {
    subtitle: 'फीस & डिजिटल रसीद',
    tabStudents: 'स्टूडेंट्स',
    tabAttendance: 'अटेंडेंस',
    tabFees: 'फीस',
    tabTests: 'टेस्ट',
    collectedLabel: 'जमा फीस',
    pendingLabel: 'बाकी फीस',
    sendAllPaid: 'Paid को रसीद भेजें',
    sendAllDue: 'Due को रिमाइंडर भेजें',
    queueTitlePaid: 'सभी जमा फीस की रसीद भेजें',
    queueTitleDue: 'सभी बाकी फीस का रिमाइंडर भेजें',
    filterAll: 'सभी',
    filterPending: 'बाकी (Due)',
    filterPaid: 'जमा (Paid)',
    searchPlaceholder: 'स्टूडेंट या पिता का नाम खोजें...',
    paidBadge: 'जमा (Paid)',
    partialBadge: 'आधी जमा',
    pendingBadge: 'बाकी (Due)',
    collectBtn: 'फीस जमा करें',
    sendReceiptBtn: 'रसीद भेजें',
    sendReminderBtn: 'रिमाइंडर',
    resetTitle: 'पेमेंट हटाएं',
    modalTitle: 'ट्यूशन फीस जमा करें',
    amountLabel: 'प्राप्त राशि (₹ में) *',
    dateLabel: 'जमा करने की तारीख',
    cancel: 'रद्द करें',
    confirmPay: 'फीस सेव करें',
    saving: 'सेव हो रहा है...',
    loading: 'फीस रिकॉर्ड लोड हो रहा है...',
    noStudents: 'इस फ़िल्टर में कोई स्टूडेंट नहीं मिला।',
    parentPrefix: 'पिता:',
    dueDayPrefix: 'तारीख:',
    thSuffix: '',
    confirmReset: (name: string) =>
      `क्या आप ${name} की इस महीने की जमा फीस एंट्री हटाना चाहते हैं?`,
    whatsappReceipt: (
      s: Student,
      paid: number,
      month: string,
      date: string,
      tuitionName: string
    ) =>
      `✅ *फीस रसीद - ${tuitionName}*\n\n• स्टूडेंट: *${s.full_name}* (${s.class})\n• अभिभावक: ${s.parent_name || 'Parent'}\n• महीना: *${month}*\n• जमा राशि: *₹${paid}* (कुल फीस: ₹${s.monthly_fee})\n• तारीख: ${date}\n\nधन्यवाद!`,
    whatsappReminder: (
      s: Student,
      due: number,
      month: string,
      tuitionName: string,
      upiId: string
    ) =>
      `🔔 *फीस रिमाइंडर - ${tuitionName}*\n\nनमस्ते *${s.parent_name || 'अभिभावक'}*, *${s.full_name}* (${s.class}) की *${month}* की ट्यूशन फीस *₹${due}* बाकी है (तारीख: ${s.fee_due_day || 5})।${
        upiId ? `\n\n• ऑनलाइन UPI ID: *${upiId}*` : ''
      }\n\nकृपया शीघ्र जमा करवाएं। धन्यवाद!`,
  },
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getCurrentMonthLabel = () => {
  const label = new Date().toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return MONTHS_LIST.includes(label) ? label : 'November 2026';
};

export default function FeesPage() {
  const { lang, toggleLanguage } = useLanguage();
  const { settings, saveSettings, lockApp } = useAppSettings();
  const t = translations[lang];

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthLabel());
  const [students, setStudents] = useState<Student[]>([]);
  const [paymentsMap, setPaymentsMap] = useState<Record<string, FeePayment>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Collect Fee Modal State
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayDate());
  const [saving, setSaving] = useState(false);

  // Queue Modal State
  const [queueOpen, setQueueOpen] = useState(false);
  const [queueTitle, setQueueTitle] = useState('');
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  const fetchFeesData = useCallback(async () => {
    setLoading(true);

    const [studentsRes, paymentsRes] = await Promise.all([
      supabase
        .from('students')
        .select('id, full_name, parent_name, class, parent_phone, monthly_fee, fee_due_day')
        .order('full_name', { ascending: true }),
      supabase.from('fee_payments').select('*').eq('month', selectedMonth),
    ]);

    if (!studentsRes.error && studentsRes.data) {
      setStudents(studentsRes.data);
    }

    if (!paymentsRes.error && paymentsRes.data) {
      const map: Record<string, FeePayment> = {};
      paymentsRes.data.forEach((p) => {
        map[p.student_id] = p as FeePayment;
      });
      setPaymentsMap(map);
    } else {
      setPaymentsMap({});
    }

    setLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    fetchFeesData();
  }, [fetchFeesData]);

  const openCollectModal = (student: Student) => {
    const existing = paymentsMap[student.id];
    setActiveStudent(student);
    setAmountInput(
      existing ? String(existing.amount_paid) : String(student.monthly_fee)
    );
    setPaymentDate(existing?.payment_date || getTodayDate());
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !amountInput) return;

    setSaving(true);
    const existing = paymentsMap[activeStudent.id];
    const numericAmount = Number(amountInput);

    if (existing) {
      await supabase
        .from('fee_payments')
        .update({
          amount_paid: numericAmount,
          payment_date: paymentDate,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('fee_payments').insert([
        {
          student_id: activeStudent.id,
          amount_paid: numericAmount,
          payment_date: paymentDate,
          month: selectedMonth,
        },
      ]);
    }

    setSaving(false);
    setActiveStudent(null);
    fetchFeesData();
  };

  const handleResetPayment = async (student: Student) => {
    const existing = paymentsMap[student.id];
    if (!existing) return;
    if (!confirm(t.confirmReset(student.full_name))) return;

    await supabase.from('fee_payments').delete().eq('id', existing.id);
    fetchFeesData();
  };

  const buildStudentFeeMessage = (student: Student, isReceipt: boolean) => {
    const payment = paymentsMap[student.id];
    const paidAmount = Number(payment?.amount_paid || 0);
    const dueAmount = Math.max(0, Number(student.monthly_fee) - paidAmount);

    return isReceipt
      ? t.whatsappReceipt(
          student,
          paidAmount,
          selectedMonth,
          payment?.payment_date || getTodayDate(),
          settings.tuitionName
        )
      : t.whatsappReminder(
          student,
          dueAmount,
          selectedMonth,
          settings.tuitionName,
          settings.upiId
        );
  };

  const sendSingleWhatsApp = (student: Student, isReceipt: boolean) => {
    let phone = (student.parent_phone || '').replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const message = buildStudentFeeMessage(student, isReceipt);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openBulkFeeQueue = (type: 'Paid' | 'Pending') => {
    const matching = students.filter((s) => {
      const paid = Number(paymentsMap[s.id]?.amount_paid || 0);
      const isPaid = paid >= Number(s.monthly_fee) && Number(s.monthly_fee) > 0;
      return type === 'Paid' ? isPaid : !isPaid;
    });

    const items: QueueItem[] = matching.map((s) => ({
      id: s.id,
      studentName: s.full_name,
      className: s.class,
      parentName: s.parent_name,
      phone: s.parent_phone,
      message: buildStudentFeeMessage(s, type === 'Paid'),
    }));

    setQueueTitle(type === 'Paid' ? t.queueTitlePaid : t.queueTitleDue);
    setQueueItems(items);
    setQueueOpen(true);
  };

  const totalExpected = students.reduce(
    (sum, s) => sum + Number(s.monthly_fee || 0),
    0
  );
  const totalCollected = students.reduce(
    (sum, s) => sum + Number(paymentsMap[s.id]?.amount_paid || 0),
    0
  );
  const totalPending = Math.max(0, totalExpected - totalCollected);

  const paidStudentsCount = students.filter((s) => {
    const paid = Number(paymentsMap[s.id]?.amount_paid || 0);
    return paid >= Number(s.monthly_fee) && Number(s.monthly_fee) > 0;
  }).length;
  const dueStudentsCount = students.length - paidStudentsCount;

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.full_name.toLowerCase().includes(q) ||
      (s.parent_name || '').toLowerCase().includes(q);

    const paid = Number(paymentsMap[s.id]?.amount_paid || 0);
    const isFullyPaid = paid >= Number(s.monthly_fee) && Number(s.monthly_fee) > 0;

    if (statusFilter === 'Paid') return matchesSearch && isFullyPaid;
    if (statusFilter === 'Pending') return matchesSearch && !isFullyPaid;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28 md:pb-12">
      {/* Sticky Top Header */}
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-white/15 p-2 rounded-xl shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="truncate">
              <h1 className="text-sm sm:text-lg font-bold leading-tight truncate">
                {settings.tuitionName}
              </h1>
              <p className="text-[11px] text-indigo-200 truncate">{t.subtitle}</p>
            </div>
          </div>

          {/* Desktop/Tablet Inline Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-indigo-700/60 p-1 rounded-xl">
            <Link
              href="/"
              className="text-indigo-100 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Users className="w-3.5 h-3.5" /> {t.tabStudents}
            </Link>
            <Link
              href="/attendance"
              className="text-indigo-100 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <CheckSquare className="w-3.5 h-3.5" /> {t.tabAttendance}
            </Link>
            <Link
              href="/fees"
              className="bg-white text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5" /> {t.tabFees}
            </Link>
            <Link
              href="/tests"
              className="text-indigo-100 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <ClipboardList className="w-3.5 h-3.5" /> {t.tabTests}
            </Link>
          </nav>

          {/* Month Selector, Language & Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-indigo-700/90 border border-indigo-400/40 text-white rounded-xl px-2 h-9 sm:h-10 text-xs font-semibold focus:outline-none max-w-[115px] sm:max-w-none"
            >
              {MONTHS_LIST.map((m) => (
                <option key={m} value={m} className="bg-indigo-800 text-white">
                  {m}
                </option>
              ))}
            </select>

            <button
              onClick={toggleLanguage}
              className="bg-indigo-700 active:scale-95 hover:bg-indigo-800 border border-indigo-400/40 text-white px-2.5 h-9 sm:h-10 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="bg-indigo-700 active:scale-95 hover:bg-indigo-800 border border-indigo-400/40 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6 space-y-4">
        {/* Collected vs Pending Summary */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                {t.collectedLabel}
              </p>
              <p className="text-lg sm:text-2xl font-extrabold text-emerald-600 truncate">
                ₹{totalCollected}
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                {t.pendingLabel}
              </p>
              <p className="text-lg sm:text-2xl font-extrabold text-rose-600 truncate">
                ₹{totalPending}
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Paid Receipts & Due Reminders Queue Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => openBulkFeeQueue('Paid')}
            disabled={paidStudentsCount === 0}
            className="bg-emerald-600 active:scale-[0.99] hover:bg-emerald-700 disabled:opacity-40 text-white px-3 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t.sendAllPaid} ({paidStudentsCount})
            </span>
          </button>

          <button
            onClick={() => openBulkFeeQueue('Pending')}
            disabled={dueStudentsCount === 0}
            className="bg-amber-600 active:scale-[0.99] hover:bg-amber-700 disabled:opacity-40 text-white px-3 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t.sendAllDue} ({dueStudentsCount})
            </span>
          </button>
        </div>

        {/* Search & Filter Pills */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 bg-white p-1 rounded-xl border border-slate-200 h-11 sm:w-72 shrink-0">
            {(['All', 'Pending', 'Paid'] as const).map((tab) => {
              const label =
                tab === 'All'
                  ? t.filterAll
                  : tab === 'Pending'
                  ? t.filterPending
                  : t.filterPaid;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-lg text-xs font-bold transition ${
                    statusFilter === tab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Student Fee Cards */}
        {loading ? (
          <p className="text-center text-sm text-slate-500 py-10">{t.loading}</p>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <p className="text-sm text-slate-600 font-medium">{t.noStudents}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredStudents.map((student) => {
              const payment = paymentsMap[student.id];
              const paidAmount = Number(payment?.amount_paid || 0);
              const totalFee = Number(student.monthly_fee || 0);
              const isPaid = paidAmount >= totalFee && totalFee > 0;
              const isPartial = paidAmount > 0 && paidAmount < totalFee;

              return (
                <div
                  key={student.id}
                  className={`bg-white p-4 rounded-2xl border shadow-sm flex flex-col justify-between gap-3 ${
                    isPaid
                      ? 'border-emerald-200'
                      : isPartial
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-slate-900">
                          {student.full_name}
                        </h3>
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-md">
                          {student.class}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {student.parent_name
                          ? `${t.parentPrefix} ${student.parent_name} • `
                          : ''}
                        {t.dueDayPrefix} {student.fee_due_day || 5}
                        {t.thSuffix}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-700'
                            : isPartial
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isPaid
                          ? t.paidBadge
                          : isPartial
                          ? t.partialBadge
                          : t.pendingBadge}
                      </span>
                      <p className="text-sm font-extrabold text-slate-800 mt-1">
                        ₹{paidAmount}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          / ₹{totalFee}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {!isPaid ? (
                      <>
                        <button
                          onClick={() => openCollectModal(student)}
                          className="flex-1 bg-indigo-600 active:scale-[0.98] hover:bg-indigo-700 text-white h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          {t.collectBtn}
                        </button>
                        <button
                          onClick={() => sendSingleWhatsApp(student, false)}
                          className="px-3.5 h-10 bg-amber-50 active:scale-95 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          {t.sendReminderBtn}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => sendSingleWhatsApp(student, true)}
                          className="flex-1 bg-emerald-500 active:scale-[0.98] hover:bg-emerald-600 text-white h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {t.sendReceiptBtn}
                        </button>
                        <button
                          onClick={() => handleResetPayment(student)}
                          className="w-10 h-10 bg-slate-100 active:scale-95 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl flex items-center justify-center transition"
                          title={t.resetTitle}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Collect Fee Modal */}
      {activeStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSavePayment}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {t.modalTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeStudent.full_name} ({activeStudent.class}) • {selectedMonth}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.amountLabel}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 h-12 text-base font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.dateLabel}
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveStudent(null)}
                className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition"
              >
                {saving ? t.saving : t.confirmPay}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fast Queue Sender Modal */}
      <WhatsAppQueueModal
        isOpen={queueOpen}
        onClose={() => setQueueOpen(false)}
        title={queueTitle}
        items={queueItems}
        lang={lang}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={saveSettings}
        onLockNow={lockApp}
        lang={lang}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-600 font-medium text-[10px] transition"
          >
            <div className="px-3 py-1">
              <Users className="w-5 h-5" />
            </div>
            <span>{t.tabStudents}</span>
          </Link>

          <Link
            href="/attendance"
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-600 font-medium text-[10px] transition"
          >
            <div className="px-3 py-1">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span>{t.tabAttendance}</span>
          </Link>

          <Link
            href="/fees"
            className="flex flex-col items-center justify-center gap-1 text-indigo-600 font-bold text-[10px]"
          >
            <div className="bg-indigo-50 px-3 py-1 rounded-full">
              <Wallet className="w-5 h-5" />
            </div>
            <span>{t.tabFees}</span>
          </Link>

          <Link
            href="/tests"
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-600 font-medium text-[10px] transition"
          >
            <div className="px-3 py-1">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span>{t.tabTests}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}