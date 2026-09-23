/**
 * runtime/instancing/lodView —— THREE 相机 → LodView 口径翻译（T006.3，D27.5/D27.6）。
 *
 * 职责：把渲染相机的 THREE 形态翻译成 domain 评估器消费的纯数据 LodView——
 *  - 透视：kind='perspective' + 世界位 + fovY（**弧度**——three 的 PerspectiveCamera.fov
 *    为度，编辑器内部弧度惯例见 core/types；评估器头注口径 (d/r)·tan(fovY/2)）；
 *  - 正交：kind='orthographic' + orthoHeight = top − bottom（正交退化口径，lod-spec §4.2
 *    ——无距离概念，不消费相机位姿）。
 * 散布链（ScatterChunkManager.frame）与放置链（InstancedAssetPool.frameLod）共用本翻译，
 * 两链共享同一选档语义（D27.5）；评估器零 THREE（check:layers），本文件是唯一的
 * THREE→domain 口径边界。屏占比解释口径（T021.2，D41 §4.1）：screenFraction（资产
 * 直径 / 视口高度）= 1 / m（m 为本翻译产出视图算得的统一度量，见 lodEvaluation 头注）
 * ——调试与验收读数统一按 1/m 折算，不作选档输入。
 * 边界：调用方须先 camera.updateMatrixWorld()（世界位经 getWorldPosition 取，相机被
 * 挂父节点也正确）；既非透视也非正交的裸 Camera 抛 Error（防御——项目内不存在该形态，
 * 早暴露优于静默错算）。
 */
import type { LodView } from '../../domain/lod/lodEvaluation';
import * as THREE from 'three';

/** 世界位暂存（单线程渲染运行时；值即时拷入返回的纯数据对象，无逃逸） */
const _worldPosition = new THREE.Vector3();

/** 度 → 弧度（three fov 惯例 → 评估器弧度惯例） */
const DEG_TO_RAD = Math.PI / 180;

export function lodViewOfCamera(camera: THREE.Camera): LodView {
  const perspective = camera as THREE.PerspectiveCamera;
  if (perspective.isPerspectiveCamera) {
    camera.getWorldPosition(_worldPosition);
    return {
      kind: 'perspective',
      cameraPosition: { x: _worldPosition.x, y: _worldPosition.y, z: _worldPosition.z },
      fovY: perspective.fov * DEG_TO_RAD,
    };
  }
  const orthographic = camera as THREE.OrthographicCamera;
  if (orthographic.isOrthographicCamera) {
    return { kind: 'orthographic', orthoHeight: orthographic.top - orthographic.bottom };
  }
  throw new Error('LOD 视图翻译需要透视或正交相机，收到未知 Camera 形态');
}
