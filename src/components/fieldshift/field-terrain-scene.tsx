import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { canopyGrid, moistureGrid } from "@/lib/fieldshift/agronomy";
import { CROPS } from "@/lib/fieldshift/data";
import type { FieldSite } from "@/lib/fieldshift/types";

const GRID = 11;
const SCALE = 0.022; // metres -> scene units

function pointInPolygon(x: number, z: number, poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]!;
    const [xj, zj] = poly[j]!;
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function FieldPlate({ field }: { field: FieldSite }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(
      field.outline.map(([x, z]) => new THREE.Vector2(x * SCALE, z * SCALE)),
    );
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
    g.rotateX(Math.PI / 2);
    return g;
  }, [field.outline]);

  const edge = useMemo(() => {
    const pts = field.outline.map(([x, z]) => new THREE.Vector3(x * SCALE, 0.002, z * SCALE));
    pts.push(pts[0]!.clone());
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [field.outline]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial color="#4a3b2c" roughness={0.95} metalness={0} />
      </mesh>
      <primitive
        object={new THREE.Line(
          edge,
          new THREE.LineBasicMaterial({ color: "#5bd2ff", transparent: true, opacity: 0.85 }),
        )}
      />
    </group>
  );
}

function Terrain() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(9, 9, 48, 48);
    const pos = g.attributes['position'] as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h =
        Math.sin(x * 0.7) * 0.12 + Math.cos(y * 0.55) * 0.1 + Math.sin((x + y) * 0.3) * 0.08 - 0.06;
      pos.setZ(i, h);
    }
    g.computeVertexNormals();
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, -0.09, 0]} receiveShadow>
      <meshStandardMaterial color="#2c3324" roughness={1} wireframe={false} />
    </mesh>
  );
}

function Columns({ field, mode }: { field: FieldSite; mode: "moisture" | "canopy" }) {
  const group = useRef<THREE.Group>(null);
  const cells = useMemo(() => {
    const m = moistureGrid(field, GRID);
    const c = canopyGrid(field, GRID);
    const bounds = field.outline.reduce(
      (acc, [x, z]) => ({
        minX: Math.min(acc.minX, x),
        maxX: Math.max(acc.maxX, x),
        minZ: Math.min(acc.minZ, z),
        maxZ: Math.max(acc.maxZ, z),
      }),
      { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity },
    );

    const out: { x: number; z: number; moisture: number; canopy: number }[] = [];
    for (let iz = 0; iz < GRID; iz++) {
      for (let ix = 0; ix < GRID; ix++) {
        const fx = bounds.minX + ((bounds.maxX - bounds.minX) * (ix + 0.5)) / GRID;
        const fz = bounds.minZ + ((bounds.maxZ - bounds.minZ) * (iz + 0.5)) / GRID;
        if (!pointInPolygon(fx, fz, field.outline)) continue;
        out.push({
          x: fx * SCALE,
          z: fz * SCALE,
          moisture: m[iz]![ix]!,
          canopy: c[iz]![ix]!,
        });
      }
    }
    return out;
  }, [field]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const cell = cells[i];
      if (!cell) return;
      const target =
        mode === "moisture" ? 0.12 + cell.moisture * 2.6 : 0.12 + cell.canopy * 1.5;
      const wobble = 1 + Math.sin(clock.elapsedTime * 1.6 + i * 0.5) * 0.02;
      child.scale.y += (target * wobble - child.scale.y) * 0.08;
      child.position.y = child.scale.y / 2 + 0.06;
    });
  });

  const crop = CROPS[field.currentCropId]!;

  return (
    <group ref={group}>
      {cells.map((cell, i) => {
        const value = mode === "moisture" ? cell.moisture / 0.45 : cell.canopy;
        const color =
          mode === "moisture"
            ? new THREE.Color().lerpColors(
                new THREE.Color("#c2603a"),
                new THREE.Color("#3fa9ff"),
                Math.min(1, value),
              )
            : new THREE.Color().lerpColors(
                new THREE.Color("#8a7a3a"),
                new THREE.Color(crop.canopyColor),
                Math.min(1, value),
              );
        return (
          <mesh key={i} position={[cell.x, 0.3, cell.z]} castShadow>
            <boxGeometry args={[0.13, 1, 0.13]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.25}
              transparent
              opacity={0.88}
              roughness={0.45}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ScanSweep() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime % 6) / 6;
    ref.current.position.z = -3.2 + t * 6.4;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.35;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.4, 0]}>
      <planeGeometry args={[6.4, 0.5]} />
      <meshBasicMaterial
        color="#5bd2ff"
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function FieldTerrainScene({
  field,
  mode,
}: {
  field: FieldSite;
  mode: "moisture" | "canopy";
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [3.6, 3.1, 4.4], fov: 45 }}
      dpr={[1, 2]}
      onCreated={({ gl }) => gl.setClearColor("#0d121b")}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.8}
        color="#ffeccc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 2, -4]} intensity={0.45} color="#5b8fd6" />
      <Environment>
        <Lightformer intensity={1.2} position={[0, 5, 0]} scale={[10, 10, 1]} color="#dfe9ff" />
        <Lightformer
          intensity={0.6}
          color="#84a7c9"
          position={[-5, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[16, 2, 1]}
        />
      </Environment>
      <fog attach="fog" args={["#0d121b", 8, 17]} />
      <Terrain />
      <FieldPlate field={field} />
      <Columns field={field} mode={mode} />
      <ScanSweep />
      <gridHelper args={[9, 18, "#1d2a3a", "#151d28"]} position={[0, -0.16, 0]} />
      <OrbitControls
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={11}
        target={[0, 0.3, 0]}
      />
    </Canvas>
  );
}
