'use client';

import { useState, useEffect } from 'react';

export type Lang = 'en' | 'hi';

export function useLanguage() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('tuition_lang') as Lang | null;
    if (saved === 'en' || saved === 'hi') {
      setLang(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang: Lang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    localStorage.setItem('tuition_lang', nextLang);
  };

  return { lang, toggleLanguage };
}