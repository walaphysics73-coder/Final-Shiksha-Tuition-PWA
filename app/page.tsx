'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/useLanguage';
import { useAppSettings } from '@/lib/useAppSettings';
import { PinLockScreen, SettingsModal } from '@/components/PinLockAndSettings';
import {
  UserPlus,
  Users,
  IndianRupee,
  Phone,
  Search,
  Trash2,
  Edit3,
  CheckSquare,
  Wallet,
  MessageCircle,
  GraduationCap,
  Languages,
  MapPin,
  User,
  Calendar,
  BookOpen,
  X,
  Settings,
  ClipboardList,
} from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  parent_name: string;
  class: string;
  subjects: string;
  school_name: string;
  medium: string;
  parent_phone: string;
  address: string;
  monthly_fee: number;
  fee_due_day: number;
  joining_date: string;
  batch_time: string;
}

const translations = {
  en: {
    subtitle: 'Class 1 - 10 Manager',
    newAdmission: 'Add',
    closeForm: 'Close',
    tabStudents: 'Students',
    tabAttendance: 'Attendance',
    tabFees: 'Fees',
    tabTests: 'Tests',
    totalStudents: 'Total Students',
    monthlyTarget: 'Monthly Target',
    formTitleAdd: 'New Student Admission',
    formTitleEdit: 'Edit Student Details',
    fullName: 'Student Full Name *',
    fullNamePlaceholder: 'e.g. Aarav Sharma',
    parentName: "Father's / Parent's Name *",
    parentNamePlaceholder: 'e.g. Rajesh Sharma',
    classLabel: 'Class (1 - 10) *',
    subjectsLabel: 'Subjects *',
    parentPhone: 'Parent WhatsApp (10 Digits) *',
    parentPhonePlaceholder: '10-digit mobile number',
    digitsCount: 'digits',
    monthlyFee: 'Monthly Fee (₹) *',
    monthlyFeePlaceholder: 'e.g. 500',
    feeDueDay: 'Fee Due Date (Every Month)',
    joiningDate: 'Admission Date',
    schoolName: 'School Name',
    schoolNamePlaceholder: 'School name (Optional)',
    mediumLabel: 'Medium',
    batchTime: 'Batch Timing Slot',
    batchTimePlaceholder: 'e.g. Evening 4:00 - 6:00 PM',
    addressLabel: 'Complete Address *',
    addressPlaceholder: 'House/Street, Ward/Colony, Village/City...',
    cancel: 'Cancel',
    saveAdmission: 'Save Admission',
    updateAdmission: 'Update Details',
    saving: 'Saving...',
    searchPlaceholder: 'Search student, parent or mobile...',
    allClasses: 'All Classes',
    loading: 'Loading student records...',
    noStudentsTitle: 'No students registered yet.',
    noStudentsSub: 'Tap "+ Add" above to add your first student.',
    perMonth: '/mo',
    dueEvery: 'Due:',
    thOfMonth: 'th',
    parentPrefix: 'Parent:',
    editTitle: 'Edit',
    deleteTitle: 'Delete',
    alertRequired: 'Please fill Student Name, Parent Name, Address, and Monthly Fee!',
    alertPhone10: 'Mobile number must be exactly 10 digits!',
    alertSaveError: 'Error saving data: ',
    confirmDelete: (name: string) => `Are you sure you want to remove ${name}'s record?`,
    whatsappWelcome: (s: Student, tuitionName: string) =>
      `Hello *${s.parent_name || 'Parent'}*! Admission for *${s.full_name}* (${s.class} - ${s.subjects}) is confirmed at *${tuitionName}*.\n\n• Batch Time: ${s.batch_time}\n• Monthly Fee: ₹${s.monthly_fee} (Due by ${s.fee_due_day}th of every month)\n\nThank you!`,
  },
  hi: {
    subtitle: 'क्लास 1 - 10 मैनेजर',
    newAdmission: 'नया',
    closeForm: 'बंद',
    tabStudents: 'स्टूडेंट्स',
    tabAttendance: 'अटेंडेंस',
    tabFees: 'फीस',
    tabTests: 'टेस्ट',
    totalStudents: 'कुल स्टूडेंट्स',
    monthlyTarget: 'मासिक टारगेट',
    formTitleAdd: 'नया स्टूडेंट एडमिशन फॉर्म',
    formTitleEdit: 'स्टूडेंट की जानकारी सुधारें',
    fullName: 'स्टूडेंट का पूरा नाम *',
    fullNamePlaceholder: 'जैसे: आरव शर्मा',
    parentName: 'पिता / अभिभावक का नाम *',
    parentNamePlaceholder: 'जैसे: राजेश शर्मा',
    classLabel: 'क्लास (1 - 10) *',
    subjectsLabel: 'विषय (Subjects) *',
    parentPhone: 'पेरेंट व्हाट्सएप (10 अंक) *',
    parentPhonePlaceholder: '10 अंकों का मोबाइल नंबर',
    digitsCount: 'अंक',
    monthlyFee: 'मासिक फीस (₹ में) *',
    monthlyFeePlaceholder: 'जैसे: 500',
    feeDueDay: 'हर महीने फीस की तारीख',
    joiningDate: 'एडमिशन की तारीख',
    schoolName: 'स्कूल का नाम',
    schoolNamePlaceholder: 'स्कूल का नाम (वैकल्पिक)',
    mediumLabel: 'मीडियम (Medium)',
    batchTime: 'बैच टाइमिंग (Batch Slot)',
    batchTimePlaceholder: 'जैसे: Evening 4:00 - 6:00 PM',
    addressLabel: 'पूरा पता (Complete Address) *',
    addressPlaceholder: 'मकान नं./गली, मोहल्ला/कॉलोनी, गांव/शहर...',
    cancel: 'रद्द करें',
    saveAdmission: 'एडमिशन सेव करें',
    updateAdmission: 'अपडेट सेव करें',
    saving: 'सेव हो रहा है...',
    searchPlaceholder: 'स्टूडेंट, पिता या मोबाइल से खोजें...',
    allClasses: 'सभी क्लास',
    loading: 'डेटा लोड हो रहा है...',
    noStudentsTitle: 'अभी कोई स्टूडेंट रजिस्टर्ड नहीं है।',
    noStudentsSub: 'ऊपर "+ नया" दबाकर पहला स्टूडेंट जोड़ें।',
    perMonth: '/माह',
    dueEvery: 'तारीख:',
    thOfMonth: 'हर माह',
    parentPrefix: 'पिता:',
    editTitle: 'सुधारें',
    deleteTitle: 'हटाएं',
    alertRequired: 'कृपया स्टूडेंट का नाम, पिता का नाम, पता और फीस जरूर भरें!',
    alertPhone10: 'मोबाइल नंबर पूरे 10 अंकों का होना जरूरी है!',
    alertSaveError: 'डेटा सेव करने में दिक्कत आई: ',
    confirmDelete: (name: string) => `क्या आप वाकई ${name} का रिकॉर्ड हटाना चाहते हैं?`,
    whatsappWelcome: (s: Student, tuitionName: string) =>
      `नमस्ते *${s.parent_name || 'अभिभावक'}*! *${s.full_name}* (${s.class} - ${s.subjects}) का *${tuitionName}* में एडमिशन कन्फर्म हो गया है।\n\n• बैच टाइम: ${s.batch_time}\n• मासिक फीस: ₹${s.monthly_fee} (हर महीने की ${s.fee_due_day} तारीख तक)\n\nधन्यवाद!`,
  },
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function DashboardPage() {
  const { lang, toggleLanguage } = useLanguage();
  const { settings, saveSettings, isLoaded, isUnlocked, unlockApp, lockApp } =
    useAppSettings();
  const t = translations[lang];

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');

  const initialFormState = {
    full_name: '',
    parent_name: '',
    class: 'Class 8',
    subjects: 'All Subjects',
    school_name: '',
    medium: 'English',
    parent_phone: '',
    address: '',
    monthly_fee: '',
    fee_due_day: '5',
    joining_date: getTodayDate(),
    batch_time: 'Evening 4:00 - 6:00 PM',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setStudents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchStudents();
    }
  }, [isUnlocked]);

  if (!isLoaded) return null;

  if (!isUnlocked) {
    return (
      <PinLockScreen
        settings={settings}
        onSaveSettings={saveSettings}
        onUnlock={unlockApp}
        lang={lang}
      />
    );
  }

  const handlePhoneChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, parent_phone: onlyDigits });
  };

  const openNewForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowForm(!showForm);
  };

  const handleEditClick = (student: Student) => {
    setEditingId(student.id);
    setFormData({
      full_name: student.full_name || '',
      parent_name: student.parent_name || '',
      class: student.class || 'Class 8',
      subjects: student.subjects || 'All Subjects',
      school_name: student.school_name || '',
      medium: student.medium || 'English',
      parent_phone: (student.parent_phone || '').replace(/\D/g, '').slice(0, 10),
      address: student.address || '',
      monthly_fee: String(student.monthly_fee || ''),
      fee_due_day: String(student.fee_due_day || '5'),
      joining_date: student.joining_date || getTodayDate(),
      batch_time: student.batch_time || 'Evening 4:00 - 6:00 PM',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.full_name.trim() ||
      !formData.parent_name.trim() ||
      !formData.address.trim() ||
      !formData.monthly_fee
    ) {
      alert(t.alertRequired);
      return;
    }

    if (formData.parent_phone.length !== 10) {
      alert(t.alertPhone10);
      return;
    }

    setSaving(true);

    const payload = {
      full_name: formData.full_name.trim(),
      parent_name: formData.parent_name.trim(),
      class: formData.class,
      subjects: formData.subjects,
      school_name: formData.school_name.trim(),
      medium: formData.medium,
      parent_phone: formData.parent_phone,
      address: formData.address.trim(),
      monthly_fee: Number(formData.monthly_fee),
      fee_due_day: Number(formData.fee_due_day) || 5,
      joining_date: formData.joining_date || getTodayDate(),
      batch_time: formData.batch_time.trim(),
    };

    const { error } = editingId
      ? await supabase.from('students').update(payload).eq('id', editingId)
      : await supabase.from('students').insert([payload]);

    setSaving(false);

    if (error) {
      alert(t.alertSaveError + error.message);
    } else {
      setFormData(initialFormState);
      setEditingId(null);
      setShowForm(false);
      fetchStudents();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t.confirmDelete(name))) return;

    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) {
      fetchStudents();
    }
  };

  const sendWhatsAppWelcome = (student: Student) => {
    let phone = student.parent_phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const message = t.whatsappWelcome(student, settings.tuitionName);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.full_name.toLowerCase().includes(q) ||
      (s.parent_name || '').toLowerCase().includes(q) ||
      s.parent_phone.includes(searchQuery);
    const matchesClass = classFilter === 'All' || s.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const totalMonthlyExpected = students.reduce(
    (sum, s) => sum + Number(s.monthly_fee || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28 md:pb-12">
      {/* Compact Sticky Top Header */}
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
          {/* Dynamic Tuition Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-white/15 p-2 rounded-xl shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="truncate">
              <h1 className="text-sm sm:text-lg font-bold leading-tight truncate">
                {settings.tuitionName}
              </h1>
              <p className="text-[11px] text-indigo-200 truncate">
                {settings.teacherName ? `${settings.teacherName} • ` : ''}
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Inline Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-indigo-700/60 p-1 rounded-xl">
            <Link
              href="/"
              className="bg-white text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
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
              className="text-indigo-100 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <ClipboardList className="w-3.5 h-3.5" /> {t.tabTests}
            </Link>
          </nav>

          {/* Right Action Buttons */}
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
              title="Settings & Lock"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={openNewForm}
              className="bg-white active:scale-95 text-indigo-600 px-3 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 shadow-sm hover:bg-indigo-50 transition"
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4" />
                  <span>{t.closeForm}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{t.newAdmission}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                {t.totalStudents}
              </p>
              <p className="text-lg sm:text-2xl font-extrabold text-slate-800 leading-tight">
                {students.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                {t.monthlyTarget}
              </p>
              <p className="text-lg sm:text-2xl font-extrabold text-slate-800 leading-tight truncate">
                ₹{totalMonthlyExpected}
              </p>
            </div>
          </div>
        </div>

        {/* Digital Admission / Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSaveStudent}
            className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-indigo-200 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-indigo-700">
                {editingId ? t.formTitleEdit : t.formTitleAdd}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.fullNamePlaceholder}
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.parentName}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.parentNamePlaceholder}
                  value={formData.parent_name}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    {t.parentPhone}
                  </label>
                  <span
                    className={`text-[11px] font-bold ${
                      formData.parent_phone.length === 10
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {formData.parent_phone.length}/10 {t.digitsCount}
                  </span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  placeholder={t.parentPhonePlaceholder}
                  value={formData.parent_phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm tracking-wider font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.classLabel}
                </label>
                <select
                  value={formData.class}
                  onChange={(e) =>
                    setFormData({ ...formData, class: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={`Class ${num}`}>
                      Class {num}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.subjectsLabel}
                </label>
                <select
                  value={formData.subjects}
                  onChange={(e) =>
                    setFormData({ ...formData, subjects: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="All Subjects">All Subjects</option>
                  <option value="Maths & Science">Maths & Science</option>
                  <option value="Mathematics Only">Mathematics Only</option>
                  <option value="Science Only">Science Only</option>
                  <option value="English & Grammar">English & Grammar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.monthlyFee}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  required
                  placeholder={t.monthlyFeePlaceholder}
                  value={formData.monthly_fee}
                  onChange={(e) =>
                    setFormData({ ...formData, monthly_fee: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.feeDueDay}
                </label>
                <select
                  value={formData.fee_due_day}
                  onChange={(e) =>
                    setFormData({ ...formData, fee_due_day: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                >
                  {[1, 5, 10, 15, 20, 25].map((day) => (
                    <option key={day} value={day}>
                      {day} {t.thOfMonth}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.joiningDate}
                </label>
                <input
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) =>
                    setFormData({ ...formData, joining_date: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.mediumLabel}
                </label>
                <select
                  value={formData.medium}
                  onChange={(e) =>
                    setFormData({ ...formData, medium: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="English">English Medium</option>
                  <option value="Hindi">Hindi Medium</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.schoolName}
                </label>
                <input
                  type="text"
                  placeholder={t.schoolNamePlaceholder}
                  value={formData.school_name}
                  onChange={(e) =>
                    setFormData({ ...formData, school_name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.batchTime}
                </label>
                <input
                  type="text"
                  placeholder={t.batchTimePlaceholder}
                  value={formData.batch_time}
                  onChange={(e) =>
                    setFormData({ ...formData, batch_time: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.addressLabel}
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={t.addressPlaceholder}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl p-3.5 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="w-full sm:w-auto px-5 h-11 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-indigo-600 active:scale-[0.99] text-white px-6 h-11 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition"
              >
                {saving
                  ? t.saving
                  : editingId
                  ? t.updateAdmission
                  : t.saveAdmission}
              </button>
            </div>
          </form>
        )}

        {/* Search & Class Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 h-11 text-base sm:text-sm font-medium focus:outline-none focus:border-indigo-500 sm:w-44"
          >
            <option value="All">{t.allClasses}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={`Class ${num}`}>
                Class {num}
              </option>
            ))}
          </select>
        </div>

        {/* Students Grid */}
        {loading ? (
          <p className="text-center text-sm text-slate-500 py-10">{t.loading}</p>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-slate-700 font-semibold">{t.noStudentsTitle}</p>
            <p className="text-xs text-slate-400">{t.noStudentsSub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between gap-3.5"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {student.full_name}
                      </h3>
                      {student.parent_name && (
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {t.parentPrefix} {student.parent_name}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block bg-emerald-50 text-emerald-700 font-extrabold text-sm px-2.5 py-1 rounded-lg">
                        ₹{student.monthly_fee}
                        <span className="text-[11px] font-medium">{t.perMonth}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                      {student.class}
                    </span>
                    <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {student.subjects || 'All Subjects'}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md">
                      {student.medium}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <p>
                      {student.school_name ? `${student.school_name} • ` : ''}
                      {student.batch_time} ({t.dueEvery} {student.fee_due_day || 5}
                      {t.thOfMonth})
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />{' '}
                        {student.parent_phone}
                      </span>
                      {student.joining_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {student.joining_date}
                        </span>
                      )}
                    </div>

                    {student.address && (
                      <p className="flex items-start gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{student.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => sendWhatsAppWelcome(student)}
                    className="flex-1 bg-emerald-500 active:scale-[0.98] hover:bg-emerald-600 text-white h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleEditClick(student)}
                    className="px-3.5 h-10 bg-indigo-50 active:scale-95 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{t.editTitle}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(student.id, student.full_name)}
                    className="w-10 h-10 bg-rose-50 active:scale-95 text-rose-500 hover:bg-rose-100 rounded-xl flex items-center justify-center transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Settings & PIN Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={saveSettings}
        onLockNow={lockApp}
        lang={lang}
      />

      {/* Mobile Bottom Navigation Bar (4 Tabs) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 text-indigo-600 font-bold text-[10px]"
          >
            <div className="bg-indigo-50 px-3 py-1 rounded-full">
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