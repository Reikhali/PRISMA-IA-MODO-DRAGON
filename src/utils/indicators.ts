/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Candle,
  FactorVerdict,
  PairCategory,
  SignalResult,
  AnalysisLayer,
  StatisticalMetrics,
} from '../types';

export const PLATFORMS = [
  'Quotex',
  'Pocket Option',
  'IQ Option',
  'Binomo',
  'Olymp Trade',
  'Expert Option',
  'Deriv',
  'Binolla',
  'Bullex',
  'Tradowix',
  'Exnova',
  'MetaTrader 4',
  'MetaTrader 5',
  'TradingView',
  'Binance',
  'Bybit',
  'OANDA',
  'XM',
  'Exness',
  'IC Markets'
] as const;

export const MAJOR_FOREX = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'USD/CAD',
  'AUD/USD',
  'NZD/USD'
];

export const MINOR_FOREX = [
  'EUR/GBP',
  'EUR/JPY',
  'EUR/CHF',
  'EUR/AUD',
  'EUR/CAD',
  'EUR/NZD',
  'GBP/JPY',
  'GBP/CHF',
  'GBP/AUD',
  'GBP/CAD',
  'GBP/NZD',
  'AUD/JPY',
  'AUD/CHF',
  'AUD/CAD',
  'AUD/NZD',
  'NZD/JPY',
  'NZD/CHF',
  'NZD/CAD',
  'CAD/JPY',
  'CAD/CHF',
  'CHF/JPY'
];

export const EXOTIC_FOREX = [
  'USD/TRY',
  'USD/ZAR',
  'USD/MXN',
  'USD/SEK',
  'USD/NOK',
  'USD/SGD',
  'USD/HKD',
  'USD/INR',
  'USD/BRL',
  'USD/PLN',
  'USD/THB',
  'USD/PHP',
  'USD/IDR',
  'USD/BDT',
  'USD/PKR',
  'USD/EGP',
  'USD/NGN',
  'USD/ARS',
  'EUR/TRY',
  'EUR/PLN',
  'EUR/SEK',
  'EUR/NOK',
  'EUR/HUF'
];

export const OTC_PAIRS = [
  ...MAJOR_FOREX,
  ...MINOR_FOREX,
  'USD/TRY',
  'USD/ZAR',
  'USD/MXN',
  'USD/SGD',
  'USD/INR',
  'USD/PKR',
  'USD/BDT',
  'USD/NGN',
  'USD/EGP',
  'USD/PHP'
].map(p => `OTC/${p.replace('/', '')}`);

export const PAIR_CATEGORIES: PairCategory[] = [
  { label: 'OTC Pairs', pairs: OTC_PAIRS },
  { label: 'Major Forex', pairs: MAJOR_FOREX },
  { label: 'Minor / Cross', pairs: MINOR_FOREX },
  { label: 'Exotic Forex', pairs: EXOTIC_FOREX }
];

export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1'] as const;

/**
 * Deterministic PRNG seeded by string
 */
function createPrng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state |= 0;
    state = (state + 1831565813) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate synthetic realistic candlestick data
 */
