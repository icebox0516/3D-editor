/**
 * tests/support/procedural-tree/geometryHarness.ts —— Lod 几何不变量测试共享脚手架
 * （T020 阶段二 Step A：13 树资产 xxxLod.test.ts 工具合一——原各文件本地定义逐字节
 * 同源（仅结果类型名不同）；断言语义零变化，纯脚手架迁移）。
 *
 * 约束：零 mock 真实几何生成；构建产物登记走工厂化 tracker（严禁模块级共享数组——
 * 每个测试文件实例化自己的 tracker；buildSlot 留在各文件本地——含资产特定 import，
 * 属粘合代码）。
 */
import * as THREE from 'three';

/** 构建产物登记 tracker（afterEach 统一 dispose 兜底——每测试文件一个实例） */
export interface GeometryTracker<T extends { geometry: THREE.BufferGeometry }> {
  track: (result: T) => T;
  disposeAll: () => void;
}

/** 构建产物登记（工厂化：测试文件内 const { track, disposeAll } = createGeometryTracker<XxxGeometryResult>()） */
export function createGeometryTracker<T extends { geometry: THREE.BufferGeometry }>(): GeometryTracker<T> {
  const built: T[] = [];
  return {
    track(result: T): T {
      built.push(result);
      return result;
    },
    disposeAll() {
      for (const { geometry } of built.splice(0)) geometry.dispose();
    },
  };
}

/** bbox 跨度账目（XZ 最大水平跨 / 总高 / minY） */
export function spanOf<T extends { geometry: THREE.BufferGeometry }>(
  result: T,
): { xz: number; y: number; minY: number } {
  result.geometry.computeBoundingBox();
  const b = result.geometry.boundingBox!;
  return {
    xz: Math.max(b.max.x - b.min.x, b.max.z - b.min.z),
    y: b.max.y - b.min.y,
    minY: b.min.y,
  };
}

/** 叶组逐卡 XZ 位置块键（6 顶点 × x,z 共 12 分量 join）+ 首顶点 Y——Mid ⊂ High 匹配口径：
 *  几何尾部 minY 贴地平移只改 Y 分量，Mid 皮面采样不同 → 全局 Y 偏移档间不同，raw Y
 *  不可逐位比；X/Z 不受平移影响逐位可比，公共卡 Y 差 = 单一常量偏移（贴地平移差）。
 *  组语义 = 组 1 纯叶卡逐 6 顶点直扫（组内含非卡块的资产保留本地实现——如 platanus 果序块守卫） */
export function leafCardXZ<T extends { geometry: THREE.BufferGeometry }>(
  result: T,
): { keys: string[]; y0: number[] } {
  const leaf = result.geometry.groups[1]!;
  const pos = result.geometry.getAttribute('position');
  const keys: string[] = [];
  const y0: number[] = [];
  for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
    const nums: number[] = [];
    for (let v = 0; v < 6; v++) {
      nums.push(pos.array[(base + v) * 3]!, pos.array[(base + v) * 3 + 2]!);
    }
    keys.push(nums.join(','));
    y0.push(pos.array[base * 3 + 1]!);
  }
  return { keys, y0 };
}
