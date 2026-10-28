/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SignalResult, AnalysisLayer } from '../types';
import {
  PLATFORMS,
  PAIR_CATEGORIES,
  TIMEFRAMES,
  analyzeSignal,
} from '../utils/indicators';
import { DragonHero } from './DragonHero';
import { Embers } from './Embers';
import { FireEffect } from './FireEffect';
import { CandleChart } from './CandleChart';
import { TelegramButton } from './TelegramButton';
import { playDragonRoar, isAudioMuted, setAudioMuted } from '../utils/sfx';

interface WarTableProps {
  onLock: () => void;
  lang: 'pt' | 'en';
}

interface LogStep {
  icon: string;
  text: string;
  tone?: 'gold' | 'green' | 'cyan';
}

export const WarTable: React.FC<WarTableProps> = ({ onLock, lang }) => {
  const isPt = lang === 'pt';

  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [marketPair, setMarketPair] = useState<string>(PAIR_CATEGORIES[0].pairs[0]);
  const [timeframe, setTimeframe] = useState<string>(TIMEFRAMES[0]);
  const [payout, setPayout] = useState<number>(87);
  const [isSummoning, setIsSummoning] = useState<boolean>(false);
  const [analysisLogs, setAnalysisLogs] = useState<LogStep[]>([]);
  const [signalResult, setSignalResult] = useState<SignalResult | null>(null);
  const [activeTab, setActiveTab] = useState<'layers' | 'indicators' | 'stats'>('layers');
  const [selectedLayerId, setSelectedLayerId] = useState<string>('structure');
  const [countdown, setCountdown] = useState<number>(60);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [fireActive, setFireActive] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);

  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  // Initialize audio mute state from localStorage
  useEffect(() => {
    setMuted(isAudioMuted());
  }, []);

  // Next candle countdown timer (ticks every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup pending timeouts on unmount
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(clearTimeout);
    };
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    setAudioMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) {
      playDragonRoar();
    }
  };

  const summonSignal = () => {
    if (isSummoning) return;

    // Clear previous timers
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    setIsSummoning(true);
    setSignalResult(null);
    setAnalysisLogs([]);

    const steps: LogStep[] = isPt
      ? [
          { icon: '🐉', text: 'Despertando o dragão • sincronizando velas ao vivo…' },
          { icon: '📐', text: `[1/6 ESTRUTURA]: Analisando topos/fundos e quebra de estrutura (BOS/ChoCh)...`, tone: 'cyan' },
          { icon: '🧱', text: `[2/6 S/R]: Mapeando blocos de ordens e zonas de suporte/resistência...`, tone: 'cyan' },
          { icon: '💧', text: `[3/6 LIQUIDEZ]: Rastreando piscinas de liquidez BSL/SSL e caça a stops...`, tone: 'cyan' },
          { icon: '⚡', text: `[4/6 EXAUSTÃO]: Verificando absorção de pavios e exaustão de volume...`, tone: 'cyan' },
          { icon: '🕯️', text: `[5/6 PADRÕES]: Identificando padrões de candles e gatilho de price action...`, tone: 'cyan' },
          { icon: '🎯', text: `[6/6 RETESTE]: Validando sustentação de rompimento e pullback...`, tone: 'cyan' },
          { icon: '📊', text: `[ESTATÍSTICA REAL]: Computando Intervalo Wilson (95% CI) e Ponto de Equilíbrio...`, tone: 'gold' },
          { icon: '👑', text: 'Confluência forjada • Sinal pronto para execução!', tone: 'gold' },
        ]
      : [
          { icon: '🐉', text: 'Waking the dragon • syncing live candles…' },
          { icon: '📐', text: `[1/6 STRUCTURE]: Validating swings, BOS and ChoCh on ${timeframe}...`, tone: 'cyan' },
          { icon: '🧱', text: `[2/6 S/R]: Mapping order blocks and key support/resistance...`, tone: 'cyan' },
          { icon: '💧', text: `[3/6 LIQUIDITY]: Tracking BSL/SSL pools and stop sweeps...`, tone: 'cyan' },
          { icon: '⚡', text: `[4/6 EXHAUSTION]: Calculating wick absorption and volume climax...`, tone: 'cyan' },
          { icon: '🕯️', text: `[5/6 PATTERNS]: Detecting candlestick and price action patterns...`, tone: 'cyan' },
          { icon: '🎯', text: `[6/6 RETEST]: Confirming breakout pullback hold...`, tone: 'cyan' },
          { icon: '📊', text: `[REAL STATS]: Computing Wilson 95% Confidence and Break-even...`, tone: 'gold' },
          { icon: '👑', text: 'Confluence forged • Signal ready for execution!', tone: 'gold' },
        ];

    // Animate log steps sequentially
    steps.forEach((step, idx) => {
      const t = setTimeout(() => {
        setAnalysisLogs((prev) => [...prev, step]);
      }, 420 * (idx + 1));
      timerRefs.current.push(t);
    });

    // Final confluence evaluation & eruption
    const finalTimer = setTimeout(() => {
      const seed = `${marketPair}-${platform}-${timeframe}-${Math.floor(Date.now() / 60000)}`;
      const result = analyzeSignal(seed, payout);

      // Trigger dragon fire & screen shake & audio roar
      setFireActive(true);
      setIsShaking(true);
      playDragonRoar();

      const finishTimer = setTimeout(() => {
        setSignalResult(result);
        setSelectedLayerId('structure');
        setFireActive(false);
        setIsShaking(false);
        setIsSummoning(false);
        setCountdown(60);
      }, 1600);

      timerRefs.current.push(finishTimer);
    }, 420 * (steps.length + 1));

    timerRefs.current.push(finalTimer);
  };

  const t = {
    title: 'PRISMA IA',
    subtitleTag: isPt ? 'MODO DRAGON' : 'DRAGON MODE',
    fullTitle: isPt ? 'PRISMA IA • MODO DRAGON' : 'PRISMA IA • DRAGON MODE',
    badge: isPt
      ? 'SINAIS IA AO VIVO • TODAS AS PLATAFORMAS • TODOS OS PARES FOREX'
      : 'LIVE AI SIGNALS • ALL PLATFORMS • ALL FOREX PAIRS',
    motto: isPt
      ? 'O Prisma IA no Modo Dragon responde apenas ao seu guardião.'
      : 'Prisma IA Dragon Mode answers only to its keeper.',
    warTable: isPt ? 'MESA DE GUERRA' : 'WAR TABLE',
    tradingPlatform: isPt ? 'PLATAFORMA DE NEGOCIAÇÃO' : 'TRADING PLATFORM',
    marketPair: isPt ? 'PAR DE MERCADO' : 'MARKET PAIR',
    timeframe: isPt ? '⏳ TEMPO GRÁFICO' : '⏳ TIMEFRAME',
    brokerPayout: isPt ? 'PAYOUT DA CORRETORA' : 'BROKER PAYOUT',
    summonBtn: isPt ? 'CONVOCAR SINAL' : 'SUMMON SIGNAL',
    summoningBtn: isPt ? 'CONVOCANDO…' : 'SUMMONING…',
    dragonSound: isPt ? '⚙️ SOM DO DRAGÃO' : '⚙️ DRAGON SOUND',
    sealGate: isPt ? 'SELAR O PORTÃO' : 'SEAL THE GATE',
    awaiting: isPt ? 'aguardando varredura do mercado…' : 'awaiting market scan…',
    dragonSleeps: isPt ? '⌛ O dragão dorme. Convoque um sinal…' : '⌛ The dragon sleeps. Summon a signal…',
    analyzing: isPt ? '▮ analisando 6 camadas em tempo real…' : '▮ analyzing 6 layers in real time…',
    signalEmitted: isPt ? '🏳️ Sinal emitido em' : '🏳️ Signal emitted on',
    nextCandle: isPt ? 'FECHAMENTO DA PRÓXIMA VELA' : 'NEXT CANDLE CLOSE',
    throneVerdict: isPt ? 'VEREDITO PRISMA IA' : 'PRISMA IA VERDICT',
    confidence: isPt ? 'assertividade estimada' : 'estimated winrate',
    layersTab: isPt ? '6 Camadas de Análise' : '6 Analysis Layers',
    statsTab: isPt ? 'Estatística Real & Wilson' : 'Real Stats & Wilson',
    indicatorsTab: isPt ? 'Indicadores Clássicos' : 'Classic Indicators',
    confluenceReport: isPt ? 'RELATÓRIO DE CONFLUÊNCIA' : 'CONFLUENCE REPORT',
    entry: isPt ? 'entrada' : 'entry',
    volatility: isPt ? 'VOL' : 'VOL',
    telegramBtn: isPt ? 'ENTRAR NO CANAL DO TELEGRAM' : 'JOIN TELEGRAM CHANNEL',
    footer: isPt
      ? '🐉 PRISMA IA • MODO DRAGON • FORJADO EM FOGO E AÇO'
      : '🐉 PRISMA IA • DRAGON MODE • FORGED IN FIRE & STEEL',
  };

  const selectedLayer = signalResult?.layers.find((l) => l.id === selectedLayerId) ?? signalResult?.layers[0];

  return (
    <main
      className={`relative min-h-screen overflow-hidden pb-16 ${
        isShaking ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Visual Effects */}
      <FireEffect active={fireActive} />
      <Embers className="opacity-50" />

      {/* Header with animated Dragon */}
      <header className="relative">
        <DragonHero />
        <div className="-mt-14 text-center px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <h1 className="font-display text-steel text-4xl font-black tracking-[0.16em] sm:text-6xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {t.title}
            </h1>
            <span className="font-display inline-block rounded-md border border-gold/40 bg-secondary/80 px-3 py-1 text-xs sm:text-sm tracking-[0.2em] text-gold font-bold shadow-[0_0_15px_rgba(255,180,40,0.3)]">
              {t.subtitleTag}
            </span>
          </div>
          <div className="hairline-gold mx-auto mt-4 h-px w-72" />
          <p className="mt-4 inline-block rounded-full border border-gold/25 bg-card/70 px-4 py-1.5 text-[11px] sm:text-xs tracking-[0.2em] text-muted-foreground backdrop-blur-md">
            {t.badge}
          </p>
          <p className="font-display mt-3 text-xs tracking-[0.2em] text-gold/70">
            {t.motto}
          </p>
        </div>
      </header>

      {/* War Room Grid */}
      <div className="relative mx-auto mt-10 grid w-full max-w-6xl gap-6 px-4 lg:grid-cols-[1fr_1.4fr]">
        {/* Left Column: War Table Controls */}
        <section className="panel-royal space-y-5 p-6 h-fit">
          <div className="flex items-center justify-between border-b border-gold/20 pb-3">
            <h2 className="font-display text-sm tracking-[0.28em] text-gold font-bold">
              {t.warTable}
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground uppercase bg-secondary/60 px-2 py-0.5 rounded border border-border">
              6 CAMADAS + WILSON
            </span>
          </div>

          {/* Platform Selector */}
          <label className="block">
            <span className="font-display flex items-center gap-2 text-xs tracking-[0.22em] text-steel">
              <span aria-hidden="true">🏰</span>
              {t.tradingPlatform}
            </span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-2 w-full appearance-none rounded-md border border-border bg-input/60 px-4 py-3 text-sm text-foreground outline-none transition-colors duration-300 focus:border-gold/60 cursor-pointer"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p} className="bg-card text-foreground">
                  {p}
                </option>
              ))}
            </select>
          </label>

          {/* Market Pair Selector */}
          <label className="block">
            <span className="font-display flex items-center gap-2 text-xs tracking-[0.22em] text-steel">
              <span aria-hidden="true">🐲</span>
              {t.marketPair}
            </span>
            <select
              value={marketPair}
              onChange={(e) => setMarketPair(e.target.value)}
              className="mt-2 w-full appearance-none rounded-md border border-border bg-input/60 px-4 py-3 text-sm text-foreground outline-none transition-colors duration-300 focus:border-gold/60 cursor-pointer"
            >
              {PAIR_CATEGORIES.map((cat) => (
                <optgroup key={cat.label} label={cat.label} className="bg-card font-bold text-gold">
                  {cat.pairs.map((p) => (
                    <option key={cat.label + p} value={p} className="bg-card text-foreground font-normal">
                      {p}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {/* Timeframe Buttons */}
          <div>
            <span className="font-display text-xs tracking-[0.22em] text-steel">
              {t.timeframe}
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-all duration-300 cursor-pointer ${
                    timeframe === tf
                      ? 'border-gold/60 bg-secondary text-gold shadow-[var(--shadow-ember)] font-bold'
                      : 'border-border bg-input/40 text-muted-foreground hover:border-gold/30 hover:text-foreground'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Payout Adjustment (for Break-Even computation) */}
          <div>
            <div className="flex items-center justify-between text-xs tracking-[0.22em]">
              <span className="font-display text-steel">{t.brokerPayout}</span>
              <span className="font-mono font-bold text-gold">{payout}%</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {[80, 85, 87, 90, 92].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPayout(p)}
                  className={`flex-1 rounded py-1 font-mono text-[11px] border transition-colors cursor-pointer ${
                    payout === p
                      ? 'border-gold bg-secondary text-gold font-bold'
                      : 'border-border bg-input/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/80">
              Break-Even Mínimo:{' '}
              <span className="text-steel font-bold">
                {(100 / (1 + payout / 100)).toFixed(2)}%
              </span>
            </p>
          </div>

          {/* Summon Signal Button */}
          <button
            type="button"
            onClick={summonSignal}
            disabled={isSummoning}
            className="font-display animate-sheen w-full rounded-md border border-gold/30 px-4 py-4 text-sm font-bold tracking-[0.24em] text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-ember)] disabled:opacity-70 cursor-pointer"
            style={{
              backgroundImage:
                'linear-gradient(100deg, oklch(0.42 0.16 22) 0%, oklch(0.55 0.2 28) 45%, oklch(0.42 0.16 22) 70%)',
            }}
          >
            {isSummoning ? t.summoningBtn : t.summonBtn}
          </button>

          {/* Telegram link */}
          <TelegramButton label={t.telegramBtn} />

          {/* Sound Toggle */}
          <div className="flex items-center justify-between rounded-md border border-border bg-input/30 px-4 py-2.5">
            <span className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
              {t.dragonSound}
            </span>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              className={`rounded-md border px-3 py-1 font-mono text-[11px] tracking-widest transition-colors duration-300 cursor-pointer ${
                muted
                  ? 'border-border text-muted-foreground hover:text-foreground'
                  : 'border-gold/50 bg-secondary text-gold font-bold shadow-[0_0_10px_rgba(255,180,40,0.3)]'
              }`}
            >
              {muted ? (isPt ? 'MUDO' : 'MUTED') : (isPt ? 'LIGADO' : 'ON')}
            </button>
          </div>

          {/* Seal Gate Button */}
          <button
            type="button"
            onClick={onLock}
            className="w-full rounded-md border border-border px-4 py-2 text-xs tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground hover:border-gold/40 cursor-pointer"
          >
            {t.sealGate}
          </button>
        </section>

        {/* Right Column: Live Candles, 6 Layers, Wilson Stats & Signal Analysis */}
        <section className="space-y-6">
          {/* Candle Chart & Live Dragon Analysis Log */}
          <div className="panel-royal p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-display rounded-md border border-gold/30 bg-secondary px-3 py-1 text-xs tracking-[0.2em] text-gold font-semibold">
                {timeframe} TIMEFRAME
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {marketPair} | {platform}
              </span>
            </div>

            <div className="hairline-gold my-4 h-px w-full" />

            {/* Candlestick SVG chart */}
            <CandleChart result={signalResult} emptyText={t.awaiting} />

            {/* Analysis Log */}
            <div className="mt-4 space-y-1.5 rounded-lg border border-border/70 bg-background/60 p-4 font-mono text-[12px] sm:text-[13px] leading-relaxed max-h-56 overflow-y-auto">
              {analysisLogs.length === 0 && !signalResult && (
                <p className="text-muted-foreground">{t.dragonSleeps}</p>
              )}

              {analysisLogs.map((log, idx) => (
                <p
                  key={idx}
                  className={`animate-in fade-in slide-in-from-left-2 duration-300 ${
                    log.tone === 'gold'
                      ? 'text-gold font-semibold'
                      : log.tone === 'cyan'
                      ? 'text-cyan-300'
                      : 'text-success'
                  }`}
                >
                  {log.icon} {log.text}
                </p>
              ))}

              {isSummoning && (
                <p className="text-muted-foreground animate-pulse">{t.analyzing}</p>
              )}

              {signalResult && (
                <div className="pt-2 mt-2 border-t border-border/50 flex flex-wrap items-center justify-between text-xs font-bold text-steel">
                  <span>
                    {t.signalEmitted} {timeframe} • {signalResult.dir} • {signalResult.grade}
                  </span>
                  {signalResult.candlePatternFound && (
                    <span className="text-gold font-mono">
                      🕯️ {signalResult.candlePatternFound}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metric Boxes: Countdown & Throne Verdict */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Candle Countdown */}
            <div className="panel-royal p-5 text-center">
              <p className="text-xs tracking-[0.22em] text-muted-foreground">
                {t.nextCandle} • {timeframe}
              </p>
              <p className="font-display mt-2 text-4xl font-bold tabular-nums text-gold drop-shadow-[0_2px_10px_rgba(255,200,80,0.3)]">
                00:{String(countdown).padStart(2, '0')}
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Expiração sincronizada ao fechamento da vela
              </p>
            </div>

            {/* Throne Verdict */}
            <div
              className={`panel-royal p-5 text-center transition-all duration-500 ${
                signalResult
                  ? 'animate-signal-reveal opacity-100 shadow-[var(--shadow-ember)]'
                  : 'opacity-60'
              }`}
            >
              <p className="text-xs tracking-[0.22em] text-muted-foreground">
                {t.throneVerdict}
              </p>
              {signalResult ? (
                <>
                  <p
                    className="font-display mt-2 text-3xl sm:text-4xl font-black tracking-wider"
                    style={{
                      color:
                        signalResult.dir === 'UP'
                          ? 'var(--success)'
                          : 'var(--destructive)',
                    }}
                  >
                    {signalResult.dir === 'UP' ? '▲ CALL / COMPRA' : '▼ PUT / VENDA'}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {t.confidence}: <span className="text-steel font-bold">{signalResult.confidence}%</span>
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="font-display rounded-md border border-gold/30 bg-secondary px-3 py-0.5 text-[11px] tracking-[0.2em] text-gold font-bold">
                      {signalResult.grade}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                      EV: +${signalResult.stats.expectedValuePerTrade}/$100
                    </span>
                  </div>
                </>
              ) : (
                <p className="font-display mt-2 text-4xl font-black text-muted-foreground">
                  —
                </p>
              )}
            </div>
          </div>

          {/* Deep Analysis Tabs Section (6 Layers, Wilson Stats, Indicators) */}
          {signalResult && (
            <div className="panel-royal animate-signal-reveal p-6 space-y-5">
              {/* Tabs Switcher */}
              <div className="flex border-b border-border/70 pb-2 gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('layers')}
                  className={`font-display text-xs tracking-wider px-3 py-2 rounded-t transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'layers'
                      ? 'border-b-2 border-gold text-gold font-bold bg-secondary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🛡️ {t.layersTab} (6)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stats')}
                  className={`font-display text-xs tracking-wider px-3 py-2 rounded-t transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'stats'
                      ? 'border-b-2 border-gold text-gold font-bold bg-secondary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  📊 {t.statsTab}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('indicators')}
                  className={`font-display text-xs tracking-wider px-3 py-2 rounded-t transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'indicators'
                      ? 'border-b-2 border-gold text-gold font-bold bg-secondary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ⚔️ {t.indicatorsTab} (8)
                </button>
              </div>

              {/* TAB 1: 6 Analysis Layers */}
              {activeTab === 'layers' && (
                <div className="space-y-4">
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Verificação sequencial das 6 camadas institucionais de confluência do robô:
                  </p>

                  {/* Layer pills buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {signalResult.layers.map((layer) => {
                      const isSel = selectedLayerId === layer.id;
                      return (
                        <button
                          key={layer.id}
                          type="button"
                          onClick={() => setSelectedLayerId(layer.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer font-mono text-[11px] ${
                            isSel
                              ? 'border-gold bg-secondary/70 shadow-[0_0_12px_rgba(255,180,40,0.2)]'
                              : 'border-border/70 bg-background/40 hover:border-gold/40'
                          }`}
                        >
                          <span className="truncate pr-1">{layer.name.split('.')[1] || layer.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                              layer.verdict === 'UP'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                                : layer.verdict === 'DOWN'
                                ? 'bg-red-950 text-red-400 border border-red-700/50'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {layer.verdict}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Layer Details Card */}
                  {selectedLayer && (
                    <div className="rounded-lg border border-gold/30 bg-background/80 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                        <span className="font-display text-sm font-bold text-gold">
                          {selectedLayer.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                              selectedLayer.status === 'CONFIRMED'
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {selectedLayer.status}
                          </span>
                          <span
                            className={`font-mono text-xs font-black ${
                              selectedLayer.verdict === 'UP'
                                ? 'text-success'
                                : selectedLayer.verdict === 'DOWN'
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                            }`}
                          >
                            VEREDITO: {selectedLayer.verdict}
                          </span>
                        </div>
                      </div>

                      <p className="font-sans text-xs text-steel leading-relaxed">
                        {selectedLayer.summary}
                      </p>

                      {/* Layer Metrics Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                        {selectedLayer.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="rounded border border-border/60 bg-input/20 px-2.5 py-1.5"
                          >
                            <span className="block text-muted-foreground text-[10px]">{m.label}</span>
                            <span className="font-bold text-foreground">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Wilson Statistics & Break-Even */}
              {activeTab === 'stats' && (
                <div className="space-y-4 font-mono">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Sample Size */}
                    <div className="rounded-lg border border-border/70 bg-background/50 p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Amostra Estatística
                      </p>
                      <p className="text-xl font-bold text-steel mt-1">
                        {signalResult.stats.totalSignalsSampled} Sinais
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {signalResult.stats.wins}W / {signalResult.stats.losses}L
                      </p>
                    </div>

                    {/* Sample Winrate */}
                    <div className="rounded-lg border border-border/70 bg-background/50 p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Taxa Amostral Real
                      </p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">
                        {signalResult.stats.sampleWinRate}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Empírica calculada
                      </p>
                    </div>

                    {/* Wilson 95% Confidence Interval */}
                    <div className="rounded-lg border border-gold/40 bg-secondary/40 p-3 text-center">
                      <p className="text-[10px] text-gold uppercase tracking-wider font-bold">
                        Wilson 95% CI (Real)
                      </p>
                      <p className="text-lg font-black text-gold mt-1">
                        [{signalResult.stats.wilsonLowerBound}% — {signalResult.stats.wilsonUpperBound}%]
                      </p>
                      <p className="text-[10px] text-gold/80">
                        Piso mínimo garantido: {signalResult.stats.wilsonLowerBound}%
                      </p>
                    </div>

                    {/* Break-Even Rate */}
                    <div className="rounded-lg border border-border/70 bg-background/50 p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Break-Even (Payout {signalResult.stats.brokerPayout}%)
                      </p>
                      <p className="text-xl font-bold text-cyan-400 mt-1">
                        {signalResult.stats.breakEvenWinRate}%
                      </p>
                      <p className="text-[10px] text-emerald-400 font-bold">
                        Edge: +{signalResult.stats.expectedEdge}%
                      </p>
                    </div>
                  </div>

                  {/* Visual Edge Comparison Bar */}
                  <div className="rounded-lg border border-border/70 bg-background/60 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-steel font-bold">Vantagem Matemática (Edge Estatístico)</span>
                      <span className="text-emerald-400 font-bold">
                        +{signalResult.stats.expectedEdge}% acima do Break-Even
                      </span>
                    </div>

                    {/* Progress representation */}
                    <div className="relative h-6 w-full rounded-full bg-input overflow-hidden border border-border/60">
                      {/* Break-even marker */}
                      <div
                        className="absolute top-0 bottom-0 bg-red-500/30 border-r-2 border-red-400"
                        style={{ width: `${signalResult.stats.breakEvenWinRate}%` }}
                      />
                      {/* Wilson lower bound fill */}
                      <div
                        className="absolute top-0 bottom-0 bg-gold/30 border-r-2 border-gold"
                        style={{ width: `${signalResult.stats.wilsonLowerBound}%` }}
                      />
                      {/* Actual winrate fill */}
                      <div
                        className="absolute top-0 bottom-0 bg-emerald-500/50 border-r-2 border-emerald-400"
                        style={{ width: `${signalResult.stats.sampleWinRate}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                        Break-Even: {signalResult.stats.breakEvenWinRate}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-full bg-gold" />
                        Wilson Mínimo 95%: {signalResult.stats.wilsonLowerBound}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                        Taxa Real: {signalResult.stats.sampleWinRate}%
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground/90 font-sans leading-relaxed pt-1">
                      💡 <strong>Validação Estatística com Intervalo de Wilson:</strong> Mesmo na hipótese mais conservadora de 95% de confiança estatística, a assertividade mínima estimada é de <strong>{signalResult.stats.wilsonLowerBound}%</strong>, superando com folga o limite de sobrevivência matemática ({signalResult.stats.breakEvenWinRate}%). Expectativa matemática positiva (EV+) de <strong>+${signalResult.stats.expectedValuePerTrade}</strong> a cada $100 apostados.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: Classic Indicators Factors */}
              {activeTab === 'indicators' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
                    <span>
                      {t.entry}: <span className="text-foreground font-bold">{signalResult.entry.toFixed(5)}</span>
                    </span>
                    <span>
                      Alvo / TP: <span className="text-emerald-400 font-bold">{signalResult.targetPrice.toFixed(5)}</span>
                    </span>
                    <span>
                      Proteção / SL: <span className="text-red-400 font-bold">{signalResult.stopLossPrice.toFixed(5)}</span>
                    </span>
                    <span>
                      ATR: <span className="text-foreground font-bold">{signalResult.atr.toFixed(5)}</span> ({signalResult.volatility} {t.volatility})
                    </span>
                  </div>

                  <ul className="grid gap-2 sm:grid-cols-2">
                    {signalResult.factors.map((factor) => (
                      <li
                        key={factor.name}
                        className="flex items-center justify-between rounded-md border border-border/70 bg-background/50 px-3 py-2 font-mono text-[12px]"
                      >
                        <span className="text-muted-foreground">{factor.name}</span>
                        <span
                          className="font-bold"
                          style={{
                            color:
                              factor.verdict === 'UP'
                                ? 'var(--success)'
                                : factor.verdict === 'DOWN'
                                ? 'var(--destructive)'
                                : 'var(--muted-foreground)',
                          }}
                        >
                          {factor.verdict} · {factor.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* War Room Footer */}
      <footer className="relative mt-14 flex flex-col items-center gap-5 px-4 text-center">
        <div className="w-full max-w-sm">
          <TelegramButton label={t.telegramBtn} />
        </div>
        <p className="text-xs tracking-[0.2em] text-muted-foreground">
          {t.footer}
        </p>
      </footer>
    </main>
  );
};