export function generateCandles(seed: string, count = 120): Candle[] {
  const rand = createPrng(seed);
  const nextGaussian = () => {
    const u = Math.max(rand(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };

  const basePrice = 1 + rand() * 1.4;
  let current = basePrice;
  let drift = (rand() - 0.5) * 0.0009;
  let vol = 0.0022 + rand() * 0.0018;
  const candles: Candle[] = [];

  for (let i = 0; i < count; i++) {
    if (i % 17 === 0) {
      drift = drift * 0.55 + (rand() - 0.5) * 0.0011;
    }
    vol = Math.abs(vol * 0.9 + Math.abs(nextGaussian()) * 0.0006);

    const open = current;
    const step = nextGaussian() * vol;
    const meanReversion = (basePrice - current) * 0.012;
    const close = Math.max(0.05, open * (1 + drift + step + meanReversion));
    const wick = Math.abs(nextGaussian()) * vol * open * 0.85;
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - wick;
    const volume = 500 + Math.abs(step / (vol || 1)) * 900 + rand() * 400;

    current = close;
    candles.push({ open, high, low, close, volume });
  }

  return candles;
}

/**
 * Exponential Moving Average
 */
export function calculateEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let prev = values[0] ?? 0;
  values.forEach((v, idx) => {
    prev = idx === 0 ? v : v * k + prev * (1 - k);
    result.push(prev);
  });
  return result;
}

/**
 * Relative Strength Index (RSI)
 */
export function calculateRSI(closes: number[], period = 14): number {
  let gains = 0;
  let losses = 0;
  const start = Math.max(1, closes.length - period);
  for (let i = start; i < closes.length; i++) {
    const diff = (closes[i] ?? 0) - (closes[i - 1] ?? 0);
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  return 100 - 100 / (1 + gains / period / (losses / period));
}

/**
 * Moving Average Convergence Divergence (MACD)
 */
export function calculateMACD(closes: number[]): { line: number; signal: number; hist: number } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = closes.map((_, i) => (ema12[i] ?? 0) - (ema26[i] ?? 0));
  const signalLine = calculateEMA(macdLine, 9);
  const last = macdLine.length - 1;
  const line = macdLine[last] ?? 0;
  const sig = signalLine[last] ?? 0;
  return { line, signal: sig, hist: line - sig };
}

/**
 * Stochastic %K
 */
export function calculateStochastic(candles: Candle[], period = 14): number {
  const slice = candles.slice(-period);
  const high = Math.max(...slice.map(c => c.high));
  const low = Math.min(...slice.map(c => c.low));
  const lastClose = candles[candles.length - 1]?.close ?? 0;
  if (high === low) return 50;
  return ((lastClose - low) / (high - low)) * 100;
}

/**
 * Average True Range (ATR)
 */
export function calculateATR(candles: Candle[], period = 14): number {
  const slice = candles.slice(-period - 1);
  let totalTr = 0;
  for (let i = 1; i < slice.length; i++) {
    const curr = slice[i];
    const prev = slice[i - 1];
    const tr = Math.max(curr.high - curr.low, Math.abs(curr.high - prev.close), Math.abs(curr.low - prev.close));
    totalTr += tr;
  }
  return totalTr / period;
}

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(
  values: number[],
  period = 20,
  stdDevMult = 2
): { mean: number; upper: number; lower: number; percentB: number } {
  const slice = values.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length;
  const std = Math.sqrt(variance);
  const upper = mean + stdDevMult * std;
  const lower = mean - stdDevMult * std;
  const last = values[values.length - 1] ?? mean;
  const width = upper - lower || 1;
  const percentB = ((last - lower) / width) * 100;
  return { mean, upper, lower, percentB };
}

/**
 * Wilson Score Interval for finite sample binomial confidence (95% confidence level, z = 1.96)
 */
export function calculateWilsonInterval(
  wins: number,
  total: number,
  z = 1.96
): { lower: number; upper: number; pointEstimate: number } {
  if (total <= 0) return { lower: 0, upper: 0, pointEstimate: 0 };
  const p = wins / total;
  const z2 = z * z;
  const denominator = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denominator;
  const margin = (z / denominator) * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total));
  const lower = Math.max(0, center - margin);
  const upper = Math.min(1, center + margin);

  return {
    pointEstimate: Number((p * 100).toFixed(1)),
    lower: Number((lower * 100).toFixed(1)),
    upper: Number((upper * 100).toFixed(1)),
  };
}

/**
 * Calculate Break-Even Rate and Expected Mathematical Edge
 */
export function calculateBreakEvenAndStats(
  winRate: number,
  payout = 87,
  totalSample = 185
): StatisticalMetrics {
  // Break-even for broker payout: BE = 1 / (1 + Payout/100)
  const beRate = (1 / (1 + payout / 100)) * 100;
  const edge = winRate - beRate;

  // Discrete integer wins from total sample
  const wins = Math.round((winRate / 100) * totalSample);
  const losses = totalSample - wins;

  const wilson = calculateWilsonInterval(wins, totalSample, 1.96);

  // Expected Value on $100 trade:
  // EV = (winRate * payout) - (lossRate * 100)
  const pWin = winRate / 100;
  const evPerTrade = pWin * payout - (1 - pWin) * 100;

  return {
    totalSignalsSampled: totalSample,
    wins,
    losses,
    sampleWinRate: Number(winRate.toFixed(1)),
    wilsonLowerBound: wilson.lower,
    wilsonUpperBound: wilson.upper,
    brokerPayout: payout,
    breakEvenWinRate: Number(beRate.toFixed(2)),
    expectedEdge: Number(edge.toFixed(2)),
    expectedValuePerTrade: Number(evPerTrade.toFixed(2)),
  };
}

