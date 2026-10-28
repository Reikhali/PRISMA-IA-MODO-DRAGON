/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const TELEGRAM_URL = 'https://t.me/Ahmad_Trader07';

interface TelegramButtonProps {
  className?: string;
  label?: string;
}

export const TelegramButton: React.FC<TelegramButtonProps> = ({
  className = '',
  label = 'JOIN TELEGRAM CHANNEL',
}) => {
  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-gold/25 bg-card/70 px-5 py-4 backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[var(--shadow-ember)] ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(100deg, transparent 20%, oklch(0.8 0.02 250 / 0.12) 50%, transparent 80%)',
        }}
      />
      <svg
        viewBox="0 0 240 240"
        className="h-7 w-7 shrink-0 drop-shadow-[0_2px_6px_oklch(0.6_0.15_240/0.6)]"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="tg-disc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#37BBFE" />
            <stop offset="100%" stopColor="#007DBB" />
          </linearGradient>
        </defs>
        <circle cx="120" cy="120" r="120" fill="url(#tg-disc)" />
        <path
          fill="#fff"
          d="M52 118.5c38-16.6 63.4-27.5 76-32.8 36.2-15.1 43.7-17.7 48.6-17.8 1.1 0 3.5.2 5.1 1.5 1.3 1 1.7 2.5 1.9 3.5.2 1 .4 3.3.2 5.1-2 21.1-10.7 72.3-15.1 96-1.9 10-5.6 13.4-9.1 13.7-7.7.7-13.6-5.1-21.1-10-11.7-7.7-18.3-12.5-29.7-20-13.2-8.7-4.6-13.5 2.9-21.3 2-2 36-33 36.7-35.8.1-.4.2-1.7-.6-2.4-.8-.7-2-.5-2.9-.3-1.2.3-20.9 13.3-59 39-5.6 3.8-10.7 5.7-15.2 5.6-5-.1-14.6-2.8-21.8-5.1-8.8-2.9-15.8-4.4-15.2-9.3.3-2.6 3.8-5.2 10.3-7.6z"
        />
      </svg>
      <span className="font-display text-xs sm:text-sm font-bold tracking-[0.22em] text-steel">
        {label}
      </span>
    </a>
  );
};
