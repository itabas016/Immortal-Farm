
import React from 'react';
import { LandPlot, PlotStatus } from '../types';
import { SEEDS } from '../constants';

interface PlotProps {
  plot: LandPlot;
  onClick: () => void;
  activeTool: string;
  t: any;
  isLocked?: boolean;
}

const Plot: React.FC<PlotProps> = ({ plot, onClick, activeTool, t, isLocked }) => {
  const seed = plot.plantType ? SEEDS[plot.plantType] : null;

  const getGrowthPercentage = () => {
    if (plot.status !== PlotStatus.PLANTED || !plot.growthStartTime || !seed) return 0;
    const elapsed = (Date.now() - plot.growthStartTime) / 1000;
    return Math.min(100, (elapsed / seed.growthTime) * 100);
  };

  const isHarvestable = plot.status === PlotStatus.READY;
  const isWithered = plot.waterLevel <= 0;

  if (isLocked) {
    return (
      <div className="relative aspect-square rounded-2xl bg-slate-800/20 border-2 border-slate-700/50 flex flex-col items-center justify-center grayscale opacity-40">
        <span className="text-2xl mb-1">🔒</span>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`relative aspect-square rounded-2xl cursor-pointer transition-all duration-300 group
        ${plot.status === PlotStatus.EMPTY ? 'bg-amber-900/30 border-2 border-dashed border-amber-800/50 hover:bg-amber-800/40' : 'bg-amber-900/50 border-2 border-amber-800 shadow-inner'}
        ${isHarvestable ? 'ring-4 ring-yellow-400/50 animate-pulse' : ''}
        ${isWithered ? 'grayscale opacity-70' : ''}
      `}
    >
      <div className="absolute inset-0 p-2 overflow-hidden opacity-30 pointer-events-none">
        <div className="w-full h-full border border-amber-600 rounded-lg"></div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
        {plot.status === PlotStatus.EMPTY ? (
          <span className="text-amber-900/40 group-hover:scale-110 transition-transform text-[8px] font-bold uppercase tracking-tighter">
            {activeTool === 'PLANT' ? t.sow : ''}
          </span>
        ) : (
          <>
            <div className={`text-4xl transition-transform duration-500 
              ${plot.status === PlotStatus.READY ? 'scale-125' : 'scale-75 animate-bounce'}`}>
              {seed?.icon}
            </div>
            
            {plot.status === PlotStatus.PLANTED && (
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{ width: `${getGrowthPercentage()}%` }}
                />
              </div>
            )}
            
            {plot.status === PlotStatus.READY && (
              <div className="absolute top-1 right-1 bg-yellow-400 text-amber-900 text-[10px] font-bold px-1.5 rounded animate-bounce">
                {t.ready}
              </div>
            )}
          </>
        )}
      </div>

      {!isLocked && plot.status !== PlotStatus.EMPTY && (
        <div className="absolute bottom-1 left-2 right-2 flex justify-between items-center">
          <div className="flex items-center">
            <span className={`text-[8px] font-bold ${plot.waterLevel < 20 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
              💧 {Math.round(plot.waterLevel)}%
            </span>
          </div>
          {plot.hasWeeds && <div className="bg-red-500/80 rounded-full p-0.5 animate-pulse text-[10px]">🌿</div>}
          {plot.isFertilized && <div className="bg-purple-500/80 rounded-full p-0.5 text-[10px]">✨</div>}
        </div>
      )}
    </div>
  );
};

export default Plot;
