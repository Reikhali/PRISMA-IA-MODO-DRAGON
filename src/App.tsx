/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UnlockGate } from './components/UnlockGate';
import { WarTable } from './components/WarTable';

const STORAGE_UNLOCKED_KEY = 'dragon-throne-unlocked';
const STORAGE_LANG_KEY = 'dragon-throne-lang';

export default function App() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_UNLOCKED_KEY) === '1';
  });

  const [lang, setLang] = useState<'pt' | 'en'>(() => {
    if (typeof window === 'undefined') return 'pt';
    const saved = window.localStorage.getItem(STORAGE_LANG_KEY);
    return saved === 'en' ? 'en' : 'pt';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_LANG_KEY, lang);
  }, [lang]);

  const handleUnlock = () => {
    setUnlocked(true);
    window.localStorage.setItem(STORAGE_UNLOCKED_KEY, '1');
  };

  const handleLock = () => {
    setUnlocked(false);
    window.localStorage.removeItem(STORAGE_UNLOCKED_KEY);
  };

  return (
    <div className="min-h-screen bg-[#121016] text-[#f2eefb] relative selection:bg-[#ff5522]/30 selection:text-[#ffd778]">
      {/* Top Navbar Header with Language & Status */}
      <header className="absolute top-3 right-4 z-40 flex items-center gap-3">
        {/* Language Switcher */}
        <div className="flex items-center rounded-lg border border-gold/30 bg-card/80 p-0.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLang('pt')}
            className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider transition-colors cursor-pointer ${
              lang === 'pt'
                ? 'bg-secondary text-gold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🇧🇷 PT
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider transition-colors cursor-pointer ${
              lang === 'en'
                ? 'bg-secondary text-gold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🇺🇸 EN
          </button>
        </div>

        {/* Gate State Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] tracking-wider uppercase backdrop-blur-md ${
            unlocked
              ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
              : 'border-amber-500/40 bg-amber-950/40 text-amber-300'
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              unlocked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          {unlocked ? (lang === 'pt' ? 'ACESSO LIBERADO' : 'GATE UNLOCKED') : (lang === 'pt' ? 'PORTÃO SELADO' : 'GATE SEALED')}
        </div>
      </header>

      {/* Main Views */}
      {unlocked ? (
        <WarTable onLock={handleLock} lang={lang} />
      ) : (
        <UnlockGate onUnlock={handleUnlock} lang={lang} />
      )}
    </div>
  );
}
