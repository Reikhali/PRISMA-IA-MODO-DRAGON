/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FactorVerdict {
  name: string;
  verdict: 'UP' | 'DOWN' | 'FLAT';
  detail: string;
  weight: number;
}

export type LayerId = 'structure' | 'sr' | 'liquidity' | 'exhaustion' | 'patterns' | 'breakout_retest';

export interface AnalysisLayer {
  id: LayerId;
  name: string;
  verdict: 'UP' | 'DOWN' | 'NEUTRAL';
  score: number; // -1 to 1
  status: 'CONFIRMED' | 'CAUTION' | 'DIVERGENT';
  summary: string;
  metrics: { label: string; value: string }[];
}

export interface StatisticalMetrics {
  totalSignalsSampled: number;
  wins: number;
  losses: number;
  sampleWinRate: number; // e.g. 84.5%
  wilsonLowerBound: number; // Wilson 95% Confidence Interval lower bound (e.g. 78.2%)
  wilsonUpperBound: number; // Wilson 95% Confidence Interval upper bound (e.g. 89.1%)
  brokerPayout: number; // e.g. 87% (default for Quotex/Pocket Option OTC)
  breakEvenWinRate: number; // 1 / (1 + payout/100) -> 53.48%
  expectedEdge: number; // sampleWinRate - breakEvenWinRate -> +31.02%
  expectedValuePerTrade: number; // Expected profit on a $100 bet: (winRate * payout - lossRate * 100)
}

export interface SignalResult {
  dir: 'UP' | 'DOWN';
  confidence: number;
  grade: 'ELITE' | 'STRONG' | 'MODERATE' | 'WEAK';
  score: number;
  factors: FactorVerdict[];
  layers: AnalysisLayer[];
  stats: StatisticalMetrics;
  entry: number;
  targetPrice: number;
  stopLossPrice: number;
  atr: number;
  volatility: 'HIGH' | 'LOW' | 'NORMAL';
  candlePatternFound?: string;
  candles: Candle[];
  ema9: number[];
  ema21: number[];
}

export interface PairCategory {
  label: string;
  pairs: string[];
}
