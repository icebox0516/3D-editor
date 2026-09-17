/**
 * io/SceneExporter —— 基础场景导出器。
 *
 * 职责：把 SceneData 导出为标准场景 JSON 文本——与 SceneSerializer.serialize 输出
 *      完全一致（同一序列化实现，保证「保存文件」与「导出文件」同构，可互换加载）。
 * 边界：纯转换零业务逻辑；零渲染；不落盘（写文件由调用方/宿主环境负责）。
 */
import type { SceneData } from '../scene/SceneData';
import { SceneSerializer } from './SceneSerializer';

export class SceneExporter {
  private readonly serializer = new SceneSerializer();

  /** 导出标准场景 JSON（version "2.0"，只存数据定义与引用） */
  export(data: SceneData): string {
    return this.serializer.serialize(data);
  }
}
