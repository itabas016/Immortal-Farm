
import React from 'react';
import { PlayerState, Language } from '../types';
import { MALL_ITEMS, LAND_UPGRADE_BASE_COST, MAX_PLOTS_TOTAL } from '../constants';

interface MallProps {
  player: PlayerState;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>;
  t: any;
  language: Language;
}

const Mall: React.FC<MallProps> = ({ player, setPlayer, t, language }) => {
  const nextLandCost = Math.floor(LAND_UPGRADE_BASE_COST * Math.pow(2.2, player.maxPlots - 5));
  const canBuyLand = player.maxPlots < MAX_PLOTS_TOTAL && player.spiritStones >= nextLandCost;

  const buyLand = () => {
    if (canBuyLand) {
      setPlayer(prev => ({
        ...prev,
        spiritStones: prev.spiritStones - nextLandCost,
        maxPlots: prev.maxPlots + 1
      }));
    }
  };

  const buyItem = (itemId: string, cost: number) => {
    if (player.spiritStones >= cost && !player.inventory.includes(itemId)) {
      setPlayer(prev => ({
        ...prev,
        spiritStones: prev.spiritStones - cost,
        inventory: [...prev.inventory, itemId]
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Land Upgrade */}
      <div className="p-3 bg-slate-700/50 border border-indigo-500/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <div className="text-[10px] font-bold uppercase">{t.buyLand}</div>
              <div className="text-[9px] text-slate-400">({player.maxPlots} / {MAX_PLOTS_TOTAL})</div>
            </div>
          </div>
          <button 
            disabled={!canBuyLand}
            onClick={buyLand}
            className={`px-3 py-1 rounded text-[10px] font-bold ${canBuyLand ? 'bg-yellow-500 text-slate-900' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
          >
            {player.maxPlots >= MAX_PLOTS_TOTAL ? 'MAX' : `✨ ${nextLandCost}`}
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-700 w-full my-2"></div>

      {/* Items */}
      <div className="space-y-2">
        {MALL_ITEMS.map(item => {
          const isOwned = player.inventory.includes(item.id);
          const canAfford = player.spiritStones >= item.cost;
          return (
            <div key={item.id} className="p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <div className="text-[10px] font-bold uppercase">{language === 'zh' ? item.name_zh : item.name_en}</div>
                </div>
                {isOwned ? (
                  <span className="text-[9px] font-bold text-emerald-400 uppercase">Owned</span>
                ) : (
                  <button 
                    disabled={!canAfford}
                    onClick={() => buyItem(item.id, item.cost)}
                    className={`px-3 py-1 rounded text-[10px] font-bold ${canAfford ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
                  >
                    ✨ {item.cost}
                  </button>
                )}
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">{language === 'zh' ? item.desc_zh : item.desc_en}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Mall;
