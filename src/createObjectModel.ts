import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  textureAnisotropy?: number;
  qualityPriority?: 'reference-fidelity' | 'balanced';
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
};

type SculptMaterialSpec = Record<string, any>;

// THREE.CapsuleGeometry duplicates every UV-seam vertex (measured: 194 boundary
// edges on the default radius/segments below) -- same benign pattern as box/
// cylinder/sphere/torus, all of which weld cleanly to 0 given a CORRECT weld.
// (A naive vertex-only mergeVertices() reports 64 'non-manifold' edges here, but
// that is a counting artifact, not a real defect: it double-counts a handful of
// near-pole triangles that become degenerate once two of their three corners
// coincide -- confirmed by replicating subdivideCatmullClark's own degenerate-
// triangle-aware vertex identity, which finds a perfectly ordinary 2-manifold.)
// A capsule is the primary shape for skinned limbs/torso (PLAN_1.5), and skinning
// weight computation is O(vertices x bones), so fewer, guaranteed-simple vertices
// is worth having regardless -- authored as a deterministic, closed-by-
// construction mesh instead: shared pole vertices, and
// the radial index taken `% radialSegments` so the seam is never a duplicate
// vertex in the first place, rather than something to weld away afterward.
// Adapted from forge/stage5_rig/emit_rig.py's buildWatertightCapsule (verified
// there: 0 boundary edges, 0 non-manifold edges, deterministic across repeated
// runs) -- ported here rather than imported because this factory and the rig
// emitter are separate generated-output surfaces with no shared runtime module;
// see forge/tests/test_primitive_watertightness.py for the measured proof, and
// coordinate with the rig owner before changing either copy independently.
function buildWatertightCapsule(
  radius: number,
  cylLength: number,
  capSegments: number,
  radialSegments: number,
  heightSegments: number,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];
  const halfCyl = cylLength / 2;
  const totalSpan = 2 * (Math.PI / 2 * radius) + Math.max(0, cylLength);
  const vOf = (fromBottom: number) => (totalSpan > 0 ? fromBottom / totalSpan : 0);

  const bottomPoleIndex = positions.length / 3;
  positions.push(0, -halfCyl - radius, 0);
  uvs.push(0.5, vOf(0));

  const ringStarts: number[] = [];
  const ringV: number[] = [];
  for (let ring = 1; ring <= capSegments; ring += 1) {
    const phi = (Math.PI / 2) * (ring / capSegments);
    const y = -halfCyl - radius * Math.cos(phi);
    const r = radius * Math.sin(phi);
    const start = positions.length / 3;
    ringStarts.push(start);
    ringV.push(vOf(radius * phi));
    for (let radial = 0; radial < radialSegments; radial += 1) {
      const theta = (radial / radialSegments) * Math.PI * 2;
      positions.push(r * Math.cos(theta), y, r * Math.sin(theta));
      uvs.push(radial / radialSegments, vOf(radius * phi));
    }
  }

  const cylinderRingStarts: number[] = [];
  if (cylLength > 0) {
    for (let step = 1; step <= heightSegments; step += 1) {
      const y = -halfCyl + (cylLength * step) / heightSegments;
      const start = positions.length / 3;
      cylinderRingStarts.push(start);
      const v = vOf(radius * (Math.PI / 2) + halfCyl + y);
      for (let radial = 0; radial < radialSegments; radial += 1) {
        const theta = (radial / radialSegments) * Math.PI * 2;
        positions.push(radius * Math.cos(theta), y, radius * Math.sin(theta));
        uvs.push(radial / radialSegments, v);
      }
    }
  }

  const topRingStarts: number[] = [];
  for (let ring = capSegments - 1; ring >= 1; ring -= 1) {
    const phi = (Math.PI / 2) * (ring / capSegments);
    const y = halfCyl + radius * Math.cos(phi);
    const r = radius * Math.sin(phi);
    const start = positions.length / 3;
    topRingStarts.push(start);
    const v = vOf(radius * (Math.PI / 2) + Math.max(0, cylLength) + radius * (Math.PI / 2 - phi));
    for (let radial = 0; radial < radialSegments; radial += 1) {
      const theta = (radial / radialSegments) * Math.PI * 2;
      positions.push(r * Math.cos(theta), y, r * Math.sin(theta));
      uvs.push(radial / radialSegments, v);
    }
  }

  const topPoleIndex = positions.length / 3;
  positions.push(0, halfCyl + radius, 0);
  uvs.push(0.5, vOf(totalSpan));

  const firstBottomRing = ringStarts[0];
  for (let radial = 0; radial < radialSegments; radial += 1) {
    const next = (radial + 1) % radialSegments;
    indices.push(bottomPoleIndex, firstBottomRing + radial, firstBottomRing + next);
  }

  const allRings = [...ringStarts, ...cylinderRingStarts, ...topRingStarts];
  for (let i = 0; i < allRings.length - 1; i += 1) {
    const a = allRings[i];
    const b = allRings[i + 1];
    for (let radial = 0; radial < radialSegments; radial += 1) {
      const next = (radial + 1) % radialSegments;
      indices.push(a + radial, a + next, b + next);
      indices.push(a + radial, b + next, b + radial);
    }
  }

  const lastRing = allRings[allRings.length - 1];
  for (let radial = 0; radial < radialSegments; radial += 1) {
    const next = (radial + 1) % radialSegments;
    indices.push(topPoleIndex, lastRing + next, lastRing + radial);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildLatheGeometry(profile: { points: [number, number][]; segments?: number }): THREE.LatheGeometry {
  const points = profile.points.map(([x, y]) => new THREE.Vector2(Math.max(0.0001, x), y));
  return new THREE.LatheGeometry(points, profile.segments ?? 24);
}

// Plan 1.3 F.6 — sweep a thin 2D cross-section along a 3D spine so a curved
// form (hooked blade, handle) reads correctly from EVERY camera angle, not just
// the reference angle a flat extrude happens to match. Uses ExtrudeGeometry's
// native extrudePath; bevelEnabled: false keeps sharp tips (same rule as F.5).
function buildCurveSweepGeometry(
  sweep: { spine: [number, number, number][]; crossSection: { points: [number, number][] }; closed?: boolean },
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const cs = sweep.crossSection.points;
  if (cs.length > 0) {
    shape.moveTo(cs[0][0], cs[0][1]);
    for (let i = 1; i < cs.length; i += 1) shape.lineTo(cs[i][0], cs[i][1]);
    shape.closePath();
  }
  const spine = sweep.spine.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const path = new THREE.CatmullRomCurve3(spine, sweep.closed ?? false);
  return new THREE.ExtrudeGeometry(shape, {
    extrudePath: path,
    steps: Math.max(24, spine.length * 8),
    bevelEnabled: false,
  });
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readLayerNumber(value: unknown, keys: string[], fallback: number): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === 'number') return record[key] as number;
    }
  }
  return fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{3}$/i.test(hex)
    ? '#' + hex.slice(1).split('').map((part) => part + part).join('')
    : hex;
  const value = /^#[0-9a-f]{6}$/i.test(normalized) ? Number.parseInt(normalized.slice(1), 16) : 0x8a7a5f;
  return [clampAlbedoChannel((value >> 16) & 255), clampAlbedoChannel((value >> 8) & 255), clampAlbedoChannel(value & 255)];
}

function materialPalette(spec: SculptMaterialSpec): string[] {
  const palette = spec.colorVariation?.palette;
  if (Array.isArray(palette) && palette.length > 0) return palette.filter((value) => typeof value === 'string');
  const secondary = spec.albedo?.secondary;
  const colors = [spec.baseColor ?? spec.color ?? spec.albedo?.dominant, ...(Array.isArray(secondary) ? secondary : [])];
  return colors.filter((value): value is string => typeof value === 'string' && value.startsWith('#'));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampAlbedoChannel(value: number): number {
  return Math.max(30, Math.min(240, Math.round(value)));
}

function clampPbrF0(value: number): number {
  return Math.max(0.02, Math.min(1, value));
}

function clampPbrIor(value: number): number {
  return Math.max(1, Math.min(2.5, value));
}

function clampPbrMetalness(value: number): number {
  return value >= 0.5 ? 1 : 0;
}

function clampedAlbedoColor(spec: SculptMaterialSpec): THREE.Color {
  const source = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  // setStyle with an explicit SRGBColorSpace, NOT the numeric constructor.
  //
  // `new THREE.Color(r, g, b)` treats its arguments as LINEAR working-space components,
  // while an authored `baseColor` hex is sRGB. Feeding one to the other skipped the
  // transfer function and lifted every dark albedo: #2e2a28, authored as a near-black
  // vinyl, rendered at roughly sRGB 0.46 — a mid grey. The error is largest exactly where
  // it matters most, because the transfer curve is steepest near black.
  return new THREE.Color().setStyle(source, THREE.SRGBColorSpace);
}

function smoothCurve(value: number): number {
  return value * value * (3 - 2 * value);
}

function periodicHash(x: number, y: number, seed: number, periodX: number, periodY: number): number {
  const wrappedX = ((x % periodX) + periodX) % periodX;
  const wrappedY = ((y % periodY) + periodY) % periodY;
  let value = Math.imul(wrappedX + seed * 17, 374761393) ^ Math.imul(wrappedY + seed * 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function periodicValueNoise(u: number, v: number, seed: number, periodX: number, periodY: number): number {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), ty);
}

type SurfaceBand = {
  frequency: number;
  amplitude: number;
  stretchX: number;
  stretchY: number;
  ridge: boolean;
};

function surfaceBands(spec: SculptMaterialSpec): SurfaceBand[] {
  const source = Array.isArray(spec.surfaceFrequencyBands) ? spec.surfaceFrequencyBands : [];
  const parsed = source.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const band = item as Record<string, unknown>;
    const frequency = typeof band.frequency === 'number' ? band.frequency : 0;
    const amplitude = typeof band.amplitude === 'number' ? band.amplitude : 0;
    if (frequency <= 0 || amplitude <= 0) return [];
    const stretch = Array.isArray(band.stretch) ? band.stretch : [1, 1];
    const description = `${String(band.pattern ?? '')} ${String(band.role ?? '')}`.toLowerCase();
    return [{
      frequency,
      amplitude,
      stretchX: typeof stretch[0] === 'number' ? Math.max(0.1, stretch[0]) : 1,
      stretchY: typeof stretch[1] === 'number' ? Math.max(0.1, stretch[1]) : 1,
      ridge: /(ridge|groove|grain|fiber|striated|crack)/.test(description),
    }];
  });
  return parsed.length > 0 ? parsed : [
    { frequency: 2, amplitude: 0.42, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 12, amplitude: 0.22, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 56, amplitude: 0.08, stretchX: 1, stretchY: 1, ridge: false },
  ];
}

