/**
 * runtime/styles/building/buildingExtrude —— 平面轮廓 → 立体挤出（building 预设共用，T6.3）。
 *
 * 职责：building.default / building.modern 两套挤出预设的共用实现——
 *   1) extractOutlineLoop：从调用方传入的 XZ 平面三角网几何提取外边界环
 *      （边界边 = 仅被一个三角形引用的边；量化键合并索引/非索引几何的重复顶点；
 *      带洞轮廓产生多环，取 |面积| 最大者为外轮廓，洞 v1 不挤出）；
 *   2) extrudeOutline：THREE.Shape + ExtrudeGeometry（depth = height，无倒角），
 *      挤出轴向 +Z 旋转为世界 +Y（proper rotation 绕向不翻），底面贴轮廓平面 y=0；
 *   3) createBuildingPreset：按配置产出 { meta, build }（单材质单 Mesh，参与引擎
 *      模板共享；墙面/顶面材质分层 v1 不做）。
 * 边界：调用方轮廓几何归调用方（只读顶点，不释放不修改）；插件自建挤出几何实例独占，
 *      height 变化/setGeometry 时重建并释放旧挤出几何；材质归引擎。
 * 实现：v1 不求性能（逐三角形扫边 + 链环），轮廓顶点量为绘制交互级（数百内）。
 */
import * as THREE from 'three';
import { SURFACE_SHAPES } from '../presetShapes';
import { readColor, readNumber } from '../presetHelpers';
import { svgThumbnail } from '../presetThumbnail';
import type { StylePresetMeta } from '../../../registries';
import type { StyleInstance, StylePresetBuild } from '../types';

/** 轮廓顶点（XZ 平面投影；Y 分量不参与——高度合成由对象 transform 供给，分域契约 §A） */
export interface OutlinePoint {
  x: number;
  z: number;
}

/** 从三角网几何提取外边界环；无可识别边界（<1 三角形或无闭合环）返回 null */
export function extractOutlineLoop(geometry: THREE.BufferGeometry): OutlinePoint[] | null {
  const position = geometry.getAttribute('position');
  if (!position) return null;
  const index = geometry.getIndex();
  const triangleCount = Math.floor((index ? index.count : position.count) / 3);
  if (triangleCount < 1) return null;

  // 顶点量化合并（0.01mm 精度键）：索引与非索引几何统一为去重点表
  const points: OutlinePoint[] = [];
  const keyToVertex = new Map<string, number>();
  const resolveVertex = (attributeIndex: number): number => {
    const x = position.getX(attributeIndex);
    const z = position.getZ(attributeIndex);
    const key = `${Math.round(x * 1e5)}|${Math.round(z * 1e5)}`;
    let mapped = keyToVertex.get(key);
    if (mapped === undefined) {
      mapped = points.length;
      points.push({ x, z });
      keyToVertex.set(key, mapped);
    }
    return mapped;
  };

  // 边计数（端点规范化序）：count === 1 → 边界边
  const edgeRecords = new Map<string, [u: number, v: number, count: number]>();
  const countEdge = (u: number, v: number): void => {
    const key = u < v ? `${u}|${v}` : `${v}|${u}`;
    const record = edgeRecords.get(key);
    if (record) record[2] += 1;
    else edgeRecords.set(key, [u, v, 1]);
  };
  for (let t = 0; t < triangleCount; t++) {
    const a = resolveVertex(index ? index.getX(t * 3) : t * 3);
    const b = resolveVertex(index ? index.getX(t * 3 + 1) : t * 3 + 1);
    const c = resolveVertex(index ? index.getX(t * 3 + 2) : t * 3 + 2);
    if (a === b || b === c || c === a) continue; // 退化三角形跳过
    countEdge(a, b);
    countEdge(b, c);
    countEdge(c, a);
  }

  const boundary: Array<[u: number, v: number]> = [...edgeRecords.values()]
    .filter((record) => record[2] === 1)
    .map((record) => [record[0], record[1]]);
  if (boundary.length < 3) return null;

  // 邻接表链接成环（简单多边形边界顶点度数 ≤ 2）；多环取 |面积| 最大者为外轮廓
  const adjacency = new Map<number, number[]>();
  const link = (u: number, v: number): void => {
    const list = adjacency.get(u);
    if (list) list.push(v);
    else adjacency.set(u, [v]);
  };
  for (const [u, v] of boundary) {
    link(u, v);
    link(v, u);
  }

  const consumed = new Set<number>();
  let bestLoop: number[] | null = null;
  let bestArea = 0;
  for (const start of adjacency.keys()) {
    if (consumed.has(start)) continue;
    const loop: number[] = [];
    let previous = -1;
    let current = start;
    while (!consumed.has(current)) {
      consumed.add(current);
      loop.push(current);
      const neighbors = (adjacency.get(current) ?? []).filter(
        (n) => n !== previous && !consumed.has(n),
      );
      if (neighbors.length === 0) break; // 开链（病态输入）：截断
      previous = current;
      current = neighbors[0]!;
    }
    if (loop.length >= 3) {
      const area = Math.abs(shoelaceArea(loop, points));
      if (area > bestArea) {
        bestArea = area;
        bestLoop = loop;
      }
    }
  }
  if (!bestLoop) return null;
  return bestLoop.map((i) => points[i]!);
}

