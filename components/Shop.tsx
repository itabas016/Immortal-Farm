
import React from 'react';
import { PlantType } from '../types';
import { SEEDS } from '../constants';

interface ShopProps {
  selectedSeed: PlantType | null;
  setSelectedSeed: (type: PlantType) => void;
  spiritStones: number;
  t: any;
}

const Shop: React.FC<ShopProps> = ({ selectedSeed, setSelectedSeed, spiritStones, t }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
      <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">{t.sacredSeeds}</h3>
      <div className="space-y-2">
        {Object.values(SEEDS).map((seed) => {
          const isSelected = selectedSeed === seed.type;
          const canAfford = spiritStones >= seed.cost;

          return (
            <button
              key={seed.type}
              onClick={() => setSelectedSeed(seed.type)}
              disabled={!canAfford && !isSelected}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all
                ${isSelected 
                  ? 'bg-amber-600 border-amber-400 shadow-inner' 
                  : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }
                ${!canAfford && !isSelected ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{seed.icon}</span>
                <div className="text-left">
                  <div className="text-[10px] font-bold leading-none uppercase">{t.seeds[seed.type] || seed.type}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{t.growth}: {seed.growthTime}s</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                  ✨ {seed.cost}
                </div>
                <div className="text-[9px] text-emerald-400 leading-none">{t.yield}: {seed.salePrice}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;