function sampleSurface(u: number, v: number, bands: SurfaceBand[], seed: number): number {
  let value = 0;
  let weight = 0;
  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];
    const periodX = Math.max(1, Math.round(band.frequency * band.stretchX));
    const periodY = Math.max(1, Math.round(band.frequency * band.stretchY));
    let sample = periodicValueNoise(u, v, seed + index * 1013, periodX, periodY);
    if (band.ridge) sample = 1 - Math.abs(sample * 2 - 1);
    value += sample * band.amplitude;
    weight += band.amplitude;
  }
  return weight > 0 ? clamp01(value / weight) : 0.5;
}

function mixPalette(colors: [number, number, number][], value: number): [number, number, number] {
  if (colors.length === 1) return colors[0];
  const scaled = clamp01(value) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const a = colors[index];
  const b = colors[index + 1];
  return [
    Math.round(THREE.MathUtils.lerp(a[0], b[0], mix)),
    Math.round(THREE.MathUtils.lerp(a[1], b[1], mix)),
    Math.round(THREE.MathUtils.lerp(a[2], b[2], mix)),
  ];
}

type ColorGradientStop = { offset: number; color: string };
type ColorGradientSpec = {
  type: 'linear' | 'radial';
  axis: [number, number];
  stops: ColorGradientStop[];
};

function parseRgba(value: string): [number, number, number] {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value);
  if (!match) return [138, 122, 95];
  return [clampAlbedoChannel(Number(match[1])), clampAlbedoChannel(Number(match[2])), clampAlbedoChannel(Number(match[3]))];
}

// Analytical per-pixel gradient sample. The extraction schema's colorGradient carries
// exact rgba(...) stop colors (see extract_part_color_recipe.py), so this samples the
// same trend directly in JS math rather than round-tripping through a Canvas 2D
// createLinearGradient/createRadialGradient object — same visual result, and it composes
// directly with the existing noise/height-correlated colorVariation blend below.
function sampleColorGradient(gradient: ColorGradientSpec, u: number, v: number): [number, number, number] {
  const stops = gradient.stops.length >= 2 ? gradient.stops : [{ offset: 0, color: 'rgba(138,122,95,1)' }, { offset: 1, color: 'rgba(138,122,95,1)' }];
  let t: number;
  if (gradient.type === 'radial') {
    const [cx, cy] = gradient.axis;
    const dx = u - cx;
    const dy = v - cy;
    const maxRadius = Math.max(0.001, Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy)));
    t = clamp01(Math.hypot(dx, dy) / maxRadius);
  } else {
    const [ax, ay] = gradient.axis;
    const projection = (u - 0.5) * ax + (v - 0.5) * ay;
    const maxProjection = 0.5 * (Math.abs(ax) + Math.abs(ay)) || 0.5;
    t = clamp01(projection / maxProjection + 0.5);
  }
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const mix = scaled - index;
  const a = parseRgba(stops[index].color);
  const b = parseRgba(stops[index + 1].color);
  return [
    THREE.MathUtils.lerp(a[0], b[0], mix),
    THREE.MathUtils.lerp(a[1], b[1], mix),
    THREE.MathUtils.lerp(a[2], b[2], mix),
  ];
}

function writePixel(data: Uint8ClampedArray, offset: number, red: number, green: number, blue: number): void {
  data[offset] = Math.max(0, Math.min(255, Math.round(red)));
  data[offset + 1] = Math.max(0, Math.min(255, Math.round(green)));
  data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue)));
  data[offset + 3] = 255;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function createMapTexture(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [2, 2];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 2,
    typeof repeat[1] === 'number' ? repeat[1] : 2,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

type ProceduralTextureSet = {
  albedo: THREE.Texture;
  roughness: THREE.Texture;
  height: THREE.Texture;
  normal: THREE.Texture;
  ao: THREE.Texture;
  source: 'reference-pixel-extraction' | 'procedural';
};

function referenceMapUrl(spec: SculptMaterialSpec, channel: string): string | null {
  const reference = spec.referencePbr;
  if (!reference || typeof reference !== 'object') return null;
  if (reference.usable === false) return null;
  const confidence = typeof reference.confidence === 'number'
    ? reference.confidence
    : (typeof reference.estimatedFidelity === 'number' ? reference.estimatedFidelity : 0);
  const threshold = typeof reference.targetThreshold === 'number' ? reference.targetThreshold : 0.7;
  if (confidence < threshold) return null;
  const maps = reference.maps;
  if (!maps || typeof maps !== 'object') return null;
  const map = (maps as Record<string, unknown>)[channel];
  if (!map || typeof map !== 'object') return null;
  const record = map as Record<string, unknown>;
  const url = typeof record.url === 'string' && record.url.trim() ? record.url : record.path;
  return typeof url === 'string' && url.trim() ? url : null;
}

function createLoadedMapTexture(
  url: string,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [1, 1];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 1,
    typeof repeat[1] === 'number' ? repeat[1] : 1,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

function makeReferenceTextureSet(spec: SculptMaterialSpec, options: ProceduralModelOptions): ProceduralTextureSet | null {
  const albedo = referenceMapUrl(spec, 'albedo');
  const roughness = referenceMapUrl(spec, 'roughness');
  const height = referenceMapUrl(spec, 'height');
  const normal = referenceMapUrl(spec, 'normal');
  const ao = referenceMapUrl(spec, 'ao');
  if (!albedo || !roughness || !height || !normal || !ao) return null;
  return {
    albedo: createLoadedMapTexture(albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createLoadedMapTexture(roughness, THREE.NoColorSpace, spec, options),
    height: createLoadedMapTexture(height, THREE.NoColorSpace, spec, options),
    normal: createLoadedMapTexture(normal, THREE.NoColorSpace, spec, options),
    ao: createLoadedMapTexture(ao, THREE.NoColorSpace, spec, options),
    source: 'reference-pixel-extraction',
  };
}

function makeProceduralTextureSet(
  id: string,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): ProceduralTextureSet | null {
  if (typeof document === 'undefined') return null;
  const qualityFirst = (options.qualityPriority ?? 'reference-fidelity') === 'reference-fidelity';
  const requested = options.textureSize ?? spec.textureResolution;
  const requestedSize = typeof requested === 'number' && Number.isFinite(requested)
    ? requested
    : (qualityFirst ? 1024 : 512);
  const size = Math.max(256, Math.min(2048, 2 ** Math.round(Math.log2(requestedSize))));
  const canvases = {
    albedo: makeCanvas(size),
    roughness: makeCanvas(size),
    height: makeCanvas(size),
    normal: makeCanvas(size),
    ao: makeCanvas(size),
  };
  const contexts = {
    albedo: canvases.albedo.getContext('2d'),
    roughness: canvases.roughness.getContext('2d'),
    height: canvases.height.getContext('2d'),
    normal: canvases.normal.getContext('2d'),
    ao: canvases.ao.getContext('2d'),
  };
  if (!contexts.albedo || !contexts.roughness || !contexts.height || !contexts.normal || !contexts.ao) return null;
  const images = {
    albedo: contexts.albedo.createImageData(size, size),
    roughness: contexts.roughness.createImageData(size, size),
    height: contexts.height.createImageData(size, size),
    normal: contexts.normal.createImageData(size, size),
    ao: contexts.ao.createImageData(size, size),
  };
  const seed = hashString(id);
  const bands = surfaceBands(spec);
  const heightField = new Float32Array(size * size);
  const roughnessField = new Float32Array(size * size);
  const palette = materialPalette(spec);
  const fallback = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  const colors = (palette.length >= 2 ? palette : [fallback, '#6E614B', '#A08F70']).map(hexToRgb);
  const baseRoughness = clamp01(readLayerNumber(spec.roughness, ['base'], 0.76));
  const roughnessVariation = clamp01(readLayerNumber(spec.roughness, ['variation'], 0.18));
  const colorAmplitude = clamp01(readLayerNumber(spec.colorVariation, ['amplitude', 'variation'], 0.18));
  const heightCorrelation = clamp01(readLayerNumber(spec.colorVariation, ['heightCorrelation'], 0.3));
  const colorGradient: ColorGradientSpec | undefined = spec.colorGradient;
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = y * size + x;
      const height = sampleSurface(u, v, bands, seed + 101);
      const roughNoise = sampleSurface(u, v, bands, seed + 7001);
      const colorNoise = sampleSurface(u, v, bands, seed + 15013);
      heightField[index] = height;
      roughnessField[index] = clamp01(baseRoughness + (roughNoise - 0.5) * roughnessVariation * 2);
      let color: [number, number, number];
      if (colorGradient) {
        // Evidence-derived spatial gradient (Plan 1.3 Workstream C) takes priority
        // over the noise-based palette blend below — it is a measured trend, not a guess.
        color = sampleColorGradient(colorGradient, u, v);
      } else {
        const paletteValue = clamp01(
          0.5 + (colorNoise - 0.5) * colorAmplitude * 2 + (height - 0.5) * heightCorrelation
        );
        color = mixPalette(colors, paletteValue);
      }
      writePixel(images.albedo.data, index * 4, color[0], color[1], color[2]);
    }
  }
  const normalStrength = Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35));
  const aoStrength = clamp01(readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35));
  for (let y = 0; y < size; y += 1) {
    const up = ((y - 1 + size) % size) * size;
    const down = ((y + 1) % size) * size;
    for (let x = 0; x < size; x += 1) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const index = y * size + x;
      const center = heightField[index];
      const dx = (heightField[y * size + right] - heightField[y * size + left]) * normalStrength * 6;
      const dy = (heightField[down + x] - heightField[up + x]) * normalStrength * 6;
      const inverseLength = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const normalX = -dx * inverseLength;
      const normalY = -dy * inverseLength;
      const normalZ = inverseLength;
      const neighborAverage = (
        heightField[y * size + left] + heightField[y * size + right]
        + heightField[up + x] + heightField[down + x]
      ) * 0.25;
      const cavity = Math.max(0, neighborAverage - center);
      const ao = clamp01(1 - aoStrength * (cavity * 12 + (1 - center) * 0.16));
      const offset = index * 4;
      const heightByte = center * 255;
      const roughnessByte = roughnessField[index] * 255;
      writePixel(images.height.data, offset, heightByte, heightByte, heightByte);
      writePixel(images.roughness.data, offset, roughnessByte, roughnessByte, roughnessByte);
      writePixel(
        images.normal.data, offset,
        (normalX * 0.5 + 0.5) * 255,
        (normalY * 0.5 + 0.5) * 255,
        (normalZ * 0.5 + 0.5) * 255,
      );
      writePixel(images.ao.data, offset, ao * 255, ao * 255, ao * 255);
    }
  }
  contexts.albedo.putImageData(images.albedo, 0, 0);
  contexts.roughness.putImageData(images.roughness, 0, 0);
  contexts.height.putImageData(images.height, 0, 0);
  contexts.normal.putImageData(images.normal, 0, 0);
  contexts.ao.putImageData(images.ao, 0, 0);
  return {
    albedo: createMapTexture(canvases.albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createMapTexture(canvases.roughness, THREE.NoColorSpace, spec, options),
    height: createMapTexture(canvases.height, THREE.NoColorSpace, spec, options),
    normal: createMapTexture(canvases.normal, THREE.NoColorSpace, spec, options),
    ao: createMapTexture(canvases.ao, THREE.NoColorSpace, spec, options),
    source: 'procedural',
  };
}

