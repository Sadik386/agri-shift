import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import earthMap from "@/assets/earth-equirect.jpg";
import { SATELLITES } from "@/lib/fieldshift/data";
import type { FieldSite } from "@/lib/fieldshift/types";

const R = 1.4;

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function Earth() {
  const texture = useTexture(earthMap);
  texture.colorSpace = THREE.SRGBColorSpace;
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.045;
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          color="#7e93b0"
          roughness={0.85}
          metalness={0.05}
          emissive="#0a1a2e"
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* atmosphere */}
      <mesh scale={1.06}>
        <sphereGeometry args={[R, 48, 48]} />
        <meshBasicMaterial
          color="#3ea8ff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[R * 1.001, 36, 24]} />
        <meshBasicMaterial color="#5bd2ff" wireframe transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

function OrbitRing({
  inclination,
  color,
  period,
  phase,
  radius,
}: {
  inclination: number;
  color: string;
  period: number;
  phase: number;
  radius: number;
}) {
  const group = useRef<THREE.Group>(null);
  const sat = useRef<THREE.Group>(null);
  const trail = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime / period) * Math.PI * 2 + phase;
    if (sat.current) {
      sat.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    }
    if (group.current) group.current.rotation.y += 0.0004;
  });

  return (
    <group ref={group} rotation={[(inclination * Math.PI) / 180, 0, 0]}>
      <primitive object={new THREE.Line(trail, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }))} />
      <group ref={sat}>
        <mesh>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  );
}

function FieldMarker({ field }: { field: FieldSite }) {
  const pos = useMemo(() => latLonToVec3(field.lat, field.lon, R), [field.lat, field.lon]);
  const ring = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.35;
    if (ring.current) {
      ring.current.scale.setScalar(pulse);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.55 / pulse;
    }
    if (beam.current) {
      (beam.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.sin(clock.elapsedTime * 2.2) * 0.1;
    }
  });

  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize()),
    [pos],
  );

  return (
    <group position={pos} quaternion={quaternion}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.035, 24]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>
      <mesh ref={ring} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.075, 32]} />
        <meshBasicMaterial color="#ffd166" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={beam} position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.005, 0.05, 0.44, 12, 1, true]} />
        <meshBasicMaterial
          color="#ffd166"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Stars() {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 420; i++) {
      const v = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5)
        .normalize()
        .multiplyScalar(7 + rand() * 4);
      pts.push(v.x, v.y, v.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#9fc6ff" size={0.035} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

export function GlobeScene({ field }: { field: FieldSite }) {
  return (
    <Canvas
      camera={{ position: [0, 1.6, 4.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      onCreated={({ gl }) => gl.setClearColor("#0a0f18")}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 3, 5]} intensity={2.1} color="#dbeeff" />
      <directionalLight position={[-5, -2, -3]} intensity={0.5} color="#2a5ea8" />
      <Environment>
        <Lightformer intensity={1.4} position={[0, 4, 3]} scale={[8, 8, 1]} color="#cfe6ff" />
        <Lightformer intensity={0.7} position={[-5, 0, -2]} rotation-y={Math.PI / 2} scale={[12, 2, 1]} color="#3f6fa8" />
      </Environment>
      <Stars />
      <Suspense fallback={null}>
        <group>
          <Earth />
          <FieldMarker field={field} />
        </group>
      </Suspense>
      {SATELLITES.map((s, i) => (
        <OrbitRing
          key={s.id}
          inclination={s.inclination}
          color={s.color}
          period={s.period}
          phase={i * 1.7}
          radius={R + 0.25 + i * 0.13}
        />
      ))}
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.35}
        minDistance={2.6}
        maxDistance={7}
      />
    </Canvas>
  );
}
