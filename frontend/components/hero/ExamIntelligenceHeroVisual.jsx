"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ExamIntelligenceHeroVisual() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check device capability / reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Dimensional Academic Topic Nodes & Exam Graph
    const group = new THREE.Group();
    scene.add(group);

    // Central geometric node representing NLP Intelligence Core (Icosahedron wireframe + solid core)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x433d8b,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    const innerGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x2e236c,
      transparent: true,
      opacity: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // Orbiting Syllabus Nodes (Floating documents and topic clusters)
    const nodeCount = 28;
    const nodePositions = [];
    const nodeColors = [0xc8acd6, 0x38bdf8, 0x8b5cf6, 0xffffff];

    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      const radius = 2.2 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      nodePositions.push(new THREE.Vector3(x, y, z));

      const hex = nodeColors[Math.floor(Math.random() * nodeColors.length)];
      const c = new THREE.Color(hex);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Synaptic Connection Lines between Exam Question Nodes
    const lineIndices = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 2.0) {
          lineIndices.push(nodePositions[i], nodePositions[j]);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry().setFromPoints(lineIndices);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xc8acd6,
      transparent: true,
      opacity: 0.18,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // Floating Holographic Document Cards (Question Papers entering the system)
    const cardGroup = new THREE.Group();
    group.add(cardGroup);

    const cardGeo = new THREE.PlaneGeometry(0.8, 1.1);
    const cardMat1 = new THREE.MeshBasicMaterial({
      color: 0x17153b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });

    const cardEdges = new THREE.EdgesGeometry(cardGeo);
    const cardEdgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });

    for (let i = 0; i < 3; i++) {
      const card = new THREE.Mesh(cardGeo, cardMat1);
      const edge = new THREE.LineSegments(cardEdges, cardEdgeMat);
      card.add(edge);

      card.position.set(-2.4 + i * 2.4, 0.4 - i * 0.4, 0.6 - i * 0.5);
      card.rotation.set(0.2, -0.3 + i * 0.3, -0.1);
      cardGroup.add(card);
    }

    // 3. Mouse Interaction Parallax
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 0.6;
      targetY = (e.clientY / innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 4. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow organic rotation
      coreMesh.rotation.y = elapsedTime * 0.12;
      coreMesh.rotation.x = elapsedTime * 0.08;
      particles.rotation.y = -elapsedTime * 0.06;
      lines.rotation.y = -elapsedTime * 0.06;

      // Subtle breathing scale
      const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.03;
      innerMesh.scale.set(scale, scale, scale);

      // Card hovering
      cardGroup.children.forEach((c, idx) => {
        c.position.y += Math.sin(elapsedTime * 2 + idx) * 0.0015;
      });

      // Smooth parallax damping
      group.rotation.y += (targetX - group.rotation.y) * 0.05;
      group.rotation.x += (targetY - group.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 5. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[620px] flex items-center justify-center select-none pointer-events-none">
      {/* Three.js canvas mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

      {/* Atmospheric lighting glows */}
      <div className="absolute w-72 h-72 rounded-full bg-brand-royal/30 blur-[100px] pointer-events-none" />
      <div className="absolute w-60 h-60 rounded-full bg-brand-cyan/15 blur-[90px] translate-x-32 -translate-y-20 pointer-events-none" />
    </div>
  );
}
