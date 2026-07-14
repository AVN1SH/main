"use client";

import { useEffect, useState } from "react";
import { mapManager } from "@/game/mapManager";

export default function GameObjectsOverlay() {
  // Keep this in sync with the currently selected map (not hardcoded to
  // map-1) so the correct background is already in place *before* the
  // game-start transition and Phaser scene creation happen. Phaser's
  // DomLayer still updates this element's background/backgroundPosition
  // directly during gameplay (parallax scroll), this just makes sure the
  // starting value is always correct.
  const [bgImage, setBgImage] = useState(
    () => mapManager.getCurrentConfig().backgroundTall,
  );

  useEffect(() => {
    const unsub = mapManager.subscribe((_id, config) =>
      setBgImage(config.backgroundTall),
    );
    return unsub;
  }, []);

  return (
    <>
      <div
        id="game-bg"
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 transition-[background-image] duration-300 ease-out"
        style={{
          background: `url('${bgImage}') repeat-y`,
          backgroundSize: "100% auto",
        }}
      />
      <div
        id="game-dom-layer"
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[1]"
      />
    </>
  );
}
