
import { PlantType, Seed, RankName } from './types';

export const SEEDS: Record<PlantType, Seed> = {
  [PlantType.GRAIN]: {
    type: PlantType.GRAIN, cost: 10, salePrice: 25, growthTime: 10, xpYield: 5, icon: '🌾'
  },
  [PlantType.VEGETABLE]: {
    type: PlantType.VEGETABLE, cost: 50, salePrice: 120, growthTime: 30, xpYield: 15, icon: '🥬'
  },
  [PlantType.FRUIT]: {
    type: PlantType.FRUIT, cost: 200, salePrice: 500, growthTime: 120, xpYield: 50, icon: '🍎'
  },
  [PlantType.FLOWER]: {
    type: PlantType.FLOWER, cost: 1000, salePrice: 2800, growthTime: 300, xpYield: 150, icon: '🪷'
  },
  [PlantType.RARE]: {
    type: PlantType.RARE, cost: 5000, salePrice: 15000, growthTime: 600, xpYield: 1000, icon: '🐉'
  },
  [PlantType.GINSENG]: {
    type: PlantType.GINSENG, cost: 25000, salePrice: 85000, growthTime: 3600, xpYield: 5000, icon: '🎍'
  },
  [PlantType.WORLD_TREE]: {
    type: PlantType.WORLD_TREE, cost: 100000, salePrice: 500000, growthTime: 86400, xpYield: 50000, icon: '🌳'
  }
};

export const RANKS = [
  { name: RankName.MORTAL, minXp: 0 },
  { name: RankName.QI_REFINING, minXp: 100 },
  { name: RankName.FOUNDATION, minXp: 1000 },
  { name: RankName.GOLDEN_CORE, minXp: 10000 },
  { name: RankName.NASCENT_SOUL, minXp: 100000 }
];

export const INITIAL_STONES = 200;
export const INITIAL_PLOTS = 6;
export const MAX_PLOTS_TOTAL = 24;
export const LAND_UPGRADE_BASE_COST = 500;

export const MALL_ITEMS = [
  { id: 'item_vase', name_en: 'Spirit Spring Vase', name_zh: '灵泉净瓶', cost: 2000, desc_en: 'Reduces water consumption speed.', desc_zh: '降低水分消耗速度。', icon: '🏺' },
  { id: 'item_array', name_en: 'Heavenly Array', name_zh: '聚灵大阵', cost: 15000, desc_en: 'Permanent 25% growth speed bonus.', desc_zh: '永久提升25%生长速度。', icon: '🌀' }
];

export const WATER_DRAIN_RATE = 0.5;
export const WEED_CHANCE = 0.05;