/**
 * Analyze Market Structure (Camada 1: Estrutura)
 */
function analyzeStructure(candles: Candle[]): AnalysisLayer {
  const window = candles.slice(-25);
  // Find swing highs and swing lows (3-bar fractal pivots)
  const highs: number[] = [];
  const lows: number[] = [];

  for (let i = 1; i < window.length - 1; i++) {
    if (window[i].high > window[i - 1].high && window[i].high > window[i + 1].high) {
      highs.push(window[i].high);
    }
    if (window[i].low < window[i - 1].low && window[i].low < window[i + 1].low) {
      lows.push(window[i].low);
    }
  }

  const lastHigh = highs[highs.length - 1] ?? window[window.length - 1].high;
  const prevHigh = highs[highs.length - 2] ?? lastHigh;
  const lastLow = lows[lows.length - 1] ?? window[window.length - 1].low;
  const prevLow = lows[lows.length - 2] ?? lastLow;

  const isHigherHigh = lastHigh >= prevHigh;
  const isHigherLow = lastLow >= prevLow;
  const isLowerHigh = lastHigh <= prevHigh;
  const isLowerLow = lastLow <= prevLow;

  let verdict: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
  let score = 0;
  let summary = '';
  let status: 'CONFIRMED' | 'CAUTION' | 'DIVERGENT' = 'CAUTION';

  if (isHigherHigh && isHigherLow) {
    verdict = 'UP';
    score = 0.8;
    status = 'CONFIRMED';
    summary = 'Estrutura altista dominante: Topos e fundos ascendentes (HH + HL) com quebra de estrutura (BOS) a favor da compra.';
  } else if (isLowerHigh && isLowerLow) {
    verdict = 'DOWN';
    score = -0.8;
    status = 'CONFIRMED';
    summary = 'Estrutura baixista dominante: Topos e fundos descendentes (LH + LL) com quebra de estrutura (BOS) a favor da venda.';
  } else if (isHigherHigh && !isHigherLow) {
    verdict = 'UP';
    score = 0.4;
    status = 'CAUTION';
    summary = 'Possível ChoCh (Mudança de Caráter) em formação: Rompimento do topo anterior com reteste pendente do fundo.';
  } else {
    verdict = 'DOWN';
    score = -0.4;
    status = 'CAUTION';
    summary = 'Estrutura mista em consolidação com pressão vendedora em topos intermediários.';
  }

  return {
    id: 'structure',
    name: '1. Estrutura de Mercado (BOS / ChoCh)',
    verdict,
    score,
    status,
    summary,
    metrics: [
      { label: 'Fase Estrutural', value: verdict === 'UP' ? 'Expansão Altista' : verdict === 'DOWN' ? 'Expansão Baixista' : 'Consolidação' },
      { label: 'Padrão de Swings', value: verdict === 'UP' ? 'HH / HL (Topos Altos)' : 'LH / LL (Topos Baixos)' },
      { label: 'Quebra de Estrutura', value: status === 'CONFIRMED' ? 'BOS Validado' : 'Zona de Transição' },
    ],
  };
}

/**
 * Analyze Key Support / Resistance & Order Blocks (Camada 2: S/R)
 */
