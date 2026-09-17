/**
 * runtime/styles/materialPool —— 材质模板池（引用计数，T6.2 材质纪律的引擎侧基础设施）。
 *
 * 职责：按 presetId 缓存「默认参数形态」的共享材质模板并维护引用计数；
 *      最后一个使用实例释放时才 dispose 模板本体（需求《绘制需求变更.md》5.4 #3）。
 * 缓存键设计（任务书「按 presetId + 可选 params 签名，自行设计并测试锁定」裁定）：
 *      仅 presetId、无 params 签名维度——模板恒为默认参数形态，带 overrides 的实例
 *      从不进入模板池（创建即独享 / updateStyle 写时复制提升为独享），故不存在
 *      「同预设不同参数形态」的模板分叉需求；键空间极小且可预测。
 * 边界：仅被 engine.ts 消费（不进 runtime/styles barrel）；
 *      非线程问题（单线程渲染框架）；模板池不做 LRU——预设总量有限（首版 21 套）。
 */
import type * as THREE from 'three';

/** 一条模板记录：材质本体 + 当前共享实例数 */
interface TemplateRecord {
  material: THREE.Material;
  refCount: number;
}

const templates = new Map<string, TemplateRecord>();

/** 取模板记录；无模板或已释放返回 undefined */
export function getTemplate(presetId: string): TemplateRecord | undefined {
  return templates.get(presetId);
}

/** 以给定材质登记模板（首个共享实例的材质即模板本体），引用计数置 1 */
export function setTemplate(presetId: string, material: THREE.Material): void {
  templates.set(presetId, { material, refCount: 1 });
}

/** 引用计数 +1（已有实例复用模板时） */
export function retainTemplate(presetId: string): void {
  const record = templates.get(presetId);
  if (record) record.refCount += 1;
}

/**
 * 引用计数 -1；归零时 dispose 模板本体并移除记录（最后一个实例释放才释放模板）。
 * 返回是否触发了模板释放（测试观察用）。
 */
export function releaseTemplate(presetId: string): boolean {
  const record = templates.get(presetId);
  if (!record) return false;
  record.refCount -= 1;
  if (record.refCount <= 0) {
    templates.delete(presetId);
    record.material.dispose();
    return true;
  }
  return false;
}
