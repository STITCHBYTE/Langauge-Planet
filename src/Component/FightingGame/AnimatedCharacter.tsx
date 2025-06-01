import React, { useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface Props {
  modelPath: string;
  animationPath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
  keyId: string; // To force re-render on action
}

const AnimatedCharacter: React.FC<Props> = ({
  modelPath,
  animationPath,
  position,
  rotation,
  scale = [1.5, 1.5, 1.5],
  keyId,
}) => {
  const { scene } = useGLTF(modelPath) as any;
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    let mixerInstance: THREE.AnimationMixer;
    let mounted = true;

    const loadAnimation = async () => {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(animationPath);
      if (!mounted) return;

      mixerInstance = new THREE.AnimationMixer(scene);
      setMixer(mixerInstance);

      const clip = gltf.animations[0];
      const action = mixerInstance.clipAction(clip);
      action.reset().fadeIn(0.2).play();
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
      actionRef.current = action;

      mixerInstance.addEventListener("finished", (event) => {
        if (!animationPath.includes("idle")) {
          setMixer(null); // Trigger idle reset in parent
        }
      });
    };

    loadAnimation();

    return () => {
      mounted = false;
      if (mixerInstance) mixerInstance.stopAllAction();
    };
  }, [animationPath, scene, keyId]);

  useFrame((_, delta) => {
    mixer?.update(delta);
  });

  return (
    <primitive object={scene} position={position} rotation={rotation} scale={scale} />
  );
};

export default AnimatedCharacter;
