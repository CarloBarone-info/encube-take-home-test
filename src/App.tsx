import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";

function Card({
  position,
  color,
  width,
  height,
}: {
  position: [number, number, number];
  color: string;
  width: number;
  height: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, 0.15]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={2} />

      <Card position={[-4, 2, 0]} width={5} height={3} color="#ffffff" />

      <Card position={[3, 2, 0]} width={4} height={4} color="#dbeafe" />

      <Card position={[-2, -3, 0]} width={4} height={2.5} color="#ede9fe" />

      <Card position={[4, -3, 0]} width={5} height={2.5} color="#dcfce7" />

      <MapControls
        enableRotate={false}
        screenSpacePanning
        minZoom={30}
        maxZoom={250}
      />
    </>
  );
}

export default function App() {
  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Encube Review</span>

          <button className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
            Select
          </button>

          <button className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100">
            Comment
          </button>
        </div>

        <span className="text-sm text-neutral-500">100%</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="relative flex-1 bg-neutral-200">
          <Canvas
            orthographic
            camera={{
              position: [0, 0, 100],
              zoom: 70,
              near: 0.1,
              far: 1000,
            }}
          >
            <Scene />
          </Canvas>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-md bg-white px-3 py-2 text-xs text-neutral-500 shadow">
            Drag to pan · Scroll to zoom
          </div>
        </main>

        <aside className="w-80 border-l border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 p-4">
            <h2 className="font-semibold">Comments</h2>
            <p className="mt-1 text-sm text-neutral-500">No comments yet</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
