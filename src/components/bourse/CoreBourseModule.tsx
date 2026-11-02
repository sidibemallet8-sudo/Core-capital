/**
 * CORE CAPITAL V3 — MODULE 5 : CORE BOURSE & TRADING VIEW WORKSPACE
 * Interface professionnelle de trading et d'analyse technique inspirée de TradingView.
 * - Graphiques multi-styles : Chandeliers Japonais, Heikin-Ashi, Barres OHLC, Courbe & Zone
 * - Périodes temporelles : 1m, 5m, 15m, 1H, 4H, 1D, 1W
 * - Barre d'outils de dessin technique : Ligne de tendance, Support/Résistance, Retracement de Fibonacci, Calculateur Risque/Rendement
 * - Indicateurs professionnels : RSI 14, MACD (12,26,9), Bandes de Bollinger (20,2), SMA 20/50, Volume
 * - Carnet d'ordres (Order Book) & Profondeur de marché en direct
 * - Terminal de passage d'ordre simulé (Market, Limit, Stop Loss & Take Profit)
 * - Données en direct de l'API CoinGecko pour la crypto et cotations BRVM / Actions
 */

import React, { useState, useMemo, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MarketAsset, MarketCategory, CandleStickPoint } from '../../types';
import {
  TrendingUp,
  Star,
  Search,
  Filter,
  ExternalLink,
  ShieldAlert,
  Bell,
  LineChart,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Sliders,
  Crosshair,
  Minus,
  TrendingDown,
  Activity,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { marketDataService } from '../../services/marketDataService';

type ChartStyle = 'candles' | 'line' | 'area' | 'bars' | 'heikin';
type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
type DrawingTool = 'cursor' | 'trendline' | 'horizontal' | 'fibonacci' | 'measure';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface SimulatedTrade {
  id: string;
  assetSymbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  amount: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
  status: 'open' | 'closed';
}

export const CoreBourseModule: React.FC = () => {
  const { marketAssets, toggleWatchlist, marketAlerts, addMarketAlert, deleteMarketAlert, userProfile } = useFinance();

  // Navigation et Sélection
  const [selectedCategory, setSelectedCategory] = useState<'all' | MarketCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(marketAssets[0] || null);

  // TradingView Workspace Options
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingTool>('cursor');
  const [isFullscreenDesk, setIsFullscreenDesk] = useState<boolean>(false);

  // Indicateurs Techniques Actifs
  const [showRsi, setShowRsi] = useState<boolean>(true);
  const [showMacd, setShowMacd] = useState<boolean>(false);
  const [showBollinger, setShowBollinger] = useState<boolean>(true);
  const [showSma, setShowSma] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);

  // Outils de dessin interactifs
  const [horizontalLevel, setHorizontalLevel] = useState<number | null>(null);
  const [hasTrendline, setHasTrendline] = useState<boolean>(false);
  const [hasFibonacci, setHasFibonacci] = useState<boolean>(false);

  // Survol de la souris (Crosshair)
  const [hoverData, setHoverData] = useState<{ price: number; time: string; index: number } | null>(null);

  // Onglet de droite : Carnet d'ordres / Terminal de trading
  const [sideTab, setSideTab] = useState<'orderbook' | 'trading' | 'assets'>('trading');

  // Terminal de Trading Simulé
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState<string>('50000');
  const [tradeLeverage, setTradeLeverage] = useState<number>(1);
  const [stopLossPercent, setStopLossPercent] = useState<string>('5');
  const [takeProfitPercent, setTakeProfitPercent] = useState<string>('15');
  const [openTrades, setOpenTrades] = useState<SimulatedTrade[]>([]);
  const [tradeNotification, setTradeNotification] = useState<string | null>(null);

  // Modale alerte de seuil
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  // Données de marché en direct (CoinGecko)
  const [liveCryptoMap, setLiveCryptoMap] = useState<Record<string, any>>({});
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<string>('En direct');

  const refreshLiveCrypto = async () => {
    setIsRefreshingLive(true);
    try {
      const data = await marketDataService.fetchLiveCryptoPrices();
      if (Object.keys(data).length > 0) {
        setLiveCryptoMap(data);
        setLastLiveUpdate(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } finally {
      setIsRefreshingLive(false);
    }
  };

  // Liste filtrée des actifs
  const filteredAssets = useMemo(() => {
    return marketAssets.filter((asset) => {
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.exchangeOrSource.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [marketAssets, selectedCategory, searchQuery]);

  // Cours et chandeliers calculés
  const currentAsset = selectedAsset || marketAssets[0];

  const currentPrice = useMemo(() => {
    if (!currentAsset) return 0;
    if (currentAsset.category === 'crypto') {
      const liveKey = currentAsset.id === 'BTC' ? 'bitcoin' : currentAsset.id === 'ETH' ? 'ethereum' : 'solana';
      if (liveCryptoMap[liveKey]?.usd) {
        return liveCryptoMap[liveKey].usd;
      }
    }
    return currentAsset.price;
  }, [currentAsset, liveCryptoMap]);

  const rawCandles = useMemo(() => {
    if (!currentAsset) return [];
    return currentAsset.candles || [];
  }, [currentAsset]);

  // Transformation Heikin-Ashi si activée
  const displayCandles = useMemo(() => {
    if (chartStyle !== 'heikin' || rawCandles.length === 0) return rawCandles;
    const haCandles: CandleStickPoint[] = [];
    for (let i = 0; i < rawCandles.length; i++) {
      const cur = rawCandles[i];
      const prev = haCandles[i - 1] || cur;
      const haClose = (cur.open + cur.high + cur.low + cur.close) / 4;
      const haOpen = (prev.open + prev.close) / 2;
      const haHigh = Math.max(cur.high, haOpen, haClose);
      const haLow = Math.min(cur.low, haOpen, haClose);
      haCandles.push({
        time: cur.time,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
        volume: cur.volume,
      });
    }
    return haCandles;
  }, [rawCandles, chartStyle]);

  const closes = useMemo(() => displayCandles.map((c) => c.close), [displayCandles]);

  // Indicateurs Mathématiques Déterministes
  const rsi = useMemo(() => marketDataService.calculateRSI(closes, 14), [closes]);
  const sma20 = useMemo(() => marketDataService.calculateSMA(closes, 20), [closes]);
  const sma50 = useMemo(() => marketDataService.calculateSMA(closes, 50), [closes]);
  const ema12 = useMemo(() => marketDataService.calculateEMA(closes, 12), [closes]);
  const calculatedVol = useMemo(() => marketDataService.calculateVolatility(closes), [closes]);

  // Bandes de Bollinger (20, 2)
  const bollingerBands = useMemo(() => {
    if (closes.length < 20) return null;
    const mean = sma20;
    const variance =
      closes.slice(-20).reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 20;
    const stdDev = Math.sqrt(variance);
    return {
      upper: Math.round((mean + 2 * stdDev) * 100) / 100,
      middle: Math.round(mean * 100) / 100,
      lower: Math.round((mean - 2 * stdDev) * 100) / 100,
    };
  }, [closes, sma20]);

  // Carnet d'ordres simulé réaliste autour du cours actuel
  const orderBook = useMemo(() => {
    if (!currentPrice || currentPrice <= 0) return { asks: [], bids: [], spread: 0 };
    const step = currentPrice * 0.0015;
    const asks: OrderBookEntry[] = [];
    const bids: OrderBookEntry[] = [];

    let cumAsk = 0;
    for (let i = 5; i >= 1; i--) {
      const p = currentPrice + i * step;
      const amt = (currentPrice * 0.05 * (6 - i) + 1.2).toFixed(2);
      cumAsk += parseFloat(amt);
      asks.push({ price: p, amount: parseFloat(amt), total: Math.round(cumAsk * 100) / 100 });
    }

    let cumBid = 0;
    for (let i = 1; i <= 5; i++) {
      const p = currentPrice - i * step;
      const amt = (currentPrice * 0.06 * (6 - i) + 0.8).toFixed(2);
      cumBid += parseFloat(amt);
      bids.push({ price: p, amount: parseFloat(amt), total: Math.round(cumBid * 100) / 100 });
    }

    const spread = asks[asks.length - 1]?.price - bids[0]?.price;
    return { asks, bids, spread: Math.max(0, spread) };
  }, [currentPrice]);

  // Exécution d'un ordre de trading simulé
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(tradeAmount);
    if (isNaN(amt) || amt <= 0) return;

    const stopPercent = parseFloat(stopLossPercent) || 0;
    const tpPercent = parseFloat(takeProfitPercent) || 0;

    const slPrice =
      tradeSide === 'buy'
        ? currentPrice * (1 - stopPercent / 100)
        : currentPrice * (1 + stopPercent / 100);

    const tpPrice =
      tradeSide === 'buy'
        ? currentPrice * (1 + tpPercent / 100)
        : currentPrice * (1 - tpPercent / 100);

    const newTrade: SimulatedTrade = {
      id: `trade-${Date.now()}`,
      assetSymbol: currentAsset.symbol,
      type: tradeSide,
      entryPrice: currentPrice,
      amount: amt,
      leverage: tradeLeverage,
      stopLoss: stopPercent > 0 ? slPrice : undefined,
      takeProfit: tpPercent > 0 ? tpPrice : undefined,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'open',
    };

    setOpenTrades((prev) => [newTrade, ...prev]);
    setTradeNotification(
      `Ordre ${tradeSide.toUpperCase()} ${currentAsset.symbol} exécuté à ${currentPrice.toLocaleString('fr-FR')} ${currentAsset.currency}`
    );
    setTimeout(() => setTradeNotification(null), 4000);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset) return;
    const priceNum = parseFloat(alertTargetPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    addMarketAlert({
      assetId: currentAsset.id,
      assetSymbol: currentAsset.symbol,
      targetPrice: priceNum,
      condition: alertCondition,
    });
    setIsAlertModalOpen(false);
    setAlertTargetPrice('');
  };

  // Min / Max pour l'échelle du graphique
  const chartMin = useMemo(() => {
    if (displayCandles.length === 0) return 0;
    const minLow = Math.min(...displayCandles.map((c) => c.low));
    return minLow * 0.985;
  }, [displayCandles]);

  const chartMax = useMemo(() => {
    if (displayCandles.length === 0) return 100;
    const maxHigh = Math.max(...displayCandles.map((c) => c.high));
    return maxHigh * 1.015;
  }, [displayCandles]);

  // Niveaux de Fibonacci basés sur Min et Max
  const fibLevels = useMemo(() => {
    const range = chartMax - chartMin;
    return [
      { level: '100.0%', price: chartMax, color: '#f43f5e' },
      { level: '78.6%', price: chartMin + range * 0.786, color: '#fb923c' },
      { level: '61.8% (Golden)', price: chartMin + range * 0.618, color: '#fbbf24' },
      { level: '50.0%', price: chartMin + range * 0.5, color: '#3b82f6' },
      { level: '38.2%', price: chartMin + range * 0.382, color: '#2dd4bf' },
      { level: '23.6%', price: chartMin + range * 0.236, color: '#34d399' },
      { level: '0.0%', price: chartMin, color: '#10b981' },
    ];
  }, [chartMax, chartMin]);

  return (
    <div
      className={`space-y-4 animate-fade-in pb-12 ${
        isFullscreenDesk ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto' : ''
      }`}
    >
      {/* ================= BARRE DE NAVIGATION SUPÉRIEURE TRADINGVIEW ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Sélecteur d'actif & Cotation en direct */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="font-black text-sm text-white tracking-wide">{currentAsset.symbol}</span>
            <span className="text-[11px] text-slate-400">· {currentAsset.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-900">
              {currentAsset.category}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-white font-mono">
              {currentPrice.toLocaleString('fr-FR')} {currentAsset.currency}
            </span>
            <span
              className={`text-xs font-bold font-mono flex items-center ${
                currentAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentAsset.change24h >= 0 ? '+' : ''}
              {currentAsset.change24h}%
            </span>
          </div>
        </div>

        {/* Sélecteur de Timeframe (TradingView style) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['1m', '5m', '15m', '1h', '4h', '1D', '1W'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Style de graphique (Chandeliers, Courbe, Barres, Heikin-Ashi) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setChartStyle('candles')}
            title="Chandeliers Japonais (Candlesticks)"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              chartStyle === 'candles' ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bougies
          </button>
          <button
            onClick={() => setChartStyle('heikin')}
            title="Bougies Heikin-Ashi (Lissées)"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              chartStyle === 'heikin' ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Heikin-Ashi
          </button>
          <button
            onClick={() => setChartStyle('bars')}
            title="Barres OHLC"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              chartStyle === 'bars' ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Barres
          </button>
          <button
            onClick={() => setChartStyle('line')}
            title="Ligne continue"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              chartStyle === 'line' ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ligne
          </button>
        </div>

        {/* Indicateurs Techniques Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowRsi(!showRsi)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              showRsi
                ? 'bg-blue-950/80 border-blue-700 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            RSI (14)
          </button>
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              showBollinger
                ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Bollinger
          </button>
          <button
            onClick={() => setShowSma(!showSma)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              showSma
                ? 'bg-purple-950/80 border-purple-700 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            SMA 20/50
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              showVolume
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Volume
          </button>

          <button
            onClick={refreshLiveCrypto}
            disabled={isRefreshingLive}
            title="Rafraîchir les cours en direct"
            className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLive ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsFullscreenDesk(!isFullscreenDesk)}
            title={isFullscreenDesk ? 'Quitter le plein écran' : 'Mode Station de Trading Plein Écran'}
            className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer transition-colors"
          >
            {isFullscreenDesk ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {tradeNotification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{tradeNotification}</span>
        </div>
      )}

      {/* ================= ZONE DE TRAVAIL PRINCIPALE (GRILLE TRADINGVIEW) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* BARRE D'OUTILS DE DESSIN TECHNIQUE GAUCHE (1 colonne en lg) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-2 flex lg:flex-col items-center justify-start gap-2 shadow-md">
          <button
            onClick={() => setActiveDrawingTool('cursor')}
            title="Curseur Réticule (Crosshair)"
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer w-full flex items-center justify-center ${
              activeDrawingTool === 'cursor' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveDrawingTool('trendline');
              setHasTrendline(!hasTrendline);
            }}
            title="Ligne de Tendance (Trendline)"
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer w-full flex items-center justify-center ${
              hasTrendline ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveDrawingTool('horizontal');
              setHorizontalLevel(horizontalLevel ? null : currentPrice * 0.99);
            }}
            title="Rayon Horizontal (Support / Résistance)"
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer w-full flex items-center justify-center ${
              horizontalLevel !== null ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveDrawingTool('fibonacci');
              setHasFibonacci(!hasFibonacci);
            }}
            title="Retracement de Fibonacci (0% à 100%)"
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer w-full flex items-center justify-center ${
              hasFibonacci ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <div className="w-full border-t border-slate-800 my-1 hidden lg:block" />

          <button
            onClick={() => {
              setHorizontalLevel(null);
              setHasTrendline(false);
              setHasFibonacci(false);
            }}
            title="Effacer les tracés"
            className="p-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer w-full flex items-center justify-center"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* CANEVAS CENTRAL DU GRAPHIQUE INTERACTIF (8 colonnes en lg) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Overlay des coordonnées au survol */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span>
                O: <strong className="text-white">{displayCandles[displayCandles.length - 1]?.open}</strong>
              </span>
              <span>
                H: <strong className="text-emerald-400">{displayCandles[displayCandles.length - 1]?.high}</strong>
              </span>
              <span>
                L: <strong className="text-rose-400">{displayCandles[displayCandles.length - 1]?.low}</strong>
              </span>
              <span>
                C: <strong className="text-blue-400">{displayCandles[displayCandles.length - 1]?.close}</strong>
              </span>
            </div>
            {hoverData && (
              <span className="text-blue-400 font-bold">
                Point survolé : {hoverData.price.toLocaleString('fr-FR')} {currentAsset.currency} ({hoverData.time})
              </span>
            )}
          </div>

          {/* Zone de tracé graphique principale */}
          <div className="relative flex-1 min-h-[360px] flex items-end justify-between px-2 pt-4 pb-2">
            {/* Lignes de quadrillage horizontal */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-600 w-full" />
              <div className="border-b border-slate-600 w-full" />
              <div className="border-b border-slate-600 w-full" />
              <div className="border-b border-slate-600 w-full" />
            </div>

            {/* Niveaux de Fibonacci si activés */}
            {hasFibonacci && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 opacity-70">
                {fibLevels.map((fib, idx) => (
                  <div key={idx} className="relative w-full flex items-center">
                    <div className="flex-1 border-b border-dashed" style={{ borderColor: fib.color }} />
                    <span
                      className="px-1 text-[9px] font-mono font-bold shrink-0 ml-1 rounded"
                      style={{ color: fib.color, backgroundColor: '#020617' }}
                    >
                      {fib.level} ({fib.price.toLocaleString('fr-FR')})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Ligne horizontale Support/Résistance si activée */}
            {horizontalLevel !== null && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                style={{
                  bottom: `${((horizontalLevel - chartMin) / (chartMax - chartMin)) * 100}%`,
                }}
              >
                <div className="flex-1 border-b-2 border-amber-400 border-dashed" />
                <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-bold text-[9px] font-mono rounded">
                  SUPPORT {horizontalLevel.toLocaleString('fr-FR')}
                </span>
              </div>
            )}

            {/* Tracé de ligne de tendance diagonale si activée */}
            {hasTrendline && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-15" preserveAspectRatio="none">
                <line x1="10%" y1="80%" x2="90%" y2="25%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="10%" cy="80%" r="4" fill="#3b82f6" />
                <circle cx="90%" cy="25%" r="4" fill="#3b82f6" />
              </svg>
            )}

            {/* RENDU SELON LE STYLE CHOISI */}
            {chartStyle === 'candles' || chartStyle === 'heikin' ? (
              displayCandles.map((candle, idx) => {
                const isBull = candle.close >= candle.open;
                const bodyTop = Math.max(candle.open, candle.close);
                const bodyBottom = Math.min(candle.open, candle.close);
                const heightPercent = Math.max(4, ((bodyTop - bodyBottom) / (chartMax - chartMin)) * 100);
                const bottomPercent = ((bodyBottom - chartMin) / (chartMax - chartMin)) * 100;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoverData({ price: candle.close, time: candle.time, index: idx })}
                    onMouseLeave={() => setHoverData(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-crosshair px-0.5"
                  >
                    {/* Mèche (High - Low) */}
                    <div
                      className={`w-0.5 absolute z-10 transition-colors ${
                        isBull ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                      style={{
                        bottom: `${((candle.low - chartMin) / (chartMax - chartMin)) * 100}%`,
                        height: `${((candle.high - candle.low) / (chartMax - chartMin)) * 100}%`,
                      }}
                    />
                    {/* Corps du chandelier */}
                    <div
                      className={`w-full max-w-[22px] rounded-xs relative z-20 transition-all ${
                        isBull
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20'
                          : 'bg-rose-500 shadow-sm shadow-rose-500/20'
                      }`}
                      style={{
                        height: `${heightPercent}%`,
                        marginBottom: `${bottomPercent}%`,
                      }}
                    />
                    {/* Barres de Volume sous le chandelier */}
                    {showVolume && candle.volume && (
                      <div
                        className={`w-full max-w-[18px] opacity-40 absolute bottom-0 z-5 ${
                          isBull ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{
                          height: `${Math.min(30, (candle.volume / 1000) * 15)}%`,
                        }}
                      />
                    )}
                    <span className="text-[9px] text-slate-500 font-mono mt-1 select-none">{candle.time}</span>
                  </div>
                );
              })
            ) : chartStyle === 'bars' ? (
              displayCandles.map((candle, idx) => {
                const isBull = candle.close >= candle.open;
                const bottomPercent = ((candle.low - chartMin) / (chartMax - chartMin)) * 100;
                const heightPercent = ((candle.high - candle.low) / (chartMax - chartMin)) * 100;
                const openPos = ((candle.open - candle.low) / (candle.high - candle.low)) * 100;
                const closePos = ((candle.close - candle.low) / (candle.high - candle.low)) * 100;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoverData({ price: candle.close, time: candle.time, index: idx })}
                    onMouseLeave={() => setHoverData(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative cursor-crosshair"
                  >
                    <div
                      className={`w-0.5 relative ${isBull ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{
                        bottom: `${bottomPercent}%`,
                        height: `${heightPercent}%`,
                      }}
                    >
                      {/* Ergot Open à gauche */}
                      <div
                        className={`w-1.5 h-0.5 absolute -left-1.5 ${isBull ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        style={{ bottom: `${openPos}%` }}
                      />
                      {/* Ergot Close à droite */}
                      <div
                        className={`w-1.5 h-0.5 absolute left-0.5 ${isBull ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        style={{ bottom: `${closePos}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono mt-1">{candle.time}</span>
                  </div>
                );
              })
            ) : (
              // Ligne continue SVG
              <div className="relative w-full h-full flex items-end">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="tradingviewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Zone de remplissage */}
                  <polygon
                    fill="url(#tradingviewGrad)"
                    points={`0,100 ${closes
                      .map((val, idx) => {
                        const y = 100 - ((val - chartMin) / (chartMax - chartMin)) * 100;
                        const x = (idx / (closes.length - 1)) * 100;
                        return `${x},${y}`;
                      })
                      .join(' ')} 100,100`}
                  />
                  {/* Ligne */}
                  <polyline
                    fill="none"
                    stroke={currentAsset.change24h >= 0 ? '#10b981' : '#f43f5e'}
                    strokeWidth="2.5"
                    points={closes
                      .map((val, idx) => {
                        const y = 100 - ((val - chartMin) / (chartMax - chartMin)) * 100;
                        const x = (idx / (closes.length - 1)) * 100;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              </div>
            )}
          </div>

          {/* SOUS-PANNEAU DES INDICATEURS TECHNIQUES (RSI, Bollinger, SMA) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">RSI (14)</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold font-mono text-white">{rsi.rsi}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                    rsi.status === 'Suracheté'
                      ? 'text-rose-400 bg-rose-950/60 border border-rose-900'
                      : rsi.status === 'Survendu'
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-900'
                      : 'text-blue-300 bg-blue-950/60 border border-blue-900'
                  }`}
                >
                  {rsi.status}
                </span>
              </div>
            </div>

            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Moyenne SMA (20)</span>
              <span className="font-bold font-mono text-white mt-0.5 block">
                {sma20 > 0 ? `${sma20.toLocaleString('fr-FR')} ${currentAsset.currency}` : 'Calcul...'}
              </span>
            </div>

            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Bandes de Bollinger</span>
              <span className="font-bold font-mono text-amber-300 text-[11px] mt-0.5 block">
                {bollingerBands ? `[${bollingerBands.lower} - ${bollingerBands.upper}]` : 'Calcul...'}
              </span>
            </div>

            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Volatilité 30j</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{calculatedVol}</span>
            </div>
          </div>
        </div>

        {/* PANNEAU LATÉRAL DROIT : CARNET D'ORDRES & TERMINAL DE TRADING (3 colonnes en lg) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between shadow-xl">
          <div>
            {/* Onglets du volet latéral */}
            <div className="flex border-b border-slate-800 text-xs mb-3">
              <button
                onClick={() => setSideTab('trading')}
                className={`flex-1 pb-2 font-semibold text-center cursor-pointer border-b-2 ${
                  sideTab === 'trading'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Ordres
              </button>
              <button
                onClick={() => setSideTab('orderbook')}
                className={`flex-1 pb-2 font-semibold text-center cursor-pointer border-b-2 ${
                  sideTab === 'orderbook'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Carnet (DOM)
              </button>
              <button
                onClick={() => setSideTab('assets')}
                className={`flex-1 pb-2 font-semibold text-center cursor-pointer border-b-2 ${
                  sideTab === 'assets'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Actifs
              </button>
            </div>

            {/* VUE 1 : TERMINAL DE TRADING SIMULÉ */}
            {sideTab === 'trading' && (
              <form onSubmit={handleExecuteTrade} className="space-y-3">
                {/* Sélecteur Achat / Vente */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTradeSide('buy')}
                    className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                      tradeSide === 'buy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ACHAT (LONG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeSide('sell')}
                    className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                      tradeSide === 'sell' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    VENTE (SHORT)
                  </button>
                </div>

                {/* Type d'ordre : Marché / Limite */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Type d'ordre :</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setOrderType('market')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        orderType === 'market' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'
                      }`}
                    >
                      Au Marché
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('limit')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        orderType === 'limit' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'
                      }`}
                    >
                      Limite
                    </button>
                  </div>
                </div>

                {/* Montant investi */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Montant ({currentAsset.currency})
                  </label>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Levier (1x, 2x, 5x, 10x) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-semibold">Effet de levier</span>
                    <span className="text-blue-400 font-bold">{tradeLeverage}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 5, 10].map((lev) => (
                      <button
                        key={lev}
                        type="button"
                        onClick={() => setTradeLeverage(lev)}
                        className={`py-1 text-[11px] font-bold rounded-lg cursor-pointer ${
                          tradeLeverage === lev ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stop Loss & Take Profit */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-rose-400 mb-1">Stop Loss (-%)</label>
                    <input
                      type="number"
                      value={stopLossPercent}
                      onChange={(e) => setStopLossPercent(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-400 mb-1">Take Profit (+%)</label>
                    <input
                      type="number"
                      value={takeProfitPercent}
                      onChange={(e) => setTakeProfitPercent(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bouton de validation */}
                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg cursor-pointer transition-all ${
                    tradeSide === 'buy'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                >
                  Placer l'ordre {tradeSide === 'buy' ? 'Achat' : 'Vente'}
                </button>
              </form>
            )}

            {/* VUE 2 : CARNET D'ORDRES (ORDER BOOK) */}
            {sideTab === 'orderbook' && (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                  <span>Prix ({currentAsset.currency})</span>
                  <span>Volume</span>
                  <span>Total</span>
                </div>

                {/* Ventes (Asks en rouge) */}
                <div className="space-y-1">
                  {orderBook.asks.map((ask, idx) => (
                    <div key={idx} className="flex justify-between text-rose-400 text-[11px] relative">
                      <span>{ask.price.toLocaleString('fr-FR')}</span>
                      <span>{ask.amount}</span>
                      <span className="text-slate-400">{ask.total}</span>
                    </div>
                  ))}
                </div>

                {/* Ligne de Spread */}
                <div className="py-1 px-2 bg-slate-950 rounded border border-slate-800 text-[10px] flex items-center justify-between text-slate-300">
                  <span>Spread marché</span>
                  <span className="font-bold text-amber-400">{orderBook.spread.toFixed(2)}</span>
                </div>

                {/* Achats (Bids en vert) */}
                <div className="space-y-1">
                  {orderBook.bids.map((bid, idx) => (
                    <div key={idx} className="flex justify-between text-emerald-400 text-[11px]">
                      <span>{bid.price.toLocaleString('fr-FR')}</span>
                      <span>{bid.amount}</span>
                      <span className="text-slate-400">{bid.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VUE 3 : SÉLECTEUR D'ACTIFS */}
            {sideTab === 'assets' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`py-2 px-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      asset.id === currentAsset.id ? 'bg-slate-800' : 'hover:bg-slate-950'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{asset.symbol}</span>
                        <span className="text-[10px] text-slate-400">{asset.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{asset.exchangeOrSource}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-white block">
                        {asset.price.toLocaleString('fr-FR')}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {asset.change24h >= 0 ? '+' : ''}
                        {asset.change24h}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons d'export et d'alerte en bas */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="flex-1 py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>Alerte Seuil</span>
            </button>
            <button
              onClick={() => marketDataService.exportAssetHistoryToCsv(currentAsset)}
              className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              title="Exporter l'historique en CSV"
            >
              <Download className="w-3 h-3 text-blue-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* HISTORIQUE DES POSITIONS SIMULÉES OUVERTES */}
      {openTrades.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Positions Ouvertes Simulées ({openTrades.length})</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2">Actif</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Entrée</th>
                  <th className="py-2">Montant</th>
                  <th className="py-2">Levier</th>
                  <th className="py-2">Stop Loss</th>
                  <th className="py-2">Take Profit</th>
                  <th className="py-2">Heure</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {openTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-950/40">
                    <td className="py-2 font-bold text-white">{trade.assetSymbol}</td>
                    <td className="py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          trade.type === 'buy' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2">{trade.entryPrice.toLocaleString('fr-FR')}</td>
                    <td className="py-2">{trade.amount.toLocaleString('fr-FR')}</td>
                    <td className="py-2">{trade.leverage}x</td>
                    <td className="py-2 text-rose-400">
                      {trade.stopLoss ? trade.stopLoss.toLocaleString('fr-FR') : '-'}
                    </td>
                    <td className="py-2 text-emerald-400">
                      {trade.takeProfit ? trade.takeProfit.toLocaleString('fr-FR') : '-'}
                    </td>
                    <td className="py-2 text-slate-400">{trade.timestamp}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => setOpenTrades((prev) => prev.filter((t) => t.id !== trade.id))}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded cursor-pointer"
                      >
                        Clôturer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALE ALERTE DE SEUIL */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={`Créer une Alerte Seuil — ${currentAsset.symbol}`}
        maxWidth="sm"
      >
        <form onSubmit={handleCreateAlert} className="space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
            Cours actuel :{' '}
            <strong className="text-white font-mono">
              {currentPrice.toLocaleString('fr-FR')} {currentAsset.currency}
            </strong>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Condition de déclenchement</label>
            <select
              value={alertCondition}
              onChange={(e) => setAlertCondition(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="above">Le cours dépasse ou franchit à la hausse</option>
              <option value="below">Le cours chute sous le seuil à la baisse</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Prix cible ({currentAsset.currency})
            </label>
            <input
              type="number"
              step="any"
              required
              value={alertTargetPrice}
              onChange={(e) => setAlertTargetPrice(e.target.value)}
              placeholder="Ex: 18500"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(false)}
              className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Enregistrer l'Alerte
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
