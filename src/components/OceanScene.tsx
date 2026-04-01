import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Sparkles, MeshDistortMaterial, Sphere, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Bubbles({ count = 80 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30;
      p[i * 3 + 1] = (Math.random() - 0.5) * 30;
      p[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.0005;
    ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.5) * 0.001;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#60a5fa"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Fish({ position = [0, 0, 0] as [number, number, number], scale = 1, color = "#3b82f6", speed = 1 }) {
  const ref = useRef<THREE.Group>(null);
  const [offset] = useState(() => Math.random() * Math.PI * 2);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 0.3;
    ref.current.position.x = position[0] + Math.cos(t * 0.5) * 1.5;
    ref.current.rotation.z = Math.sin(t * 2) * 0.1;
    ref.current.rotation.y = Math.PI / 2 + Math.cos(t * 0.5) * 0.2;
  });

  return (
    <Float speed={2 * speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={ref} position={position} scale={scale}>
        <mesh>
          <capsuleGeometry args={[0.2, 0.6, 4, 16]} />
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.4}
            radius={1}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.4, 3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </Float>
  );
}

function SceneContent() {
  const { viewport, mouse, camera } = useThree();
  
  useFrame(() => {
    // Subtle camera parallax
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#60a5fa" />
      <spotLight
        position={[-15, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={3}
        color="#3b82f6"
        castShadow
      />
      
      <Bubbles count={150} />
      <Sparkles count={80} scale={15} size={3} speed={0.3} color="#93c5fd" />
      
      {/* School of Fish */}
      <Fish position={[-6, 3, -4]} scale={0.6} color="#2563eb" speed={1.2} />
      <Fish position={[7, -2, -5]} scale={0.9} color="#1d4ed8" speed={0.8} />
      <Fish position={[0, -4, -8]} scale={1.2} color="#1e40af" speed={0.6} />
      <Fish position={[-8, -1, -2]} scale={0.5} color="#3b82f6" speed={1.5} />
      <Fish position={[4, 4, -6]} scale={0.7} color="#60a5fa" speed={1.1} />
      <Fish position={[-2, 5, -10]} scale={2} color="#172554" speed={0.4} />
      
      {/* Background Sphere for Depth */}
      <Sphere args={[30, 32, 32]}>
        <meshStandardMaterial
          color="#020617"
          side={THREE.BackSide}
          transparent
          opacity={0.8}
        />
      </Sphere>

      <ContactShadows opacity={0.4} scale={20} blur={2} far={10} resolution={256} color="#000000" />
    </>
  );
}

export default function OceanScene() {
  const fastMode = localStorage.getItem('fastMode') === 'true';

  if (fastMode) {
    return (
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e3a8a_0%,#020617_100%)] opacity-30" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950 opacity-50" />
      <Canvas shadows dpr={[1, 2]}>
        <SceneContent />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
