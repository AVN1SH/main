'use client';

export default function GameObjectsOverlay() {
  return (
    <>
      <div
        id="game-bg"
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          background: "url('/game-assets/environment/background_tall.svg') repeat-y",
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