function createSculptMaterial(id: string, spec: SculptMaterialSpec, options: ProceduralModelOptions, denseComponent = false): THREE.MeshPhysicalMaterial {
  // A material that declares -- with evidence -- that its subject carries no texture
  // detail gets NO texture set. Synthesising one anyway is not a harmless default: the
  // branch below then forces color to white and roughness to 1 and reads both from the
  // generated maps, so the authored albedo and the reference-derived roughness are both
  // discarded, and the model gains mottling the reference does not have. Measured on the
  // tuxedo cat, whose black fur rendered as speckled grey-and-white from a palette that
  // only ever described two flat regions.
  const textureless = (spec.textureless as { declared?: boolean } | undefined)?.declared === true;
  const textures = textureless
    ? null
    : makeReferenceTextureSet(spec, options) ?? makeProceduralTextureSet(id, spec, options);
  const material = new THREE.MeshPhysicalMaterial({
    color: textures ? 0xffffff : clampedAlbedoColor(spec),
    roughness: textures ? 1 : clamp01(readLayerNumber(spec.roughness, ['base'], 0.76)),
    metalness: clampPbrMetalness(readLayerNumber(spec.metalness, ['base'], 0.0)),
    clearcoat: clamp01(readLayerNumber(spec.clearcoat, ['base', 'amount'], 0)),
    clearcoatRoughness: clamp01(readLayerNumber(spec.clearcoatRoughness, ['base'], 0.25)),
    transmission: clamp01(readLayerNumber(spec.transmission, ['base', 'amount'], 0)),
    ior: clampPbrIor(readLayerNumber(spec.ior, ['base', 'value'], 1.5)),
    thickness: Math.max(0, readLayerNumber(spec.thickness, ['base', 'amount'], 0)),
    attenuationDistance: Math.max(0.001, readLayerNumber(spec.attenuationDistance, ['base', 'value'], Infinity)),
    attenuationColor: new THREE.Color(typeof spec.attenuationColor === 'string' ? spec.attenuationColor : '#ffffff'),
    sheen: clamp01(readLayerNumber(spec.sheen, ['base', 'amount'], 0)),
    sheenColor: new THREE.Color(typeof spec.sheenColor === 'string' ? spec.sheenColor : '#ffffff'),
    sheenRoughness: clamp01(readLayerNumber(spec.sheenRoughness, ['base'], 1.0)),
    iridescence: clamp01(readLayerNumber(spec.iridescence, ['base', 'amount'], 0)),
    iridescenceIOR: clampPbrIor(readLayerNumber(spec.iridescenceIOR, ['base', 'value'], 1.3)),
    anisotropy: clamp01(readLayerNumber(spec.anisotropy, ['base', 'amount'], 0)),
    anisotropyRotation: readLayerNumber(spec.anisotropy, ['rotation'], 0),
    specularIntensity: clampPbrF0(readLayerNumber(spec.specularF0 ?? spec.f0 ?? spec.specularIntensity, ['base', 'value'], 1.0)),
    specularColor: new THREE.Color(typeof spec.specularColor === 'string' ? spec.specularColor : '#ffffff'),
    emissive: new THREE.Color(typeof spec.emissive === 'string' ? spec.emissive : '#000000'),
    emissiveIntensity: Math.max(0, readLayerNumber(spec.emissiveIntensity, ['base'], 1.0)),
    opacity: clamp01(readLayerNumber(spec.opacity, ['base'], 1)),
    transparent: readLayerNumber(spec.transmission, ['base', 'amount'], 0) > 0 || readLayerNumber(spec.opacity, ['base'], 1) < 1,
    alphaTest: Math.max(0, readLayerNumber(spec.alpha, ['cutoff', 'alphaTest'], 0)),
    wireframe: options.wireframe ?? false,
    side: spec.doubleSided === true ? THREE.DoubleSide : THREE.FrontSide,
    flatShading: spec.flatShading === true,
  });
  if (textures) {
    material.map = textures.albedo;
    material.roughnessMap = textures.roughness;
    material.normalMap = textures.normal;
    material.normalScale.setScalar(Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35)));
    material.aoMap = textures.ao;
    material.aoMap.channel = 0;
    material.aoMapIntensity = readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35);
    const denseMesh = denseComponent || spec.denseMesh === true || spec.geometryDensity === 'dense' || spec.topologyClass === 'dense';
    const bumpScale = Math.max(0, readLayerNumber(spec.bump, ['amplitude', 'strength'], 0));
    const effectiveBumpScale = denseMesh ? Math.max(0.05, bumpScale) : bumpScale;
    if (effectiveBumpScale > 0) {
      material.bumpMap = textures.height;
      material.bumpScale = effectiveBumpScale;
    }
    const displacementScale = Math.max(0, readLayerNumber(spec.displacement, ['amplitude', 'strength'], 0));
    const effectiveDisplacementScale = denseMesh ? Math.max(0.005, displacementScale) : displacementScale;
    if (effectiveDisplacementScale > 0) {
      material.displacementMap = textures.height;
      material.displacementScale = effectiveDisplacementScale;
      material.displacementBias = -effectiveDisplacementScale * 0.5;
    }
  }
  material.envMapIntensity = readLayerNumber(spec, ['envMapIntensity'], 0.8);
  material.userData.sculptMaterial = spec;
  material.userData.proceduralMapsIndependent = true;
  material.userData.pbrConstraints = { albedoRange: [30, 240], binaryMetalness: true, f0Range: [0.02, 1], iorRange: [1, 2.5] };
  material.userData.pbrTextureSource = textures?.source ?? 'flat-fallback';
  material.userData.referencePbr = spec.referencePbr ?? null;
  material.userData.referenceMaterialId = spec.referenceMaterialId ?? spec.materialReference?.profileId ?? null;
  material.userData.materialEvidence = spec.materialEvidence ?? null;
  material.userData.validationViews = spec.materialReference?.validationViews ?? [];
  material.needsUpdate = true;
  return material;
}

type AttachmentEndpoint = {
  start: THREE.Vector3;
  midpoint: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
  baseRadius: number;
  endRadius: number;
};

