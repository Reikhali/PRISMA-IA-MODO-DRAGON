/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DragonHero } from './DragonHero';
import { TelegramButton } from './TelegramButton';
import { playDragonRoar } from '../utils/sfx';

interface UnlockGateProps {
  onUnlock: () => void;
  lang: 'pt' | 'en';
}

export const UnlockGate: React.FC<UnlockGateProps> = ({ onUnlock, lang }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isWaking, setIsWaking] = useState(false);

  const isPt = lang === 'pt';

  const t = {
    title: 'PRISMA IA',
    subtitleTag: isPt ? 'MODO DRAGON' : 'DRAGON MODE',
    fullTitle: isPt ? 'PRISMA IA • MODO DRAGON' : 'PRISMA IA • DRAGON MODE',
    sealedGate: isPt ? 'PORTÃO SELADO' : 'SEALED GATE',
    subtitle: isPt
      ? 'Apenas a palavra do guardião desperta o dragão.'
      : "Only the keeper's word wakes the dragon.",
    label: isPt ? 'PALAVRA DO GUARDIÃO' : "KEEPER'S WORD",
    placeholder: isPt ? 'Digite a palavra do guardião (prismaia)…' : "Enter keeper's word (prismaia)…",
    enterBtn: isPt ? 'ENTRAR NO PRISMA IA' : 'ENTER PRISMA IA',
    wakingBtn: isPt ? 'DESPERTANDO O DRAGÃO…' : 'WAKING THE DRAGON…',
    telegramBtn: isPt ? 'ENTRAR NO CANAL DO TELEGRAM' : 'JOIN TELEGRAM CHANNEL',
    emptyError: isPt ? 'Pronuncie a palavra do guardião (prismaia) para abrir.' : 'Speak the keeper word (prismaia) to open.',
    wrongError: isPt ? 'Palavra do guardião incorreta! Digite: prismaia' : 'Incorrect keeper word! Type: prismaia',
    hint: isPt
      ? "Chave do Guardião: prismaia"
      : "Keeper's Key: prismaia",
    footer: isPt
      ? '🐉 PRISMA IA • MODO DRAGON • FORJADO EM FOGO E AÇO'
      : '🐉 PRISMA IA • DRAGON MODE • FORGED IN FIRE & STEEL',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = passcode.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanWord) {
      setError(t.emptyError);
      return;
    }
    if (cleanWord !== 'prismaia') {
      setError(t.wrongError);
      return;
    }

    setError('');
    setIsWaking(true);
    playDragonRoar();

    setTimeout(() => {
      onUnlock();
    }, 700);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-12">
      {/* Background vignette & ambient lighting */}
      <div
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, oklch(0.28 0.08 25 / 0.4) 0%, oklch(0.13 0.007 285) 75%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
        {/* Dragon Emblem */}
        <DragonHero compact={true} />

        {/* Title */}
        <div className="-mt-8 text-center space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <h1 className="font-display text-steel text-4xl sm:text-5xl font-black tracking-[0.18em]">
              {t.title}
            </h1>
            <span className="font-display inline-block rounded-md border border-gold/40 bg-secondary/80 px-2.5 py-1 text-xs tracking-[0.2em] text-gold font-bold shadow-[0_0_12px_rgba(255,180,40,0.25)]">
              {t.subtitleTag}
            </span>
          </div>
          <div className="hairline-gold mx-auto h-px w-64" />
        </div>

        {/* Gate Card */}
        <div className="panel-royal p-7 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="font-display text-sm tracking-[0.28em] text-gold font-bold">
              {t.sealedGate}
            </h2>
            <p className="font-sans text-xs tracking-wider text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-display block text-xs tracking-[0.22em] text-steel mb-2">
                {t.label}
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t.placeholder}
                autoFocus
                className="w-full appearance-none rounded-md border border-border bg-input/60 px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors duration-300 focus:border-gold/60 focus:ring-1 focus:ring-gold/30"
              />
              {error && (
                <p className="mt-1.5 text-xs text-destructive font-mono animate-in fade-in">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isWaking}
              className="font-display animate-sheen w-full rounded-md border border-gold/30 px-4 py-3.5 text-sm font-bold tracking-[0.24em] text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-ember)] disabled:opacity-70 cursor-pointer"
              style={{
                backgroundImage:
                  'linear-gradient(100deg, oklch(0.42 0.16 22) 0%, oklch(0.55 0.2 28) 45%, oklch(0.42 0.16 22) 70%)',
              }}
            >
              {isWaking ? t.wakingBtn : t.enterBtn}
            </button>
          </form>

          <p className="text-center font-mono text-[11px] text-muted-foreground/60 italic">
            {t.hint}
          </p>

          <div className="pt-2">
            <TelegramButton label={t.telegramBtn} />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] tracking-[0.22em] text-muted-foreground/70">
          {t.footer}
        </p>
      </div>
    </div>
  );
};
