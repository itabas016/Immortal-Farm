
export type Language = 'en' | 'zh';

export enum PlantType {
  GRAIN = 'Spirit Grain',
  VEGETABLE = 'Jade Lettuce',
  FRUIT = 'Crimson Apple',
  FLOWER = 'Azure Lotus',
  RARE = 'Dragon Breath Herb',
  GINSENG = 'Millennial Ginseng',
  WORLD_TREE = 'World Tree Seed'
}

export enum PlotStatus {
  EMPTY = 'EMPTY',
  PLANTED = 'PLANTED',
  READY = 'READY'
}

export interface Seed {
  type: PlantType;
  cost: number;
  salePrice: number;
  growthTime: number; // in seconds
  xpYield: number;
  icon: string;
}

export interface LandPlot {
  id: number;
  status: PlotStatus;
  plantType?: PlantType;
  growthStartTime?: number;
  waterLevel: number; // 0 to 100
  hasWeeds: boolean;
  isFertilized: boolean;
}

export interface PlayerState {
  spiritStones: number;
  cultivationLevel: number; // XP
  rank: string;
  maxPlots: number;
  inventory: string[]; // List of permanent item IDs
}

export enum RankName {
  MORTAL = 'Mortal (凡人)',
  QI_REFINING = 'Qi Refining (炼气)',
  FOUNDATION = 'Foundation (筑基)',
  GOLDEN_CORE = 'Golden Core (金丹)',
  NASCENT_SOUL = 'Nascent Soul (元婴)'
}