/** 有向面积（shoelace）：环顶点索引 → 投影点列面积一半 */
function shoelaceArea(loop: readonly number[], points: readonly OutlinePoint[]): number {
  let sum = 0;
  for (let i = 0; i < loop.length; i++) {
    const p = points[loop[i]!]!;
    const q = points[loop[(i + 1) % loop.length]!]!;
    sum += p.x * q.z - q.x * p.z;
  }
  return sum / 2;
}

/**
 * 轮廓点列 → 立体挤出几何（底面贴 y=baseOffset、顶面 y=baseOffset+height；法线/UV 由 ExtrudeGeometry 自产）。
 * baseOffset = 调用方轮廓几何的 boundingBox.min.y（T6.4 R6 基座偏移合成）：GeometryBuilder
 * 产出的轮廓已按 shape.baseHeight 抬升，挤出底面须叠加同一偏移，保证分域契约 §A
 * 「最终 y = shape.baseHeight + transform.position.y」对 building 挤出同样成立。
 */
export function extrudeOutline(points: readonly OutlinePoint[], height: number, baseOffset = 0): THREE.BufferGeometry {
  const shapePoints = points.map((p) => new THREE.Vector2(p.x, p.z));
  if (THREE.ShapeUtils.area(shapePoints) < 0) shapePoints.reverse(); // 规范 CCW（外轮廓约定）
  const shape = new THREE.Shape(shapePoints);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
  geometry.rotateX(Math.PI / 2); // 挤出轴 +Z → 世界 +Y（proper rotation，绕向/法线不翻）
  geometry.translate(0, height + baseOffset, 0); // y ∈ [-h, 0] → [baseOffset, baseOffset + h]
  return geometry;
}

/** 挤出产物：几何 + 归属（owns=false 表示轮廓提取失败退用调用方几何，不可释放） */
interface ExtrusionResult {
  geometry: THREE.BufferGeometry;
  owns: boolean;
}

/** building 预设配置（两套差异仅材质基线与展示信息） */
export interface BuildingPresetConfig {
  id: string;
  name: string;
  /** 主体色基线（primaryColor 参数默认值） */
  color: string;
  roughness: number;
  metalness: number;
  /** 缩略图示意图形（SVG 片段，主色为背景） */
  glyph: string;
}

/** 语义保留键 height 读取（引擎经 createStyle/updateStyle 第六参/semantic 键通路并入） */
function readHeight(params: Record<string, unknown>): number {
  const semantic = params.semantic as { height?: unknown } | undefined;
  return readNumber(semantic?.height, 10, 0);
}

/**
 * 产出 building 挤出预设（meta + build）。
 * build：读轮廓顶点自建立体挤出几何（侧面+顶面）；update 材质参数照常走 instance.material，
 * height 变化时重建「插件自建挤出几何」（任务书授权）；setGeometry 重存调用方轮廓并按
 * 当前 height 重挤出；dispose 仅释放插件自建挤出几何。
 */
