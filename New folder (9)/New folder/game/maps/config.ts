export interface MapAssetInfo {
  path: string;
  w: number;
  h: number;
}

export interface MapAssetDef extends MapAssetInfo {
  logicalKey: string;
  loadType: 'svg' | 'image' | 'lottie';
}

export interface MapConfig {
  id: string;
  sceneKey: string;
  name: string;
  ns: string;
  assets: MapAssetDef[];
  domAssets: Record<string, MapAssetInfo>;
  textureKeys: Record<string, string>;
  backgroundTall: string;
  backgroundWide: string;
  music: string;
}

export type PlatformType =
  | "platform_island"
  | "platform_log"
  | "platform_hay"
  | "platform_board";

export interface TierConfig {
  scoreThreshold: number;
  platformWeights: Record<PlatformType, number>;
  beeChance: number;
  multiPlatformChance: number;
  movingPlatformChance: number;
}
