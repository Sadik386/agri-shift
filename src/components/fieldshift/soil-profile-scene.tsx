import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Crop, SoilProfileLayer } from "@/lib/fieldshift/types";

const DEPTH_SCALE = 0.016; // cm -> scene units
const W = 2.2;

function SoilStack({ layers }: { layers: SoilProfileLayer[] }) {
  let y = 0;
  return (
    <group>
      {layers.map((layer) => {
        const h = layer.depthCm * DEPTH_SCALE;
        const centreY = -(y + h / 2);
        y += h;
        const wet = new THREE.Color("#3c6f9c");
        const base = new THREE.Color(layer.color);
        const color = base.clone().lerp(wet, Math.min(0.55, layer.moisturePct / 100));
        return (
          <group key={layer.label} position={[0, centreY, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[W, h, W * 0.7]} />
              <meshStandardMaterial color={color} roughness={0.95} metalness={0.02} />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(W, h, W * 0.7)]} />
              <lineBasicMaterial color="#1b2634" transparent opacity={0.8} />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}

function Roots({ growth, crop, maxDepth }: { growth: number; crop: Crop; maxDepth: number }) {
  const group = useRef<THREE.Group>(null);
  const strands = useMemo(() => {
    let seed = 7;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    return Array.from({ length: 14 }, () => ({
      angle: rand() * Math.PI * 2,
      spread: 0.12 + rand() * 0.55,
      depthFactor: 0.45 + rand() * 0.55,
      thickness: 0.006 + rand() * 0.01,
    }));
  }, []);

  const reach = Math.min(crop.rootDepthCm, maxDepth) * DEPTH_SCALE;

  useFrame(() => {
    if (group.current) group.current.scale.y += (Math.max(0.02, growth) - group.current.scale.y) * 0.1;
  });

  return (
    <group ref={group} scale={[1, 0.02, 1]}>
      {strands.map((s, i) => {
        const depth = reach * s.depthFactor;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(
            Math.cos(s.angle) * s.spread * 0.4,
            -depth * 0.4,
            Math.sin(s.angle) * s.spread * 0.3,
          ),
          new THREE.Vector3(
            Math.cos(s.angle) * s.spread,
            -depth,
            Math.sin(s.angle) * s.spread * 0.7,
          ),
        ]);
        return (
          <mesh key={i}>
            <tubeGeometry args={[curve, 20, s.thickness, 6, false]} />
            <meshStandardMaterial color="#e8dcc2" roughness={0.7} emissive="#b8a97f" emissiveIntensity={0.15} />
          </mesh>
        );
      })}
    </group>
  );
}

function Plant({ growth, crop }: { growth: number; crop: Crop }) {
  const group = useRef<THREE.Group>(null);
  const leaves = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        y: 0.12 + i * 0.09,
        angle: (i * 2.399) % (Math.PI * 2),
        len: 0.34 - i * 0.02,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.scale.y += (Math.max(0.05, growth) - group.current.scale.y) * 0.1;
    group.current.scale.x = group.current.scale.z = 0.55 + group.current.scale.y * 0.45;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 1.1) * 0.035;
  });

  const mature = growth > 0.8;

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#5f8f3e" roughness={0.6} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh
          key={i}
          position={[Math.cos(l.angle) * 0.07, l.y + 0.1, Math.sin(l.angle) * 0.07]}
          rotation={[0.5, l.angle, 0.9]}
          castShadow
        >
          <boxGeometry args={[l.len, 0.006, 0.055]} />
          <meshStandardMaterial color={crop.canopyColor} roughness={0.55} />
        </mesh>
      ))}
      {mature && (
        <mesh position={[0, 0.98, 0]} castShadow>
          <coneGeometry args={[0.07, 0.3, 10]} />
          <meshStandardMaterial
            color={crop.nitrogenFixing ? "#8fd694" : "#e7c65c"}
            emissive={crop.nitrogenFixing ? "#3d7a45" : "#8a6f1f"}
            emissiveIntensity={0.25}
            roughness={0.5}
          />
        </mesh>
      )}
      {crop.nitrogenFixing && (
        <group>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[Math.cos(i * 1.6) * 0.12, -0.12 - i * 0.07, Math.sin(i * 1.6) * 0.1]}
            >
              <sphereGeometry args={[0.028, 10, 10]} />
              <meshStandardMaterial color="#f0b6c8" emissive="#a04f6a" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function MoistureDrops({ layers }: { layers: SoilProfileLayer[] }) {
  const group = useRef<THREE.Group>(null);
  const total = layers.reduce((s, l) => s + l.depthCm, 0) * DEPTH_SCALE;
  useFrame((_, delta) => {
    group.current?.children.forEach((child, i) => {
      child.position.y -= delta * (0.3 + (i % 5) * 0.07);
      if (child.position.y < -total) child.position.y = 0.4;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (((i * 37) % 100) / 100 - 0.5) * W * 0.85,
            -((i * 13) % 100) / 100 * total,
            (((i * 61) % 100) / 100 - 0.5) * W * 0.55,
          ]}
        >
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#5bd2ff" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

export function SoilProfileScene({
  layers,
  crop,
  growth,
}: {
  layers: SoilProfileLayer[];
  crop: Crop;
  growth: number;
}) {
  const maxDepth = layers.reduce((s, l) => s + l.depthCm, 0);
  const totalHeight = maxDepth * DEPTH_SCALE;

  return (
    <Canvas
      shadows
      camera={{ position: [2.4, 0.6, 3.2], fov: 42 }}
      dpr={[1, 2]}
      onCreated={({ gl }) => gl.setClearColor("#0d121b")}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.7} color="#ffe9c9" castShadow />
      <directionalLight position={[-3, 1, -3]} intensity={0.4} color="#6f9ad6" />
      <Environment>
        <Lightformer intensity={1.2} position={[0, 4, 2]} scale={[8, 8, 1]} color="#e6f0ff" />
        <Lightformer intensity={0.5} color="#7f9ec2" position={[-4, 0, -2]} rotation-y={Math.PI / 2} scale={[12, 2, 1]} />
      </Environment>
      <group position={[0, totalHeight / 2 - 0.35, 0]}>
        <SoilStack layers={layers} />
        <MoistureDrops layers={layers} />
        <Roots growth={growth} crop={crop} maxDepth={maxDepth} />
        <Plant growth={growth} crop={crop} />
      </group>
      <OrbitControls
        minDistance={2.2}
        maxDistance={7}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
