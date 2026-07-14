import { MapConfig, MapAssetDef, MapAssetInfo } from "../config";

const NS = "map1_";

const ASSETS: MapAssetDef[] = [
  { logicalKey: "player", path: "./game-assets/map-1/characters/white_sheep.svg", w: 50, h: 50, loadType: "svg" },
  { logicalKey: "platform_hay", path: "./game-assets/map-1/platforms/hay.svg", w: 80, h: 32, loadType: "svg" },
  { logicalKey: "platform_island", path: "./game-assets/map-1/platforms/island.svg", w: 80, h: 32, loadType: "svg" },
  { logicalKey: "platform_log", path: "./game-assets/map-1/platforms/log.svg", w: 80, h: 32, loadType: "svg" },
  { logicalKey: "platform_board", path: "./game-assets/map-1/obstacles/board.svg", w: 80, h: 20, loadType: "svg" },
  { logicalKey: "obstacle_bee", path: "./game-assets/map-1/enemies/bee.svg", w: 25, h: 25, loadType: "svg" },
  { logicalKey: "obstacle_thorns", path: "./game-assets/map-1/obstacles/small_thorns.svg", w: 40, h: 16, loadType: "svg" },
  { logicalKey: "item_carrot", path: "./game-assets/map-1/items/carrot.svg", w: 30, h: 30, loadType: "svg" },
  { logicalKey: "item_apple", path: "./game-assets/map-1/items/apple.svg", w: 30, h: 30, loadType: "svg" },
  { logicalKey: "balloon", path: "./game-assets/map-1/balloon.lottie", w: 80, h: 80, loadType: "lottie" },
  { logicalKey: "ui_heart", path: "./game-assets/map-1/items/heart.svg", w: 30, h: 30, loadType: "svg" },
  { logicalKey: "coin", path: "./icons/coin.png", w: 32, h: 32, loadType: "image" },
  { logicalKey: "barn", path: "./game-assets/map-1/environment/barn.svg", w: 50, h: 48, loadType: "svg" },
  { logicalKey: "bg_tall", path: "./game-assets/map-1/environment/background_tall.svg", w: 0, h: 0, loadType: "svg" },
  { logicalKey: "env_grass", path: "./game-assets/map-1/environment/grass.svg", w: 29, h: 21, loadType: "svg" },
  { logicalKey: "env_flower", path: "./game-assets/map-1/environment/flower.svg", w: 30, h: 56, loadType: "svg" },
  { logicalKey: "env_worm", path: "./game-assets/map-1/environment/worm.svg", w: 37, h: 27, loadType: "svg" },
  { logicalKey: "env_grass_block_1", path: "./game-assets/map-1/environment/grass_1.svg", w: 145, h: 145, loadType: "svg" },
  { logicalKey: "env_grass_block_2", path: "./game-assets/map-1/environment/grass_2.svg", w: 145, h: 145, loadType: "svg" },
  { logicalKey: "env_grass_block_3", path: "./game-assets/map-1/environment/grass_3.svg", w: 145, h: 145, loadType: "svg" },
];

const buildDomAssets = (assets: MapAssetDef[]): Record<string, MapAssetInfo> => {
  const map: Record<string, MapAssetInfo> = {};
  for (const a of assets) map[a.logicalKey] = { path: a.path, w: a.w, h: a.h };
  return map;
};

const buildTextureKeys = (assets: MapAssetDef[]): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const a of assets) map[a.logicalKey] = NS + a.logicalKey;
  return map;
};

export const MAP_1_CONFIG: MapConfig = {
  id: "map-1",
  sceneKey: "MainGame_Map1",
  name: "Sky",
  ns: NS,
  assets: ASSETS,
  domAssets: buildDomAssets(ASSETS),
  textureKeys: buildTextureKeys(ASSETS),
  backgroundTall: "./game-assets/map-1/environment/background_tall.svg",
  backgroundWide: "./game-assets/map-1/environment/background_wide.svg",
  music: "./sounds/bgm.mp3",
};