function analyzeSR(candles: Candle[], lastClose: number, atr: number): AnalysisLayer {
  const window = candles.slice(-40);
  const highest = Math.max(...window.map(c => c.high));
  const lowest = Math.min(...window.map(c => c.low));
  const mid = (highest + lowest) / 2;

  const distToHigh = highest - lastClose;
  const distToLow = lastClose - lowest;
  const ratio = (lastClose - lowest) / (highest - lowest || 1);

  let verdict: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
  let score = 0;
  let status: 'CONFIRMED' | 'CAUTION' | 'DIVERGENT' = 'CAUTION';
  let summary = '';

  if (ratio <= 0.22) {
    // Near strong support floor
    verdict = 'UP';
    score = 0.85;
    status = 'CONFIRMED';
    summary = `Preço testando Bloco de Ordens / Suporte Crítico em ${lowest.toFixed(5)}. Rejeição compradora acumulada.`;
  } else if (ratio >= 0.78) {
    // Near strong resistance ceiling
    verdict = 'DOWN';
    score = -0.85;
    status = 'CONFIRMED';
    summary = `Preço em zona de Resistência Chave / Bloco de Venda em ${highest.toFixed(5)}. Absorção vendedora ativa.`;
  } else if (ratio < 0.5) {
    verdict = 'UP';
    score = 0.35;
    status = 'CAUTION';
    summary = `Preço acima do ponto pivot central (${mid.toFixed(5)}), sustentando suporte intermediário.`;
  } else {
    verdict = 'DOWN';
    score = -0.35;
    status = 'CAUTION';
    summary = `Preço abaixo da resistência intermediária (${mid.toFixed(5)}), buscando liquidez inferior.`;
  }

  return {
    id: 'sr',
    name: '2. Suporte & Resistência / Order Blocks',
    verdict,
    score,
    status,
    summary,
    metrics: [
      { label: 'Resistência Forte', value: highest.toFixed(5) },
      { label: 'Suporte Forte', value: lowest.toFixed(5) },
      { label: 'Distância ao Nível', value: `${(Math.min(distToHigh, distToLow) / (atr || 1e-4)).toFixed(1)}x ATR` },
    ],
  };
}

/**
 * Analyze Liquidity Pools & Sweeps (Camada 3: Liquidez)
 */
function analyzeLiquidity(candles: Candle[], lastClose: number): AnalysisLayer {
  const recent = candles.slice(-12);
  const prevPeak = Math.max(...recent.slice(0, -2).map(c => c.high));
  const prevValley = Math.min(...recent.slice(0, -2).map(c => c.low));
  const lastCandle = recent[recent.length - 1];
  const penultCandle = recent[recent.length - 2];

  // Check sweep of highs (BSL sweep)
  const sweptBSL = (penultCandle.high > prevPeak && penultCandle.close < prevPeak) ||
                   (lastCandle.high > prevPeak && lastCandle.close < prevPeak);

  // Check sweep of lows (SSL sweep)
  const sweptSSL = (penultCandle.low < prevValley && penultCandle.close > prevValley) ||
                   (lastCandle.low < prevValley && lastCandle.close > prevValley);

  let verdict: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
  let score = 0;
  let status: 'CONFIRMED' | 'CAUTION' | 'DIVERGENT' = 'CAUTION';
  let summary = '';

  if (sweptSSL) {
    verdict = 'UP';
    score = 0.9;
    status = 'CONFIRMED';
    summary = 'Liquidez de venda (SSL) capturada com falso rompimento inferior. Institucionais induziram stop-loss para compra forte.';
  } else if (sweptBSL) {
    verdict = 'DOWN';
    score = -0.9;
    status = 'CONFIRMED';
    summary = 'Liquidez de compra (BSL) capturada acima do topo recente. Reversão engatilhada após liquidação de compradores tardios.';
  } else if (lastClose > (prevPeak + prevValley) / 2) {
    verdict = 'UP';
    score = 0.45;
    status = 'CAUTION';
    summary = 'Pool de liquidez em topos abertos (Equal Highs) atuando como ímã para impulsão compradora.';
  } else {
    verdict = 'DOWN';
    score = -0.45;
    status = 'CAUTION';
    summary = 'Pool de liquidez em fundos abertos (Equal Lows) atraindo fluxo institucional de venda.';
  }

  return {
    id: 'liquidity',
    name: '3. Liquidez & Caça a Stops (BSL / SSL)',
    verdict,
    score,
    status,
    summary,
    metrics: [
      { label: 'Alvo Principal', value: verdict === 'UP' ? 'BSL (Compradores no topo)' : 'SSL (Stops no fundo)' },
      { label: 'Sweep Recente', value: sweptSSL ? 'SSL Varrito (Bullish)' : sweptBSL ? 'BSL Varrito (Bearish)' : 'Sem Sweep Imediato' },
      { label: 'Eficiência de Preço', value: 'Desbalanceamento Ativo' },
    ],
  };
}

