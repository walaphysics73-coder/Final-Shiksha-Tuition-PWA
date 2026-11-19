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
  Settings,
  ClipboardList,
  Send,
  Save,
  MessageCircle,
  Megaphone,
  Award,
  Calendar,
} from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  parent_name: string;
  class: string;
  parent_phone: string;
}

interface TestMarkRecord {
  id: string;
  test_date: string;
  test_title: string;
  max_marks: number;
  student_id: string;
  marks_obtained: number;
}

const translations = {
  en: {
    subtitle: 'Tests & Notices',
    tabStudents: 'Students',
    tabAttendance: 'Attendance',
    tabFees: 'Fees',
    tabTests: 'Tests',
    modeTests: 'Weekly Test Marks',
    modeNotice: 'Homework / Holiday',
    testTitleLabel: 'Test Name / Subject *',
    testTitlePlaceholder: 'e.g. Maths Weekly Test',
    maxMarksLabel: 'Max Marks *',
    classFilterLabel: 'Select Class',
    allClasses: 'All Classes',
    saveMarksBtn: 'Save All Marks',
    saving: 'Saving...',
    savedAlert: 'Test marks saved successfully!',
    sendAllScorecards: 'Send All Scorecards',
    queueScorecardTitle: 'Send Test Scorecards',
    marksPlaceholder: 'Marks',
    sendSingleBtn: 'Scorecard',
    loading: 'Loading students...',
    noStudents: 'No students found for this class.',
    parentPrefix: 'Parent:',
    noticeHeading: 'Broadcast Homework or Holiday Notice',
    noticeTargetLabel: 'Send To Class',
    noticeTextLabel: 'Message / Homework Details *',
    noticePlaceholder:
      'e.g. Today Homework: Solve Ex 4.2 Q1 to Q5.\nOR: Tomorrow tuition class will remain closed.',
    quickHolidayBtn: '+ Holiday Template',
    quickHomeworkBtn: '+ Homework Template',
    sendNoticeQueueBtn: 'Send Notice to Parents',
    queueNoticeTitle: 'Broadcast Notice to Parents',
    scorecardMsg: (
      s: Student,
      title: string,
      obtained: number,
      max: number,
      date: string,
      tuitionName: string
    ) => {
      const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
      const remark =
        pct >= 80
          ? 'Excellent! 🌟'
          : pct >= 50
          ? 'Good, keep improving 👍'
          : 'Needs extra practice 📚';
      return `📊 *TEST REPORT - ${tuitionName}*\n\n• Student: *${s.full_name}* (${s.class})\n• Test: *${title}*\n• Marks Scored: *${obtained} / ${max}* (${pct}%)\n• Date: ${date}\n• Remark: ${remark}`;
    },
    noticeMsg: (s: Student, body: string, tuitionName: string) =>
      `📢 *NOTICE - ${tuitionName}*\n\nHello *${s.parent_name || 'Parent'}* (Student: ${s.full_name} - ${s.class}),\n\n${body.trim()}`,
  },
  hi: {
    subtitle: 'टेस्ट मार्क्स & नोटिस',
    tabStudents: 'स्टूडेंट्स',
    tabAttendance: 'अटेंडेंस',
    tabFees: 'फीस',
    tabTests: 'टेस्ट',
    modeTests: 'वीकली टेस्ट मार्क्स',
    modeNotice: 'होमवर्क / छुट्टी नोटिस',
    testTitleLabel: 'टेस्ट का नाम / विषय *',
    testTitlePlaceholder: 'जैसे: Maths Weekly Test',
    maxMarksLabel: 'कुल अंक (Max Marks) *',
    classFilterLabel: 'क्लास चुनें',
    allClasses: 'सभी क्लास',
    saveMarksBtn: 'सभी नंबर सेव करें',
    saving: 'सेव हो रहा है...',
    savedAlert: 'टेस्ट के नंबर सफलतापूर्वक सेव हो गए!',
    sendAllScorecards: 'सभी को स्कोरकार्ड भेजें',
    queueScorecardTitle: 'टेस्ट स्कोरकार्ड भेजें',
    marksPlaceholder: 'अंक',
    sendSingleBtn: 'रिपोर्ट भेजें',
    loading: 'डेटा लोड हो रहा है...',
    noStudents: 'इस क्लास में कोई स्टूडेंट नहीं मिला।',
    parentPrefix: 'पिता:',
    noticeHeading: 'होमवर्क या छुट्टी का नोटिस भेजें',
    noticeTargetLabel: 'किस क्लास को भेजना है',
    noticeTextLabel: 'नोटिस या होमवर्क लिखें *',
    noticePlaceholder:
      'जैसे: आज का होमवर्क: प्रश्नावली 4.2 के सवाल 1 से 5 हल करें।\nया: कल ट्यूशन क्लास की छुट्टी रहेगी।',
    quickHolidayBtn: '+ छुट्टी टेम्पलेट',
    quickHomeworkBtn: '+ होमवर्क टेम्पलेट',
    sendNoticeQueueBtn: 'पेरेंट्स को नोटिस भेजें',
    queueNoticeTitle: 'सभी पेरेंट्स को नोटिस भेजें',
    scorecardMsg: (
      s: Student,
      title: string,
      obtained: number,
      max: number,
      date: string,
      tuitionName: string
    ) => {
      const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
      const remark =
        pct >= 80
          ? 'बहुत बढ़िया प्रदर्शन! 🌟'
          : pct >= 50
          ? 'अच्छा प्रयास, और मेहनत करें 👍'
          : 'अधिक अभ्यास की आवश्यकता है 📚';
      return `📊 *टेस्ट रिपोर्ट कार्ड - ${tuitionName}*\n\n• स्टूडेंट: *${s.full_name}* (${s.class})\n• टेस्ट: *${title}*\n• प्राप्तांक: *${obtained} / ${max}* (${pct}%)\n• तारीख: ${date}\n• टिप्पणी: ${remark}`;
    },
    noticeMsg: (s: Student, body: string, tuitionName: string) =>
      `📢 *सूचना - ${tuitionName}*\n\nनमस्ते *${s.parent_name || 'अभिभावक'}* (स्टूडेंट: ${s.full_name} - ${s.class}),\n\n${body.trim()}`,
  },
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function TestsAndNoticesPage() {
  const { lang, toggleLanguage } = useLanguage();
  const { settings, saveSettings, lockApp } = useAppSettings();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'tests' | 'notice'>('tests');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Weekly Test State
  const [testDate, setTestDate] = useState(getTodayDate());
  const [testTitle, setTestTitle] = useState('Weekly Test');
  const [maxMarks, setMaxMarks] = useState('20');
  const [classFilter, setClassFilter] = useState('All');
  const [marksInputMap, setMarksInputMap] = useState<Record<string, string>>({});
  const [existingRecordsMap, setExistingRecordsMap] = useState<
    Record<string, TestMarkRecord>
  >({});
  const [savingMarks, setSavingMarks] = useState(false);

  // Notice Broadcast State
  const [noticeClass, setNoticeClass] = useState('All');
  const [noticeText, setNoticeText] = useState('');

  // Queue Modal State
  const [queueOpen, setQueueOpen] = useState(false);
  const [queueTitle, setQueueTitle] = useState('');
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  const fetchStudentsAndMarks = useCallback(async () => {
    setLoading(true);

    const [studentsRes, marksRes] = await Promise.all([
      supabase
        .from('students')
        .select('id, full_name, parent_name, class, parent_phone')
        .order('full_name', { ascending: true }),
      supabase
        .from('test_marks')
        .select('*')
        .eq('test_date', testDate)
        .eq('test_title', testTitle.trim()),
    ]);

    if (!studentsRes.error && studentsRes.data) {
      setStudents(studentsRes.data);
    }

    if (!marksRes.error && marksRes.data) {
      const recMap: Record<string, TestMarkRecord> = {};
      const inputMap: Record<string, string> = {};
      marksRes.data.forEach((r) => {
        recMap[r.student_id] = r as TestMarkRecord;
        inputMap[r.student_id] = String(r.marks_obtained);
      });
      setExistingRecordsMap(recMap);
      setMarksInputMap(inputMap);
    } else {
      setExistingRecordsMap({});
      setMarksInputMap({});
    }

    setLoading(false);
  }, [testDate, testTitle]);

  useEffect(() => {
    fetchStudentsAndMarks();
  }, [fetchStudentsAndMarks]);

  const filteredStudents = students.filter(
    (s) => classFilter === 'All' || s.class === classFilter
  );

  const handleSaveAllMarks = async () => {
    if (!testTitle.trim() || !maxMarks) return;
    setSavingMarks(true);

    const numericMax = Number(maxMarks) || 20;

    for (const student of filteredStudents) {
      const rawVal = marksInputMap[student.id];
      if (rawVal === undefined || rawVal === '') continue;

      const numericScore = Number(rawVal);
      const existing = existingRecordsMap[student.id];

      if (existing) {
        await supabase
          .from('test_marks')
          .update({
            marks_obtained: numericScore,
            max_marks: numericMax,
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('test_marks').insert([
          {
            test_date: testDate,
            test_title: testTitle.trim(),
            max_marks: numericMax,
            student_id: student.id,
            marks_obtained: numericScore,
          },
        ]);
      }
    }

    setSavingMarks(false);
    alert(t.savedAlert);
    fetchStudentsAndMarks();
  };

  const sendSingleScorecard = (student: Student) => {
    const score = Number(marksInputMap[student.id] || 0);
    const max = Number(maxMarks) || 20;
    let phone = (student.parent_phone || '').replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const msg = t.scorecardMsg(
      student,
      testTitle.trim() || 'Weekly Test',
      score,
      max,
      testDate,
      settings.tuitionName
    );
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const openScorecardQueue = () => {
    const max = Number(maxMarks) || 20;
    const scoredStudents = filteredStudents.filter(
      (s) => marksInputMap[s.id] !== undefined && marksInputMap[s.id] !== ''
    );

    const items: QueueItem[] = scoredStudents.map((s) => ({
      id: s.id,
      studentName: s.full_name,
      className: s.class,
      parentName: s.parent_name,
      phone: s.parent_phone,
      message: t.scorecardMsg(
        s,
        testTitle.trim() || 'Weekly Test',
        Number(marksInputMap[s.id]),
        max,
        testDate,
        settings.tuitionName
      ),
    }));

    setQueueTitle(t.queueScorecardTitle);
    setQueueItems(items);
    setQueueOpen(true);
  };

  const openNoticeQueue = () => {
    if (!noticeText.trim()) return;

    const targetStudents = students.filter(
      (s) => noticeClass === 'All' || s.class === noticeClass
    );

    const items: QueueItem[] = targetStudents.map((s) => ({
      id: s.id,
      studentName: s.full_name,
      className: s.class,
      parentName: s.parent_name,
      phone: s.parent_phone,
      message: t.noticeMsg(s, noticeText, settings.tuitionName),
    }));

    setQueueTitle(t.queueNoticeTitle);
    setQueueItems(items);
    setQueueOpen(true);
  };

  const scoredCount = filteredStudents.filter(
    (s) => marksInputMap[s.id] !== undefined && marksInputMap[s.id] !== ''
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
              className="text-indigo-100 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
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
              className="bg-white text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <ClipboardList className="w-3.5 h-3.5" /> {t.tabTests}
            </Link>
          </nav>

          {/* Right Language & Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
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
        {/* Mode Switcher: Weekly Tests vs Homework/Holiday Notice */}
        <div className="grid grid-cols-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('tests')}
            className={`h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'tests'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{t.modeTests}</span>
          </button>

          <button
            onClick={() => setActiveTab('notice')}
            className={`h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'notice'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{t.modeNotice}</span>
          </button>
        </div>

        {/* ================= TAB 1: WEEKLY TEST MARKS ================= */}
        {activeTab === 'tests' ? (
          <div className="space-y-4">
            {/* Test Configuration Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t.testTitleLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.testTitlePlaceholder}
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t.maxMarksLabel}
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t.classFilterLabel}
                  </label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 h-11 text-base sm:text-sm font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">{t.allClasses}</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={`Class ${num}`}>
                        Class {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSaveAllMarks}
                    disabled={savingMarks || filteredStudents.length === 0}
                    className="flex-1 sm:flex-initial bg-indigo-600 active:scale-[0.98] hover:bg-indigo-700 disabled:opacity-50 text-white px-4 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingMarks ? t.saving : t.saveMarksBtn}</span>
                  </button>

                  <button
                    onClick={openScorecardQueue}
                    disabled={scoredCount === 0}
                    className="flex-1 sm:flex-initial bg-emerald-600 active:scale-[0.98] hover:bg-emerald-700 disabled:opacity-40 text-white px-4 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {t.sendAllScorecards} ({scoredCount})
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Students Marks Entry List */}
            {loading ? (
              <p className="text-center text-sm text-slate-500 py-10">{t.loading}</p>
            ) : filteredStudents.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600 font-medium">{t.noStudents}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredStudents.map((student) => {
                  const val = marksInputMap[student.id] ?? '';
                  const hasScore = val !== '';

                  return (
                    <div
                      key={student.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                            {student.full_name}
                          </h3>
                          <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0">
                            {student.class}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {student.parent_name
                            ? `${t.parentPrefix} ${student.parent_name}`
                            : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50 h-11">
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={Number(maxMarks) || 100}
                            placeholder={t.marksPlaceholder}
                            value={val}
                            onChange={(e) =>
                              setMarksInputMap({
                                ...marksInputMap,
                                [student.id]: e.target.value,
                              })
                            }
                            className="w-16 bg-white h-full text-center text-base sm:text-sm font-extrabold text-slate-900 focus:outline-none"
                          />
                          <span className="px-2 text-xs font-bold text-slate-500">
                            /{maxMarks || 20}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={!hasScore}
                          onClick={() => sendSingleScorecard(student)}
                          className="bg-emerald-500 active:scale-95 hover:bg-emerald-600 disabled:opacity-35 text-white px-3 h-11 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t.sendSingleBtn}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ================= TAB 2: HOMEWORK & HOLIDAY NOTICE ================= */
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              {t.noticeHeading}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.noticeTargetLabel}
                </label>
                <select
                  value={noticeClass}
                  onChange={(e) => setNoticeClass(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">{t.allClasses}</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={`Class ${num}`}>
                      Class {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNoticeText(
                      lang === 'hi'
                        ? 'सूचित किया जाता है कि कल ट्यूशन क्लास की छुट्टी रहेगी। अगली क्लास अपने निर्धारित समय पर लगेगी।'
                        : 'Please note that tomorrow Tuition Class will remain closed. Regular classes will resume as per schedule.'
                    )
                  }
                  className="flex-1 h-11 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition"
                >
                  {t.quickHolidayBtn}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNoticeText(
                      lang === 'hi'
                        ? 'आज का होमवर्क:\n1. कक्षा में पढ़ाए गए अध्याय का रिवीजन करें।\n2. अभ्यास प्रश्न अपनी कॉपी में हल करके लाएं।'
                        : 'Today Homework:\n1. Revise the chapter taught in class today.\n2. Complete practice questions in your notebook.'
                    )
                  }
                  className="flex-1 h-11 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
                >
                  {t.quickHomeworkBtn}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {t.noticeTextLabel}
              </label>
              <textarea
                rows={4}
                placeholder={t.noticePlaceholder}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3.5 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              disabled={!noticeText.trim() || students.length === 0}
              onClick={openNoticeQueue}
              className="w-full h-12 bg-emerald-600 active:scale-[0.99] hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>{t.sendNoticeQueueBtn}</span>
            </button>
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
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-600 font-medium text-[10px] transition"
          >
            <div className="px-3 py-1">
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
            className="flex flex-col items-center justify-center gap-1 text-indigo-600 font-bold text-[10px]"
          >
            <div className="bg-indigo-50 px-3 py-1 rounded-full">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span>{t.tabTests}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}