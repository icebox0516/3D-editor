/**
 * runtime/styles/poi/billboard.preset —— 图标牌（poi 预设，T6.3 新增，无旧对照）。
 *
 * 设计：THREE.Sprite + 程序化图标贴图（中心圆点 + 外环 + glow 光晕，无外部资产）；
 *      根对象为 Sprite（具 material 槽位，参与引擎材质模板共享）；color 经
 *      SpriteMaterial.color 着色（贴图按白色绘制），size → sprite.scale，glow → 光晕
 *      强度重绘贴图。传入 point 几何存引用但不使用不释放（授权规则 2）。
 *
 * 贴图缓存（共享资源纪律）：图标像素仅取决于量化 glow（步进 0.1，键空间 ≤51），故做
 *      模块级内容寻址缓存——多实例/引擎共享模板材质引用同一贴图对象，实例 dispose 不
 *      释放贴图（缓存有界、跨实例复用，语义对齐引擎 materialPool 模板池）。
 *      测试环境（node 无 DOM）走 DataTexture 兜底，像素生成函数两路共用。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

const ICON_SIZE = 128;

export const meta: StylePresetMeta = {
  id: 'poi.billboard',
  name: '图标牌',
  category: 'poi',
  thumbnail: svgThumbnail('#4ec9ff', `<circle cx='16' cy='16' r='7' fill='none' stroke='#fff' stroke-width='3'/>`),
  supportedShapes: ['point'],
  supportedSemantics: ['poi'],
  defaultParams: [
    { key: 'color', label: '标牌色', type: 'color', default: '#4ec9ff' },
    { key: 'size', label: '尺寸', type: 'number', default: 1.5, min: 0.5, max: 4, step: 0.1 },
    { key: 'glow', label: '光晕', type: 'number', default: 0.5, min: 0, max: 5, step: 0.1 },
  ],
};

/** 程序化绘制图标像素（RGBA，白色基底供 material.color 着色）：圆点 + 外环 + glow 光晕 */
function paintIconPixels(size: number, glow: number): Uint8ClampedArray<ArrayBuffer> {
  const data = new Uint8ClampedArray(size * size * 4);
  const center = size / 2;
  const glowT = Math.min(Math.max(glow / 5, 0), 1);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = Math.hypot(x + 0.5 - center, y + 0.5 - center);
      let alpha: number;
      if (r <= size * 0.17) alpha = 255; // 中心圆点
      else if (r >= size * 0.31 && r <= size * 0.39) alpha = 235; // 外环
      else alpha = Math.round(150 * glowT * (Math.max(0, 1 - r / (size * 0.5))) ** 2); // 光晕
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = alpha;
    }
  }
  return data;
}

/** 内容寻址贴图缓存：量化 glow → 贴图（键空间 ≤51，有界；跨实例共享不随实例释放） */
const iconTextureCache = new Map<string, THREE.Texture>();

function iconTexture(glow: number): THREE.Texture {
  const key = glow.toFixed(1);
  const cached = iconTextureCache.get(key);
  if (cached) return cached;
  const pixels = paintIconPixels(ICON_SIZE, glow);
  let texture: THREE.Texture;
  if (typeof document !== 'undefined') {
    // 浏览器运行时：CanvasTexture 承载（约定路径）
    const canvas = document.createElement('canvas');
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(new ImageData(pixels, ICON_SIZE, ICON_SIZE), 0, 0);
      texture = new THREE.CanvasTexture(canvas);
    } else {
      texture = new THREE.DataTexture(pixels, ICON_SIZE, ICON_SIZE, THREE.RGBAFormat);
      texture.needsUpdate = true;
    }
  } else {
    // node 测试兜底：无 DOM，DataTexture 直接承载同一像素
    texture = new THREE.DataTexture(pixels, ICON_SIZE, ICON_SIZE, THREE.RGBAFormat);
    texture.needsUpdate = true;
  }
  texture.colorSpace = THREE.SRGBColorSpace;
  iconTextureCache.set(key, texture);
  return texture;
}

export function build(_geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  // _geometry（point 几何）归调用方：Sprite 视觉不消费传入几何，存档忽略（授权规则 2，不释放）
  const size = readNumber(params.size, 1.5, 0.5, 4);
  const material = new THREE.SpriteMaterial({
    map: iconTexture(readNumber(params.glow, 0.5, 0, 5)),
    color: new THREE.Color(readColor(params.color, '#4ec9ff')),
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size, 1);

  const instance: StyleInstance = {
    object: sprite,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      // 授权规则 1：读当前材质（引擎模板共享/写时复制可能已换绑）
      const mat = instance.material as THREE.SpriteMaterial;
      if (typeof p.color === 'string' && p.color !== '') mat.color.set(p.color);
      if (p.size !== undefined) {
        const s = readNumber(p.size, sprite.scale.x, 0.5, 4);
        sprite.scale.set(s, s, 1);
      }
      if (p.glow !== undefined) {
        const next = iconTexture(readNumber(p.glow, 0.5, 0, 5));
        if (mat.map !== next) {
          mat.map = next; // 换绑缓存贴图（内容寻址，共享安全；旧贴图仍被缓存持有）
          mat.needsUpdate = true;
        }
      }
    },
    setGeometry() {
      // point 几何归调用方：Sprite 视觉不消费几何，存档忽略（授权规则 2，不释放）
    },
    dispose() {
      // 贴图为模块级共享缓存（有界），不随实例释放；材质归引擎、传入几何归调用方
      sprite.removeFromParent();
    },
  };
  return instance;
}
