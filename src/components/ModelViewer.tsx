import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentRef, ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { SITE } from "../constants/site";

type View = "full" | "close";

const VIEWS: { value: View; label: string }[] = [
  { value: "full", label: "Full view" },
  { value: "close", label: "Close-up" },
];

/** Camera directions (from the target) for each view */
const DIRECTIONS: Record<View, THREE.Vector3> = {
  full: new THREE.Vector3(0.12, 0.9, 0.45),
  close: new THREE.Vector3(1, 0.6, 1),
};

interface Frame {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/** Shows load progress inside the canvas while the GLB downloads */
function Loader(): React.ReactElement {
  const { progress } = useProgress();
  return (
    <Html center>
      <p className="whitespace-nowrap text-sm text-gray-100">
        Loading model… {Math.round(progress)}%
      </p>
    </Html>
  );
}

/** Procedural studio lighting: bright strips give the glossy black body visible edges */
function Lights(): React.ReactElement {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 10, 6]} intensity={1.4} />
      <Environment resolution={512}>
        <Lightformer form="rect" intensity={4} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[16, 16, 1]} />
        <Lightformer form="rect" intensity={7} position={[-9, 1, 2]} rotation-y={Math.PI / 2} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={7} position={[9, 1, -2]} rotation-y={-Math.PI / 2} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={3} position={[0, 2, -9]} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[0, 2, 9]} scale={[14, 3, 1]} />
      </Environment>
    </>
  );
}

interface SceneProps {
  view: View;
  reducedMotion: boolean;
}

/** The JUNO.1 model, orbit controls, and the camera moves between the two views */
function Scene({ view, reducedMotion }: SceneProps): React.ReactElement {
  const { scene } = useGLTF(SITE.modelUrl);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / Math.max(s.size.height, 1));
  const firstRun = useRef(true);

  // Work out where the camera should sit for each view from the model's real bounds
  const frames = useMemo<Record<View, Frame>>(() => {
    scene.updateMatrixWorld(true);
    const full = new THREE.Box3().setFromObject(scene);

    // "Close-up" frames the main enclosure (the "Cube" part) plus a little room for the controls
    const body = new THREE.Box3();
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.name === "Cube") body.expandByObject(o);
    });
    body.expandByScalar(0.6);

    const fit = (box: THREE.Box3, dir: THREE.Vector3, margin: number): Frame => {
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const vfov = THREE.MathUtils.degToRad(camera.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      const dist = (sphere.radius * margin) / Math.sin(Math.min(vfov, hfov) / 2);
      return {
        target: sphere.center.clone(),
        position: sphere.center.clone().add(dir.clone().normalize().multiplyScalar(dist)),
      };
    };

    return {
      full: fit(full, DIRECTIONS.full, 0.68),
      close: fit(body.isEmpty() ? full : body, DIRECTIONS.close, 1.0),
    };
  }, [scene, aspect, camera]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const f = frames[view];
    const instant = firstRun.current || reducedMotion;
    firstRun.current = false;

    if (instant) {
      camera.position.copy(f.position);
      c.target.copy(f.target);
      c.update();
      return;
    }

    const opts = { duration: 1.4, ease: "power3.inOut", onUpdate: () => c.update() };
    const tweens = [
      gsap.to(camera.position, { x: f.position.x, y: f.position.y, z: f.position.z, ...opts }),
      gsap.to(c.target, { x: f.target.x, y: f.target.y, z: f.target.z, ...opts }),
    ];
    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [view, frames, camera, reducedMotion]);

  return (
    <>
      <primitive object={scene} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        rotateSpeed={0.6}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.7}
      />
    </>
  );
}

// Keep camera moves time-accurate even when frames are slow (low-end devices)
gsap.ticker.lagSmoothing(0);

useGLTF.preload(SITE.modelUrl);

/** Shows a message instead of crashing the page if WebGL isn't available */
class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render(): ReactNode {
    if (this.state.failed) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center text-gray-100">
          The 3D view isn&apos;t supported on this device or browser.
        </div>
      );
    }
    return this.props.children;
  }
}

/** "Take a closer look": interactive 3D viewer with a Full view / Close-up toggle */
function ModelViewer(): React.ReactElement {
  const [view, setView] = useState<View>("full");
  const [inView, setInView] = useState(true);
  const holder = useRef<HTMLDivElement>(null);
  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Pause rendering while the viewer is scrolled out of sight
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="common-padding" aria-labelledby="viewer-heading">
      <div className="screen-max-width">
        <h2 id="viewer-heading" className="section-heading">
          Take a closer look.
        </h2>

        <div ref={holder} className="mt-8 h-[62vh] min-h-[380px] w-full md:h-[78vh]">
          <ViewerBoundary>
            <Canvas
              dpr={[1, 2]}
              frameloop={inView ? "always" : "never"}
              camera={{ fov: 30, near: 0.1, far: 500, position: [0, 10, 30] }}
              gl={{ antialias: true }}
              aria-label="Interactive 3D model of JUNO.1. Drag to rotate."
            >
              <Lights />
              <Suspense fallback={<Loader />}>
                <Scene view={view} reducedMotion={reducedMotion} />
              </Suspense>
            </Canvas>
          </ViewerBoundary>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div
            role="radiogroup"
            aria-label="Camera view"
            className="inline-flex rounded-full border border-white/20 p-1"
          >
            {VIEWS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={view === value}
                onClick={() => setView(value)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  view === value ? "bg-white text-black" : "text-white hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray">Drag to rotate JUNO.1.</p>
        </div>
      </div>
    </section>
  );
}

export default ModelViewer;
