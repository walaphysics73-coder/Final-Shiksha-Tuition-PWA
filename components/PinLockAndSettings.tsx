'use client';

import React, { useState } from 'react';
import { Lock, Settings, X, ShieldCheck, KeyRound, Check } from 'lucide-react';
import { TuitionSettings } from '@/lib/useAppSettings';
import { Lang } from '@/lib/useLanguage';

interface PinScreenProps {
  settings: TuitionSettings;
  onSaveSettings: (s: TuitionSettings) => void;
  onUnlock: () => void;
  lang: Lang;
}

export function PinLockScreen({
  settings,
  onSaveSettings,
  onUnlock,
  lang,
}: PinScreenProps) {
  const isFirstTime = !settings.pin;
  const [pinInput, setPinInput] = useState('');
  const [tuitionNameInput, setTuitionNameInput] = useState(
    settings.tuitionName || 'Shiksha Tuition'
  );
  const [error, setError] = useState('');

  const handleDigit = (digit: string) => {
    setError('');
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);

      // Auto-unlock on 4th digit if PIN already exists
      if (!isFirstTime && next.length === 4) {
        if (next === settings.pin) {
          onUnlock();
        } else {
          setTimeout(() => {
            setError(lang === 'hi' ? 'गलत PIN! दोबारा कोशिश करें' : 'Incorrect PIN! Try again');
            setPinInput('');
          }, 150);
        }
      }
    }
  };

  const handleBackspace = () => {
    setError('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) {
      setError(lang === 'hi' ? 'पूरे 4 अंकों का PIN चुनें' : 'Please enter a 4-digit PIN');
      return;
    }
    onSaveSettings({
      ...settings,
      tuitionName: tuitionNameInput.trim() || 'Shiksha Tuition',
      pin: pinInput,
    });
    onUnlock();
  };

  return (
    <div className="min-h-screen bg-indigo-600 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-white text-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            {isFirstTime ? <ShieldCheck className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h1 className="text-lg font-extrabold text-slate-900">
            {isFirstTime
              ? lang === 'hi'
                ? 'सुरक्षा PIN सेट करें'
                : 'Set Security PIN'
              : settings.tuitionName || 'Shiksha Tuition'}
          </h1>
          <p className="text-xs text-slate-500">
            {isFirstTime
              ? lang === 'hi'
                ? 'अपनी कोचिंग का नाम और 4-अंकों का गोपनीय PIN बनाएं'
                : 'Set your Tuition Name & 4-digit secret PIN'
              : lang === 'hi'
              ? 'ऐप खोलने के लिए 4-अंकों का PIN डालें'
              : 'Enter 4-digit PIN to unlock'}
          </p>
        </div>

        {isFirstTime && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'hi' ? 'कोचिंग / ट्यूशन का नाम' : 'Tuition / Coaching Name'}
            </label>
            <input
              type="text"
              value={tuitionNameInput}
              onChange={(e) => setTuitionNameInput(e.target.value)}
              placeholder="e.g. Shiksha Tuition Classes"
              className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* 4 PIN Dots */}
        <div className="flex justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all ${
                pinInput.length > idx
                  ? 'bg-indigo-600 scale-110'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs font-bold text-rose-600">{error}</p>
        )}

        {/* Touch Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-13 rounded-2xl bg-slate-100 active:bg-indigo-100 hover:bg-slate-200 text-lg font-extrabold text-slate-800 transition"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-slate-100 active:bg-indigo-100 hover:bg-slate-200 text-lg font-extrabold text-slate-800 transition"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-rose-50 active:bg-rose-100 text-rose-600 text-sm font-bold transition"
          >
            ⌫
          </button>
        </div>

        {isFirstTime && (
          <button
            type="button"
            onClick={handleSetupSubmit}
            className="w-full h-11 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-sm transition"
          >
            {lang === 'hi' ? 'PIN सेव करें और आगे बढ़ें' : 'Save PIN & Continue'}
          </button>
        )}
      </div>
    </div>
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TuitionSettings;
  onSaveSettings: (s: TuitionSettings) => void;
  onLockNow: () => void;
  lang: Lang;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onLockNow,
  lang,
}: SettingsModalProps) {
  const [tuitionName, setTuitionName] = useState(settings.tuitionName);
  const [teacherName, setTeacherName] = useState(settings.teacherName);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [pin, setPin] = useState(settings.pin);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      alert(lang === 'hi' ? 'PIN पूरे 4 अंकों का होना चाहिए!' : 'PIN must be 4 digits!');
      return;
    }
    onSaveSettings({
      tuitionName: tuitionName.trim() || 'Shiksha Tuition',
      teacherName: teacherName.trim(),
      upiId: upiId.trim(),
      pin,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form
        onSubmit={handleSave}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'hi' ? 'ट्यूशन सेटिंग्स & सुरक्षा' : 'Tuition Settings & Security'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'hi' ? 'कोचिंग / ट्यूशन का नाम *' : 'Tuition / Coaching Name *'}
            </label>
            <input
              type="text"
              required
              value={tuitionName}
              onChange={(e) => setTuitionName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'hi' ? 'टीचर का नाम (वैकल्पिक)' : 'Teacher Name (Optional)'}
            </label>
            <input
              type="text"
              placeholder="e.g. Siddharth Sir"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'hi'
                ? 'UPI ID (फीस रिमाइंडर में भेजने के लिए)'
                : 'UPI ID (Included in Fee Reminders)'}
            </label>
            <input
              type="text"
              placeholder="e.g. 8619098999@ybl"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 h-11 text-base sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'hi' ? '4-अंकों का सुरक्षा PIN *' : '4-Digit Security PIN *'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={4}
                required
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                className="w-full border border-slate-300 rounded-xl pl-10 pr-3.5 h-11 text-base sm:text-sm tracking-[0.4em] font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLockNow();
            }}
            className="h-11 px-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-100 transition"
          >
            <Lock className="w-4 h-4" />
            {lang === 'hi' ? 'अभी लॉक करें' : 'Lock App Now'}
          </button>

          <button
            type="submit"
            className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-700 shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            {lang === 'hi' ? 'सेटिंग्स सेव करें' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}