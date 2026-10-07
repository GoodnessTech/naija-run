import React from 'react';

export function RainforestLighting() {
  return (
    <>
      {/* Deep jungle sky color */}
      <color attach="background" args={['#0e2617']} />

      {/* 
        Fog calibrated for high gameplay visibility:
        Starts at 38 meters (so obstacles ahead are completely clear and visible!),
        fades smoothly into the atmospheric misty rainforest vista at 110 meters.
      */}
      <fog attach="fog" args={['#0d2315', 38, 115]} />

      {/* Ambient Lighting: Bright warm jungle fill so obstacles never appear pitch black */}
      <ambientLight intensity={1.25} color="#86a88b" />

      {/* Hemisphere Light: Golden sunlight from sky, red laterite reflection from below */}
      <hemisphereLight
        args={['#fef9c3', '#963c22', 1.35]}
      />

      {/* Directional Golden Sunlight: Clear shadows and highlights on obstacles */}
      <directionalLight
        position={[14, 32, 18]}
        intensity={2.8}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={95}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0004}
      />

      {/* Rim light: Emerald supernatural edge illumination */}
      <directionalLight
        position={[-16, 15, -28]}
        intensity={0.9}
        color="#34d399"
      />
    </>
  );
}
