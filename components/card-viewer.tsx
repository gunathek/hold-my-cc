"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";
import { PostProcessing } from "@/components/post-processing";

function Model() {
  const { scene } = useGLTF("/models/gold_card_smol.glb");
  return <primitive object={scene} scale={1.5} />;
}

export default function CardViewer() {
  const [mounted, setMounted] = useState(false);
  const autoRotate = true;

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="absolute inset-0 z-[1] flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="absolute inset-0 z-[1] flex items-center justify-center">
      <Canvas
        dpr={[1, 2]}
        className="h-full w-full bg-transparent"
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 1], fov: 45 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 6, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <PresentationControls
            global
            rotation={[0, -Math.PI / 4, 0]}
            polar={[0, 0]} // lock vertical rotation so interactions stay horizontal
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            config={{ mass: 2, tension: 500 }}
          >
            <Model />
          </PresentationControls>
        </Suspense>
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={2.5}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          enableZoom={false}
          enablePan={false}
        />
        <PostProcessing gridSize={3} pixelSizeRatio={1} grayscaleOnly={false} />
      </Canvas>
    </div>
  );
}
