import { SHEEP_CHARACTER_SVG } from "./sheep";
import { PARROT_CHARACTER_SVG } from "./parrot";
import { DEMON_CHARACTER_SVG } from "./demon";

export { SHEEP_CHARACTER_SVG, PARROT_CHARACTER_SVG, DEMON_CHARACTER_SVG };

// Keyed by MapId so scenes can look their character up without importing
// each one individually.
export const CHARACTER_SVGS: Record<string, string> = {
  "map-1": SHEEP_CHARACTER_SVG,
  "map-2": PARROT_CHARACTER_SVG,
  "map-3": DEMON_CHARACTER_SVG,
};
