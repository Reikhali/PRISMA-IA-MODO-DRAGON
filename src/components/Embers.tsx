/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const EMBER_PARTICLES = Array.from({ length: 26 }, (_, t) => ({
  id: t,
  left: (t * 37) % 100,
  delay: (t % 13) * 0.9,
  duration: 7 + ((t * 3) % 9),
  size: 1 + ((t * 7) % 3),
  drift: ((t % 5) - 2) * 22,
}));

interface EmbersProps {
  className?: string;
}

export const Embers: React.FC<EmbersProps> = ({ className = '' }) => {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {EMBER_PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className="absolute bottom-0 rounded-full bg-ember"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: '0 0 8px 2px oklch(0.7 0.19 45 / 0.7)',
            animation: `ember-rise ${particle.duration}s linear ${particle.delay}s infinite`,
            // @ts-expect-error CSS variable custom property
            '--drift': `${particle.drift}px`,
          }}
        />
      ))}
    </div>
  );
};