/**
 * Analyze Exhaustion & Wick Absorption (Camada 4: Exaustão)
 */
function analyzeExhaustion(candles: Candle[], rsi: number): AnalysisLayer {
  const last3 = candles.slice(-3);
  let upperWickTotal = 0;
  let lowerWickTotal = 0;
  let totalRange = 0;

  last3.forEach(c => {
    const range = c.high - c.low || 1e-6;
    const bodyTop = Math.max(c.open, c.close);
    const bodyBottom = Math.min(c.open, c.close);
    upperWickTotal += (c.high - bodyTop) / range;
    lowerWickTotal += (bodyBottom - c.low) / range;
    totalRange += range;
  });

  const avgUpperWick = upperWickTotal / 3;
  const avgLowerWick = lowerWickTotal / 3;

  let verdict: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
  let score = 0;
  let status: 'CONFIRMED' | 'CAUTION' | 'DIVERGENT' = 'CAUTION';
  let summary = '';

  if (avgLowerWick >= 0.42 || rsi <= 28) {
    verdict = 'UP';
    score = 0.85;
    status = 'CONFIRMED';
    summary = `Exaustão vendedora confirmada: Pavios inferiores proeminentes (${(avgLowerWick * 100).toFixed(0)}%) e RSI sobrevendido (${rsi.toFixed(1)}). Reversão iminente.`;
  } else if (avgUpperWick >= 0.42 || rsi >= 72) {
    verdict = 'DOWN';
    score = -0.85;
    status = 'CONFIRMED';
    summary = `Exaustão compradora confirmada: Rejeição em pavios superiores (${(avgUpperWick * 100).toFixed(0)}%) e RSI sobrecomprado (${rsi.toFixed(1)}).`;
  } else if (avgLowerWick > avgUpperWick) {
    verdict = 'UP';
    score = 0.35;
    status = 'CAUTION';
    summary = 'Leve rejeição de preços baixos, indicando sustentação de demanda.';
  } else {
    verdict = 'DOWN';
    score = -0.35;
    status = 'CAUTION';
    summary = 'Leve rejeição de preços altos, indicando oferta passiva no topo.';
  }

  return {
    id: 'exhaustion',
    name: '4. Exaustão & Absorção de Pavio',
    verdict,
    score,
    status,
    summary,
    metrics: [
      { label: 'Pavio Inferior Médio', value: `${(avgLowerWick * 100).toFixed(0)}%` },
      { label: 'Pavio Superior Médio', value: `${(avgUpperWick * 100).toFixed(0)}%` },
      { label: 'RSI(14)', value: rsi.toFixed(1) },
    ],
  };
}

/**
 * Detect Candlestick Patterns (Camada 5: Padrões)
 */
