'use client';

import React, { useState } from 'react';
import { useAppSettings, DEFAULT_PIN } from '@/lib/useAppSettings';
import { useLanguage } from '@/lib/useLanguage';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Languages,
} from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { settings, isLoaded, isUnlocked, unlockApp } = useAppSettings();
  const { lang, toggleLanguage } = useLanguage();

  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If authenticated, render the requested page (/, /attendance, /fees, /tests)
  if (isUnlocked) {
    return <>{children}</>;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.pin) {
      setError('');
      setPinInput('');
      unlockApp();
    } else {
      setError(
        lang === 'hi'
          ? 'गलत पासवर्ड (PIN)! कृपया सही 4-अंकों का PIN डालें।'
          : 'Incorrect PIN! Please enter the valid 4-digit PIN.'
      );
      setPinInput('');
    }
  };

  const handlePinChange = (val: string) => {
    setError('');
    const digits = val.replace(/\D/g, '').slice(0, 4);
    setPinInput(digits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 relative">
      {/* Top Language Toggle */}
      <div className="w-full max-w-[380px] flex justify-end mb-3">
        <button
          type="button"
          onClick={toggleLanguage}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/15 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition"
        >
          <Languages className="w-3.5 h-3.5" />
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Centered Sleek Login Card */}
      <div
        style={{ maxWidth: '380px', width: '100%' }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Top Accent Header */}
        <div className="bg-indigo-600 px-6 py-6 text-center text-white">
          <div className="w-14 h-14 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {settings.tuitionName || 'Shiksha Tuition'}
          </h1>
          <p className="text-xs text-indigo-200 mt-1">
            {lang === 'hi'
              ? 'टीचर एडमिन पैनल • सुरक्षित लॉगिन'
              : 'Teacher Admin Portal • Secure Access'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                {lang === 'hi' ? '4-अंकों का पासवर्ड (PIN)' : '4-Digit Security PIN'}
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                {pinInput.length}/4
              </span>
            </div>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                autoFocus
                required
                placeholder="••••"
                value={pinInput}
                onChange={(e) => handlePinChange(e.target.value)}
                className="w-full h-12 px-4 pr-11 rounded-xl border-2 border-slate-200 text-center text-xl font-extrabold tracking-[0.5em] text-slate-900 focus:outline-none focus:border-indigo-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600 mt-2 text-center">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pinInput.length !== 4}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition active:scale-[0.99]"
          >
            <span>{lang === 'hi' ? 'डैशबोर्ड खोलें' : 'Unlock Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Default PIN Hint Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              {lang === 'hi' ? 'डिफ़ॉल्ट पासवर्ड:' : 'Default PIN:'}
            </span>
            <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
              {DEFAULT_PIN}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}