export function createBuildingPreset(config: BuildingPresetConfig): {
  meta: StylePresetMeta;
  build: StylePresetBuild;
} {
  const meta: StylePresetMeta = {
    id: config.id,
    name: config.name,
    category: 'building',
    thumbnail: svgThumbnail(config.color, config.glyph),
    supportedShapes: [...SURFACE_SHAPES],
    supportedSemantics: ['building'],
    defaultParams: [
      { key: 'primaryColor', label: '主体色', type: 'color', default: config.color },
      { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0, max: 1, step: 0.05 },
      { key: 'glow', label: '发光强度', type: 'number', default: 0, min: 0, max: 5, step: 0.1 },
    ],
  };

  const build: StylePresetBuild = (geometry, params) => {
    const opacity = readNumber(params.opacity, 1, 0, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(readColor(params.primaryColor, config.color)),
      opacity,
      transparent: opacity < 1,
      roughness: config.roughness,
      metalness: config.metalness,
    });
    material.emissiveIntensity = readNumber(params.glow, 0, 0, 5); // 同貌策略：emissive 黑 × glow（视觉无效，参数存档）

    const extrude = (source: THREE.BufferGeometry, height: number): ExtrusionResult => {
      const loop = extractOutlineLoop(source);
      if (!loop) return { geometry: source, owns: false }; // 病态轮廓：退用调用方几何平铺（不释放）
      // 基座偏移读源几何当前包围盒（setGeometry/rebuild 路径重读新几何的偏移，R6）
      source.computeBoundingBox();
      const baseOffset = source.boundingBox ? source.boundingBox.min.y : 0;
      return { geometry: extrudeOutline(loop, height, baseOffset), owns: true };
    };

    let outline = geometry; // 调用方轮廓几何（只读顶点，不释放）
    let currentHeight = readHeight(params);
    let extruded = extrude(outline, currentHeight);
    const mesh = new THREE.Mesh(extruded.geometry, material);
    // 建筑立体表达自决投影（与预设决定自身材质同级，插件自身职责）：
    // 挤出（owns=true）与病态轮廓平铺（owns=false）两路径共用本 Mesh，统一置 castShadow
    mesh.castShadow = true;

    /** 按当前轮廓 + 高度重挤出：旧插件几何释放，调用方轮廓不动 */
    const rebuild = (): void => {
      const next = extrude(outline, currentHeight);
      if (extruded.owns) extruded.geometry.dispose();
      extruded = next;
      mesh.geometry = extruded.geometry;
    };

    const instance: StyleInstance = {
      object: mesh,
      material,
      presetId: meta.id,
      supportedShapes: [...meta.supportedShapes],
      update(p) {
        // 授权规则 1：材质参数读当前材质（引擎模板共享/写时复制可能已换绑）
        const mat = instance.material as THREE.MeshStandardMaterial;
        if (typeof p.primaryColor === 'string' && p.primaryColor !== '') mat.color.set(p.primaryColor);
        const next = readNumber(p.opacity, mat.opacity, 0, 1);
        mat.opacity = next;
        mat.transparent = next < 1;
        if (p.glow !== undefined) mat.emissiveIntensity = readNumber(p.glow, mat.emissiveIntensity, 0, 5);
        // height 经 semantic 通路变化且与当前不同 → 重建插件自建挤出几何（任务书授权路径）
        const semantic = p.semantic as { height?: unknown } | undefined;
        if (semantic && typeof semantic.height === 'number' && Number.isFinite(semantic.height)) {
          const height = readNumber(semantic.height, currentHeight, 0);
          if (height !== currentHeight) {
            currentHeight = height;
            rebuild();
          }
        }
      },
      setGeometry(next) {
        outline = next; // 重存调用方轮廓（旧轮廓归调用方，不释放）
        rebuild(); // 按当前 height 重新挤出
      },
      dispose() {
        // 仅释放插件自建挤出几何（owns=false 时为调用方几何，不可释放）；材质归引擎
        if (extruded.owns) extruded.geometry.dispose();
        mesh.removeFromParent();
      },
    };
    return instance;
  };

  return { meta, build };
}
