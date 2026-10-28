/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SignalResult } from '../types';

interface CandleChartProps {
  result: SignalResult | null;
  emptyText?: string;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  result,
  emptyText = 'awaiting market scan…',
}) => {
  const candles = (result?.candles ?? []).slice(-40);

  if (candles.length === 0) {
    return (
      <div className="flex h-44 w-full items-center justify-center rounded-lg border border-border/60 bg-background/50 font-mono text-xs text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  const ema9 = (result?.ema9 ?? []).slice(-40);
  const ema21 = (result?.ema21 ?? []).slice(-40);

  const highest = Math.max(...candles.map((c) => c.high), ...ema21, ...ema9);
  const lowest = Math.min(...candles.map((c) => c.low), ...ema21, ...ema9);
  const range = highest - lowest || 1;

  // Coordinate transforms matching original SVG viewbox 340 x 100
  const yCoord = (val: number) => 100 - ((val - lowest) / range) * 92 - 4;
  const candleStep = 340 / candles.length;
  const xCoord = (idx: number) => idx * candleStep + candleStep / 2;

  const buildPath = (values: number[]) => {
    return values
      .map((val, idx) => `${idx === 0 ? 'M' : 'L'}${xCoord(idx).toFixed(2)},${yCoord(val).toFixed(2)}`)
      .join(' ');
  };

  const gridLevels = [16, 32, 48, 64, 80];

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border/70 bg-background/60 p-2">
      <svg viewBox="0 0 340 100" className="h-44 w-full" preserveAspectRatio="none">
        {/* Background Grid Lines */}
        {gridLevels.map((y) => (
          <line
            key={y}
            x1="0"
            x2="340"
            y1={y}
            y2={y}
            stroke="oklch(0.3 0.008 285)"
            strokeWidth="0.35"
          />
        ))}

        {/* Candlesticks: Wicks and Bodies */}
        {candles.map((candle, idx) => {
          const x = xCoord(idx);
          const isBull = candle.close >= candle.open;
          const color = isBull ? 'oklch(0.74 0.16 155)' : 'oklch(0.62 0.2 25)';
          const openY = yCoord(candle.open);
          const closeY = yCoord(candle.close);
          const highY = yCoord(candle.high);
          const lowY = yCoord(candle.low);
          const bodyY = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(openY - closeY), 0.9);

          return (
            <g key={idx}>
              {/* Wick */}
              <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth="0.7" />
              {/* Candle Body */}
              <rect
                x={x - 2.4}
                y={bodyY}
                width="4.8"
                height={bodyHeight}
                fill={color}
                opacity="0.92"
                rx="0.5"
              />
            </g>
          );
        })}

        {/* EMA 9 Curve (Gold) */}
        {ema9.length > 0 && (
          <path
            d={buildPath(ema9)}
            fill="none"
            stroke="oklch(0.82 0.13 85)"
            strokeWidth="0.9"
            opacity="0.85"
          />
        )}

        {/* EMA 21 Curve (Steel) */}
        {ema21.length > 0 && (
          <path
            d={buildPath(ema21)}
            fill="none"
            stroke="oklch(0.7 0.02 285)"
            strokeWidth="0.9"
            opacity="0.6"
          />
        )}
      </svg>
      {/* Legend */}
      <div className="mt-1 flex items-center justify-between px-2 font-mono text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 rounded bg-[oklch(0.82_0.13_85)]" /> EMA 9
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 rounded bg-[oklch(0.7_0.02_285)]" /> EMA 21
          </span>
        </div>
        <span className="text-[9px] tracking-wider uppercase opacity-70">40 LIVE CANDLES</span>
      </div>
    </div>
  );
};
