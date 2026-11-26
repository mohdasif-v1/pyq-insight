"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ExamIntelligenceHeroVisual() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // Renderer with memory & performance safety
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLightPrimary = new THREE.PointLight(0xc8acd6, 2.5, 20);
    pointLightPrimary.position.set(3, 4, 4);
    scene.add(pointLightPrimary);

    const pointLightSecondary = new THREE.PointLight(0x38bdf8, 2.0, 20);
    pointLightSecondary.position.set(-4, -3, 3);
    scene.add(pointLightSecondary);

    // 3. Central Semantic Group: Academic NLP Intelligence Core
    // Workflow Visualization: Paper Ingestion -> Question Segment -> Topic Mapping -> Trend Output
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Core Geometry: Multi-layered Polyhedron (Embedding Space)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x2e236c,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // Inner Radiant Nucleus (TF-IDF Topic Convergence)
    const nucleusGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x433d8b,
      emissive: 0x2e236c,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    masterGroup.add(nucleusMesh);

    // Orbital Ring: Syllabus Alignment Horizon
    const ringGeo = new THREE.TorusGeometry(1.9, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc8acd6,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    masterGroup.add(ringMesh);

    const ring2Mesh = new THREE.Mesh(ringGeo, ringMat);
    ring2Mesh.rotation.x = -Math.PI / 3;
    ring2Mesh.rotation.y = Math.PI / 6;
    masterGroup.add(ring2Mesh);

    // 4. Topic Node Clusters & Synaptic Connections
    // Representing extracted questions connecting to syllabus topic nodes
    const nodeCount = 32;
    const nodePositions = [];
    const nodeColors = [0xc8acd6, 0x38bdf8, 0x8b5cf6, 0xffffff];

    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      const radius = 2.1 + (i % 3) * 0.55;
      const theta = (i / nodeCount) * Math.PI * 2 + (Math.random() * 0.4);
      const phi = Math.acos((Math.random() * 2) - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) * 0.7; // slight flattening for dimensional readability

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      nodePositions.push(new THREE.Vector3(x, y, z));

      const hex = nodeColors[i % nodeColors.length];
      const c = new THREE.Color(hex);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particles);

    // Vectorized Synapses (Cosine Similarity Lines connecting related questions)
    const lineIndices = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 1.75) {
          lineIndices.push(nodePositions[i], nodePositions[j]);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry().setFromPoints(lineIndices);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xc8acd6,
      transparent: true,
      opacity: 0.22,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    masterGroup.add(lines);

    // 5. Floating Holographic Question Paper Document Layers
    const docGroup = new THREE.Group();
    masterGroup.add(docGroup);

    const docGeo = new THREE.PlaneGeometry(0.75, 1.05);
    const docMat = new THREE.MeshStandardMaterial({
      color: 0x17153b,
      roughness: 0.3,
      metalness: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const edgeGeo = new THREE.EdgesGeometry(docGeo);
    const edgeMatCyan = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const edgeMatLavender = new THREE.LineBasicMaterial({ color: 0xc8acd6, transparent: true, opacity: 0.75 });

    const cardConfigs = [
      { pos: [-2.2, 0.6, 0.4], rot: [0.15, -0.3, -0.1], edge: edgeMatCyan },
      { pos: [2.1, 0.8, -0.2], rot: [-0.2, 0.35, 0.1], edge: edgeMatLavender },
      { pos: [0.1, -2.1, 0.3], rot: [0.35, 0.05, 0.05], edge: edgeMatCyan },
    ];

    cardConfigs.forEach((cfg) => {
      const card = new THREE.Mesh(docGeo, docMat);
      const edge = new THREE.LineSegments(edgeGeo, cfg.edge);
      card.add(edge);
      card.position.set(...cfg.pos);
      card.rotation.set(...cfg.rot);
      docGroup.add(card);
    });

    // 6. Intersection Observer (Pause rendering when out of viewport)
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 7. Interactive Parallax Control
    let targetX = 0;
    let targetY = 0;
    const onMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 0.5;
      targetY = (e.clientY / innerHeight - 0.5) * 0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 8. Render Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible || prefersReducedMotion) {
        if (!prefersReducedMotion) return;
      }

      const elapsed = clock.getElapsedTime();

      // Smooth multi-axis rotation
      coreMesh.rotation.y = elapsed * 0.12;
      coreMesh.rotation.x = elapsed * 0.08;
      particles.rotation.y = -elapsed * 0.05;
      lines.rotation.y = -elapsed * 0.05;

      ringMesh.rotation.z = elapsed * 0.1;
      ring2Mesh.rotation.z = -elapsed * 0.12;

      // Organic pulsation
      const breath = 1 + Math.sin(elapsed * 1.6) * 0.04;
      nucleusMesh.scale.set(breath, breath, breath);

      // Micro-hover physics on document cards
      docGroup.children.forEach((c, idx) => {
        c.position.y += Math.sin(elapsed * 1.8 + idx * 1.5) * 0.0012;
      });

      // Smooth mouse-damped parallax interpolation
      masterGroup.rotation.y += (targetX - masterGroup.rotation.y) * 0.04;
      masterGroup.rotation.x += (targetY - masterGroup.rotation.x) * 0.04;

      renderer.render(scene, camera);
    };

    if (!prefersReducedMotion) {
      animate();
    } else {
      renderer.render(scene, camera);
    }

    // 9. Resize Listener
    const onResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Cleanup resources to prevent WebGL memory leaks
    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);

      coreGeo.dispose();
      coreMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      docGeo.dispose();
      docMat.dispose();
      edgeGeo.dispose();
      edgeMatCyan.dispose();
      edgeMatLavender.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      aria-label="3D Academic NLP Intelligence Visualization"
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[600px] flex items-center justify-center select-none overflow-hidden"
    >
      {/* Three.js canvas mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

      {/* Atmospheric backlight layers */}
      <div
        aria-hidden="true"
        className="absolute w-80 h-80 rounded-full bg-brand-royal/25 blur-[100px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute w-64 h-64 rounded-full bg-brand-cyan/15 blur-[90px] translate-x-32 -translate-y-16 pointer-events-none"
      />
    </div>
  );
}
