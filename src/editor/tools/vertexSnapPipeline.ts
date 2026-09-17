/**
 * editor/tools/vertexSnapPipeline —— 顶点编辑吸附管线工厂（T6.8 奠基；T8.1 R1/R4 扩展）。
 *
 * 职责：组装 runtime VertexEditImpl 消费的吸附管线（结构化 apply 闭包）——
 *      组合根 bootstrap 经本工厂注入，复用 editor/tools/draw/snap 纯函数
 *      （与绘制管线 DrawToolBase.applyAids 完全同语义，单一真相源）：
 *      1. Shift 正交锁定（主轴取偏移大者）——优先于 A 键角度锁定（互斥）；
 *      2. A 键 45° 角度锁定（会话开关 session.angleLock，DrawToolBase 同款常量语义；
 *         绘制辅助锁定三键不受吸附总开关管辖）；
 *      3. G 网格吸附：会话开关 ∧ drawGrid.snapEnabled（全局）∧ 总开关三取「与」；
 *         按住 Ctrl 临时反转总状态（masterEnabled XOR ctrlKey，拖拽会话内）。
 * 边界：editor 层零 THREE；工厂产出为纯数据闭包对象（runtime 以结构化类型消费，
 *      VertexSnapPipeline 接口定义在 runtime——DAG 禁止反向导入，签名由组合根装配保证）。
 */
import type { Vec2 } from '../../core/types';
import type { SnapTiersConfig } from '../services/snapTiersConfig';
import type { DrawGridConfig } from './draw/DrawGridConfig';
import { angleLock, gridSnap, orthoLock } from './draw/snap';
import type { VertexSnapSession } from './VertexEditTool';

/** A 键角度锁定步长（度；与 DrawToolBase.ANGLE_STEP_DEG 同值——绘制/顶点编辑同一语义） */
const VERTEX_ANGLE_STEP_DEG = 45;

/** 管线输入输出形态（与 runtime VertexSnapPipeline.apply 结构一致） */
export interface VertexSnapPipelineLike {
  apply(
    raw: Vec2,
    anchor: Vec2,
    modifiers: { shiftKey: boolean; ctrlKey: boolean },
  ): Vec2;
}

/**
 * 构造顶点编辑吸附管线（bootstrap 注入 runtime VertexEditImpl deps.snap）。
 * 共享可变对象（session/drawGrid/tiers）直读——设置面板/会话键切换即时生效。
 */
export function createVertexSnapPipeline(
  session: VertexSnapSession,
  drawGrid: DrawGridConfig,
  tiers: SnapTiersConfig,
): VertexSnapPipelineLike {
  return {
    apply(raw, anchor, modifiers) {
      let p = raw;
      if (modifiers.shiftKey) {
        // Shift 正交锁定：主轴取偏移大者（与 DrawToolBase.applyAids 同款）
        const axis: 'x' | 'z' =
          Math.abs(p.x - anchor.x) >= Math.abs(p.y - anchor.y) ? 'x' : 'z';
        p = orthoLock(anchor, p, axis);
      } else if (session.angleLock) {
        // A 键 45° 锁定（互斥，Shift 优先）——绘制辅助锁定，不受总开关/Ctrl 影响
        p = angleLock(anchor, p, VERTEX_ANGLE_STEP_DEG);
      }
      // G 网格吸附：会话开关 ∧ 全局开关 ∧ 总开关（Ctrl 临时反转）
      const masterEffective = tiers.masterEnabled !== modifiers.ctrlKey;
      if (session.enabled && drawGrid.snapEnabled && masterEffective) {
        p = gridSnap(p, drawGrid.spacing);
      }
      return p;
    },
  };
}
