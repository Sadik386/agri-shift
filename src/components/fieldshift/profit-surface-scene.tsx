import { Canvas } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { ProfitSurface } from "@/lib/fieldshift/types";

const SX = 3.4; // deficit axis width
const SZ = 3.0; // price axis depth
const SY = 1.9; // profit height

function Surface({ surface }: { surface: ProfitSurface }) {
  const { geometry, zeroY } = useMemo(() => {
    const nx = surface.deficits.length;
    const nz = surface.priceIndices.length;
    const g = new THREE.PlaneGeometry(SX, SZ, nx - 1, nz - 1);
    const pos = g.attributes['position'] as THREE.BufferAttribute;
    const range = Math.max(1, surface.max - surface.min);
    const colors: number[] = [];
    const cold = new THREE.Color("#ff5d5d");
    const mid = new THREE.Color("#ffc857");
    const hot = new THREE.Color("#4ce0a5");

    for (let iz = 0; iz < nz; iz++) {
      for (let ix = 0; ix < nx; ix++) {
        const i = iz * nx + ix;
        const value = surface.grid[ix]![iz]!;
        const t = (value - surface.min) / range;
        pos.setZ(i, t * SY);
        const c = t < 0.5 ? cold.clone().lerp(mid, t * 2) : mid.clone().lerp(hot, (t - 0.5) * 2);
        colors.push(c.r, c.g, c.b);
      }
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    g.rotateX(-Math.PI / 2);
    return { geometry: g, zeroY: ((0 - surface.min) / range) * SY };
  }, [surface]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.45}
          metalness={0.1}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial wireframe color="#0c1118" transparent opacity={0.35} />
      </mesh>
      {surface.min < 0 && surface.max > 0 && (
        <mesh position={[0, zeroY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[SX, SZ]} />
          <meshBasicMaterial
            color="#ff6b6b"
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function AxisLabels({ surface }: { surface: ProfitSurface }) {
  const label = "rounded bg-[oklch(0.18_0.02_250)]/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[oklch(0.82_0.03_250)] whitespace-nowrap border border-white/10";
  return (
    <>
      <Html position={[0, -0.25, SZ / 2 + 0.45]} center>
        <div className={label}>Rainfall deficit 0 → 60 %</div>
      </Html>
      <Html position={[SX / 2 + 0.6, -0.25, 0]} center>
        <div className={label}>Fertilizer price 0.7× → 1.5×</div>
      </Html>
      <Html position={[-SX / 2 - 0.35, SY + 0.25, 0]} center>
        <div className={label}>Net profit k৳/acre</div>
      </Html>
      <Html position={[-SX / 2 - 0.3, SY, -SZ / 2]} center>
        <div className={label}>{surface.max.toFixed(0)}k</div>
      </Html>
      <Html position={[-SX / 2 - 0.3, 0, -SZ / 2]} center>
        <div className={label}>{surface.min.toFixed(0)}k</div>
      </Html>
    </>
  );
}

export function ProfitSurfaceScene({ surface }: { surface: ProfitSurface }) {
  return (
    <Canvas
      camera={{ position: [4.2, 3.2, 4.6], fov: 42 }}
      dpr={[1, 2]}
      onCreated={({ gl }) => gl.setClearColor("#0d121b")}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.6} color="#e9f2ff" />
      <directionalLight position={[-4, 3, -4]} intensity={0.5} color="#6f9ad6" />
      <Environment>
        <Lightformer intensity={1.1} position={[0, 5, 1]} scale={[9, 9, 1]} color="#e6f0ff" />
        <Lightformer intensity={0.5} color="#82a5c8" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[14, 2, 1]} />
      </Environment>
      <group position={[0, -0.7, 0]}>
        <Surface surface={surface} />
        <AxisLabels surface={surface} />
        <gridHelper args={[4.4, 12, "#213044", "#17212d"]} position={[0, -0.02, 0]} />
      </group>
      <OrbitControls minDistance={3.4} maxDistance={11} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  );
}
