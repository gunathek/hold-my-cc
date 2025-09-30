"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PresentationControls,
  Stage,
  useGLTF,
} from "@react-three/drei";
import { PostProcessing } from "@/components/post-processing";

function Model() {
  const { scene } = useGLTF("/models/gold_card_smol.glb");
  return <primitive object={scene} scale={1.5} />;
}

export default function CardViewer() {
  const [mounted, setMounted] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="h-screen w-screen">
      <Canvas shadows dpr={[1, 2]} className="h-full w-full">
        <color attach="background" args={["#ffffff"]} />
        <Suspense fallback={null}>
          <Stage environment="city" adjustCamera={2.5} intensity={0.3}>
            <PresentationControls
              global
              rotation={[0, -Math.PI / 4, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
              config={{ mass: 2, tension: 500 }}
              // snap={{ mass: 4, tension: 1500 }}
            >
              <Model />
            </PresentationControls>
          </Stage>
        </Suspense>
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={2.5}
          enableZoom={false}
          enablePan={true}
        />
        <PostProcessing gridSize={3} pixelSizeRatio={1} grayscaleOnly={false} />
      </Canvas>
    </div>
  );
}
