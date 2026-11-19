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
  Check,
  X,
  MessageCircle,
  Calendar,
  Search,
  CheckCheck,
  UserCheck,
  UserX,
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
  batch_time: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  student_id: string;
  status: 'Present' | 'Absent';
}

const translations = {
  en: {
    subtitle: 'Daily Attendance',
    tabStudents: 'Students',
    tabAttendance: 'Attendance',
    tabFees: 'Fees',
    tabTests: 'Tests',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    totalLabel: 'Total',
    markAllPresent: 'Mark All Present',
    markingAll: 'Updating...',
    notifyAllPresent: 'Notify Present',
    notifyAllAbsent: 'Notify Absent',
    queueTitlePresent: 'Notify All Present Parents',
    queueTitleAbsent: 'Notify All Absent Parents',
    searchPlaceholder: 'Search student name...',
    allClasses: 'All Classes',
    presentBtn: 'Present',
    absentBtn: 'Absent',
    whatsappPresentBtn: 'Reached Msg',
    whatsappAbsentBtn: 'Absent Alert',
    loading: 'Loading attendance...',
    noStudents: 'No students found. Add students first from the Students tab.',
    parentPrefix: 'Parent:',
    whatsappPresentMsg: (s: Student, dateStr: string, tuitionName: string) =>
      `✅ *${tuitionName}*\n\nHello *${s.parent_name || 'Parent'}*, your child *${s.full_name}* (${s.class}) has safely reached Tuition Class today (${dateStr}).`,
    whatsappAbsentMsg: (s: Student, dateStr: string, tuitionName: string) =>
      `⚠️ *${tuitionName}*\n\nHello *${s.parent_name || 'Parent'}*, your child *${s.full_name}* (${s.class}) is *ABSENT* from Tuition Class today (${dateStr}). Please share the reason for absence.`,
  },
  hi: {
    subtitle: 'दैनिक अटेंडेंस',
    tabStudents: 'स्टूडेंट्स',
    tabAttendance: 'अटेंडेंस',
    tabFees: 'फीस',
    tabTests: 'टेस्ट',
    presentLabel: 'उपस्थित (Present)',
    absentLabel: 'अनुपस्थित (Absent)',
    totalLabel: 'कुल बच्चे',
    markAllPresent: 'सभी को Present करें',
    markingAll: 'अपडेट हो रहा है...',
    notifyAllPresent: 'Present को भेजें',
    notifyAllAbsent: 'Absent को भेजें',
    queueTitlePresent: 'सभी Present पेरेंट्स को सूचना',
    queueTitleAbsent: 'सभी Absent पेरेंट्स को सूचना',
    searchPlaceholder: 'स्टूडेंट का नाम खोजें...',
    allClasses: 'सभी क्लास',
    presentBtn: 'Present',
    absentBtn: 'Absent',
    whatsappPresentBtn: 'आगमन सूचना',
    whatsappAbsentBtn: 'अनुपस्थिति अलर्ट',
    loading: 'अटेंडेंस लोड हो रही है...',
    noStudents: 'कोई स्टूडेंट नहीं मिला। पहले Students टैब से एडमिशन जोड़ें।',
    parentPrefix: 'पिता:',
    whatsappPresentMsg: (s: Student, dateStr: string, tuitionName: string) =>
      `✅ *${tuitionName}*\n\nनमस्ते *${s.parent_name || 'अभिभावक'}*, आपका बच्चा *${s.full_name}* (${s.class}) आज (${dateStr}) समय पर ट्यूशन क्लास पहुँच गया है।`,
    whatsappAbsentMsg: (s: Student, dateStr: string, tuitionName: string) =>
      `⚠️ *${tuitionName}*\n\nनमस्ते *${s.parent_name || 'अभिभावक'}*, आपका बच्चा *${s.full_name}* (${s.class}) आज (${dateStr}) ट्यूशन क्लास में *अनुपस्थित (Absent)* है। कृपया छुट्टी का कारण बताएं।`,
  },
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function AttendancePage() {
  const { lang, toggleLanguage } = useLanguage();
  const { settings, saveSettings, lockApp } = useAppSettings();
  const t = translations[lang];

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [showSettings, setShowSettings] = useState(false);

  // Queue Modal State
  const [queueOpen, setQueueOpen] = useState(false);
  const [queueTitle, setQueueTitle] = useState('');
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [studentsRes, attendanceRes] = await Promise.all([
      supabase
        .from('students')
        .select('id, full_name, parent_name, class, parent_phone, batch_time')
        .order('full_name', { ascending: true }),
      supabase.from('attendance').select('*').eq('date', selectedDate),
    ]);

    if (!studentsRes.error && studentsRes.data) {
      setStudents(studentsRes.data);
    }

    if (!attendanceRes.error && attendanceRes.data) {
      const map: Record<string, AttendanceRecord> = {};
      attendanceRes.data.forEach((rec) => {
        map[rec.student_id] = rec as AttendanceRecord;
      });
      setAttendanceMap(map);
    } else {
      setAttendanceMap({});
    }

    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAttendance = async (studentId: string, status: 'Present' | 'Absent') => {
    const existing = attendanceMap[studentId];

    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        id: existing?.id || 'temp',
        date: selectedDate,
        student_id: studentId,
        status,
      },
    }));

    if (existing && existing.id !== 'temp') {
      await supabase
        .from('attendance')
        .update({ status })
        .eq('id', existing.id);
    } else {
      const { data } = await supabase
        .from('attendance')
        .insert([{ date: selectedDate, student_id: studentId, status }])
        .select()
        .single();

      if (data) {
        setAttendanceMap((prev) => ({
          ...prev,
          [studentId]: data as AttendanceRecord,
        }));
      }
    }
  };

  const handleMarkAllPresent = async () => {
    if (filteredStudents.length === 0) return;
    setBulkUpdating(true);

    for (const student of filteredStudents) {
      if (attendanceMap[student.id]?.status !== 'Present') {
        await markAttendance(student.id, 'Present');
      }
    }

    setBulkUpdating(false);
  };

  const sendSingleWhatsApp = (student: Student, status: 'Present' | 'Absent') => {
    let phone = (student.parent_phone || '').replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const message =
      status === 'Present'
        ? t.whatsappPresentMsg(student, selectedDate, settings.tuitionName)
        : t.whatsappAbsentMsg(student, selectedDate, settings.tuitionName);

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openBulkQueue = (targetStatus: 'Present' | 'Absent') => {
    const matching = filteredStudents.filter(
      (s) => attendanceMap[s.id]?.status === targetStatus
    );

    const items: QueueItem[] = matching.map((s) => ({
      id: s.id,
      studentName: s.full_name,
      className: s.class,
      parentName: s.parent_name,
      phone: s.parent_phone,
      message:
        targetStatus === 'Present'
          ? t.whatsappPresentMsg(s, selectedDate, settings.tuitionName)
          : t.whatsappAbsentMsg(s, selectedDate, settings.tuitionName),
    }));

    setQueueTitle(
      targetStatus === 'Present' ? t.queueTitlePresent : t.queueTitleAbsent
    );
    setQueueItems(items);
    setQueueOpen(true);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'All' || s.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const presentFilteredCount = filteredStudents.filter(
    (s) => attendanceMap[s.id]?.status === 'Present'
  ).length;
  const absentFilteredCount = filteredStudents.filter(
    (s) => attendanceMap[s.id]?.status === 'Absent'
  ).length;

  const totalPresentCount = Object.values(attendanceMap).filter(
    (a) => a.status === 'Present'
  ).length;
  const totalAbsentCount = Object.values(attendanceMap).filter(
    (a) => a.status === 'Absent'
  ).length;

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
              className="bg-white text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <CheckSquare className="w-3.5 h-3.5" /> {t.tabAttendance}
            </Link>
            <Link
              href="/fees"
              className="text-indigo-100 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
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

          {/* Right Date Picker, Language & Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative flex items-center bg-indigo-700/90 border border-indigo-400/40 rounded-xl px-2 h-9 sm:h-10">
              <Calendar className="w-3.5 h-3.5 text-indigo-200 mr-1 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none w-[102px] sm:w-auto [color-scheme:dark]"
              />
            </div>

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
        {/* 3 Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mb-1 sm:mb-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">{t.presentLabel}</p>
              <p className="text-lg sm:text-xl font-extrabold text-emerald-600">
                {totalPresentCount}
              </p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl mb-1 sm:mb-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">{t.absentLabel}</p>
              <p className="text-lg sm:text-xl font-extrabold text-rose-600">
                {totalAbsentCount}
              </p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mb-1 sm:mb-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">{t.totalLabel}</p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-800">
                {students.length}
              </p>
            </div>
          </div>
        </div>

        {/* Bulk WhatsApp Queue Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => openBulkQueue('Present')}
            disabled={presentFilteredCount === 0}
            className="bg-emerald-600 active:scale-[0.99] hover:bg-emerald-700 disabled:opacity-40 text-white px-3 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t.notifyAllPresent} ({presentFilteredCount})
            </span>
          </button>

          <button
            onClick={() => openBulkQueue('Absent')}
            disabled={absentFilteredCount === 0}
            className="bg-rose-600 active:scale-[0.99] hover:bg-rose-700 disabled:opacity-40 text-white px-3 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t.notifyAllAbsent} ({absentFilteredCount})
            </span>
          </button>

          <button
            onClick={handleMarkAllPresent}
            disabled={bulkUpdating || filteredStudents.length === 0}
            className="col-span-2 sm:col-span-1 bg-indigo-600 active:scale-[0.99] hover:bg-indigo-700 disabled:opacity-50 text-white px-3 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <CheckCheck className="w-4 h-4 shrink-0" />
            <span>{bulkUpdating ? t.markingAll : t.markAllPresent}</span>
          </button>
        </div>

        {/* Search & Class Filter */}
        <div className="flex gap-2">
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

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 h-11 text-base sm:text-sm font-medium focus:outline-none focus:border-indigo-500 w-32 sm:w-40"
          >
            <option value="All">{t.allClasses}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={`Class ${num}`}>
                Class {num}
              </option>
            ))}
          </select>
        </div>

        {/* Attendance List */}
        {loading ? (
          <p className="text-center text-sm text-slate-500 py-10">{t.loading}</p>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <p className="text-sm text-slate-600 font-medium">{t.noStudents}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStudents.map((student) => {
              const status = attendanceMap[student.id]?.status;
              const isPresent = status === 'Present';
              const isAbsent = status === 'Absent';

              return (
                <div
                  key={student.id}
                  className={`bg-white p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between gap-3 ${
                    isAbsent
                      ? 'border-rose-300 bg-rose-50/30'
                      : isPresent
                      ? 'border-emerald-300 bg-emerald-50/20'
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
                        {student.batch_time}
                      </p>
                    </div>

                    {/* Individual WhatsApp button for BOTH Present and Absent */}
                    {status && (
                      <button
                        onClick={() => sendSingleWhatsApp(student, status)}
                        className={`px-3 h-9 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 text-white active:scale-95 transition ${
                          isPresent
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {isPresent ? t.whatsappPresentBtn : t.whatsappAbsentBtn}
                      </button>
                    )}
                  </div>

                  {/* Present / Absent Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => markAttendance(student.id, 'Present')}
                      className={`h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition active:scale-[0.98] ${
                        isPresent
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {t.presentBtn}
                    </button>

                    <button
                      onClick={() => markAttendance(student.id, 'Absent')}
                      className={`h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition active:scale-[0.98] ${
                        isAbsent
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      {t.absentBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
            className="flex flex-col items-center justify-center gap-1 text-indigo-600 font-bold text-[10px]"
          >
            <div className="bg-indigo-50 px-3 py-1 rounded-full">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span>{t.tabAttendance}</span>
          </Link>

          <Link
            href="/fees"
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-600 font-medium text-[10px] transition"
          >
            <div className="px-3 py-1">
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