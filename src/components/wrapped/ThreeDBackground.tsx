
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const FloatingPlanes = () => {
  const planeSize = 2;
  const count = 20;
  const planesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (planesRef.current) {
      planesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      planesRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  const planes = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.random() * 4 - 2;
    
    // Calculate hue based on index for a gradient effect from purple to red
    const hue = 280 + (i / count) * 60; // From purple (280) to red-purple (340)
    const color = `hsl(${hue}, 70%, 50%)`;
    
    return {
      position: [x, y, z],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      color,
      scale: 0.5 + Math.random() * 0.5,
      key: i
    };
  });

  return (
    <group ref={planesRef}>
      {planes.map((plane) => (
        <mesh 
          key={plane.key} 
          position={plane.position as [number, number, number]} 
          rotation={plane.rotation as [number, number, number]}
          scale={[plane.scale, plane.scale, plane.scale]}
        >
          <planeGeometry args={[planeSize, planeSize]} />
          <meshStandardMaterial 
            color={plane.color} 
            side={THREE.DoubleSide} 
            transparent 
            opacity={0.7}
            emissive={plane.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

export const ThreeDBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <FloatingPlanes />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false} 
        />
      </Canvas>
    </div>
  );
};
