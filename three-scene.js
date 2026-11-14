/**
 * Custom 60fps 3D Scroll-Driven Canvas Engine (Zero External Dependencies)
 * Morphs between 7 distinct 3D states as the user scrolls through the Manifesto.
 * Optimized for Desktop, Tablet, and Mobile viewports.
 */

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

// Regular Icosahedron vertices & edges for Chapter 0/1 central 3D sculpture
const RAW_VERTS = [
  [-1, GOLDEN_RATIO, 0], [1, GOLDEN_RATIO, 0], [-1, -GOLDEN_RATIO, 0], [1, -GOLDEN_RATIO, 0],
  [0, -1, GOLDEN_RATIO], [0, 1, GOLDEN_RATIO], [0, -1, -GOLDEN_RATIO], [0, 1, -GOLDEN_RATIO],
  [GOLDEN_RATIO, 0, -1], [GOLDEN_RATIO, 0, 1], [-GOLDEN_RATIO, 0, -1], [-GOLDEN_RATIO, 0, 1],
].map(([x, y, z]) => {
  const len = Math.hypot(x, y, z);
  return { x: x / len, y: y / len, z: z / len };
});

const ICO_EDGES = [
  [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
  [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
  [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
  [4, 9], [2, 4], [6, 2], [8, 6], [9, 8],
  [1, 9], [5, 4], [11, 2], [10, 6], [7, 8],
  [0, 1], [3, 2], [4, 11], [5, 9], [8, 1],
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function rotate3D(p, rx, ry, rz) {
  // Rotate X
  let y = p.y * Math.cos(rx) - p.z * Math.sin(rx);
  let z = p.y * Math.sin(rx) + p.z * Math.cos(rx);
  let x = p.x;

  // Rotate Y
  const x2 = x * Math.cos(ry) + z * Math.sin(ry);
  const z2 = -x * Math.sin(ry) + z * Math.cos(ry);
  x = x2;
  z = z2;

  // Rotate Z
  const x3 = x * Math.cos(rz) - y * Math.sin(rz);
  const y3 = x * Math.sin(rz) + y * Math.cos(rz);
  return { x: x3, y: y3, z };
}

export class Manifesto3DScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.scrollProgress = 0; // 0.0 -> 6.0
    this.targetScroll = 0;
    this.activePillar = 0;
    this.signaturePulse = 0;

    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this.time = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generate 84 3D nodes with deterministic spherical seeds
    this.nodes = Array.from({ length: 84 }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 84);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        id: i,
        phi,
        theta,
        radiusOffset: 0.75 + ((i * 17) % 10) * 0.05,
        speed: 0.4 + ((i * 13) % 7) * 0.1,
        size: 1.8 + ((i * 7) % 5) * 0.55,
        cluster: i % 2 === 0 ? -1 : 1,
        hueType: i % 3, // 0: ochre, 1: terracotta, 2: sage/ivory
      };
    });

    this.resize();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener(
      'pointermove',
      (e) => {
        this.pointer.tx = (e.clientX / Math.max(this.width, 1) - 0.5) * 2;
        this.pointer.ty = (e.clientY / Math.max(this.height, 1) - 0.5) * 2;
      },
      { passive: true }
    );
  }

  setScrollProgress(val) {
    this.targetScroll = clamp(val, 0, 6);
  }

  setActivePillar(idx) {
    this.activePillar = idx;
  }

  pulseNewSignature() {
    this.signaturePulse = 1.0;
  }

  project(p, fov, camZ) {
    const z = p.z + camZ;
    if (z <= 0.2) return null;
    const scale = fov / z;
    return {
      x: this.width * 0.5 + p.x * scale,
      y: this.height * 0.5 + p.y * scale,
      scale,
      z,
    };
  }

  getNodePosition(node, chapterFloat, t) {
    // Smoothly interpolate node 3D position based on chapterFloat (0..6)
    const isMobile = this.width < 768;
    const spread = isMobile ? 0.72 : 1.0;

    // State 0: Restless orbiting desire shards around center
    const r0 = (2.1 + Math.sin(t * node.speed + node.id) * 0.45) * spread;
    const a0 = node.theta + t * 0.25 * node.speed;
    const p0 = {
      x: Math.sin(node.phi) * Math.cos(a0) * r0,
      y: Math.cos(node.phi) * r0 * 0.85,
      z: Math.sin(node.phi) * Math.sin(a0) * r0,
    };

    // State 2: Two separated clusters with tension between them
    const clusterShift = node.cluster * (isMobile ? 1.15 : 1.75);
    const p2 = {
      x: clusterShift + Math.cos(node.theta + t * 0.15) * 0.75 * node.radiusOffset,
      y: Math.sin(node.phi * 2 + t * 0.2) * 0.9 * spread,
      z: Math.sin(node.theta + t * 0.15) * 0.75 * node.radiusOffset,
    };

    // State 3: Four harmonic pillar orbits
    const pillarIndex = node.id % 4;
    const pillarAngle = (pillarIndex * Math.PI) / 2 + t * 0.22;
    const pillarCenter = {
      x: Math.cos(pillarAngle) * 1.45 * spread,
      y: Math.sin(pillarAngle * 2) * 0.55,
      z: Math.sin(pillarAngle) * 1.45 * spread,
    };
    const p3 = {
      x: pillarCenter.x + Math.cos(node.theta + t * 0.5) * 0.38,
      y: pillarCenter.y + Math.sin(node.phi + t * 0.5) * 0.38,
      z: pillarCenter.z + Math.sin(node.theta + t * 0.5) * 0.38,
    };

    // State 4: Wide interconnected constellation web
    const r4 = (2.25 + node.radiusOffset * 0.5) * spread;
    const p4 = {
      x: Math.sin(node.phi) * Math.cos(node.theta + t * 0.08) * r4,
      y: Math.cos(node.phi) * r4 * 0.75,
      z: Math.sin(node.phi) * Math.sin(node.theta + t * 0.08) * r4,
    };

    // State 6: Unified radiant ring / sphere of signatures
    const ringAngle = (node.id / 84) * Math.PI * 2 + t * 0.14;
    const ringRadius = (1.75 + Math.sin(node.id * 3 + t) * 0.12 + this.signaturePulse * 0.35) * spread;
    const p6 = {
      x: Math.cos(ringAngle) * ringRadius,
      y: Math.sin(node.id * 0.8 + t * 0.4) * 0.45,
      z: Math.sin(ringAngle) * ringRadius,
    };

    if (chapterFloat < 2) {
      const k = clamp(chapterFloat / 2, 0, 1);
      return {
        x: lerp(p0.x, p2.x, k),
        y: lerp(p0.y, p2.y, k),
        z: lerp(p0.z, p2.z, k),
      };
    }
    if (chapterFloat < 3) {
      const k = chapterFloat - 2;
      return {
        x: lerp(p2.x, p3.x, k),
        y: lerp(p2.y, p3.y, k),
        z: lerp(p2.z, p3.z, k),
      };
    }
    if (chapterFloat < 4.5) {
      const k = clamp((chapterFloat - 3) / 1.5, 0, 1);
      return {
        x: lerp(p3.x, p4.x, k),
        y: lerp(p3.y, p4.y, k),
        z: lerp(p3.z, p4.z, k),
      };
    }
    const k = clamp((chapterFloat - 4.5) / 1.5, 0, 1);
    return {
      x: lerp(p4.x, p6.x, k),
      y: lerp(p4.y, p6.y, k),
      z: lerp(p4.z, p6.z, k),
    };
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.reducedMotion) {
      this.time += 0.012;
    }

    this.scrollProgress = lerp(this.scrollProgress, this.targetScroll, 0.08);
    this.pointer.x = lerp(this.pointer.x, this.pointer.tx, 0.06);
    this.pointer.y = lerp(this.pointer.y, this.pointer.ty, 0.06);
    this.signaturePulse = Math.max(0, this.signaturePulse - 0.018);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Subtle paper fade during Chapter 5 (when light paper section is active)
    const onPaperWeight = clamp(1 - Math.abs(this.scrollProgress - 5) * 1.4, 0, 1);
    const globalAlpha = lerp(1, 0.28, onPaperWeight);

    const isMobile = this.width < 768;
    const fov = isMobile ? 310 : 480;
    const camZ = isMobile ? 5.6 : 5.2;

    const rotX = this.pointer.y * 0.24 + this.scrollProgress * 0.18;
    const rotY = this.pointer.x * 0.32 + this.time * 0.16;
    const rotZ = this.scrollProgress * 0.08;

    // 1. Draw Central 3D Icosahedron Crystal (fades out gently after Chapter 2)
    const crystalVisibility = clamp(1 - (this.scrollProgress - 0.4) * 0.45, 0, 1);
    if (crystalVisibility > 0.02) {
      const crystalScale = (isMobile ? 0.92 : 1.25) * (1 + this.scrollProgress * 0.15);
      const projectedVerts = RAW_VERTS.map((v) => {
        const scaled = { x: v.x * crystalScale, y: v.y * crystalScale, z: v.z * crystalScale };
        const rotated = rotate3D(scaled, rotX + this.time * 0.22, rotY, rotZ);
        return this.project(rotated, fov, camZ);
      });

      ctx.save();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = `rgba(224, 164, 68, ${0.34 * crystalVisibility * globalAlpha})`;
      for (const [i, j] of ICO_EDGES) {
        const a = projectedVerts[i];
        const b = projectedVerts[j];
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Project all 3D nodes & depth-sort them
    const projectedNodes = [];
    for (const node of this.nodes) {
      const raw = this.getNodePosition(node, this.scrollProgress, this.time);
      const rotated = rotate3D(raw, rotX * 0.65, rotY * 0.5, rotZ);
      const proj = this.project(rotated, fov, camZ);
      if (proj) {
        projectedNodes.push({ node, proj });
      }
    }
    projectedNodes.sort((a, b) => b.proj.z - a.proj.z);

    // 3. Draw connection filaments between nearby 3D nodes (increases as we move from isolation to connection!)
    const connectionStrength = clamp((this.scrollProgress - 0.6) / 2.2, 0.15, 1.0);
    const maxDist = isMobile ? 76 : 108;

    ctx.save();
    ctx.lineWidth = 0.85;
    for (let i = 0; i < projectedNodes.length; i++) {
      const A = projectedNodes[i];
      for (let j = i + 1; j < projectedNodes.length; j++) {
        const B = projectedNodes[j];
        const dx = A.proj.x - B.proj.x;
        const dy = A.proj.y - B.proj.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.24 * connectionStrength * globalAlpha;
          ctx.strokeStyle =
            onPaperWeight > 0.5
              ? `rgba(212, 101, 59, ${alpha})`
              : `rgba(224, 164, 68, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(A.proj.x, A.proj.y);
          ctx.lineTo(B.proj.x, B.proj.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // 4. Draw 4 Harmonic Pillar Orbs in Chapter 3
    const pillarVis = clamp(1 - Math.abs(this.scrollProgress - 3) * 1.1, 0, 1);
    if (pillarVis > 0.02) {
      const spread = isMobile ? 0.72 : 1.0;
      for (let p = 0; p < 4; p++) {
        const angle = (p * Math.PI) / 2 + this.time * 0.22;
        const pos = {
          x: Math.cos(angle) * 1.45 * spread,
          y: Math.sin(angle * 2) * 0.55,
          z: Math.sin(angle) * 1.45 * spread,
        };
        const rotated = rotate3D(pos, rotX * 0.65, rotY * 0.5, rotZ);
        const proj = this.project(rotated, fov, camZ);
        if (!proj) continue;

        const isActive = p === this.activePillar;
        const r = (isActive ? 28 : 16) * (proj.scale / 110);
        const grad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, Math.max(r * 2.2, 8));
        if (isActive) {
          grad.addColorStop(0, `rgba(224, 164, 68, ${0.85 * pillarVis})`);
          grad.addColorStop(0.5, `rgba(212, 101, 59, ${0.35 * pillarVis})`);
          grad.addColorStop(1, 'rgba(212, 101, 59, 0)');
        } else {
          grad.addColorStop(0, `rgba(243, 237, 226, ${0.45 * pillarVis})`);
          grad.addColorStop(1, 'rgba(243, 237, 226, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(r * 2.2, 8), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Render depth-sorted particles
    for (const { node, proj } of projectedNodes) {
      const depthFade = clamp(1.3 - proj.z / 9, 0.2, 1);
      const radius = clamp(node.size * (proj.scale / 115), 1.1, 6.5);
      const alpha = depthFade * 0.85 * globalAlpha;

      let color;
      if (node.hueType === 0) {
        color = `rgba(224, 164, 68, ${alpha})`;
      } else if (node.hueType === 1) {
        color = `rgba(212, 101, 59, ${alpha})`;
      } else {
        color = onPaperWeight > 0.5 ? `rgba(92, 131, 103, ${alpha})` : `rgba(243, 237, 226, ${alpha * 0.8})`;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
