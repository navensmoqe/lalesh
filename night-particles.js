import * as THREE from 'three';

/**
 * Luminous Night Particles: a single GPU-animated point cloud, with no image
 * downloads, per-particle lights, or per-frame geometry allocations.
 * Embers rise and dissolve; fireflies hover and pulse at independent slow rates.
 */
export function createNightParticles({ lowPower, reducedMotion, random, terrainHeight, emitters, renderer }) {
  const count = lowPower ? 140 : 320;
  const positions = new Float32Array(count * 3);
  const motion = new Float32Array(count * 4);
  const variation = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);
  const between = (a, b) => THREE.MathUtils.lerp(a, b, random());
  const amber = new THREE.Color('#ffb64f');
  const gold = new THREE.Color('#ffe7a3');
  const tint = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const zone = random();
    const firefly = random() < 0.38;
    let x, y, z;
    if (zone < 0.32 && emitters.length) {
      // Begin near the actual lanterns already placed throughout the scene.
      const lamp = emitters[Math.floor(random() * emitters.length)];
      x = lamp.x + between(-0.65, 0.65);
      y = lamp.y;
      z = lamp.z + between(-0.65, 0.65);
    } else if (zone < 0.7) {
      // Open courtyard, away from the main building's solid footprint.
      x = between(-8.7, 6.8); z = between(2.4, 18.3); y = 0.82;
    } else if (zone < 0.85) {
      // Soft columns of light alongside the sacred architecture.
      x = (random() < 0.5 ? -1 : 1) * between(18, 24);
      z = between(-16, 18); y = terrainHeight(x, z) + 0.3;
    } else {
      const angle = random() * Math.PI * 2, radius = between(27, 61);
      x = Math.cos(angle) * radius; z = Math.sin(angle) * radius;
      y = terrainHeight(x, z) + 0.3;
    }
    positions.set([x, y, z], i * 3);
    // Phase, angular speed, horizontal sway, and particle kind (1 = firefly).
    motion.set([random(), between(0.12, 0.28), between(0.35, firefly ? 1.9 : 1.25), firefly ? 1 : 0], i * 4);
    // Lifetime, rise height, world-space glow diameter, and independent phase.
    variation.set([between(58, 100), between(10, 22), between(firefly ? 0.52 : 0.33, firefly ? 0.85 : 0.65), random() * Math.PI * 2], i * 4);
    tint.copy(amber).lerp(gold, between(firefly ? 0.48 : 0.08, firefly ? 0.9 : 0.6));
    tint.toArray(colors, i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aMotion', new THREE.BufferAttribute(motion, 4));
  geometry.setAttribute('aVariation', new THREE.BufferAttribute(variation, 4));
  geometry.setAttribute('aTint', new THREE.BufferAttribute(colors, 3));
  const uniforms = {
    uTime: { value: 0 }, uNight: { value: 1 }, uFogDensity: { value: 0.0052 },
    uViewportHeight: { value: 1 }, uMaxPointSize: { value: 32 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    toneMapped: true,
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform float uNight;
      uniform float uViewportHeight;
      uniform float uMaxPointSize;
      attribute vec4 aMotion;
      attribute vec4 aVariation;
      attribute vec3 aTint;
      varying vec3 vTint;
      varying float vOpacity;
      varying float vDepth;

      void main() {
        float age = fract(aMotion.x + uTime / aVariation.x);
        float phase = aVariation.w;
        float drift = uTime * aMotion.y;
        vec3 p = position;
        // Two low-frequency waves avoid uniform circular or mechanical movement.
        p.x += aMotion.z * (0.72 * sin(drift + phase) + 0.28 * sin(drift * 0.47 + phase * 1.7));
        p.z += aMotion.z * (0.65 * cos(drift * 0.81 + phase) + 0.35 * sin(drift * 0.39 + phase * 2.3));
        float hover = 1.25 + 0.65 * sin(drift * 0.63 + phase);
        p.y += mix(age * aVariation.y, hover, aMotion.w);

        // Both ends of the ascent are invisible, concealing each particle's reset.
        float emberFade = smoothstep(0.0, 0.14, age) * (1.0 - smoothstep(0.68, 1.0, age));
        float pulse = 0.72 + 0.28 * sin(uTime * (0.36 + aMotion.x * 0.24) + phase);
        vOpacity = mix(emberFade * 0.8, 0.88, aMotion.w) * pulse * uNight;
        vTint = aTint;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        vDepth = -mvPosition.z;
        // Physical drawing-buffer size keeps glows consistent after DPR changes.
        gl_PointSize = clamp(aVariation.z * 0.5 * uViewportHeight * projectionMatrix[1][1] / max(vDepth, 0.1), 1.0, uMaxPointSize);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uFogDensity;
      varying vec3 vTint;
      varying float vOpacity;
      varying float vDepth;

      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(p, p);
        if (r2 >= 1.0 || vDepth <= 0.0) discard;
        float core = exp(-r2 * 72.0);
        float body = exp(-r2 * 18.0) * 0.55;
        float halo = exp(-r2 * 4.8) * 0.22;
        float edge = 1.0 - smoothstep(0.72, 1.0, r2);
        float fogFade = exp(-uFogDensity * uFogDensity * vDepth * vDepth);
        float nearFade = smoothstep(1.5, 5.0, vDepth);
        float alpha = min(0.95, (core * 0.65 + body + halo) * edge * vOpacity * fogFade * nearFade);
        if (alpha < 0.002) discard;
        // HDR cores feed desktop bloom; the radial halo also glows without bloom.
        gl_FragColor = vec4(vTint * (1.2 + core * 2.6), alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.name = 'Luminous_Night_Embers_and_Fireflies';
  // Positions move in the shader beyond the base geometry's bounding sphere.
  points.frustumCulled = false;
  const drawingBuffer = new THREE.Vector2();
  const gl = renderer.getContext();
  const devicePointLimit = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];

  return {
    points,
    resize() {
      renderer.getDrawingBufferSize(drawingBuffer);
      uniforms.uViewportHeight.value = drawingBuffer.y;
      uniforms.uMaxPointSize.value = Math.min(devicePointLimit, 32 * renderer.getPixelRatio());
    },
    update(dt, nightAmount, fogDensity) {
      const fade = THREE.MathUtils.clamp((nightAmount - 0.06) / 0.94, 0, 1);
      uniforms.uNight.value = fade * fade * (3 - 2 * fade);
      uniforms.uFogDensity.value = fogDensity;
      points.visible = fade > 0;
      // Keep the calm glow, but freeze decorative motion for reduced-motion users.
      if (points.visible && !reducedMotion) uniforms.uTime.value += dt;
    },
  };
}
