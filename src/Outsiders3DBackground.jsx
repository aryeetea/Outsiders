import { useEffect, useRef } from "react";

const THREE_VERSION = "0.160.0";
const FONT_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/fonts/helvetiker_bold.typeface.json`;

export default function Outsiders3DBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    async function initScene() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const [THREE, { FontLoader }, { TextGeometry }] = await Promise.all([
        import(/* @vite-ignore */ `https://esm.sh/three@${THREE_VERSION}`),
        import(/* @vite-ignore */ `https://esm.sh/three@${THREE_VERSION}/examples/jsm/loaders/FontLoader.js`),
        import(/* @vite-ignore */ `https://esm.sh/three@${THREE_VERSION}/examples/jsm/geometries/TextGeometry.js`),
      ]);

      if (cancelled) return;

      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 13);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 3.3);
      keyLight.position.set(4, 6, 8);
      scene.add(keyLight);

      const colorKick = new THREE.DirectionalLight(0xff5f5f, 1.1);
      colorKick.position.set(-5, 2.5, 5);
      scene.add(colorKick);

      const textGroup = new THREE.Group();
      scene.add(textGroup);

      const loader = new FontLoader();
      let animationFrame = 0;
      const geometries = [];
      const materials = [];

      loader.load(FONT_URL, (font) => {
        if (cancelled) return;

        const textGeometry = new TextGeometry("OUTSIDERS", {
          font,
          size: 1.32,
          height: 0.34,
          curveSegments: 5,
          bevelEnabled: true,
          bevelThickness: 0.045,
          bevelSize: 0.035,
          bevelSegments: 2,
        });
        textGeometry.computeBoundingBox();
        textGeometry.center();
        geometries.push(textGeometry);

        const textMaterial = new THREE.MeshToonMaterial({ color: 0xffd51f });
        materials.push(textMaterial);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        const outlineGeometry = textGeometry.clone();
        geometries.push(outlineGeometry);
        const outlineMaterial = new THREE.MeshBasicMaterial({
          color: 0x17151f,
          side: THREE.BackSide,
        });
        materials.push(outlineMaterial);
        const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outlineMesh.scale.set(1.08, 1.16, 1.12);
        outlineMesh.position.z = -0.03;

        const edgeGeometry = new THREE.EdgesGeometry(textGeometry, 18);
        geometries.push(edgeGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x17151f });
        materials.push(edgeMaterial);
        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);

        textGroup.add(outlineMesh);
        textGroup.add(textMesh);
        textGroup.add(edgeLines);
        resizeScene();
      });

      function resizeScene() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        camera.position.z = width < 640 ? 14.6 : width < 1024 ? 12.9 : 11.35;
        textGroup.scale.setScalar(width < 640 ? 0.68 : width < 1024 ? 0.94 : 1.18);
        textGroup.position.set(0, width < 640 ? 0.15 : 0, 0);
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      }

      function animate() {
        animationFrame = window.requestAnimationFrame(animate);
        textGroup.rotation.y += 0.0045;
        textGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.045;
        renderer.render(scene, camera);
      }

      window.addEventListener("resize", resizeScene);
      animate();

      cleanup = () => {
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", resizeScene);
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        renderer.dispose();
      };
    }

    initScene().catch((error) => {
      console.warn("[Outsiders] 3D background could not load:", error);
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="outsiders-3d-background"
      aria-hidden="true"
    />
  );
}