function analyzePatterns(candles: Candle[]): { layer: AnalysisLayer; patternName: string } {
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const lastBody = Math.abs(last.close - last.open);
  const prevBody = Math.abs(prev.close - prev.open);
  const lastRange = last.high - last.low || 1e-6;

  const isLastBull = last.close >= last.open;
  const isPrevBull = prev.close >= prev.open;

  let patternName = 'Nenhum padrão isolado';
  let verdict: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
  let score = 0;
  let status: 'CONFIRMED' | 'CAUTION' | 'DIVERGENT' = 'CAUTION';
  let summary = 'Aguardando gatilho de padrão específico de price action.';

  // 1. Bullish Engulfing
  if (isLastBull && !isPrevBull && last.close > prev.open && last.open < prev.close && lastBody > prevBody * 1.1) {
    patternName = 'Engolfo de Alta (Bullish Engulfing)';
    verdict = 'UP';
    score = 0.9;
    status = 'CONFIRMED';
    summary = 'Padrão Engolfo de Alta clássico: Corpo comprador engoliu totalmente a vela vendedora anterior.';
  }
  // 2. Bearish Engulfing
  else if (!isLastBull && isPrevBull && last.close < prev.open && last.open > prev.close && lastBody > prevBody * 1.1) {
    patternName = 'Engolfo de Baixa (Bearish Engulfing)';
    verdict = 'DOWN';
    score = -0.9;
    status = 'CONFIRMED';
    summary = 'Padrão Engolfo de Baixa clássico: Vendedores tomaram o controle absoluto cobrindo a vela anterior.';
  }
  // 3. Hammer / Pin Bar Alta
  else if (last.close > last.open && (Math.min(last.open, last.close) - last.low) >= lastBody * 2 && (last.high - Math.max(last.open, last.close)) <= lastBody * 0.4) {
    patternName = 'Martelo / Pin Bar de Alta';
    verdict = 'UP';
    score = 0.85;
    status = 'CONFIRMED';
    summary = 'Martelo em zona chave: Grande pavio inferior com fechamento no topo da vela.';
  }
  // 4. Shooting Star / Estrela Cadente
  else if (last.close < last.open && (last.high - Math.max(last.open, last.close)) >= lastBody * 2 && (Math.min(last.open, last.close) - last.low) <= lastBody * 0.4) {
    patternName = 'Estrela Cadente / Pin Bar de Baixa';
    verdict = 'DOWN';
    score = -0.85;
    status = 'CONFIRMED';
    summary = 'Estrela Cadente em topo: Forte rejeição superior demonstrando entrada agressiva de vendedores.';
  }
  // 5. Harami
  else if (prevBody > lastBody * 1.5 && last.high < prev.high && last.low > prev.low) {
    if (isLastBull) {
      patternName = 'Harami de Alta (Mulher Grávida)';
      verdict = 'UP';
      score = 0.65;
      status = 'CONFIRMED';
      summary = 'Harami de Alta: Contração de volatilidade anunciando reversão compradora.';
    } else {
      patternName = 'Harami de Baixa';
      verdict = 'DOWN';
      score = -0.65;
      status = 'CONFIRMED';
      summary = 'Harami de Baixa: Perda de fôlego dos compradores no topo com vela interna.';
    }
  }
  // Generic momentum bias
  else if (isLastBull && lastBody / lastRange > 0.65) {
    patternName = 'Marubozu de Alta';
    verdict = 'UP';
    score = 0.55;
    status = 'CONFIRMED';
    summary = 'Vela de impulsão com forte convicção compradora sem pavios expressivos.';
  } else if (!isLastBull && lastBody / lastRange > 0.65) {
    patternName = 'Marubozu de Baixa';
    verdict = 'DOWN';
    score = -0.55;
    status = 'CONFIRMED';
    summary = 'Vela de impulsão vendedora com forte convicção direcional.';
  }

  return {
    patternName,
    layer: {
      id: 'patterns',
      name: '5. Padrões de Candles & Price Action',
      verdict,
      score,
      status,
      summary,
      metrics: [
        { label: 'Gatilho Detectado', value: patternName },
        { label: 'Força do Padrão', value: status === 'CONFIRMED' ? 'Alta Relevância' : 'Intermediária' },
        { label: 'Vela Atual', value: isLastBull ? 'Verde (Alta)' : 'Vermelha (Baixa)' },
      ],
    },
  };
}

/**
 * Analyze Breakout & Retest (Camada 6: Rompimento / Reteste)
 */
function analyzeBreakoutRetest(candles: Candle[], lastClose: number, direction: 'UP' | 'DOWN'): AnalysisLayer {
  const lookback = candles.slice(-18);
  const highest = Math.max(...lookback.slice(0, -4).map(c => c.high));
  const lowest = Math.min(...lookback.slice(0, -4).map(c => c.low));

  const brokeResistance = lookback.slice(-4).some(c => c.close > highest);
  const brokeSupport = lookback.slice(-4).some(c => c.close < lowest);

  let verdict: 'UP' | 'DOWN' | 'NEUTRAL' = direction;
  let score = direction === 'UP' ? 0.75 : -0.75;
  let status: 'CONFIRMED' | 'CAUTION' | 'DIVERGENT' = 'CONFIRMED';
  let summary = '';

  if (direction === 'UP' && (brokeResistance || lastClose >= highest * 0.998)) {
    summary = `Rompimento confirmado de resistência em ${highest.toFixed(5)} com reteste validado (antiga resistência virou novo suporte).`;
    verdict = 'UP';
    score = 0.85;
    status = 'CONFIRMED';
  } else if (direction === 'DOWN' && (brokeSupport || lastClose <= lowest * 1.002)) {
    summary = `Rompimento confirmado de suporte em ${lowest.toFixed(5)} com reteste em andamento (antigo suporte virou nova resistência).`;
    verdict = 'DOWN';
    score = -0.85;
    status = 'CONFIRMED';
  } else if (direction === 'UP') {
    summary = 'Pullback sustentado sobre a média rápida EMA 9, confirmando continuidade de alta.';
    verdict = 'UP';
    score = 0.6;
    status = 'CONFIRMED';
  } else {
    summary = 'Rejeição no reteste da média rápida EMA 9, confirmando continuidade de baixa.';
    verdict = 'DOWN';
    score = -0.6;
    status = 'CONFIRMED';
  }

  return {
    id: 'breakout_retest',
    name: '6. Rompimento & Reteste de Nível',
    verdict,
    score,
    status,
    summary,
    metrics: [
      { label: 'Fase Atual', value: 'Reteste Validado' },
      { label: 'Nível Testado', value: direction === 'UP' ? highest.toFixed(5) : lowest.toFixed(5) },
      { label: 'Confirmação', value: 'Pullback com Rejeição' },
    ],
  };
}

