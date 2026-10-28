/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const SPARKS = Array.from({ length: 22 }, (_, t) => ({
  id: t,
  dx: ((t * 53) % 100) - 50,
  dy: 40 + ((t * 31) % 70),
  delay: ((t * 7) % 10) * 0.045,
  size: 2 + ((t * 5) % 4),
  dur: 0.9 + ((t * 3) % 7) * 0.12,
}));

interface FireEffectProps {
  active: boolean;
}

export const FireEffect: React.FC<FireEffectProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Screen flash */}
      <div
        className="animate-fire-flash absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 22%, oklch(0.78 0.2 55 / 0.55), oklch(0.5 0.19 30 / 0.28) 40%, transparent 72%)',
        }}
      />

      {/* Fiery cone and glowing plasma core */}
      <div className="absolute left-1/2 top-[14%] -translate-x-1/2">
        <div
          className="animate-fire-cone h-[70vh] w-[70vw] max-w-[900px] rounded-full blur-2xl sm:w-[55vw]"
          style={{
            background:
              'radial-gradient(circle at 50% 22%, oklch(0.98 0.06 90 / 0.95) 0%, oklch(0.85 0.2 70 / 0.9) 18%, oklch(0.7 0.22 45 / 0.8) 38%, oklch(0.52 0.21 28 / 0.55) 60%, transparent 78%)',
          }}
        />
        <div
          className="animate-fire-core absolute inset-0 m-auto h-[34vh] w-[34vw] max-w-[420px] rounded-full blur-xl"
          style={{
            background:
              'radial-gradient(circle, oklch(0.99 0.05 95 / 0.95), oklch(0.86 0.2 65 / 0.7) 45%, transparent 72%)',
          }}
        />
      </div>

      {/* Billowing dragon smoke */}
      <div
        className="animate-fire-smoke absolute inset-x-0 top-[10%] h-[60vh] blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 42% 60%, oklch(0.55 0.01 285 / 0.35), transparent 62%), radial-gradient(ellipse at 62% 40%, oklch(0.45 0.02 30 / 0.3), transparent 60%)',
        }}
      />

      {/* Flying sparks */}
      {SPARKS.map((spark) => (
        <span
          key={spark.id}
          className="absolute left-1/2 top-[22%] rounded-full"
          style={{
            width: `${spark.size}px`,
            height: `${spark.size}px`,
            background: 'oklch(0.9 0.19 70)',
            boxShadow: '0 0 10px 3px oklch(0.75 0.2 50 / 0.75)',
            animation: `spark-fly ${spark.dur}s ease-out ${spark.delay}s forwards`,
            // @ts-expect-error CSS variable custom properties
            '--sx': `${spark.dx}vw`,
            '--sy': `${spark.dy}vh`,
          }}
        />
      ))}
    </div>
  );
};
