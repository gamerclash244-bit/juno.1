import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import type { ComponentRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { SITE, finishes } from "../constants/site";

export type View = "full" | "close";

/** Camera directions (from the target) for each view */
const DIRECTIONS: Record<View, THREE.Vector3> = {
  full: new THREE.Vector3(0.12, 0.9, 0.45),
  close: new THREE.Vector3(1, 0.6, 1),
};

interface Frame {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

function Loader(): React.ReactElement {
  const { progress } = useProgress();
  return (
    <Html center>
      <p className="whitespace-nowrap text-sm text-[#c9606a]">Loading model… {Math.round(progress)}%</p>
    </Html>
  );
}

/**
 * Dim, dark lighting with a deep red rim: almost no front light, strong red strips
 * from behind and the sides so the black body is only outlined by red glints.
 */
function Lights(): React.ReactElement {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = 0.85;
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.12} color="#ff3030" />
      <directionalLight position={[-6, 3, -7]} intensity={3} color="#ff1414" />
      <directionalLight position={[7, 2, -5]} intensity={2} color="#c00000" />
      <Environment resolution={256}>
        <Lightformer form="rect" color="#ff2a2a" intensity={1.2} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[16, 16, 1]} />
        <Lightformer form="rect" color="#ff1010" intensity={11} position={[-9, 1, 2]} rotation-y={Math.PI / 2} scale={[12, 3, 1]} />
        <Lightformer form="rect" color="#ff1010" intensity={11} position={[9, 1, -2]} rotation-y={-Math.PI / 2} scale={[12, 3, 1]} />
        <Lightformer form="rect" color="#d00000" intensity={7} position={[0, 2, -9]} scale={[14, 3, 1]} />
        <Lightformer form="rect" color="#500000" intensity={0.3} position={[0, 2, 9]} scale={[14, 3, 1]} />
      </Environment>
    </>
  );
}

interface SceneProps {
  view: View;
  finishId: string;
  reducedMotion: boolean;
}

/** The JUNO.1 model: rises in from below on load, recolours with the dots, camera moves between views */
function Scene({ view, finishId, reducedMotion }: SceneProps): React.ReactElement {
  const { scene } = useGLTF(SITE.modelUrl);
  const group = useRef<THREE.Group>(null);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / Math.max(s.size.height, 1));
  const firstRun = useRef(true);
  const rose = useRef(false);

  const frames = useMemo<Record<View, Frame> & { radius: number }>(() => {
    scene.updateMatrixWorld(true);
    const full = new THREE.Box3().setFromObject(scene);

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
      radius: full.getBoundingSphere(new THREE.Sphere()).radius,
    };
  }, [scene, aspect, camera]);

  // Pop-up: start below the bottom edge of the frame, then rise with a small overshoot
  useLayoutEffect(() => {
    const g = group.current;
    if (!g || rose.current || reducedMotion) return;
    rose.current = true;

    const f = frames.full;
    const toTarget = f.position.clone().sub(f.target);
    const dist = toTarget.length();
    const m = new THREE.Matrix4().lookAt(f.position, f.target, new THREE.Vector3(0, 1, 0));
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    const down = new THREE.Vector3(0, -1, 0).applyQuaternion(q);
    const halfH = dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const offset = down.multiplyScalar(halfH + frames.radius * 1.2);

    g.position.copy(offset);
    const tween = gsap.to(g.position, { x: 0, y: 0, z: 0, duration: 2, delay: 0.5, ease: "back.out(1.25)" });
    return () => {
      tween.kill();
    };
  }, [frames, camera, reducedMotion]);

  // Colour dots: swap the enclosure's dark texture for a flat tint (Obsidian restores it)
  const body = useMemo(() => {
    const found: THREE.Mesh[] = [];
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.name === "Cube") found.push(o as THREE.Mesh);
    });
    const mesh = found[0];
    if (!mesh) return null;
    const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
    return { mat, map: mat.map, color: mat.color.clone() };
  }, [scene]);

  useEffect(() => {
    if (!body) return;
    const finish = finishes.find((f) => f.id === finishId);
    if (!finish) return;
    const { mat } = body;

    if (!finish.tint) {
      mat.map = body.map;
      mat.color.copy(body.color);
      mat.needsUpdate = true;
      return;
    }
    const target = new THREE.Color(finish.tint);
    mat.map = null;
    mat.color.setRGB(0.02, 0.02, 0.02);
    mat.needsUpdate = true;
    const tween = gsap.to(mat.color, { r: target.r, g: target.g, b: target.b, duration: 0.7, ease: "power2.out" });
    return () => {
      tween.kill();
    };
  }, [finishId, body]);

  // Camera moves between Full view and Close-up
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
      <group ref={group}>
        <primitive object={scene} />
      </group>
      {/* Dragging is off by request: the camera drifts slowly around the model instead */}
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.7}
      />
    </>
  );
}

gsap.ticker.lagSmoothing(0);
useGLTF.preload(SITE.modelUrl);

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

interface ModelCanvasProps {
  view: View;
  finishId: string;
  inView: boolean;
  reducedMotion: boolean;
}

/** The heavy part (three.js): loaded lazily so the heading animation can start immediately. */
function ModelCanvas({ view, finishId, inView, reducedMotion }: ModelCanvasProps): React.ReactElement {
  return (
    <ViewerBoundary>
      <Canvas
        dpr={[1, 2]}
        frameloop={inView ? "always" : "never"}
        camera={{ fov: 30, near: 0.1, far: 500, position: [0, 10, 30] }}
        gl={{ antialias: true, alpha: true }}
        aria-label="3D model of JUNO.1, slowly rotating."
      >
        <Lights />
        <Suspense fallback={<Loader />}>
          <Scene view={view} finishId={finishId} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </ViewerBoundary>
  );
}

export default ModelCanvas;
