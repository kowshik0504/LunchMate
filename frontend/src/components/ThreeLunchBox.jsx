import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeLunchBox = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 5.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ─ Environment lights ─
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0xFF6040, 3.5);
    dirLight1.position.set(4, 6, 4);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x2EC4B6, 2.5);
    dirLight2.position.set(-5, -2, -3);
    scene.add(dirLight2);
    const pointLight = new THREE.PointLight(0xFF9F1C, 2, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // ─ Tiffin group ─
    const tiffinGroup = new THREE.Group();
    scene.add(tiffinGroup);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0xDDE6F0, metalness: 0.92, roughness: 0.12 });
    const goldMat  = new THREE.MeshStandardMaterial({ color: 0xD4A227, metalness: 0.98, roughness: 0.08 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xFF5E36, metalness: 0.5, roughness: 0.3 });

    const addTier = (y, r=1.08) => {
      const geo = new THREE.CylinderGeometry(r, r, 0.75, 40, 1, false);
      const m = new THREE.Mesh(geo, steelMat); m.position.y = y;
      tiffinGroup.add(m);
      const edge = new THREE.Mesh(new THREE.TorusGeometry(r+0.01, 0.03, 12, 40), goldMat);
      edge.rotation.x = Math.PI/2; edge.position.y = y+0.375;
      tiffinGroup.add(edge);
      const baseEdge = new THREE.Mesh(new THREE.TorusGeometry(r+0.01, 0.03, 12, 40), goldMat);
      baseEdge.rotation.x = Math.PI/2; baseEdge.position.y = y-0.375;
      tiffinGroup.add(baseEdge);
    };

    addTier(-1.0);
    addTier(-0.15);
    addTier(0.70);

    // Lid
    const lidGeo = new THREE.CylinderGeometry(0.85, 1.09, 0.28, 40);
    const lid = new THREE.Mesh(lidGeo, steelMat);
    lid.position.y = 1.22; tiffinGroup.add(lid);

    const knobGeo = new THREE.SphereGeometry(0.2, 20, 20);
    const knob = new THREE.Mesh(knobGeo, goldMat);
    knob.position.y = 1.44; tiffinGroup.add(knob);

    // Clamp band
    const clampGeo = new THREE.TorusGeometry(1.15, 0.04, 12, 40, Math.PI * 1.4);
    const clamp = new THREE.Mesh(clampGeo, goldMat);
    clamp.rotation.x = Math.PI/2; clamp.position.y = 0.15; tiffinGroup.add(clamp);
    const clamp2 = clamp.clone(); clamp2.rotation.z = Math.PI; tiffinGroup.add(clamp2);

    // Stripe rings accent
    [-1.0, -0.15, 0.70].forEach(y => {
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(1.09, 0.025, 8, 40), accentMat);
      stripe.rotation.x = Math.PI/2; stripe.position.y = y;
      tiffinGroup.add(stripe);
    });

    // ─ Steam particles ─
    const STEAM = 80;
    const steamGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(STEAM * 3);
    const sizes = new Float32Array(STEAM);
    const randomness = new Float32Array(STEAM * 2);

    for (let i = 0; i < STEAM; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.8;
      pos[i*3]   = Math.cos(angle) * radius;
      pos[i*3+1] = 1.6 + Math.random() * 2.5;
      pos[i*3+2] = Math.sin(angle) * radius;
      sizes[i] = 0.05 + Math.random() * 0.1;
      randomness[i*2]   = (Math.random() - 0.5) * 0.02;
      randomness[i*2+1] = 0.008 + Math.random() * 0.012;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const steamMat = new THREE.PointsMaterial({
      color: 0xFF9F1C,
      size: 0.09,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });
    const steam = new THREE.Points(steamGeo, steamMat);
    scene.add(steam);

    // ─ Floating sparkle particles ─
    const SPARKS = 200;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(SPARKS * 3);
    for (let i = 0; i < SPARKS; i++) {
      sparkPos[i*3]   = (Math.random() - 0.5) * 10;
      sparkPos[i*3+1] = (Math.random() - 0.5) * 10;
      sparkPos[i*3+2] = (Math.random() - 0.5) * 4 - 4;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0x4FC3F7,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    // ─ Interaction ─
    let mouseX = 0, mouseY = 0;
    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      tiffinGroup.rotation.y = t * 0.35 + mouseX * 0.6;
      tiffinGroup.rotation.x = Math.sin(t * 0.4) * 0.08 - mouseY * 0.18;
      tiffinGroup.position.y = Math.sin(t * 1.2) * 0.07;

      // Steam rise
      const steamPositions = steamGeo.attributes.position.array;
      for (let i = 0; i < STEAM; i++) {
        steamPositions[i*3+1] += randomness[i*2+1];
        steamPositions[i*3]   += Math.sin(t + i) * randomness[i*2];
        if (steamPositions[i*3+1] > 4.2) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 0.8;
          steamPositions[i*3]   = Math.cos(angle) * radius;
          steamPositions[i*3+1] = 1.6;
          steamPositions[i*3+2] = Math.sin(angle) * radius;
        }
      }
      steamGeo.attributes.position.needsUpdate = true;

      // Sparks gentle drift
      const spkPos = sparkGeo.attributes.position.array;
      for (let i = 0; i < SPARKS; i++) {
        spkPos[i*3+1] += 0.003;
        if (spkPos[i*3+1] > 5) spkPos[i*3+1] = -5;
      }
      sparkGeo.attributes.position.needsUpdate = true;

      // Point light orbit
      pointLight.position.x = Math.sin(t * 0.7) * 3;
      pointLight.position.z = Math.cos(t * 0.7) * 2;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
  );
};
