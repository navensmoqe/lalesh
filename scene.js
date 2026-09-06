import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// A procedural architectural interpretation, not a surveyed reconstruction.
// All geometry and textures are created locally; no remote assets are fetched.
const $ = (id) => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed = 73147;
function random() { seed = (Math.imul(1664525, seed) + 1013904223) | 0; return (seed >>> 0) / 4294967296; }
const range = (a, b) => mix(a, b, random());

function showError(error) {
  console.error(error);
  $('loading').hidden = true;
  $('error-message').hidden = false;
}

try { initialize(); } catch (error) { showError(error); }

function initialize() {
  const container = $('scene');
  const mobile = innerWidth < 701;
  const lowPower = mobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.3 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#101f32');
  scene.fog = new THREE.FogExp2('#152b40', 0.006);
  const camera = new THREE.PerspectiveCamera(mobile ? 51 : 43, innerWidth / innerHeight, 0.2, 700);
  const home = { position: new THREE.Vector3(39, 26, 49), target: new THREE.Vector3(0, 5, 0) };
  const mobileHome = { position: new THREE.Vector3(51, 36, 68), target: new THREE.Vector3(0, 5, 0) };
  const initialHome = mobile ? mobileHome : home;
  camera.position.copy(initialHome.position);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(initialHome.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 17;
  controls.maxDistance = 116;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI / 2 - 0.065;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.7;
  controls.update();

  const world = new THREE.Group();
  world.name = 'Lalish_Holy_Valley';
  scene.add(world);
  const architecture = new THREE.Group();
  architecture.name = 'Temple_and_Courtyard';
  world.add(architecture);
  const landscape = new THREE.Group();
  landscape.name = 'Valley_and_Trees';
  world.add(landscape);

  // Small shared PBR maps: irregular limestone courses and fine mineral grain.
  function stoneTexture(masonry = false) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = masonry ? 1024 : 512;
    const ctx = canvas.getContext('2d');
    const n = canvas.width;
    ctx.fillStyle = '#b7ad92'; ctx.fillRect(0, 0, n, n);
    if (masonry) {
      const rows = 14, rowHeight = n / rows;
      for (let row = 0; row < rows; row++) {
        let x = row % 2 ? -78 : -20;
        while (x < n) {
          const width = range(85, 160), shade = range(155, 203);
          ctx.fillStyle = `rgb(${shade + 17},${shade + 8},${shade - 14})`;
          ctx.fillRect(x + 2, row * rowHeight + 2, width - 4, rowHeight - 4);
          ctx.strokeStyle = 'rgba(65,57,39,.27)'; ctx.lineWidth = 1.3;
          ctx.strokeRect(x + 2, row * rowHeight + 2, width - 4, rowHeight - 4);
          ctx.fillStyle = 'rgba(246,235,201,.22)';
          ctx.fillRect(x + 4, row * rowHeight + 3, width - 8, 2);
          x += width;
        }
      }
    }
    const pixels = ctx.getImageData(0, 0, n, n);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const grain = (random() - 0.5) * 27;
      pixels.data[i] += grain; pixels.data[i + 1] += grain; pixels.data[i + 2] += grain;
    }
    ctx.putImageData(pixels, 0, 0);
    for (let i = 0; i < 1900; i++) {
      ctx.fillStyle = `rgba(51,48,32,${range(0.03, 0.12)})`;
      ctx.fillRect(range(0, n), range(0, n), range(1, 5), range(1, 2));
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }
  const masonryMap = stoneTexture(true), grainMap = stoneTexture();
  const stone = new THREE.MeshStandardMaterial({ color: '#d5c9ac', map: masonryMap, bumpMap: masonryMap, bumpScale: 0.1, roughness: 0.96 });
  const cutStone = new THREE.MeshStandardMaterial({ color: '#e0d4b8', map: grainMap, bumpMap: grainMap, bumpScale: 0.065, roughness: 0.91 });
  const domeStone = new THREE.MeshStandardMaterial({ color: '#e9e4cf', map: grainMap, bumpMap: grainMap, bumpScale: 0.05, roughness: 0.85 });
  const agedStone = new THREE.MeshStandardMaterial({ color: '#a49c85', map: masonryMap, bumpMap: masonryMap, bumpScale: 0.11, roughness: 1 });
  const pavingMats = Array.from({ length: 5 }, (_, i) => new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.115, 0.12, 0.44 + i * 0.035), map: grainMap, bumpMap: grainMap, bumpScale: 0.055, roughness: 0.95 }));
  const bronze = new THREE.MeshStandardMaterial({ color: '#96805b', metalness: 0.7, roughness: 0.42 });
  const dark = new THREE.MeshStandardMaterial({ color: '#191814', roughness: 1 });
  const bark = new THREE.MeshStandardMaterial({ color: '#554c3a', roughness: 1, map: grainMap });
  const glow = new THREE.MeshStandardMaterial({ color: '#ffd594', emissive: '#ffaf49', emissiveIntensity: 3.3, roughness: 0.4 });
  const recessGlow = new THREE.MeshStandardMaterial({ color: '#4a2d12', emissive: '#fda640', emissiveIntensity: 0.22, roughness: 1 });

  // Batch static geometry by material after creation to keep draw calls low.
  const batches = new Map();
  function solid(geometry, material, x = 0, y = 0, z = 0, rotation = null, group = architecture) {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    if (rotation) quaternion.setFromEuler(new THREE.Euler(...rotation));
    matrix.compose(new THREE.Vector3(x, y, z), quaternion, new THREE.Vector3(1, 1, 1));
    geometry.applyMatrix4(matrix);
    const key = `${group.uuid}:${material.uuid}`;
    if (!batches.has(key)) batches.set(key, { group, material, geometries: [] });
    batches.get(key).geometries.push(geometry);
  }
  const box = (x, y, z, w, h, d, mat = stone, ry = 0, group = architecture) => solid(new THREE.BoxGeometry(w, h, d), mat, x, y, z, [0, ry, 0], group);
  const cylinder = (x, y, z, rt, rb, h, mat = cutStone, segments = 32, group = architecture) => solid(new THREE.CylinderGeometry(rt, rb, h, segments), mat, x, y, z, null, group);
  function beamBetween(a, b, radius, material, group = architecture) {
    const p = new THREE.Vector3(...a), q = new THREE.Vector3(...b);
    const geometry = new THREE.CylinderGeometry(radius * 0.7, radius, p.distanceTo(q), 6);
    geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize()));
    p.add(q).multiplyScalar(0.5);
    solid(geometry, material, p.x, p.y, p.z, null, group);
  }

  // Raised stone terraces and a tiled open courtyard.
  box(0, -0.1, 1, 34, 1.2, 37, agedStone);
  box(0, 0.48, 6.5, 32.4, 0.18, 25.5, cutStone);
  box(-1, 0.59, 11.2, 27, 0.12, 17.5, agedStone);
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 26; col++) {
      const x = -16 + col * 1.25 + (row % 2 ? 0.28 : 0);
      const z = -4.5 + row * 1.2;
      if (x > 15.6) continue;
      box(x, 0.65 + range(-0.01, 0.01), z, 1.205, 0.13, 1.15, pavingMats[Math.floor(random() * 5)]);
    }
  }
  // Steps descend from the front terrace to a gently curving approach.
  for (let step = 0; step < 6; step++) box(0, 0.6 - step * 0.2, 20.0 + step * 0.64, 9.8 + step * 0.38, 0.27, 0.75, cutStone);
  for (let row = 0; row < 31; row++) {
    const z = 24.2 + row * 1.26, midX = Math.sin(row * 0.087) * 10;
    for (let col = 0; col < 6; col++) {
      box(midX + (col - 2.5) * 1.13, -0.48, z, 1.075, 0.18, 1.2, pavingMats[Math.floor(random() * 5)], -Math.cos(row * 0.087) * 0.12, landscape);
    }
  }

  // An arch is built from individual wedge-shaped voussoirs with open space below.
  function arch(x, y, z, width, spring, depth, material = cutStone, rotation = 0) {
    const r = width / 2, thickness = 0.36;
    const local = (lx, ly, lz) => [x + lx * Math.cos(rotation) + lz * Math.sin(rotation), y + ly, z - lx * Math.sin(rotation) + lz * Math.cos(rotation)];
    for (const side of [-1, 1]) {
      const p = local(side * (r + thickness / 2), spring / 2, 0);
      box(...p, thickness, spring, depth, material, rotation);
      const base = local(side * (r + thickness / 2), 0.14, 0);
      box(...base, thickness + 0.16, 0.28, depth + 0.12, material, rotation);
    }
    for (let i = 0; i < 13; i++) {
      const a = i * Math.PI / 13 + 0.008, b = (i + 1) * Math.PI / 13 - 0.008;
      const shape = new THREE.Shape();
      shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      shape.lineTo(Math.cos(b) * r, Math.sin(b) * r);
      shape.lineTo(Math.cos(b) * (r + thickness), Math.sin(b) * (r + thickness));
      shape.lineTo(Math.cos(a) * (r + thickness), Math.sin(a) * (r + thickness));
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.022, bevelThickness: 0.018, bevelSegments: 1, steps: 1 });
      geometry.translate(0, spring, -depth / 2); geometry.rotateY(rotation);
      solid(geometry, material, x, y, z);
    }
  }
  function doorway(x, y, z, width = 1.65, spring = 1.8, mat = dark) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0); shape.lineTo(width / 2, 0); shape.lineTo(width / 2, spring);
    shape.absarc(0, spring, width / 2, 0, Math.PI, false); shape.lineTo(-width / 2, 0);
    solid(new THREE.ShapeGeometry(shape), mat, x, y, z);
    arch(x, y, z + 0.12, width, spring, 0.4);
    box(x, y + 0.06, z + 0.22, width + 0.65, 0.12, 0.95, cutStone);
  }
  function building(x, z, w, d, h) {
    const floor = 0.7;
    box(x, floor + h / 2, z, w, h, d);
    box(x, floor + 0.13, z, w + 0.22, 0.26, d + 0.22, agedStone);
    box(x, floor + h - 0.02, z, w + 0.35, 0.18, d + 0.35, cutStone);
    box(x, floor + h + 0.16, z, w + 0.16, 0.18, d + 0.16, cutStone);
    // Modest parapets: a flat-roofed complex, not a fortress.
    box(x, floor + h + 0.43, z - d / 2 + 0.1, w, 0.45, 0.3);
    box(x - w / 2 + 0.1, floor + h + 0.43, z, 0.3, 0.45, d);
    box(x + w / 2 - 0.1, floor + h + 0.43, z, 0.3, 0.45, d);
    return floor + h + 0.25;
  }
  const roofA = building(-5.5, -6, 13, 12, 5.4);
  const roofB = building(5.7, -9.4, 8.8, 10.5, 6.6);
  building(-14.0, -7.1, 4.2, 13, 4.2);
  building(12.4, -8.7, 4.8, 11.8, 4.0);
  building(-1.0, -15.2, 21, 4.1, 4.3);

  // Raised drums, scalloped rib profiles, stacked cornices, and bronze finials.
  function tower(x, z, baseY, radius, height, ribs) {
    cylinder(x, baseY + 0.48, z, radius * 0.92, radius * 1.12, 0.95, domeStone, 8);
    cylinder(x, baseY + 1.2, z, radius, radius, 0.56, domeStone, 32);
    cylinder(x, baseY + 1.5, z, radius * 1.12, radius * 1.12, 0.19, cutStone, 64);
    cylinder(x, baseY + 1.69, z, radius * 1.055, radius * 1.11, 0.2, domeStone, 64);
    const rings = 23, segments = ribs * 4, positions = [], uvs = [], indices = [];
    for (let j = 0; j <= rings; j++) {
      const t = j / rings;
      for (let i = 0; i <= segments; i++) {
        const angle = i / segments * TAU;
        const ribProfile = 1 + 0.054 * Math.cos(angle * ribs);
        const r = Math.max(0.014, radius * (1 - t) * ribProfile * (1 + Math.sin(t * Math.PI) * 0.035));
        positions.push(Math.cos(angle) * r, t * height, Math.sin(angle) * r);
        uvs.push(i / segments * 3, t * 3);
        if (j < rings && i < segments) {
          const a = j * (segments + 1) + i, b = a + segments + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices); geo.computeVertexNormals();
    solid(geo, domeStone, x, baseY + 1.77, z);
    // Strong base fluting adds depth to the cone silhouette at grazing light.
    for (let i = 0; i < ribs; i++) {
      const a = i / ribs * TAU;
      cylinder(x + Math.cos(a) * radius * 0.95, baseY + 1.15, z + Math.sin(a) * radius * 0.95, 0.085, 0.085, 0.6, cutStone, 6);
    }
    const top = baseY + 1.77 + height;
    cylinder(x, top + 0.37, z, 0.032, 0.065, 0.76, bronze, 8);
    for (let i = 0; i < 3; i++) solid(new THREE.SphereGeometry(0.11 - i * 0.025, 10, 8), bronze, x, top + i * 0.23, z);
  }
  tower(-6.3, -5.3, roofA, 3.3, 9.8, 32);
  tower(5.4, -9.4, roofB, 2.75, 8.3, 24);
  const roofC = building(-12.7, 6.8, 5.8, 6.0, 3.5);
  tower(-12.7, 6.8, roofC, 1.83, 5.4, 24);

  // Main portal with a slightly projecting stone surround and shallow carved bands.
  box(-5.5, 2.78, 0.2, 4.25, 4.2, 0.65, cutStone);
  doorway(-5.5, 0.79, 0.56, 2.05, 2.05);
  box(-5.5, 4.92, 0.33, 4.5, 0.28, 0.9, cutStone);
  box(-5.5, 5.13, 0.3, 4.17, 0.14, 0.7, domeStone);
  for (let i = 0; i < 7; i++) box(-6.85 + i * 0.45, 4.48, 0.59, 0.12, 0.19, 0.06, agedStone);
  doorway(5.3, 0.79, -4.08, 1.8, 1.95);
  doorway(-12.7, 0.79, 9.84, 1.4, 1.45);
  // Recessed windows are set against solid masonry and edged with real stone.
  for (const [x, z, y] of [[-10, 0.025, 2.8], [-0.6, 0.025, 2.8], [8.5, -4.12, 3.25], [2.3, -4.12, 3.25], [12.4, -2.76, 2.2]]) {
    doorway(x, y, z + 0.02, 0.58, 0.48, recessGlow);
    box(x, y + 0.37, z + 0.11, 0.035, 0.78, 0.07, bronze);
  }

  // An open arcaded east cloister frames the courtyard without hiding the temple.
  box(13.1, 2.35, 6.6, 0.75, 3.3, 16.0, agedStone);
  box(10.6, 4.01, 6.6, 5.75, 0.34, 16.6, cutStone);
  box(10.6, 4.24, 6.6, 5.55, 0.14, 16.4, cutStone);
  for (let i = 0; i < 5; i++) {
    arch(7.9, 0.75, 0.7 + i * 3.0, 2.25, 1.75, 0.6, cutStone, Math.PI / 2);
    box(8.0, 3.88, 0.7 + i * 3.0, 0.8, 0.22, 3.05, cutStone);
  }
  // Low perimeter walls, seating ledges, and corner piers.
  box(-16.0, 1.55, 10.7, 0.75, 1.8, 17.6, agedStone);
  box(-16.0, 2.5, 10.7, 0.92, 0.18, 17.8, cutStone);
  for (const x of [-11, 11]) {
    box(x, 1.42, 19.2, 10.0, 1.6, 0.75, agedStone);
    box(x, 2.28, 19.2, 10.3, 0.18, 0.94, cutStone);
    box(Math.sign(x) * 5.7, 1.7, 19.2, 0.95, 2.18, 1.05, cutStone);
    box(Math.sign(x) * 5.7, 2.84, 19.2, 1.12, 0.2, 1.17, domeStone);
  }
  box(-14.9, 1.02, 13.6, 1.0, 0.65, 8.8, cutStone);
  box(11.5, 1.02, 12.5, 1.0, 0.65, 4.0, cutStone);
  // A small octagonal stone basin and a leafy courtyard tree provide human scale.
  cylinder(-5.0, 0.95, 11.1, 1.3, 1.43, 0.48, cutStone, 8);
  cylinder(-5.0, 1.21, 11.1, 1.37, 1.37, 0.12, domeStone, 8);
  cylinder(-5.0, 1.28, 11.1, 1.03, 1.03, 0.025, new THREE.MeshStandardMaterial({ color: '#293a36', metalness: 0.25, roughness: 0.19 }), 40);

  // A continuous valley floor rises naturally on three sides of the sanctuary.
  function terrainHeight(x, z) {
    const distance = Math.hypot(x, z * 0.82);
    const onset = clamp((distance - 27) / 43, 0, 1);
    const wave = 5.8 * Math.sin(x * 0.039 + z * 0.014) + 4.1 * Math.cos(z * 0.047 - x * 0.018) + 2.8 * Math.sin(x * 0.079 + z * 0.061);
    const side = Math.max(0, Math.abs(x) - 30) * 0.2;
    const rear = Math.max(0, -z - 24) * 0.23;
    const approach = 1 - 0.83 * Math.exp(-((x - 7) ** 2) / 360) * clamp(z / 65, 0, 1);
    return -0.67 + onset * Math.max(0, 7 + wave + side + rear) * approach;
  }
  const terrainGeo = new THREE.PlaneGeometry(410, 410, 150, 150);
  terrainGeo.rotateX(-Math.PI / 2);
  const terrainPos = terrainGeo.attributes.position;
  const terrainColors = [];
  const rockColor = new THREE.Color('#727264'), grassColor = new THREE.Color('#555d3e');
  for (let i = 0; i < terrainPos.count; i++) {
    const x = terrainPos.getX(i), z = terrainPos.getZ(i), y = terrainHeight(x, z);
    terrainPos.setY(i, y);
    const c = grassColor.clone().lerp(rockColor, clamp(y / 38 + Math.sin(x * 0.12) * 0.2, 0, 1)).multiplyScalar(range(0.89, 1.08));
    terrainColors.push(c.r, c.g, c.b);
  }
  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(terrainColors, 3));
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, map: grainMap, roughness: 1 });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true; terrain.name = 'Wooded_valley_terrain'; landscape.add(terrain);

  // Instanced foliage and rocks share geometry/materials; no costly tree assets.
  const leaves = [], trunks = [], rocks = [];
  function tree(x, z, size = 1, cypress = false, ground = terrainHeight(x, z)) {
    const h = size * (cypress ? 7.2 : 4.7);
    trunks.push({ x, y: ground + h * 0.3, z, sx: size * 0.2, sy: h * 0.65, sz: size * 0.2 });
    if (cypress) {
      for (let i = 0; i < 5; i++) leaves.push({ x: x + range(-0.15, 0.15), y: ground + h * (0.32 + i * 0.125), z, sx: size * (0.88 - i * 0.12), sy: size * 1.62, sz: size * (0.8 - i * 0.1), shade: range(0.65, 0.9) });
    } else {
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * TAU, r = size * range(0.4, 1.25);
        leaves.push({ x: x + Math.cos(a) * r, y: ground + h * range(0.65, 0.92), z: z + Math.sin(a) * r, sx: size * range(1.0, 1.6), sy: size * range(0.8, 1.5), sz: size * range(1.0, 1.45), shade: range(0.78, 1.22) });
        if (size > 1) beamBetween([x, ground + h * 0.3, z], [x + Math.cos(a) * r, ground + h * 0.72, z + Math.sin(a) * r], size * 0.06, bark, landscape);
      }
    }
  }
  tree(-10.2, 15, 1.05, false, 0.7);
  for (const [x, z, size] of [[-20, 3, 1.15], [-21, 13, 1.3], [20, 4, 1.15], [19, -13, 1.1], [-20, -13, 1.25], [21, 20, 1.3], [-24, 24, 1.1]]) tree(x, z, size, true);
  for (let i = 0; i < (lowPower ? 160 : 265); i++) {
    const x = range(-140, 140), z = range(-135, 105), d = Math.hypot(x, z * 0.85);
    if (d < 28 || (z > 22 && Math.abs(x - 8) < 10)) continue;
    tree(x, z, range(0.65, 1.35), random() > 0.68);
  }
  for (let i = 0; i < 160; i++) {
    const x = range(-95, 95), z = range(-90, 70);
    if (Math.hypot(x, z * 0.9) < 25 || (z > 20 && Math.abs(x - 8) < 11)) continue;
    const s = range(0.3, 1.6);
    rocks.push({ x, y: terrainHeight(x, z) + s * 0.2, z, sx: s * 1.2, sy: s * 0.55, sz: s, shade: range(0.8, 1.2) });
  }
  function instances(name, geometry, material, data, colored = false) {
    const mesh = new THREE.InstancedMesh(geometry, material, data.length);
    const dummy = new THREE.Object3D();
    data.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z); dummy.scale.set(p.sx, p.sy, p.sz);
      dummy.rotation.set(range(-0.12, 0.12), range(0, TAU), range(-0.08, 0.08)); dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (colored) mesh.setColorAt(i, new THREE.Color().setScalar(p.shade));
    });
    mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
    landscape.add(mesh); return mesh;
  }
  const leafGeo = new THREE.IcosahedronGeometry(1, 1);
  const leafPos = leafGeo.attributes.position;
  for (let i = 0; i < leafPos.count; i++) {
    const x = leafPos.getX(i), y = leafPos.getY(i), z = leafPos.getZ(i);
    // Identical vertices get identical displacement, so adjacent faces stay joined.
    const s = 1 + Math.sin(x * 17 + y * 11 + z * 7) * 0.12;
    leafPos.setXYZ(i, x * s, y * s, z * s);
  }
  leafGeo.computeVertexNormals();
  instances('Olive_and_cypress_canopies', leafGeo, new THREE.MeshStandardMaterial({ color: '#596445', roughness: 1 }), leaves, true);
  instances('Tree_trunks', new THREE.CylinderGeometry(0.8, 1.15, 1, 7), bark, trunks);
  instances('Limestone_outcrops', new THREE.IcosahedronGeometry(1, 0), agedStone, rocks, true);

  // Lamps use emissive geometry + soft halo sprites. Only a few real lights are needed.
  const warmLights = [], haloSprites = [];
  const haloCanvas = document.createElement('canvas'); haloCanvas.width = haloCanvas.height = 64;
  const hc = haloCanvas.getContext('2d'), gradient = hc.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,212,142,.85)'); gradient.addColorStop(0.12, 'rgba(255,176,73,.36)'); gradient.addColorStop(0.45, 'rgba(248,158,57,.08)'); gradient.addColorStop(1, 'rgba(248,158,57,0)');
  hc.fillStyle = gradient; hc.fillRect(0, 0, 64, 64);
  const haloTexture = new THREE.CanvasTexture(haloCanvas);
  function lantern(x, y, z, realLight = false, scale = 1) {
    box(x, y, z, 0.44 * scale, 0.13 * scale, 0.44 * scale, bronze);
    box(x, y + 0.32 * scale, z, 0.25 * scale, 0.46 * scale, 0.25 * scale, glow);
    box(x, y + 0.6 * scale, z, 0.43 * scale, 0.1 * scale, 0.43 * scale, bronze);
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) box(x + dx * 0.15 * scale, y + 0.32 * scale, z + dz * 0.15 * scale, 0.035 * scale, 0.48 * scale, 0.035 * scale, bronze);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    sprite.position.set(x, y + 0.32 * scale, z); sprite.scale.setScalar(2.6 * scale); scene.add(sprite); haloSprites.push(sprite);
    if (realLight) {
      const light = new THREE.PointLight('#ffbc6c', 20, 10, 2);
      light.position.set(x, y + 0.65 * scale, z + 0.2); scene.add(light); warmLights.push({ light, power: 20 });
    }
  }
  for (const x of [-7.25, -3.75]) lantern(x, 2.65, 1.0, true);
  lantern(5.3, 3.3, -3.75, true, 0.85);
  for (const x of [-5.7, 5.7]) lantern(x, 2.98, 19.2, true);
  for (const z of [3, 9, 15]) lantern(8.3, 2.55, z, false, 0.75);
  for (let i = 0; i < 7; i++) {
    const z = 26 + i * 4.4, x = Math.sin((z - 24.2) / 1.26 * 0.087) * 10;
    for (const side of [-1, 1]) {
      box(x + side * 3.8, -0.05, z, 0.55, 0.95, 0.55, agedStone, 0, landscape);
      lantern(x + side * 3.8, 0.47, z, i === 1 && side === 1, 0.7);
    }
  }
  function floodlight(x, y, z, target, power = 170, angle = 0.62) {
    const light = new THREE.SpotLight('#ffd296', power, 43, angle, 0.85, 1.2);
    light.position.set(x, y, z); light.target.position.set(...target);
    scene.add(light, light.target); warmLights.push({ light, power });
  }
  floodlight(-9, 2.2, 5, [-6.3, 12, -5.3], 185, 0.6);
  floodlight(2, 2.2, 3, [5.4, 11, -9.4], 160, 0.52);
  floodlight(-16, 1.5, 13, [-12.7, 7, 6.8], 90, 0.58);
  floodlight(11, 1.3, 15, [10, 3, 3], 50, 0.7);

  for (const { group, material, geometries } of batches.values()) {
    const normalized = geometries.map((g) => {
      const n = g.index ? g.toNonIndexed() : g;
      if (!n.attributes.uv) n.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
      return n;
    });
    const merged = mergeGeometries(normalized, false);
    const mesh = new THREE.Mesh(merged, material); mesh.name = material === domeStone ? 'Fluted_conical_spires' : 'Stonework_and_details';
    mesh.castShadow = material !== glow; mesh.receiveShadow = true; group.add(mesh);
    for (const g of new Set([...geometries, ...normalized])) g.dispose();
  }
  batches.clear();

  // Atmospheric sky, a sparse star field, and cool moonlight keep silhouettes legible.
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { topColor: { value: new THREE.Color('#081528') }, bottomColor: { value: new THREE.Color('#354b5c') } },
    vertexShader: 'varying vec3 vWorld; void main(){vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',
    fragmentShader: 'uniform vec3 topColor;uniform vec3 bottomColor;varying vec3 vWorld;void main(){float h=normalize(vWorld).y;gl_FragColor=vec4(mix(bottomColor,topColor,pow(max(h,0.),.55)),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(290, 32, 16), skyMaterial); scene.add(sky);
  const starPositions = [];
  for (let i = 0; i < 750; i++) {
    const a = range(0, TAU), y = range(0.15, 0.98), r = Math.sqrt(1 - y * y) * 250;
    starPositions.push(Math.cos(a) * r, y * 250, Math.sin(a) * r);
  }
  const starsGeometry = new THREE.BufferGeometry(); starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: '#d4e3ed', size: 0.22, transparent: true, opacity: 0.8, sizeAttenuation: true, depthWrite: false, toneMapped: false });
  scene.add(new THREE.Points(starsGeometry, starsMaterial));
  const moon = new THREE.Mesh(new THREE.SphereGeometry(2.25, 24, 16), new THREE.MeshBasicMaterial({ color: '#e8ecdf', fog: false }));
  moon.position.set(-60, 100, -165); scene.add(moon);
  const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture, color: '#afcfee', transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  moonHalo.position.copy(moon.position); moonHalo.scale.set(27, 27, 1); scene.add(moonHalo);
  const hemisphere = new THREE.HemisphereLight('#b7d4f4', '#51442d', 1.5); scene.add(hemisphere);
  const sunlight = new THREE.DirectionalLight('#c0d5fa', 1.5); sunlight.position.set(-28, 46, 15); sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
  Object.assign(sunlight.shadow.camera, { left: -36, right: 36, top: 35, bottom: -35, near: 1, far: 125 });
  sunlight.shadow.bias = -0.0005; sunlight.shadow.normalBias = 0.06; sunlight.shadow.radius = 3; scene.add(sunlight);
  const fill = new THREE.DirectionalLight('#829abe', 0.7); fill.position.set(35, 15, -25); scene.add(fill);

  // Bloom is restrained and omitted on smaller devices; light halos still work.
  let composer = null, bloom = null;
  if (!lowPower) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.32, 0.55, 1.1);
    composer.addPass(bloom); composer.addPass(new OutputPass());
  }

  let nightAmount = 1, modeTarget = 1, transition = null, touring = false, tourTime = 0, labelsShown = false;
  let lastTime = performance.now(), labelClock = 0;
  const colors = {
    dayTop: new THREE.Color('#457794'), nightTop: new THREE.Color('#081528'),
    dayBottom: new THREE.Color('#c8c7af'), nightBottom: new THREE.Color('#354b5c'),
    dayFog: new THREE.Color('#a6b4af'), nightFog: new THREE.Color('#1e3447'),
    sun: new THREE.Color('#fff0ce'), moon: new THREE.Color('#b6cef5'),
    dayAmbient: new THREE.Color('#d9e8e9'), nightAmbient: new THREE.Color('#96b6dd'),
  };
  function updateLighting() {
    skyMaterial.uniforms.topColor.value.copy(colors.dayTop).lerp(colors.nightTop, nightAmount);
    skyMaterial.uniforms.bottomColor.value.copy(colors.dayBottom).lerp(colors.nightBottom, nightAmount);
    scene.fog.color.copy(colors.dayFog).lerp(colors.nightFog, nightAmount);
    scene.fog.density = mix(0.0042, 0.0052, nightAmount);
    sunlight.color.copy(colors.sun).lerp(colors.moon, nightAmount);
    sunlight.intensity = mix(3.5, 1.15, nightAmount);
    hemisphere.color.copy(colors.dayAmbient).lerp(colors.nightAmbient, nightAmount);
    hemisphere.intensity = mix(2.0, 1.18, nightAmount);
    fill.intensity = mix(0.65, 0.78, nightAmount);
    warmLights.forEach(({ light, power }) => { light.intensity = power * mix(0, 1, nightAmount); });
    glow.emissiveIntensity = mix(0.06, 3.5, nightAmount);
    recessGlow.emissiveIntensity = mix(0.01, 0.4, nightAmount);
    haloSprites.forEach((sprite) => { sprite.material.opacity = nightAmount * 0.85; });
    starsMaterial.opacity = nightAmount * 0.78;
    moon.visible = moonHalo.visible = nightAmount > 0.4;
    moonHalo.material.opacity = nightAmount * 0.14;
    renderer.toneMappingExposure = mix(1.03, 1.3, nightAmount);
    if (bloom) bloom.strength = mix(0.08, 0.32, nightAmount);
  }
  function setMode(next) {
    modeTarget = next === 'night' ? 1 : 0;
    document.body.dataset.mode = next;
    for (const item of ['day', 'night']) {
      $(`${item}-button`).classList.toggle('selected', next === item);
      $(`${item}-button`).setAttribute('aria-pressed', String(next === item));
    }
    if (reducedMotion) { nightAmount = modeTarget; updateLighting(); }
    $('announcement').textContent = next === 'night' ? 'الوضع الليلي' : 'الوضع النهاري';
  }
  $('day-button').addEventListener('click', () => setMode('day'));
  $('night-button').addEventListener('click', () => setMode('night'));
  updateLighting();

  // Camera transitions interpolate both the position and the point of interest.
  function flyTo(position, target, duration = 1900) {
    transition = { from: camera.position.clone(), to: new THREE.Vector3(...position), fromTarget: controls.target.clone(), toTarget: new THREE.Vector3(...target), elapsed: 0, duration: reducedMotion ? 0 : duration };
  }
  function setTour(active) {
    touring = active;
    $('tour-button').setAttribute('aria-pressed', String(active));
    $('tour-text').textContent = active ? 'إيقاف الجولة' : 'جولة تلقائية';
    $('tour-icon').innerHTML = active ? '<path d="M8 5h3v14H8Zm6 0h3v14h-3Z"/>' : '<path d="m9 5 10 7-10 7Z"/>';
    if (!active) { $('tour-progress').style.width = '0%'; $('tour-duration').textContent = '٦٠ ث'; }
  }
  const tourPositions = [
    new THREE.Vector3(39, 26, 49), new THREE.Vector3(-29, 19, 35), new THREE.Vector3(-30, 22, -22),
    new THREE.Vector3(28, 25, -27), new THREE.Vector3(34, 17, 15), new THREE.Vector3(9, 10, 31), new THREE.Vector3(39, 26, 49),
  ];
  const tourPath = new THREE.CatmullRomCurve3(tourPositions, false, 'catmullrom', 0.28);
  const tourTargets = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 5, 0), new THREE.Vector3(-5, 6, -1), new THREE.Vector3(-1, 8, -7),
    new THREE.Vector3(0, 8, -5), new THREE.Vector3(-3, 5, 1), new THREE.Vector3(-5, 4, -1), new THREE.Vector3(0, 5, 0),
  ], false, 'catmullrom', 0.25);
  $('tour-button').addEventListener('click', () => {
    if (touring) { setTour(false); transition = null; return; }
    tourTime = 0; setTour(true); flyTo(tourPositions[0].toArray(), tourTargets.points[0].toArray());
    $('announcement').textContent = 'بدأت الجولة التلقائية. اسحب المشهد أو اضغط إيقاف الجولة للتحكم بالكاميرا.';
  });
  function resetCamera() {
    setTour(false); const preset = innerWidth < 701 ? mobileHome : home;
    flyTo(preset.position.toArray(), preset.target.toArray());
    $('view-name').textContent = 'سكينة الوادي'; $('view-detail').textContent = 'منظور عام · لالش';
  }
  $('reset-button').addEventListener('click', resetCamera);
  function zoom(factor) {
    setTour(false);
    const offset = camera.position.clone().sub(controls.target), distance = clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
    offset.setLength(distance).add(controls.target); flyTo(offset.toArray(), controls.target.toArray(), 400);
  }
  $('zoom-in').addEventListener('click', () => zoom(0.83));
  $('zoom-out').addEventListener('click', () => zoom(1.2));
  controls.addEventListener('start', () => { setTour(false); transition = null; });
  container.addEventListener('keydown', (event) => {
    const delta = { ArrowLeft: 0.11, ArrowRight: -0.11, ArrowUp: -0.075, ArrowDown: 0.075 };
    if (event.key in delta) {
      event.preventDefault(); setTour(false); transition = null;
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') spherical.theta += delta[event.key];
      else spherical.phi = clamp(spherical.phi + delta[event.key], controls.minPolarAngle, controls.maxPolarAngle);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update();
    } else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(0.85); }
    else if (event.key === '-') { event.preventDefault(); zoom(1.18); }
    else if (event.key.toLowerCase() === 'r') resetCamera();
  });
  $('fullscreen-button').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if ($('experience').requestFullscreen) await $('experience').requestFullscreen();
      else $('announcement').textContent = 'يمكنك استخدام عرض الشاشة الكاملة من قائمة المتصفح.';
    } catch { $('announcement').textContent = 'يمكنك استخدام عرض الشاشة الكاملة من قائمة المتصفح.'; }
  });
  document.addEventListener('fullscreenchange', () => { $('fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'); });

  // Screen-space Arabic markers remain crisp at every zoom level and work with touch.
  const markerData = [
    { text: 'المعبد الرئيسي', point: [-5.5, 6, 0.5], camera: [13, 12, 24], target: [-5, 4, -1] },
    { text: 'المدخل', point: [-5.5, 2.5, 1], camera: [2, 6, 19], target: [-5.5, 2.6, 0] },
    { text: 'الساحة', point: [0.5, 1.5, 12], camera: [20, 18, 32], target: [-2, 1, 7] },
    { text: 'البرج المخروطي', point: [-6.3, 18, -5.3], camera: [14, 19, 18], target: [-6, 12, -5] },
    { text: 'الممر الحجري', point: [4, 0.6, 31], camera: [28, 15, 52], target: [1, 2, 13] },
  ];
  markerData.forEach((data) => {
    data.position = new THREE.Vector3(...data.point);
    const button = document.createElement('button'); button.className = 'scene-marker'; button.textContent = data.text;
    button.addEventListener('click', () => { setTour(false); flyTo(data.camera, data.target); $('view-name').textContent = data.text; $('view-detail').textContent = 'تفاصيل من الوادي المقدّس'; });
    $('labels').appendChild(button); data.element = button;
  });
  $('labels-button').addEventListener('click', () => {
    labelsShown = !labelsShown; $('labels').hidden = !labelsShown;
    $('labels-button').setAttribute('aria-pressed', String(labelsShown));
    $('labels-button').querySelector('span').textContent = labelsShown ? 'إخفاء التسميات' : 'إظهار التسميات';
    if (labelsShown) updateLabels();
  });
  const projected = new THREE.Vector3();
  function updateLabels() {
    const occupied = [];
    for (const marker of markerData) {
      projected.copy(marker.position).project(camera);
      const x = (projected.x * 0.5 + 0.5) * innerWidth, y = (-projected.y * 0.5 + 0.5) * innerHeight;
      const visible = projected.z > -1 && projected.z < 1 && x > 55 && x < innerWidth - 65 && y > 100 && y < innerHeight - 145;
      const overlaps = occupied.some((p) => Math.abs(p.x - x) < 125 && Math.abs(p.y - y) < 45);
      marker.element.hidden = !visible || overlaps;
      if (visible && !overlaps) { marker.element.style.transform = `translate(${x}px,${y - 28}px) translate(-50%,-100%)`; occupied.push({ x, y }); }
    }
  }

  // Native dialog provides focus trapping, Escape dismissal, and mobile scrolling.
  const info = $('info-panel');
  $('info-button').addEventListener('click', () => { setTour(false); info.showModal(); });
  $('close-info').addEventListener('click', () => info.close());
  info.addEventListener('click', (event) => { if (event.target === info) { const r = info.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) info.close(); } });
  $('export-button').addEventListener('click', async () => {
    const button = $('export-button'); button.disabled = true; $('export-status').textContent = 'جارٍ إعداد المجسّم…';
    try {
      // Export only the architectural group: standard meshes and PBR materials.
      // Sky shaders, postprocessing and HTML labels are intentionally presentation layers.
      const exporter = new GLTFExporter();
      const binary = await exporter.parseAsync(architecture, { binary: true, maxTextureSize: 1024, onlyVisible: true });
      const url = URL.createObjectURL(new Blob([binary], { type: 'model/gltf-binary' }));
      const link = document.createElement('a'); link.href = url; link.download = 'lalish-temple.glb'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      $('export-status').textContent = 'تم إعداد المعبد والساحة بصيغة GLB.';
    } catch (error) { console.error(error); $('export-status').textContent = 'تعذّر إعداد الملف. حاول مرة أخرى.'; }
    finally { button.disabled = false; }
  });

  // Keep resolution bounded and suspend rendering in background tabs.
  function resize() {
    const width = container.clientWidth, height = container.clientHeight;
    camera.aspect = width / height; camera.fov = width < 701 ? 51 : 43; camera.updateProjectionMatrix();
    renderer.setSize(width, height); if (composer) composer.setSize(width, height);
    if (labelsShown) updateLabels();
  }
  addEventListener('resize', resize);
  renderer.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); showError(new Error('WebGL context lost')); });
  renderer.domElement.addEventListener('webglcontextrestored', () => location.reload());
  let frames = 0, frameTime = 0, adapted = false;
  const tourNames = ['سكينة الوادي', 'عمارة الحجر', 'القباب المقدّسة', 'بين الجبال', 'أروقة الساحة', 'عتبة المعبد'];
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.05); lastTime = now;
    if (document.hidden) return;
    if (Math.abs(nightAmount - modeTarget) > 0.001) { nightAmount = mix(nightAmount, modeTarget, 1 - Math.exp(-dt * 2.8)); updateLighting(); }
    if (transition) {
      transition.elapsed += dt * 1000;
      const t = transition.duration === 0 ? 1 : Math.min(1, transition.elapsed / transition.duration), eased = t * t * (3 - 2 * t);
      camera.position.lerpVectors(transition.from, transition.to, eased); controls.target.lerpVectors(transition.fromTarget, transition.toTarget, eased);
      if (t === 1) transition = null;
    } else if (touring) {
      tourTime += dt; const t = Math.min(tourTime / 60, 1);
      camera.position.copy(tourPath.getPoint(t)); controls.target.copy(tourTargets.getPoint(t));
      $('tour-progress').style.width = `${t * 100}%`;
      $('tour-duration').textContent = `${new Intl.NumberFormat('ar').format(Math.ceil(60 - tourTime))} ث`;
      $('view-name').textContent = tourNames[Math.min(5, Math.floor(t * 6))]; $('view-detail').textContent = 'جولة في الوادي المقدّس';
      if (t === 1) { setTour(false); $('announcement').textContent = 'اكتملت الجولة. يمكنك الآن استكشاف المعبد بحرية.'; }
    }
    controls.update();
    $('compass-needle').style.transform = `rotate(${controls.getAzimuthalAngle()}rad)`;
    labelClock += dt; if (labelsShown && labelClock > 0.06) { updateLabels(); labelClock = 0; }
    if (composer) composer.render(); else renderer.render(scene, camera);
    // Adapt once after startup if sustained performance is below ~25 fps.
    if (!adapted && frames++ > 90) { frameTime += dt; if (frames > 150) { if (frameTime / 60 > 0.04) { renderer.setPixelRatio(1); if (composer) { composer.dispose(); composer = null; } resize(); } adapted = true; } }
  }
  resize(); renderer.render(scene, camera);
  $('loading').classList.add('loaded'); setTimeout(() => { $('loading').hidden = true; }, 800);
  requestAnimationFrame(animate);
}
