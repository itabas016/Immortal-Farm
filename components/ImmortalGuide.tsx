
import React, { useState, useEffect } from 'react';
import { getImmortalWisdom } from '../services/geminiService';
import { LandPlot, PlotStatus, Language } from '../types';

interface GuideProps {
  rank: string;
  plots: LandPlot[];
  language: Language;
  t: any;
}

const ImmortalGuide: React.FC<GuideProps> = ({ rank, plots, language, t }) => {
  const [wisdom, setWisdom] = useState<string>(t.wisdomPlaceholder);
  const [isLoading, setIsLoading] = useState(false);

  // Update wisdom when language changes
  useEffect(() => {
    setWisdom(t.wisdomPlaceholder);
  }, [language]);

  const fetchWisdom = async () => {
    setIsLoading(true);
    const activePlot = plots.find(p => p.status === PlotStatus.PLANTED);
    const activePlant = activePlot ? (t.seeds[activePlot.plantType!] || activePlot.plantType) : undefined;
    const msg = await getImmortalWisdom(rank, language, activePlant);
    setWisdom(msg);
    setIsLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWisdom();
    }, 5000);
    return () => clearTimeout(timer);
  }, [rank, language]);

  return (
    <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4 shadow-xl relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 text-8xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">📜</div>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20">
          <img src="https://picsum.photos/seed/immortal/100" alt="Master" className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{t.elderMaster}</h4>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[9px] text-indigo-400 font-medium uppercase">{t.attunedQi}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-indigo-500/50"></div>
        <p className={`text-sm italic pl-4 text-indigo-100 leading-relaxed min-h-[60px] transition-opacity duration-500 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
          "{wisdom}"
        </p>
      </div>

      <button 
        onClick={fetchWisdom}
        disabled={isLoading}
        className="mt-4 w-full py-1.5 bg-indigo-600/50 hover:bg-indigo-600 border border-indigo-400/50 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all"
      >
        {isLoading ? t.wisdomLoading : t.askGuidance}
      </button>
    </div>
  );
};

export default ImmortalGuide;
