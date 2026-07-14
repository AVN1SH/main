import { MapConfig } from "./maps/config";
import { MAP_1_CONFIG } from "./maps/map-1/config";
import { MAP_2_CONFIG } from "./maps/map-2/config";
import { MAP_3_CONFIG } from "./maps/map-3/config";

export type MapId = "map-1" | "map-2" | "map-3";

const ALL_MAPS: Record<MapId, MapConfig> = {
  "map-1": MAP_1_CONFIG,
  "map-2": MAP_2_CONFIG,
  "map-3": MAP_3_CONFIG,
};

class MapManager {
  private current: MapId = "map-1";
  private listeners: Array<(id: MapId, config: MapConfig) => void> = [];

  getCurrentId(): MapId {
    return this.current;
  }

  getCurrentConfig(): MapConfig {
    return ALL_MAPS[this.current];
  }

  getAll(): [MapId, MapConfig][] {
    return Object.entries(ALL_MAPS) as [MapId, MapConfig][];
  }

  get(id: MapId): MapConfig {
    return ALL_MAPS[id];
  }

  setCurrent(id: MapId) {
    if (id === this.current) return;
    if (!ALL_MAPS[id]) return;
    this.current = id;
    const config = ALL_MAPS[id];
    for (const listener of this.listeners) {
      listener(id, config);
    }
  }

  subscribe(listener: (id: MapId, config: MapConfig) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const mapManager = new MapManager();
