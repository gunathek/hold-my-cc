"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, RenderPass, EffectPass } from "postprocessing";
import { DitheringEffect } from "@/lib/dithering-shader/DitheringEffect";

/**
 * Component that manages post-processing effects
 * Configures and applies dithering effect to the rendered scene
 */
export const PostProcessing = ({
  gridSize = 4,
  pixelSizeRatio = 1,
  grayscaleOnly = true,
}) => {
  // References
  const composerRef = useRef(null);

  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);

  // Memoized resize handler
  const handleResize = useCallback(() => {
    if (composerRef.current) {
      composerRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Configure post-processing effects
  useEffect(() => {
    if (!scene || !camera || !composerRef.current) return;

    const composer = composerRef.current;
    composer.removeAllPasses();

    // Add required passes in order
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Dithering effect - always active
    const ditheringEffect = new DitheringEffect({
      gridSize,
      pixelSizeRatio,
      grayscaleOnly: grayscaleOnly,
    });

    composer.addPass(new EffectPass(camera, ditheringEffect));
  }, [scene, camera, gridSize, pixelSizeRatio, grayscaleOnly]);

  // Handle rendering
  useFrame(({ gl, scene: currentScene, camera: currentCamera }) => {
    // Initialize composer if not yet created
    if (!composerRef.current) {
      composerRef.current = new EffectComposer(gl);
      handleResize(); // Initial sizing
    }

    // Update scene and camera references if changed
    if (scene !== currentScene) setScene(currentScene);
    if (camera !== currentCamera) setCamera(currentCamera);

    // Render the composer if available
    if (composerRef.current) {
      composerRef.current.render();
      // Prevent default rendering
      return true;
    }
    return false;
  }, 1);

  return null;
};
