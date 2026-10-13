"use client";

import {useEffect, useState} from 'react';
import {useAuth} from '@/hooks';
import {applyTheme, getSettingsKey, getStoredTheme, notifySettingsUpdated, SETTINGS_UPDATED_EVENT, type ThemeSetting} from '@/utils/theme';

export default function ThemeSelect() {
 const {user, isLoading} = useAuth();
 const [theme, setTheme] = useState<ThemeSetting>('light');
 useEffect(() => {
  if (isLoading) return;
  const sync = () => {
   const theme = getStoredTheme(user?.id);
   applyTheme(theme);
   setTheme(theme);
  };
  sync();
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', sync);
  window.addEventListener('storage', sync);
  window.addEventListener(SETTINGS_UPDATED_EVENT, sync);
  return () => {
   media.removeEventListener('change', sync);
   window.removeEventListener('storage', sync);
   window.removeEventListener(SETTINGS_UPDATED_EVENT, sync);
  };
 }, [user?.id, isLoading]);

 const nextTheme: ThemeSetting = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
 const names = {light: 'claro', dark: 'oscuro', auto: 'del sistema'};
 const label = `Tema ${names[theme]}. Cambiar a tema ${names[nextTheme]}`;
 return <button type="button" className="home-theme" aria-label={label} title={label} disabled={isLoading} onClick={() => {
  setTheme(nextTheme);
  applyTheme(nextTheme);
  try {
   const key = getSettingsKey(user?.id);
   const settings = JSON.parse(window.localStorage.getItem(key) || '{}');
   window.localStorage.setItem(key, JSON.stringify({...settings, theme: nextTheme}));
   notifySettingsUpdated();
  } catch { /* Appearance remains available when browser storage is blocked. */ }
 }}>
  <svg key={theme} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
   {theme === 'light' ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></> : theme === 'dark' ? <path d="M20.5 13.1A8.5 8.5 0 0 1 10.9 3.5a8.5 8.5 0 1 0 9.6 9.6Z"/> : <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>}
  </svg>
 </button>;
}