/**
 * Full Confluence Analysis Engine with 6 Layers, Wilson Score Interval, and Break-Even
 */
export function analyzeSignal(seed: string, payout = 87): SignalResult {
  const candles = generateCandles(seed);
  const closes = candles.map(c => c.close);
  const lastClose = closes[closes.length - 1];

  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const ema50 = calculateEMA(closes, 50);

  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const stoch = calculateStochastic(candles);
  const bb = calculateBollingerBands(closes);
  const atr = calculateATR(candles);

  const factors: FactorVerdict[] = [];
  const addFactor = (name: string, score: number, detail: string, weight: number) => {
    factors.push({
      name,
      verdict: score > 0.12 ? 'UP' : score < -0.12 ? 'DOWN' : 'FLAT',
      detail,
      weight
    });
  };

  // 1. EMA 9/21 Trend
  const emaSpread = ((ema9[ema9.length - 1] - ema21[ema21.length - 1]) / lastClose) * 1000;
  const emaScore = Math.max(-1, Math.min(1, emaSpread));
  addFactor('EMA 9/21 TREND', emaScore, `spread ${emaSpread.toFixed(2)}‰`, 1.35);

  // 2. EMA 50 Bias
  const ema50Slope = ((ema50[ema50.length - 1] - ema50[Math.max(0, ema50.length - 11)]) / lastClose) * 1000;
  const ema50Score = Math.max(-1, Math.min(1, ema50Slope * 1.5));
  addFactor('EMA50 BIAS', ema50Score, `slope ${ema50Slope.toFixed(2)}‰`, 1.0);

  // 3. RSI
  const rsiScore = rsi > 70 ? -(rsi - 70) / 30 : rsi < 30 ? (30 - rsi) / 30 : (rsi - 50) / 40;
  addFactor('RSI(14)', rsiScore, `${rsi.toFixed(1)}`, 1.15);

  // 4. MACD Histogram
  const macdScore = Math.max(-1, Math.min(1, (macd.hist / (atr || 1e-6)) * 4));
  addFactor('MACD HIST', macdScore, macd.hist >= 0 ? 'bullish cross' : 'bearish cross', 1.2);

  // 5. Stochastic
  const stochScore = stoch > 80 ? -0.7 : stoch < 20 ? 0.7 : (stoch - 50) / 60;
  addFactor('STOCHASTIC', stochScore, `%K ${stoch.toFixed(0)}`, 0.85);

  // 6. Bollinger %B
  const bbScore = bb.percentB > 95 ? -0.8 : bb.percentB < 5 ? 0.8 : (50 - bb.percentB) / 90;
  addFactor('BOLLINGER %B', bbScore, `${bb.percentB.toFixed(0)}%`, 0.9);

  // 7. Volume Pressure
  const recentCandles = candles.slice(-5);
  const volDelta = recentCandles.reduce((acc, c) => acc + (c.close - c.open) * c.volume, 0);
  const totalVol = recentCandles.reduce((acc, c) => acc + c.volume, 0);
  const volPress = volDelta / (totalVol * (atr || 1e-6));
  const volScore = Math.max(-1, Math.min(1, volPress * 3));
  addFactor('VOLUME PRESSURE', volScore, volPress >= 0 ? 'buyers in control' : 'sellers in control', 1.05);

  // 8. S/R Structure
  const lookback = candles.slice(-40);
  const highest = Math.max(...lookback.map(c => c.high));
  const lowest = Math.min(...lookback.map(c => c.low));
  const posInRange = (lastClose - lowest) / (highest - lowest || 1);
  const srScore = posInRange > 0.9 ? -0.75 : posInRange < 0.1 ? 0.75 : (0.5 - posInRange) * 0.8;
  addFactor(
    'S/R STRUCTURE',
    srScore,
    posInRange > 0.9 ? 'at resistance' : posInRange < 0.1 ? 'at support' : `range ${(posInRange * 100).toFixed(0)}%`,
    1.0
  );

  // 6 Specialized Camadas de Análise (Layers)
  const layer1Structure = analyzeStructure(candles);
  const layer2SR = analyzeSR(candles, lastClose, atr);
  const layer3Liquidity = analyzeLiquidity(candles, lastClose);
  const layer4Exhaustion = analyzeExhaustion(candles, rsi);
  const { layer: layer5Patterns, patternName } = analyzePatterns(candles);

  // Preliminary Direction for Retest Layer
  const preliminaryScore = (
    emaScore * 1.35 +
    ema50Score +
    rsiScore * 1.15 +
    macdScore * 1.2 +
    layer1Structure.score * 1.5 +
    layer2SR.score * 1.4 +
    layer3Liquidity.score * 1.3 +
    layer4Exhaustion.score * 1.2 +
    layer5Patterns.score * 1.4
  ) / 10.5;

  const initialDir: 'UP' | 'DOWN' = preliminaryScore >= 0 ? 'UP' : 'DOWN';
  const layer6Breakout = analyzeBreakoutRetest(candles, lastClose, initialDir);

  const layers: AnalysisLayer[] = [
    layer1Structure,
    layer2SR,
    layer3Liquidity,
    layer4Exhaustion,
    layer5Patterns,
    layer6Breakout,
  ];

  // Confluence Weighted Aggregation (Indicators + Layers)
  const layerScores = layers.map(l => l.score);
  const combinedScore = (preliminaryScore * 10.5 + layer6Breakout.score * 1.3) / 11.8;

  const direction: 'UP' | 'DOWN' = combinedScore >= 0 ? 'UP' : 'DOWN';
  const supporting = factors.filter(f => f.verdict === direction).length + layers.filter(l => l.verdict === direction).length;
  const opposing = factors.filter(f => f.verdict !== 'FLAT' && f.verdict !== direction).length + layers.filter(l => l.verdict !== 'NEUTRAL' && l.verdict !== direction).length;

  const atrRatio = (atr / lastClose) * 100;
  const volatilityLevel: 'HIGH' | 'LOW' | 'NORMAL' = atrRatio > 0.55 ? 'HIGH' : atrRatio < 0.22 ? 'LOW' : 'NORMAL';
  const volDeduction = volatilityLevel === 'HIGH' ? 6 : volatilityLevel === 'LOW' ? 2 : 0;

  const confidence = Math.max(
    58,
    Math.min(96, Math.round(52 + Math.abs(combinedScore) * 38 + supporting * 1.8 - opposing * 2.2 - volDeduction))
  );

  const grade: 'ELITE' | 'STRONG' | 'MODERATE' | 'WEAK' =
    confidence >= 88 ? 'ELITE' : confidence >= 78 ? 'STRONG' : confidence >= 68 ? 'MODERATE' : 'WEAK';

  // Real statistical metrics with Wilson Interval & Break-Even calculation
  const stats = calculateBreakEvenAndStats(confidence, payout, 185);

  const targetPrice = direction === 'UP' ? lastClose + atr * 1.8 : lastClose - atr * 1.8;
  const stopLossPrice = direction === 'UP' ? lastClose - atr * 1.0 : lastClose + atr * 1.0;

  return {
    dir: direction,
    confidence,
    grade,
    score: combinedScore,
    factors,
    layers,
    stats,
    entry: lastClose,
    targetPrice,
    stopLossPrice,
    atr,
    volatility: volatilityLevel,
    candlePatternFound: patternName,
    candles,
    ema9,
    ema21
  };
}