function readVector3(value: unknown, fallback: [number, number, number]): THREE.Vector3 {
  if (Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === 'number')) {
    return new THREE.Vector3(value[0], value[1], value[2]);
  }
  return new THREE.Vector3(fallback[0], fallback[1], fallback[2]);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function makeAttachmentEndpoint(attachment: unknown): AttachmentEndpoint | null {
  if (!attachment || typeof attachment !== 'object') return null;
  const record = attachment as Record<string, unknown>;
  const start = readVector3(record.localStart, [0, 0, 0]);
  const end = readVector3(record.localEnd, [0, 1, 0]);
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length <= 0.0001) return null;
  const direction = delta.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const baseRadius = Math.max(0.005, readNumber(record.baseRadius, 0.06));
  const endRadius = Math.max(0.003, readNumber(record.endRadius, baseRadius * 0.55));
  return {
    start,
    midpoint: delta.multiplyScalar(0.5),
    quaternion,
    length,
    baseRadius,
    endRadius,
  };
}

// Generated from ObjectSculptSpec target: MODU Bottle
// Sculpt build pass: blockout
// This factory is intentionally pass-gated. Finish browser screenshot review before unlocking deeper passes.
export function createMODUBottleModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = "MODU Bottle";
  root.userData.reconstructionEvidence = {"itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": {"solved": false, "fovDegrees": 40.0, "aspect": 1.0, "orientation": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}, "positionHint": [0.0, 0.0, 3.0], "note": "For likeness work, solve the reference camera (forge/stage1_intake/solve_camera_pose.py) so the review render aligns with the photo and the reference can be projected. Confirm by overlay review."}, "approximationNotes": []};
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;

  const materialMap: Record<string, THREE.Material> = {};
  materialMap["body-coat"] = createSculptMaterial(
    "body-coat",
    {"id": "body-coat", "name": "Configurable powder coat", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#B7DCCF", "color": "#B7DCCF", "albedo": {"dominant": "#B7DCCF", "secondary": ["#99C7B7", "#D8ECE4"], "samplingNotes": "Mint reference variant; runtime color is user-selectable."}, "colorVariation": {"palette": ["#B7DCCF", "#99C7B7", "#D8ECE4"], "pattern": "broad-lighting-only", "amplitude": 0.03, "heightCorrelation": 0.0}, "roughness": {"base": 0.72, "variation": 0.05, "localResponse": "Broad matte highlight with slightly tighter response near silhouette edges."}, "metalness": {"base": 0.08, "variation": 0.0}, "ambientOcclusion": {"cavityStrength": 0.18, "contactShadowBias": 0.3, "notes": "Only seam/contact darkening."}, "localOverrides": [{"id": "matte-finish", "region": "full-body", "roughness": 0.72, "evidenceRefs": ["full-object"]}], "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#000000"}, "textureless": {"declared": true, "evidence": ["full-object: clean commercial reference shows no grain, print texture or surface pattern; form/color carry identity"]}, "notes": "Designed for live recoloring; no image texture is baked into the body."},
    options
  );
  materialMap["polymer"] = createSculptMaterial(
    "polymer",
    {"id": "polymer", "name": "Molded lid and handle polymer", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#A0CBBB", "color": "#A0CBBB", "albedo": {"dominant": "#A0CBBB", "secondary": ["#7EB0A0", "#C1DDD4"], "samplingNotes": "Slightly darker than body in reference."}, "colorVariation": {"palette": ["#A0CBBB", "#7EB0A0"], "pattern": "uniform-molded", "amplitude": 0.02, "heightCorrelation": 0.0}, "roughness": {"base": 0.32, "variation": 0.04, "localResponse": "Tighter molded-plastic highlight than body."}, "metalness": {"base": 0.0, "variation": 0.0}, "ambientOcclusion": {"cavityStrength": 0.22, "contactShadowBias": 0.35, "notes": "Seam and handle-root darkening."}, "localOverrides": [{"id": "polymer-sheen", "region": "lid-and-handle", "roughness": 0.32, "evidenceRefs": ["full-object"]}], "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#000000"}, "textureless": {"declared": true, "evidence": ["full-object: molded lid/handle read as smooth solid-color polymer without visible texture"]}},
    options
  );
  materialMap["brand"] = createSculptMaterial(
    "brand",
    {"id": "brand", "name": "MODU mark", "type": "standard", "shaderModel": "MeshStandardMaterial", "baseColor": "#F5F8F4", "color": "#F5F8F4", "albedo": {"dominant": "#F5F8F4", "secondary": ["#D8E4DD"], "samplingNotes": "Small pale front mark."}, "colorVariation": {"palette": ["#F5F8F4", "#D8E4DD"], "pattern": "flat", "amplitude": 0.0, "heightCorrelation": 0.0}, "roughness": {"base": 0.48, "variation": 0.0}, "metalness": {"base": 0.0, "variation": 0.0}, "ambientOcclusion": {"cavityStrength": 0.08, "contactShadowBias": 0.1, "notes": "Very shallow surface contact."}, "localOverrides": [{"id": "brand-contrast", "region": "front-wordmark", "roughness": 0.48, "evidenceRefs": ["full-object"]}], "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#000000"}, "textureless": {"declared": true, "evidence": ["full-object: small clean mark is represented as geometry/color, not a textured surface"]}},
    options
  );

  const nodes: Record<string, THREE.Object3D> = { root };
  const meshes: Record<string, THREE.Mesh> = {};
  const sockets: Record<string, THREE.Object3D> = {};
  const colliders: Record<string, unknown> = {};
  const destructionGroups: Record<string, THREE.Object3D[]> = {};

  const endpoint_body_shell_0 = makeAttachmentEndpoint(null);
  const node_body_shell_0 = new THREE.Group();
  node_body_shell_0.name = "Main bottle shell__pivot";
  node_body_shell_0.scale.set(1, 1, 1);
  if (endpoint_body_shell_0) {
    node_body_shell_0.position.copy(endpoint_body_shell_0.start);
    node_body_shell_0.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_body_shell_0.position.set(0.0, 0.0, 0.0);
    node_body_shell_0.rotation.set(0.0, 0.0, 0.0);
  }
  node_body_shell_0.userData.sculptComponent = {"id": "body-shell", "name": "Main bottle shell", "level": "macro", "role": "body", "importance": 0.9, "confidence": 0.82, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Visible outline is one continuous axisymmetric shell rather than stacked boxes.", "geometryDescriptor": {"topologyIntent": "Continuous rotational bottle shell with gentle shoulder and eased base transition.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.43, -1.32], [0.45, -1.18], [0.46, -0.55], [0.46, 0.7], [0.44, 1.02], [0.39, 1.18], [0.37, 1.24]]}}, "parent": null, "attachment": null, "dimensions": {"width": 0.92, "height": 2.64, "depth": 0.92, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "capsule", "offset": [0, 0, 0], "scale": [0.92, 2.64, 0.92], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "body-coat", "materialLayers": ["body-coat"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(183, 220, 207, 1.0)", "secondaryAlbedo": "rgba(153, 199, 183, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.86, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["body-waist", "shoulder-break"], "surfaceDetail": {"macroRoughness": 0.72, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["body-waist", "shoulder-break"], "fidelityTier": "structural"};
  node_body_shell_0.userData.actionProfile = {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "capsule", "offset": [0, 0, 0], "scale": [0.92, 2.64, 0.92], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["root"] ?? root).add(node_body_shell_0);
  nodes["body-shell"] = node_body_shell_0;
  const mesh_body_shell_0Geometry = endpoint_body_shell_0
    ? new THREE.CylinderGeometry(endpoint_body_shell_0.endRadius, endpoint_body_shell_0.baseRadius, endpoint_body_shell_0.length, 16, 6)
    : buildLatheGeometry({"points": [[0.43, -1.32], [0.45, -1.18], [0.46, -0.55], [0.46, 0.7], [0.44, 1.02], [0.39, 1.18], [0.37, 1.24]]});
  if (!endpoint_body_shell_0) {
    mesh_body_shell_0Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_body_shell_0 = new THREE.Mesh(
    mesh_body_shell_0Geometry,
    materialMap["body-coat"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_body_shell_0.name = "Main bottle shell";
  if (endpoint_body_shell_0) {
    mesh_body_shell_0.position.copy(endpoint_body_shell_0.midpoint);
    mesh_body_shell_0.quaternion.copy(endpoint_body_shell_0.quaternion);
  }
  mesh_body_shell_0.castShadow = options.castShadow ?? true;
  mesh_body_shell_0.receiveShadow = options.receiveShadow ?? true;
  mesh_body_shell_0.userData.sculptComponent = {"id": "body-shell", "name": "Main bottle shell", "level": "macro", "role": "body", "importance": 0.9, "confidence": 0.82, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Visible outline is one continuous axisymmetric shell rather than stacked boxes.", "geometryDescriptor": {"topologyIntent": "Continuous rotational bottle shell with gentle shoulder and eased base transition.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.43, -1.32], [0.45, -1.18], [0.46, -0.55], [0.46, 0.7], [0.44, 1.02], [0.39, 1.18], [0.37, 1.24]]}}, "parent": null, "attachment": null, "dimensions": {"width": 0.92, "height": 2.64, "depth": 0.92, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "capsule", "offset": [0, 0, 0], "scale": [0.92, 2.64, 0.92], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "body-coat", "materialLayers": ["body-coat"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(183, 220, 207, 1.0)", "secondaryAlbedo": "rgba(153, 199, 183, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.86, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["body-waist", "shoulder-break"], "surfaceDetail": {"macroRoughness": 0.72, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["body-waist", "shoulder-break"], "fidelityTier": "structural"};
  node_body_shell_0.add(mesh_body_shell_0);
  meshes["body-shell"] = mesh_body_shell_0;
  colliders["body-shell"] = {"type": "capsule", "offset": [0, 0, 0], "scale": [0.92, 2.64, 0.92], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  const attachment_lid_assembly_1 = {"parentId": "body-shell", "parentSocket": "neck-socket", "localStart": [0, 1.2, 0], "localEnd": [0, 1.26, 0], "contactType": "threaded-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]};
  const endpoint_lid_assembly_1 = makeAttachmentEndpoint(attachment_lid_assembly_1);
  const node_lid_assembly_1 = new THREE.Group();
  node_lid_assembly_1.name = "Stepped lid assembly__pivot";
  node_lid_assembly_1.scale.set(1, 1, 1);
  if (endpoint_lid_assembly_1) {
    node_lid_assembly_1.position.copy(endpoint_lid_assembly_1.start);
    node_lid_assembly_1.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_lid_assembly_1.position.set(0.0, 1.42, 0.0);
    node_lid_assembly_1.rotation.set(0.0, 0.0, 0.0);
  }
  node_lid_assembly_1.userData.sculptComponent = {"id": "lid-assembly", "name": "Stepped lid assembly", "level": "macro", "role": "lid", "importance": 0.9, "confidence": 0.82, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "The lid reads as a discrete rigid cap with multiple radial steps.", "geometryDescriptor": {"topologyIntent": "The lid reads as a discrete rigid cap with multiple radial steps.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "body-shell", "attachment": {"parentId": "body-shell", "parentSocket": "neck-socket", "localStart": [0, 1.2, 0], "localEnd": [0, 1.26, 0], "contactType": "threaded-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.82, "height": 0.36, "depth": 0.82, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, 1.42, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.82, 0.36, 0.82], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["lid-step"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["lid-step"], "fidelityTier": "structural"};
  node_lid_assembly_1.userData.actionProfile = {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.82, 0.36, 0.82], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["body-shell"] ?? root).add(node_lid_assembly_1);
  nodes["lid-assembly"] = node_lid_assembly_1;
  const mesh_lid_assembly_1Geometry = endpoint_lid_assembly_1
    ? new THREE.CylinderGeometry(endpoint_lid_assembly_1.endRadius, endpoint_lid_assembly_1.baseRadius, endpoint_lid_assembly_1.length, 16, 6)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 24, 8);
  if (!endpoint_lid_assembly_1) {
    mesh_lid_assembly_1Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_lid_assembly_1 = new THREE.Mesh(
    mesh_lid_assembly_1Geometry,
    materialMap["polymer"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_lid_assembly_1.name = "Stepped lid assembly";
  if (endpoint_lid_assembly_1) {
    mesh_lid_assembly_1.position.copy(endpoint_lid_assembly_1.midpoint);
    mesh_lid_assembly_1.quaternion.copy(endpoint_lid_assembly_1.quaternion);
  }
  mesh_lid_assembly_1.castShadow = options.castShadow ?? true;
  mesh_lid_assembly_1.receiveShadow = options.receiveShadow ?? true;
  mesh_lid_assembly_1.userData.sculptComponent = {"id": "lid-assembly", "name": "Stepped lid assembly", "level": "macro", "role": "lid", "importance": 0.9, "confidence": 0.82, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "The lid reads as a discrete rigid cap with multiple radial steps.", "geometryDescriptor": {"topologyIntent": "The lid reads as a discrete rigid cap with multiple radial steps.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "body-shell", "attachment": {"parentId": "body-shell", "parentSocket": "neck-socket", "localStart": [0, 1.2, 0], "localEnd": [0, 1.26, 0], "contactType": "threaded-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.82, "height": 0.36, "depth": 0.82, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, 1.42, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.82, 0.36, 0.82], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["lid-step"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["lid-step"], "fidelityTier": "structural"};
  node_lid_assembly_1.add(mesh_lid_assembly_1);
  meshes["lid-assembly"] = mesh_lid_assembly_1;
  colliders["lid-assembly"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.82, 0.36, 0.82], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  const attachment_lid_upper_2 = {"parentId": "lid-assembly", "parentSocket": "upper-seat", "localStart": [0, 0.12, 0], "localEnd": [0, 0.16, 0], "contactType": "flush-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]};
  const endpoint_lid_upper_2 = makeAttachmentEndpoint(attachment_lid_upper_2);
  const node_lid_upper_2 = new THREE.Group();
  node_lid_upper_2.name = "Upper lid ring__pivot";
  node_lid_upper_2.scale.set(1, 1, 1);
  if (endpoint_lid_upper_2) {
    node_lid_upper_2.position.copy(endpoint_lid_upper_2.start);
    node_lid_upper_2.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_lid_upper_2.position.set(0.0, 0.2, 0.0);
    node_lid_upper_2.rotation.set(0.0, 0.0, 0.0);
  }
  node_lid_upper_2.userData.sculptComponent = {"id": "lid-upper", "name": "Upper lid ring", "level": "meso", "role": "lid-ring", "importance": 0.75, "confidence": 0.82, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "A smaller upper ring creates the visible two-step lid silhouette.", "geometryDescriptor": {"topologyIntent": "A smaller upper ring creates the visible two-step lid silhouette.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "upper-seat", "localStart": [0, 0.12, 0], "localEnd": [0, 0.16, 0], "contactType": "flush-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.7, "height": 0.18, "depth": 0.7, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, 0.2, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.7, 0.18, 0.7], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["upper-lid-ridge"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["upper-lid-ridge"], "fidelityTier": "structural"};
  node_lid_upper_2.userData.actionProfile = {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.7, 0.18, 0.7], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["lid-assembly"] ?? root).add(node_lid_upper_2);
  nodes["lid-upper"] = node_lid_upper_2;
  const mesh_lid_upper_2Geometry = endpoint_lid_upper_2
    ? new THREE.CylinderGeometry(endpoint_lid_upper_2.endRadius, endpoint_lid_upper_2.baseRadius, endpoint_lid_upper_2.length, 16, 6)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 24, 8);
  if (!endpoint_lid_upper_2) {
    mesh_lid_upper_2Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_lid_upper_2 = new THREE.Mesh(
    mesh_lid_upper_2Geometry,
    materialMap["polymer"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_lid_upper_2.name = "Upper lid ring";
  if (endpoint_lid_upper_2) {
    mesh_lid_upper_2.position.copy(endpoint_lid_upper_2.midpoint);
    mesh_lid_upper_2.quaternion.copy(endpoint_lid_upper_2.quaternion);
  }
  mesh_lid_upper_2.castShadow = options.castShadow ?? true;
  mesh_lid_upper_2.receiveShadow = options.receiveShadow ?? true;
  mesh_lid_upper_2.userData.sculptComponent = {"id": "lid-upper", "name": "Upper lid ring", "level": "meso", "role": "lid-ring", "importance": 0.75, "confidence": 0.82, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "A smaller upper ring creates the visible two-step lid silhouette.", "geometryDescriptor": {"topologyIntent": "A smaller upper ring creates the visible two-step lid silhouette.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "upper-seat", "localStart": [0, 0.12, 0], "localEnd": [0, 0.16, 0], "contactType": "flush-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.7, "height": 0.18, "depth": 0.7, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, 0.2, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.7, 0.18, 0.7], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["upper-lid-ridge"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["upper-lid-ridge"], "fidelityTier": "structural"};
  node_lid_upper_2.add(mesh_lid_upper_2);
  meshes["lid-upper"] = mesh_lid_upper_2;
  colliders["lid-upper"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.7, 0.18, 0.7], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  const endpoint_lid_seam_3 = makeAttachmentEndpoint(null);
  const node_lid_seam_3 = new THREE.Group();
  node_lid_seam_3.name = "Lid seam ring__pivot";
  node_lid_seam_3.scale.set(1, 1, 1);
  if (endpoint_lid_seam_3) {
    node_lid_seam_3.position.copy(endpoint_lid_seam_3.start);
    node_lid_seam_3.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_lid_seam_3.position.set(0.0, 0.09, 0.0);
    node_lid_seam_3.rotation.set(0.0, 0.0, 0.0);
  }
  node_lid_seam_3.userData.sculptComponent = {"id": "lid-seam", "name": "Lid seam ring", "level": "meso", "role": "seam", "importance": 0.75, "confidence": 0.82, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "A narrow circumferential seam separates the lid steps.", "geometryDescriptor": {"topologyIntent": "A narrow circumferential seam separates the lid steps.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "seam-seat", "localStart": [0, 0.07, 0], "localEnd": [0, 0.1, 0], "contactType": "flush-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.78, "height": 0.045, "depth": 0.78, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, 0.09, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.78, 0.045, 0.78], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["lid-seam-line"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["lid-seam-line"], "fidelityTier": "structural"};
  node_lid_seam_3.userData.actionProfile = {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.78, 0.045, 0.78], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["lid-assembly"] ?? root).add(node_lid_seam_3);
  nodes["lid-seam"] = node_lid_seam_3;
  const mesh_lid_seam_3Geometry = endpoint_lid_seam_3
    ? new THREE.CylinderGeometry(endpoint_lid_seam_3.endRadius, endpoint_lid_seam_3.baseRadius, endpoint_lid_seam_3.length, 16, 6)
    : new THREE.TorusGeometry(0.45, 0.08, 12, 48);
  if (!endpoint_lid_seam_3) {
    mesh_lid_seam_3Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_lid_seam_3 = new THREE.Mesh(
    mesh_lid_seam_3Geometry,
    materialMap["polymer"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_lid_seam_3.name = "Lid seam ring";
  if (endpoint_lid_seam_3) {
    mesh_lid_seam_3.position.copy(endpoint_lid_seam_3.midpoint);
    mesh_lid_seam_3.quaternion.copy(endpoint_lid_seam_3.quaternion);
  }
  mesh_lid_seam_3.castShadow = options.castShadow ?? true;
  mesh_lid_seam_3.receiveShadow = options.receiveShadow ?? true;
  mesh_lid_seam_3.userData.sculptComponent = {"id": "lid-seam", "name": "Lid seam ring", "level": "meso", "role": "seam", "importance": 0.75, "confidence": 0.82, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "A narrow circumferential seam separates the lid steps.", "geometryDescriptor": {"topologyIntent": "A narrow circumferential seam separates the lid steps.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "seam-seat", "localStart": [0, 0.07, 0], "localEnd": [0, 0.1, 0], "contactType": "flush-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.78, "height": 0.045, "depth": 0.78, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, 0.09, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.78, 0.045, 0.78], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["lid-seam-line"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["lid-seam-line"], "fidelityTier": "structural"};
  node_lid_seam_3.add(mesh_lid_seam_3);
  meshes["lid-seam"] = mesh_lid_seam_3;
  colliders["lid-seam"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.78, 0.045, 0.78], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  const attachment_handle_loop_4 = {"parentId": "lid-assembly", "parentSocket": "handle-root", "localStart": [-0.25, 0.14, -0.15], "localEnd": [0.25, 0.14, -0.15], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]};
  const endpoint_handle_loop_4 = makeAttachmentEndpoint(attachment_handle_loop_4);
  const node_handle_loop_4 = new THREE.Group();
  node_handle_loop_4.name = "Carry handle loop__pivot";
  node_handle_loop_4.scale.set(1, 1, 1);
  if (endpoint_handle_loop_4) {
    node_handle_loop_4.position.copy(endpoint_handle_loop_4.start);
    node_handle_loop_4.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_handle_loop_4.position.set(0.0, 0.28, -0.18);
    node_handle_loop_4.rotation.set(0.0, 0.0, 0.0);
  }
  node_handle_loop_4.userData.sculptComponent = {"id": "handle-loop", "name": "Carry handle loop", "level": "meso", "role": "handle", "importance": 0.75, "confidence": 0.82, "primitive": "curve-sweep", "topologyClass": "continuous-sculpt", "topologyRationale": "The carry loop is a rounded swept form whose negative space is visible from the reference angle.", "geometryDescriptor": {"topologyIntent": "Rounded carry loop swept along a curved 3D spine.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "curveSweep": {"spine": [[-0.28, 0.0, 0.0], [-0.35, 0.34, 0.0], [0.0, 0.58, 0.0], [0.35, 0.34, 0.0], [0.28, 0.0, 0.0]], "crossSection": {"points": [[-0.055, -0.04], [0.055, -0.04], [0.055, 0.04], [-0.055, 0.04]]}, "closed": false}}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "handle-root", "localStart": [-0.25, 0.14, -0.15], "localEnd": [0.25, 0.14, -0.15], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.72, "height": 0.68, "depth": 0.14, "units": "relative", "confidence": 0.82}, "transform": {"position": [0.0, 0.28, -0.18], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "accent", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.72, 0.68, 0.14], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["handle-curve"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["handle-curve"], "fidelityTier": "structural"};
  node_handle_loop_4.userData.actionProfile = {"animationRole": "accent", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.72, 0.68, 0.14], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["lid-assembly"] ?? root).add(node_handle_loop_4);
  nodes["handle-loop"] = node_handle_loop_4;
  const mesh_handle_loop_4Geometry = endpoint_handle_loop_4
    ? new THREE.CylinderGeometry(endpoint_handle_loop_4.endRadius, endpoint_handle_loop_4.baseRadius, endpoint_handle_loop_4.length, 16, 6)
    : buildCurveSweepGeometry({"spine": [[-0.28, 0.0, 0.0], [-0.35, 0.34, 0.0], [0.0, 0.58, 0.0], [0.35, 0.34, 0.0], [0.28, 0.0, 0.0]], "crossSection": {"points": [[-0.055, -0.04], [0.055, -0.04], [0.055, 0.04], [-0.055, 0.04]]}, "closed": false});
  if (!endpoint_handle_loop_4) {
    mesh_handle_loop_4Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_handle_loop_4 = new THREE.Mesh(
    mesh_handle_loop_4Geometry,
    materialMap["polymer"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_handle_loop_4.name = "Carry handle loop";
  if (endpoint_handle_loop_4) {
    mesh_handle_loop_4.position.copy(endpoint_handle_loop_4.midpoint);
    mesh_handle_loop_4.quaternion.copy(endpoint_handle_loop_4.quaternion);
  }
  mesh_handle_loop_4.castShadow = options.castShadow ?? true;
  mesh_handle_loop_4.receiveShadow = options.receiveShadow ?? true;
  mesh_handle_loop_4.userData.sculptComponent = {"id": "handle-loop", "name": "Carry handle loop", "level": "meso", "role": "handle", "importance": 0.75, "confidence": 0.82, "primitive": "curve-sweep", "topologyClass": "continuous-sculpt", "topologyRationale": "The carry loop is a rounded swept form whose negative space is visible from the reference angle.", "geometryDescriptor": {"topologyIntent": "Rounded carry loop swept along a curved 3D spine.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "curveSweep": {"spine": [[-0.28, 0.0, 0.0], [-0.35, 0.34, 0.0], [0.0, 0.58, 0.0], [0.35, 0.34, 0.0], [0.28, 0.0, 0.0]], "crossSection": {"points": [[-0.055, -0.04], [0.055, -0.04], [0.055, 0.04], [-0.055, 0.04]]}, "closed": false}}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "handle-root", "localStart": [-0.25, 0.14, -0.15], "localEnd": [0.25, 0.14, -0.15], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.72, "height": 0.68, "depth": 0.14, "units": "relative", "confidence": 0.82}, "transform": {"position": [0.0, 0.28, -0.18], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "accent", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.72, 0.68, 0.14], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["handle-curve"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["handle-curve"], "fidelityTier": "structural"};
  node_handle_loop_4.add(mesh_handle_loop_4);
  meshes["handle-loop"] = mesh_handle_loop_4;
  colliders["handle-loop"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.72, 0.68, 0.14], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  const endpoint_base_ring_5 = makeAttachmentEndpoint(null);
  const node_base_ring_5 = new THREE.Group();
  node_base_ring_5.name = "Soft inset base ring__pivot";
  node_base_ring_5.scale.set(1, 1, 1);
  if (endpoint_base_ring_5) {
    node_base_ring_5.position.copy(endpoint_base_ring_5.start);
    node_base_ring_5.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_base_ring_5.position.set(0.0, -1.3, 0.0);
    node_base_ring_5.rotation.set(0.0, 0.0, 0.0);
  }
  node_base_ring_5.userData.sculptComponent = {"id": "base-ring", "name": "Soft inset base ring", "level": "meso", "role": "base", "importance": 0.75, "confidence": 0.82, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "A shallow base ring supports the observed eased lower silhouette and contact shadow.", "geometryDescriptor": {"topologyIntent": "A shallow base ring supports the observed eased lower silhouette and contact shadow.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "body-shell", "attachment": {"parentId": "body-shell", "parentSocket": "base-seat", "localStart": [0, -1.29, 0], "localEnd": [0, -1.27, 0], "contactType": "recessed-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.82, "height": 0.06, "depth": 0.82, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, -1.3, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.82, 0.06, 0.82], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["base-inset"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["base-inset"], "fidelityTier": "structural"};
  node_base_ring_5.userData.actionProfile = {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.82, 0.06, 0.82], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["body-shell"] ?? root).add(node_base_ring_5);
  nodes["base-ring"] = node_base_ring_5;
  const mesh_base_ring_5Geometry = endpoint_base_ring_5
    ? new THREE.CylinderGeometry(endpoint_base_ring_5.endRadius, endpoint_base_ring_5.baseRadius, endpoint_base_ring_5.length, 16, 6)
    : new THREE.TorusGeometry(0.45, 0.08, 12, 48);
  if (!endpoint_base_ring_5) {
    mesh_base_ring_5Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_base_ring_5 = new THREE.Mesh(
    mesh_base_ring_5Geometry,
    materialMap["polymer"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_base_ring_5.name = "Soft inset base ring";
  if (endpoint_base_ring_5) {
    mesh_base_ring_5.position.copy(endpoint_base_ring_5.midpoint);
    mesh_base_ring_5.quaternion.copy(endpoint_base_ring_5.quaternion);
  }
  mesh_base_ring_5.castShadow = options.castShadow ?? true;
  mesh_base_ring_5.receiveShadow = options.receiveShadow ?? true;
  mesh_base_ring_5.userData.sculptComponent = {"id": "base-ring", "name": "Soft inset base ring", "level": "meso", "role": "base", "importance": 0.75, "confidence": 0.82, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "A shallow base ring supports the observed eased lower silhouette and contact shadow.", "geometryDescriptor": {"topologyIntent": "A shallow base ring supports the observed eased lower silhouette and contact shadow.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "body-shell", "attachment": {"parentId": "body-shell", "parentSocket": "base-seat", "localStart": [0, -1.29, 0], "localEnd": [0, -1.27, 0], "contactType": "recessed-seat", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.82, "height": 0.06, "depth": 0.82, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, -1.3, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.82, 0.06, 0.82], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["base-inset"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["base-inset"], "fidelityTier": "structural"};
  node_base_ring_5.add(mesh_base_ring_5);
  meshes["base-ring"] = mesh_base_ring_5;
  colliders["base-ring"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.82, 0.06, 0.82], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  const attachment_anchor_left_6 = {"parentId": "lid-assembly", "parentSocket": "handle-left", "localStart": [-0.29, 0.08, -0.16], "localEnd": [-0.29, 0.18, -0.16], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]};
  const endpoint_anchor_left_6 = makeAttachmentEndpoint(attachment_anchor_left_6);
  const node_anchor_left_6 = new THREE.Group();
  node_anchor_left_6.name = "Left handle anchor__pivot";
  node_anchor_left_6.scale.set(1, 1, 1);
  if (endpoint_anchor_left_6) {
    node_anchor_left_6.position.copy(endpoint_anchor_left_6.start);
    node_anchor_left_6.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_anchor_left_6.position.set(-0.29, 0.16, -0.16);
    node_anchor_left_6.rotation.set(0.0, 0.0, 0.0);
  }
  node_anchor_left_6.userData.sculptComponent = {"id": "anchor-left", "name": "Left handle anchor", "level": "micro", "role": "anchor", "importance": 0.55, "confidence": 0.82, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Visible handle roots need small embedded anchor masses to avoid a floating loop.", "geometryDescriptor": {"topologyIntent": "Visible handle roots need small embedded anchor masses to avoid a floating loop.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "handle-left", "localStart": [-0.29, 0.08, -0.16], "localEnd": [-0.29, 0.18, -0.16], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.12, "height": 0.18, "depth": 0.12, "units": "relative", "confidence": 0.82}, "transform": {"position": [-0.29, 0.16, -0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.12, 0.18, 0.12], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["anchor-seam-left"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["anchor-seam-left"], "fidelityTier": "structural"};
  node_anchor_left_6.userData.actionProfile = {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.12, 0.18, 0.12], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["lid-assembly"] ?? root).add(node_anchor_left_6);
  nodes["anchor-left"] = node_anchor_left_6;
  const mesh_anchor_left_6Geometry = endpoint_anchor_left_6
    ? new THREE.CylinderGeometry(endpoint_anchor_left_6.endRadius, endpoint_anchor_left_6.baseRadius, endpoint_anchor_left_6.length, 16, 6)
    : buildWatertightCapsule(0.35, 0.7, 8, 16, 1);
  if (!endpoint_anchor_left_6) {
    mesh_anchor_left_6Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_anchor_left_6 = new THREE.Mesh(
    mesh_anchor_left_6Geometry,
    materialMap["polymer"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_anchor_left_6.name = "Left handle anchor";
  if (endpoint_anchor_left_6) {
    mesh_anchor_left_6.position.copy(endpoint_anchor_left_6.midpoint);
    mesh_anchor_left_6.quaternion.copy(endpoint_anchor_left_6.quaternion);
  }
  mesh_anchor_left_6.castShadow = options.castShadow ?? true;
  mesh_anchor_left_6.receiveShadow = options.receiveShadow ?? true;
  mesh_anchor_left_6.userData.sculptComponent = {"id": "anchor-left", "name": "Left handle anchor", "level": "micro", "role": "anchor", "importance": 0.55, "confidence": 0.82, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Visible handle roots need small embedded anchor masses to avoid a floating loop.", "geometryDescriptor": {"topologyIntent": "Visible handle roots need small embedded anchor masses to avoid a floating loop.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "handle-left", "localStart": [-0.29, 0.08, -0.16], "localEnd": [-0.29, 0.18, -0.16], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.12, "height": 0.18, "depth": 0.12, "units": "relative", "confidence": 0.82}, "transform": {"position": [-0.29, 0.16, -0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.12, 0.18, 0.12], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["anchor-seam-left"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["anchor-seam-left"], "fidelityTier": "structural"};
  node_anchor_left_6.add(mesh_anchor_left_6);
  meshes["anchor-left"] = mesh_anchor_left_6;
  colliders["anchor-left"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.12, 0.18, 0.12], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  const attachment_anchor_right_7 = {"parentId": "lid-assembly", "parentSocket": "handle-right", "localStart": [0.29, 0.08, -0.16], "localEnd": [0.29, 0.18, -0.16], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]};
  const endpoint_anchor_right_7 = makeAttachmentEndpoint(attachment_anchor_right_7);
  const node_anchor_right_7 = new THREE.Group();
  node_anchor_right_7.name = "Right handle anchor__pivot";
  node_anchor_right_7.scale.set(1, 1, 1);
  if (endpoint_anchor_right_7) {
    node_anchor_right_7.position.copy(endpoint_anchor_right_7.start);
    node_anchor_right_7.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_anchor_right_7.position.set(0.29, 0.16, -0.16);
    node_anchor_right_7.rotation.set(0.0, 0.0, 0.0);
  }
  node_anchor_right_7.userData.sculptComponent = {"id": "anchor-right", "name": "Right handle anchor", "level": "micro", "role": "anchor", "importance": 0.55, "confidence": 0.82, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Visible handle roots need small embedded anchor masses to avoid a floating loop.", "geometryDescriptor": {"topologyIntent": "Visible handle roots need small embedded anchor masses to avoid a floating loop.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "handle-right", "localStart": [0.29, 0.08, -0.16], "localEnd": [0.29, 0.18, -0.16], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.12, "height": 0.18, "depth": 0.12, "units": "relative", "confidence": 0.82}, "transform": {"position": [0.29, 0.16, -0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.12, 0.18, 0.12], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["anchor-seam-right"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["anchor-seam-right"], "fidelityTier": "structural"};
  node_anchor_right_7.userData.actionProfile = {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.12, 0.18, 0.12], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["lid-assembly"] ?? root).add(node_anchor_right_7);
  nodes["anchor-right"] = node_anchor_right_7;
  const mesh_anchor_right_7Geometry = endpoint_anchor_right_7
    ? new THREE.CylinderGeometry(endpoint_anchor_right_7.endRadius, endpoint_anchor_right_7.baseRadius, endpoint_anchor_right_7.length, 16, 6)
    : buildWatertightCapsule(0.35, 0.7, 8, 16, 1);
  if (!endpoint_anchor_right_7) {
    mesh_anchor_right_7Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_anchor_right_7 = new THREE.Mesh(
    mesh_anchor_right_7Geometry,
    materialMap["polymer"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_anchor_right_7.name = "Right handle anchor";
  if (endpoint_anchor_right_7) {
    mesh_anchor_right_7.position.copy(endpoint_anchor_right_7.midpoint);
    mesh_anchor_right_7.quaternion.copy(endpoint_anchor_right_7.quaternion);
  }
  mesh_anchor_right_7.castShadow = options.castShadow ?? true;
  mesh_anchor_right_7.receiveShadow = options.receiveShadow ?? true;
  mesh_anchor_right_7.userData.sculptComponent = {"id": "anchor-right", "name": "Right handle anchor", "level": "micro", "role": "anchor", "importance": 0.55, "confidence": 0.82, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Visible handle roots need small embedded anchor masses to avoid a floating loop.", "geometryDescriptor": {"topologyIntent": "Visible handle roots need small embedded anchor masses to avoid a floating loop.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "lid-assembly", "attachment": {"parentId": "lid-assembly", "parentSocket": "handle-right", "localStart": [0.29, 0.08, -0.16], "localEnd": [0.29, 0.18, -0.16], "contactType": "embedded", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.12, "height": 0.18, "depth": 0.12, "units": "relative", "confidence": 0.82}, "transform": {"position": [0.29, 0.16, -0.16], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.12, 0.18, 0.12], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "polymer", "materialLayers": ["polymer"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(160, 203, 189, 1.0)", "secondaryAlbedo": "rgba(126, 176, 160, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.8, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["anchor-seam-right"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["anchor-seam-right"], "fidelityTier": "structural"};
  node_anchor_right_7.add(mesh_anchor_right_7);
  meshes["anchor-right"] = mesh_anchor_right_7;
  colliders["anchor-right"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.12, 0.18, 0.12], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  const endpoint_brand_mark_8 = makeAttachmentEndpoint(null);
  const node_brand_mark_8 = new THREE.Group();
  node_brand_mark_8.name = "MODU front wordmark__pivot";
  node_brand_mark_8.scale.set(1, 1, 1);
  if (endpoint_brand_mark_8) {
    node_brand_mark_8.position.copy(endpoint_brand_mark_8.start);
    node_brand_mark_8.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_brand_mark_8.position.set(0.0, -0.3, 0.465);
    node_brand_mark_8.rotation.set(0.0, 0.0, 0.0);
  }
  node_brand_mark_8.userData.sculptComponent = {"id": "brand-mark", "name": "MODU front wordmark", "level": "micro", "role": "branding", "importance": 0.55, "confidence": 0.82, "primitive": "box", "topologyClass": "surface-relief", "topologyRationale": "The wordmark is a shallow front-facing raised/printed detail attached to the body surface.", "geometryDescriptor": {"topologyIntent": "The wordmark is a shallow front-facing raised/printed detail attached to the body surface.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "body-shell", "attachment": {"parentId": "body-shell", "parentSocket": "front-brand-zone", "localStart": [0, -0.3, 0.445], "localEnd": [0, -0.3, 0.466], "contactType": "surface-mount", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.34, "height": 0.1, "depth": 0.012, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, -0.3, 0.465], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.34, 0.1, 0.012], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "brand", "materialLayers": ["brand"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(245, 248, 244, 1.0)", "secondaryAlbedo": "rgba(216, 228, 221, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.7, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["modu-brand-mark"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["modu-brand-mark"], "fidelityTier": "structural"};
  node_brand_mark_8.userData.actionProfile = {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.34, 0.1, 0.012], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}};
  (nodes["body-shell"] ?? root).add(node_brand_mark_8);
  nodes["brand-mark"] = node_brand_mark_8;
  const mesh_brand_mark_8Geometry = endpoint_brand_mark_8
    ? new THREE.CylinderGeometry(endpoint_brand_mark_8.endRadius, endpoint_brand_mark_8.baseRadius, endpoint_brand_mark_8.length, 16, 6)
    : new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  if (!endpoint_brand_mark_8) {
    mesh_brand_mark_8Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_brand_mark_8 = new THREE.Mesh(
    mesh_brand_mark_8Geometry,
    materialMap["brand"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_brand_mark_8.name = "MODU front wordmark";
  if (endpoint_brand_mark_8) {
    mesh_brand_mark_8.position.copy(endpoint_brand_mark_8.midpoint);
    mesh_brand_mark_8.quaternion.copy(endpoint_brand_mark_8.quaternion);
  }
  mesh_brand_mark_8.castShadow = options.castShadow ?? true;
  mesh_brand_mark_8.receiveShadow = options.receiveShadow ?? true;
  mesh_brand_mark_8.userData.sculptComponent = {"id": "brand-mark", "name": "MODU front wordmark", "level": "micro", "role": "branding", "importance": 0.55, "confidence": 0.82, "primitive": "box", "topologyClass": "surface-relief", "topologyRationale": "The wordmark is a shallow front-facing raised/printed detail attached to the body surface.", "geometryDescriptor": {"topologyIntent": "The wordmark is a shallow front-facing raised/printed detail attached to the body surface.", "edgeTreatment": {"type": "rounded", "bevelRadius": 0.018, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "body-shell", "attachment": {"parentId": "body-shell", "parentSocket": "front-brand-zone", "localStart": [0, -0.3, 0.445], "localEnd": [0, -0.3, 0.466], "contactType": "surface-mount", "overlap": 0.025, "gapTolerance": 0.004, "evidenceRefs": ["full-object"]}, "dimensions": {"width": 0.34, "height": 0.1, "depth": 0.012, "units": "relative", "confidence": 0.82}, "transform": {"position": [0, -0.3, 0.465], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "static", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [0.34, 0.1, 0.012], "isTrigger": false, "notes": "Simple browser interaction proxy."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": ""}}, "material": "brand", "materialLayers": ["brand"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(245, 248, 244, 1.0)", "secondaryAlbedo": "rgba(216, 228, 221, 1.0)", "materialClass": "plastic", "materialClassConfidence": 0.7, "evidence": ["full-object"]}, "deformations": [], "joints": [], "seams": [], "localFeatures": ["modu-brand-mark"], "surfaceDetail": {"macroRoughness": 0.42, "microRoughness": 0.04, "bumpAmplitude": 0.0, "normalPattern": "none", "displacementPattern": "none", "occlusionPattern": "soft contact darkening at seams", "edgeWearPattern": "none", "notes": "Smooth product finish; identity comes from form, color and broad highlight response."}, "evidenceRefs": ["full-object"], "details": ["modu-brand-mark"], "fidelityTier": "structural"};
  node_brand_mark_8.add(mesh_brand_mark_8);
  meshes["brand-mark"] = mesh_brand_mark_8;
  colliders["brand-mark"] = {"type": "box", "offset": [0, 0, 0], "scale": [0.34, 0.1, 0.012], "isTrigger": false, "notes": "Simple browser interaction proxy."};

  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups } satisfies ProceduralModelRuntime;
  root.userData.lookDevTargets = {"qualityPriority": "runtime-balanced", "materialPass": {"strategy": "solid-color configurable product materials with physically plausible roughness", "runtimeColorControl": "body-coat baseColor is exposed to UI swatches"}, "lightingPass": {"strategy": "soft studio key/fill/rim with grounded contact shadow"}};
  root.userData.actionReadiness = {
    note: 'Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets.',
  };
  return root;
}

export function createMODUBottleLookDevLights(
  mode: 'neutral' | 'grazing' | 'reference' = 'neutral',
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "MODU Bottle look-dev lights";
  const hemi = new THREE.HemisphereLight(
    mode === 'reference' ? 0xfff0d6 : 0xf2f4ff,
    0x363b42,
    mode === 'grazing' ? 0.28 : mode === 'reference' ? 0.72 : 0.85,
  );
  lights.add(hemi);
  const key = new THREE.DirectionalLight(
    mode === 'reference' ? 0xffcf8a : 0xfff4e8,
    mode === 'grazing' ? 4.2 : mode === 'reference' ? 2.6 : 2.15,
  );
  if (mode === 'grazing') key.position.set(7.5, 1.1, 4.0);
  else if (mode === 'reference') key.position.set(-4.5, 7.5, 5.0);
  else key.position.set(-4.0, 6.0, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 7;
  key.shadow.blurSamples = 24;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -2.6;
  key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -2.6;
  key.shadow.camera.updateProjectionMatrix();
  lights.add(key);
  const fill = new THREE.DirectionalLight(0xa8c4ff, mode === 'grazing' ? 0.12 : 0.42);
  fill.position.set(4.0, 3.0, 3.5);
  lights.add(fill);
  const rim = new THREE.DirectionalLight(0xfff1c4, mode === 'grazing' ? 0.28 : 0.85);
  rim.position.set(0.5, 4.5, -6.0);
  lights.add(rim);
  lights.userData.reviewMode = mode;
  lights.userData.lightingFromPhoto = ["Large soft key light from upper-left/front; broad matte highlight preserves the mint body value range.", "Low-intensity cool-neutral fill from camera-right keeps the handle interior readable without flattening the form.", "Soft rear rim/environment reflection separates the lid and handle; use ACES/filmic tone mapping with exposure near 1.0.", "Ground plane receives a soft contact shadow directly beneath the bottle, with stronger AO at the base and handle roots."];
  lights.userData.lookDevTargets = {"qualityPriority": "runtime-balanced", "materialPass": {"strategy": "solid-color configurable product materials with physically plausible roughness", "runtimeColorControl": "body-coat baseColor is exposed to UI swatches"}, "lightingPass": {"strategy": "soft studio key/fill/rim with grounded contact shadow"}};
  return lights;
}

// PBR materials (clearcoat/iridescence/transmission/anisotropy) need an environment
// map to visually behave as intended — call this once per renderer and assign the
// result to scene.environment before rendering. No external HDR asset required.
export function createMODUBottleEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}

// Plan 1.3 §3.2 — auto-framing by bounding box. The Divine Eye can only compare a
// render to the reference if the object is FRAMED consistently (an object framed
// differently scores as wrong even when its shape is right). This positions the camera
// deterministically from the object's bounding box so it fills the frame at a stable
// margin, and sets near/far to the object scale. Call after adding the model to the
// scene, and again on resize (after updating camera.aspect).
export function frameMODUBottleCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.15;
  const maxDim = Math.max(size.x, size.y, size.z) * margin;
  const fov = (camera.fov * Math.PI) / 180;
  // distance so the largest object dimension fits vertically in the frame
  const distance = (maxDim / 2) / Math.tan(fov / 2);
  const az = ((options.azimuthDeg ?? 0) * Math.PI) / 180;
  const el = ((options.elevationDeg ?? 0) * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.near = Math.max(0.01, distance - maxDim);
  camera.far = distance + maxDim * 2;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

// Plan 1.3 §3.2c — PRESENTATION composer (DOF + bloom). CRITICAL (R-POSTFX): this is
// for the showcase/hero render ONLY. The Divine Eye's EVALUATION render MUST use a
// plain renderer with NO composer — bloom blows highlights and DOF blurs edges, which
// would corrupt the deterministic IoU/DCD/edge/blowout signals. Enable dof/bloom ONLY
// when the reference photo actually exhibits them (detect_reference_effects.py authorizes).
export function createMODUBottlePresentationComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: { dof?: boolean; bloom?: boolean; bloomStrength?: number; dofFocus?: number; dofAperture?: number } = {},
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (options.dof) {
    composer.addPass(new BokehPass(scene, camera, {
      focus: options.dofFocus ?? 10.0,
      aperture: options.dofAperture ?? 0.0002,
      maxblur: 0.01,
    }));
  }
  if (options.bloom) {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer.addPass(new UnrealBloomPass(size, options.bloomStrength ?? 0.4, 0.4, 0.85));
  }
  return composer;
}

export function configureMODUBottleRenderer(renderer: THREE.WebGLRenderer): void {
  // Load-bearing for view-dependent finishes (anodized / Doppler): without ACES + sRGB
  // the environment reflection reads flat/washed instead of a believable metal response.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

export function createMODUBottleInspectControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
): OrbitControls {
  // View-dependent finishes only read correctly once the user orbits — their color
  // comes from the environment reflection, not albedo, so free rotation matters here.
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.minDistance = 1.0;
  controls.maxDistance = 8.0;
  controls.autoRotate = false;
  return controls;
}
