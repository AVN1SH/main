import { MapConfig, MapAssetDef, MapAssetInfo } from "../config";

const NS = "map2_";

const ASSETS: MapAssetDef[] = [
  { logicalKey: "player", path: "./game-assets/map-2/characters/parrot.svg", w: 50, h: 50, loadType: "svg" },
  { logicalKey: "platform_hay", path: "./game-assets/map-2/platforms/platform_chest.svg", w: 80, h: 32, loadType: "svg" },
  { logicalKey: "platform_island", path: "./game-assets/map-2/platforms/platofrm_small.svg", w: 80, h: 32, loadType: "svg" },
  { logicalKey: "platform_log", path: "./game-assets/map-2/platforms/platform_big.svg", w: 80, h: 32, loadType: "svg" },
  { logicalKey: "platform_board", path: "./game-assets/map-2/obstacles/platform_roped.svg", w: 80, h: 20, loadType: "svg" },
  { logicalKey: "obstacle_bee", path: "./game-assets/map-2/environment/crab.svg", w: 25, h: 25, loadType: "svg" },
  { logicalKey: "obstacle_thorns", path: "./game-assets/map-2/obstacles/small_thorns.svg", w: 40, h: 16, loadType: "svg" },
  { logicalKey: "item_carrot", path: "./game-assets/map-2/items/compass.svg", w: 30, h: 30, loadType: "svg" },
  { logicalKey: "item_apple", path: "./game-assets/map-2/items/chest.svg", w: 30, h: 30, loadType: "svg" },
  { logicalKey: "balloon", path: "./game-assets/map-2/parrot.lottie", w: 80, h: 80, loadType: "lottie" },
  { logicalKey: "ui_heart", path: "./game-assets/map-2/items/heart.svg", w: 30, h: 30, loadType: "svg" },
  { logicalKey: "coin", path: "./icons/coin.png", w: 32, h: 32, loadType: "image" },
  { logicalKey: "barn", path: "./game-assets/map-2/environment/ship.svg", w: 50, h: 48, loadType: "svg" },
  { logicalKey: "bg_tall", path: "./game-assets/map-2/background/background_tall.svg", w: 0, h: 0, loadType: "svg" },
  { logicalKey: "env_grass", path: "./game-assets/map-2/environment/skull.svg", w: 29, h: 21, loadType: "svg" },
  { logicalKey: "env_flower", path: "./game-assets/map-2/environment/skull_blue.svg", w: 30, h: 56, loadType: "svg" },
  { logicalKey: "env_worm", path: "./game-assets/map-2/obstacles/barrel.svg", w: 37, h: 27, loadType: "svg" },
  { logicalKey: "env_grass_block_1", path: "./game-assets/map-2/environment/water_tile_set.svg", w: 145, h: 145, loadType: "svg" },
  { logicalKey: "env_grass_block_2", path: "./game-assets/map-2/environment/water_tile_set.svg", w: 145, h: 145, loadType: "svg" },
  { logicalKey: "env_grass_block_3", path: "./game-assets/map-2/environment/water_tile_set.svg", w: 145, h: 145, loadType: "svg" },
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

export const MAP_2_CONFIG: MapConfig = {
  id: "map-2",
  sceneKey: "MainGame_Map2",
  name: "Tide",
  ns: NS,
  assets: ASSETS,
  domAssets: buildDomAssets(ASSETS),
  textureKeys: buildTextureKeys(ASSETS),
  backgroundTall: "./game-assets/map-2/background/background_tall.svg",
  backgroundWide: "./game-assets/map-2/background/background_fill.svg",
  music: "./sounds/map-2-bg.mp3",
};
