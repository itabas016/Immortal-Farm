
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlantType, 
  PlotStatus, 
  LandPlot, 
  PlayerState, 
  RankName,
  Language
} from './types';
import { 
  INITIAL_STONES, 
  INITIAL_PLOTS,
  MAX_PLOTS_TOTAL,
  LAND_UPGRADE_BASE_COST,
  SEEDS, 
  RANKS, 
  WATER_DRAIN_RATE, 
  WEED_CHANCE,
  MALL_ITEMS
} from './constants';
import Plot from './components/Plot';
import Shop from './components/Shop';
import Mall from './components/Mall';
import ImmortalGuide from './components/ImmortalGuide';
import { translations } from './locales/translations';
import { saveGame, loadGame, seal, unseal } from './utils/persistence';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [activeTab, setActiveTab] = useState<'SEEDS' | 'MALL'>('SEEDS');
  const [plots, setPlots] = useState<LandPlot[]>([]);
  const [player, setPlayer] = useState<PlayerState>({
    spiritStones: INITIAL_STONES,
    cultivationLevel: 0,
    rank: RankName.MORTAL,
    maxPlots: INITIAL_PLOTS,
    inventory: []
  });

  const [selectedSeed, setSelectedSeed] = useState<PlantType | null>(null);
  const [activeTool, setActiveTool] = useState<'PLANT' | 'WATER' | 'WEED' | 'FERTILIZE' | 'HARVEST'>('PLANT');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Initialize or Load
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setPlots(saved.plots);
      setPlayer(saved.player);
      setLanguage(saved.language);
    } else {
      setPlots(Array.from({ length: MAX_PLOTS_TOTAL }, (_, i) => ({
        id: i,
        status: PlotStatus.EMPTY,
        waterLevel: 100,
        hasWeeds: false,
        isFertilized: false
      })));
    }
    setIsLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!isLoaded) return;
    saveGame({ plots, player, language, lastSave: Date.now() });
  }, [plots, player, language, isLoaded]);

  // Game Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setPlots(currentPlots => currentPlots.map(plot => {
        if (plot.id >= player.maxPlots) return plot;
        let updatedPlot = { ...plot };

        const hasVase = player.inventory.includes('item_vase');
        const drainModifier = hasVase ? 0.4 : 1.0;
        updatedPlot.waterLevel = Math.max(0, updatedPlot.waterLevel - (WATER_DRAIN_RATE * drainModifier));

        if (!updatedPlot.hasWeeds && Math.random() < WEED_CHANCE / 10) {
          updatedPlot.hasWeeds = true;
        }

        if (updatedPlot.status === PlotStatus.PLANTED && updatedPlot.growthStartTime) {
          const seed = SEEDS[updatedPlot.plantType!];
          const elapsed = (Date.now() - updatedPlot.growthStartTime) / 1000;
          
          const waterPenalty = updatedPlot.waterLevel < 20 ? 0.5 : 1;
          const weedPenalty = updatedPlot.hasWeeds ? 0.7 : 1;
          const fertBonus = updatedPlot.isFertilized ? 1.5 : 1;
          const arrayBonus = player.inventory.includes('item_array') ? 1.25 : 1.0;

          if (elapsed >= seed.growthTime / (waterPenalty * weedPenalty * fertBonus * arrayBonus)) {
            updatedPlot.status = PlotStatus.READY;
          }
        }
        return updatedPlot;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [player.maxPlots, player.inventory]);

  // Rank Check
  useEffect(() => {
    const currentRank = RANKS.slice().reverse().find(r => player.cultivationLevel >= r.minXp);
    if (currentRank && currentRank.name !== player.rank) {
      setPlayer(prev => ({ ...prev, rank: currentRank.name }));
    }
  }, [player.cultivationLevel, player.rank]);

  const handlePlotClick = (plotId: number) => {
    const plot = plots[plotId];
    if (plotId >= player.maxPlots) return;

    if (activeTool === 'PLANT') {
      if (plot.status === PlotStatus.EMPTY && selectedSeed) {
        const seed = SEEDS[selectedSeed];
        if (player.spiritStones >= seed.cost) {
          setPlayer(prev => ({ ...prev, spiritStones: prev.spiritStones - seed.cost }));
          updatePlot(plotId, {
            status: PlotStatus.PLANTED,
            plantType: selectedSeed,
            growthStartTime: Date.now(),
            waterLevel: 100,
            hasWeeds: false,
            isFertilized: false
          });
        }
      }
    } else if (activeTool === 'WATER') {
      updatePlot(plotId, { waterLevel: 100 });
    } else if (activeTool === 'WEED') {
      updatePlot(plotId, { hasWeeds: false });
    } else if (activeTool === 'FERTILIZE') {
      if (!plot.isFertilized && player.spiritStones >= 5) {
        setPlayer(prev => ({ ...prev, spiritStones: prev.spiritStones - 5 }));
        updatePlot(plotId, { isFertilized: true });
      }
    } else if (activeTool === 'HARVEST') {
      if (plot.status === PlotStatus.READY && plot.plantType) {
        const seed = SEEDS[plot.plantType];
        setPlayer(prev => ({
          ...prev,
          spiritStones: prev.spiritStones + seed.salePrice,
          cultivationLevel: prev.cultivationLevel + seed.xpYield
        }));
        updatePlot(plotId, {
          status: PlotStatus.EMPTY,
          plantType: undefined,
          growthStartTime: undefined,
          isFertilized: false
        });
      }
    }
  };

  const updatePlot = (id: number, updates: Partial<LandPlot>) => {
    setPlots(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const downloadBackup = () => {
    const state = { plots, player, language, lastSave: Date.now() };
    const sealed = seal(JSON.stringify(state));
    const blob = new Blob([sealed], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spirit_farm_${Date.now()}.dao`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const unsealed = unseal(content);
      if (unsealed) {
        try {
          const state = JSON.parse(unsealed);
          setPlots(state.plots);
          setPlayer(state.player);
          setLanguage(state.language);
          alert(language === 'zh' ? '解封成功！修为已恢复。' : 'Unseal successful! Cultivation restored.');
        } catch (err) {
          alert('Failed to parse backup.');
        }
      } else {
        alert('Invalid seal on backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 p-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-inner">
              <span className="text-2xl">🏮</span>
            </div>
            <div>
              <h1 className="text-xl font-bold chinese-font tracking-widest text-indigo-300 uppercase leading-none">{t.title}</h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex gap-1">
              <button onClick={downloadBackup} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md border border-slate-600" title={t.backup}>📜</button>
              <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md border border-slate-600" title={t.restore}>🔓</button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".dao" onChange={handleFileUpload} />
            </div>
            <button onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')} className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold border border-slate-600 transition-all uppercase">{t.toggleLang}</button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-slate-500 font-bold">{t.spiritStones}</span>
              <span className="text-xl font-bold text-yellow-400">✨ {player.spiritStones.toLocaleString()}</span>
            </div>
            <div className="h-10 w-px bg-slate-700"></div>
            <div className="flex flex-col items-start min-w-[100px]">
              <span className="text-[10px] uppercase text-slate-500 font-bold">{t.realm}</span>
              <span className="text-sm font-bold text-emerald-400">{(t.ranks as any)[player.rank] || player.rank}</span>
              <div className="w-full h-1 bg-slate-700 rounded-full mt-1">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (player.cultivationLevel / (RANKS.find(r => r.name === player.rank)?.minXp || 100)) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 mt-4">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="flex">
              <button onClick={() => setActiveTab('SEEDS')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'SEEDS' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{t.sacredSeeds}</button>
              <button onClick={() => setActiveTab('MALL')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'MALL' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{t.celestialMall}</button>
            </div>
            <div className="p-4">
              {activeTab === 'SEEDS' ? (
                <Shop selectedSeed={selectedSeed} setSelectedSeed={setSelectedSeed} spiritStones={player.spiritStones} t={t} />
              ) : (
                <Mall player={player} setPlayer={setPlayer} t={t} language={language} />
              )}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">{t.divineTools}</h3>
            <div className="grid grid-cols-2 gap-2">
              {[{ id: 'PLANT', icon: '🌱', label: t.sow }, { id: 'WATER', icon: '💧', label: t.dew }, { id: 'WEED', icon: '✂️', label: t.clear }, { id: 'FERTILIZE', icon: '🪄', label: t.qi }, { id: 'HARVEST', icon: '🧺', label: t.reap }].map(tool => (
                <button key={tool.id} onClick={() => setActiveTool(tool.id as any)} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${activeTool === tool.id ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-indigo-500/20 shadow-lg' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}>
                  <span className="text-2xl mb-1">{tool.icon}</span>
                  <span className="text-[10px] font-bold uppercase">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          <ImmortalGuide rank={player.rank} plots={plots} language={language} t={t} />
        </div>

        <div className="lg:col-span-3">
          <div className="bg-emerald-900/10 rounded-3xl p-6 border border-emerald-500/20 backdrop-blur-sm relative overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 relative z-10">
              {plots.map((plot, i) => (
                <Plot key={plot.id} plot={plot} onClick={() => handlePlotClick(plot.id)} activeTool={activeTool} t={t} isLocked={i >= player.maxPlots} />
              ))}
            </div>
          </div>
          <div className="mt-8 text-center text-slate-500 text-xs italic">
            {language === 'zh' ? "“修仙之路，始于足下，勤耕不辍，方得长生。”" : "\"Patience is the first step on the thousand-mile journey to the Heavens.\""}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
