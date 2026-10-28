/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Embers } from './Embers';

interface DragonHeroProps {
  compact?: boolean;
}

export const DragonHero: React.FC<DragonHeroProps> = ({ compact = false }) => {
  const heroImageSrc = '/assets/dragon-hero.jpg';

  return (
    <div className="relative isolate w-full overflow-hidden">
      <div
        className={`relative mx-auto w-full ${compact ? 'max-w-md' : 'max-w-3xl'}`}
        style={{ aspectRatio: '4 / 3' }}
      >
        {/* Breathing dragon body with subtle perspective wing sway */}
        <div className="absolute inset-0 animate-breathe">
          <div className="absolute inset-0 animate-wing will-change-transform">
            <img
              src={heroImageSrc}
              alt="Dragão negro animado guardando o robô de negociação Prisma IA (Modo Dragon)"
              width={1024}
              height={768}
              className="h-full w-full object-cover"
              style={{
                maskImage: 'radial-gradient(ellipse at 50% 45%, black 45%, transparent 78%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 45%, transparent 78%)',
              }}
            />
          </div>
        </div>

        {/* Glowing fiery slit eyes */}
        <span
          aria-hidden="true"
          className="animate-eye absolute rounded-full bg-ember"
          style={{
            left: '32.5%',
            top: '36.8%',
            width: 14,
            height: 9,
          }}
        />
        <span
          aria-hidden="true"
          className="animate-eye absolute rounded-full bg-ember"
          style={{
            left: '57.8%',
            top: '35.4%',
            width: 15,
            height: 9,
            animationDelay: '0.4s',
          }}
        />

        {/* Billowing mystical smoke */}
        <div
          aria-hidden="true"
          className="animate-smoke absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background:
              'radial-gradient(ellipse at 30% 90%, oklch(0.6 0.01 285 / 0.22), transparent 60%), radial-gradient(ellipse at 72% 80%, oklch(0.55 0.01 285 / 0.18), transparent 62%)',
          }}
        />

        {/* Floating rising embers */}
        <Embers />

        {/* Bottom edge blending into dark background */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background: 'linear-gradient(to top, var(--background), transparent)',
          }}
        />
      </div>
    </div>
  );
};
