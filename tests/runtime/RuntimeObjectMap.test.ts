import { describe, expect, it } from 'vitest';
import { createId } from '../../src/core/id';
import { RuntimeObjectMap } from '../../src/runtime/RuntimeObjectMap';
import * as THREE from 'three';

describe('RuntimeObjectMap', () => {
  it('set 后可按 id 取回同一 Object3D 引用', () => {
    const map = new RuntimeObjectMap();
    const id = createId('element');
    const obj = new THREE.Object3D();
    map.set(id, obj);
    expect(map.get(id)).toBe(obj);
    expect(map.has(id)).toBe(true);
  });

  it('set 自动写入 userData.objectId（正向映射同时具备反向依据）', () => {
    const map = new RuntimeObjectMap();
    const id = createId('element');
    const obj = new THREE.Object3D();
    map.set(id, obj);
    expect(obj.userData.objectId).toBe(id);
  });

  it('getId 支持从 Object3D 反查业务 id', () => {
    const map = new RuntimeObjectMap();
    const id = createId('element');
    const obj = new THREE.Object3D();
    map.set(id, obj);
    expect(map.getId(obj)).toBe(id);
  });

  it('findId 沿父链向上查找（拾取时命中子 Mesh 也能定位根对象的 id）', () => {
    const map = new RuntimeObjectMap();
    const id = createId('element');
    const root = new THREE.Object3D();
    const child = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
    root.add(child);
    map.set(id, root);
    expect(map.findId(child)).toBe(id);
    expect(map.findId(root)).toBe(id);
  });

  it('getId / findId 对未注册对象返回 null', () => {
    const map = new RuntimeObjectMap();
    expect(map.getId(new THREE.Object3D())).toBeNull();
    expect(map.findId(new THREE.Object3D())).toBeNull();
  });

  it('重复 set 同一 id 覆盖旧对象并更新映射', () => {
    const map = new RuntimeObjectMap();
    const id = createId('element');
    const first = new THREE.Object3D();
    const second = new THREE.Object3D();
    map.set(id, first);
    map.set(id, second);
    expect(map.get(id)).toBe(second);
    expect(map.getId(second)).toBe(id);
    expect(map.getId(first)).toBeNull();
  });

  it('delete 移除并返回对象，之后查询为空', () => {
    const map = new RuntimeObjectMap();
    const id = createId('element');
    const obj = new THREE.Object3D();
    map.set(id, obj);
    expect(map.delete(id)).toBe(obj);
    expect(map.get(id)).toBeUndefined();
    expect(map.has(id)).toBe(false);
    expect(map.delete(id)).toBeUndefined(); // 幂等：再删返回 undefined
  });

  it('clear 清空全部映射', () => {
    const map = new RuntimeObjectMap();
    const a = createId('element');
    const b = createId('element');
    map.set(a, new THREE.Object3D());
    map.set(b, new THREE.Object3D());
    map.clear();
    expect(map.size()).toBe(0);
    expect(map.ids()).toEqual([]);
  });

  it('ids 返回全部业务 id，size 返回数量', () => {
    const map = new RuntimeObjectMap();
    const a = createId('element');
    const b = createId('element');
    map.set(a, new THREE.Object3D());
    map.set(b, new THREE.Object3D());
    expect(map.ids().sort()).toEqual([a, b].sort());
    expect(map.size()).toBe(2);
  });
});
