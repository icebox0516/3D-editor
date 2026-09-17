/**
 * ui/components/BatchRenameDialog —— 批量重命名弹层（T8.3 §2）。
 *
 * 职责：多选（或单图层筛选集）右键「批量重命名…」的规则配置与实时预览——
 *   - 两模式单选互斥（前缀+序号 / 查找替换），共享同一实时预览路径：
 *     预览固定前 8 条「原名 → 新名」+「…共 N 项」（Blender/UE 无实时预览的补齐项）；
 *   - 空查找串（replace 模式）/ 非法步长（prefix 模式）禁用确认按钮；
 *   - 确认 = 逐对象 UpdateObjectCommand(name) 经 BatchCommand 一条历史
 *     （模型归 panels/batchRenameModel 纯函数，组件只接线）。
 * 交互（沿 SceneDialogs 先例）：.ed-dialog/.ed-dialog__scrim 原语；Esc 关闭 +
 * scrim 点击关闭（不外溢全局退出手势）；选中清空自动关闭。
 * 边界：ui 层组件只调 EditorFacade 与 store（UI 边界 #11）；数据按 sceneVersion
 *      重读门面；GUI 行为留阶段验收（模型逻辑 node 全覆盖）。
 */
import { useEffect, useState } from 'react';
import type { SceneObject } from '../../scene/SceneObject';
import { useEditorStore } from '../store';
import {
  batchRenameCommand,
  batchRenamePreview,
  defaultBatchRenameRule,
  isBatchRenameSubmittable,
} from '../panels/batchRenameModel';
import type { BatchRenameRule } from '../panels/batchRenameModel';

export function BatchRenameDialog({ onClose }: { onClose(): void }) {
  const facade = useEditorStore((s) => s.facade);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  const [rule, setRule] = useState<BatchRenameRule>(defaultBatchRenameRule());

  void sceneVersion; // 订阅版本号：场景变更时重读对象名
  const objects: SceneObject[] = facade
    ? selectedIds
        .map((id) => facade.scene.getObject(id))
        .filter((o): o is SceneObject => o !== undefined)
    : [];

  // 选中集清空（确认后 / 外部变化）→ 自动关闭
  useEffect(() => {
    if (objects.length === 0) onClose();
  }, [objects.length, onClose]);

  const preview = batchRenamePreview(objects.map((o) => o.name), rule);
  const submittable = isBatchRenameSubmittable(rule);
  const changedCount = preview.rows.filter((r) => r.from !== r.to).length;

  /** 更新规则的部分字段（非激活模式字段保留但不参与求值） */
  const patchRule = (patch: Partial<BatchRenameRule>) => setRule((r) => ({ ...r, ...patch }));

  const submit = (): void => {
    if (!facade || !submittable) return;
    const cmd = batchRenameCommand(objects, rule);
    if (cmd) facade.history.execute(cmd);
    onClose();
  };

  const numField = (
    label: string,
    key: 'start' | 'step',
    opts: { min?: number; step?: number },
  ) => (
    <div className="ed-field" key={key}>
      <label className="ed-field__label" htmlFor={`batch-rename-${key}`}>
        {label}
      </label>
      <div className="ed-field__value">
        <input
          id={`batch-rename-${key}`}
          className="ed-input ed-input--num"
          type="number"
          value={rule[key]}
          min={opts.min}
          step={opts.step ?? 1}
          aria-label={`${label}（批量重命名）`}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (Number.isFinite(value)) patchRule({ [key]: value });
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="ed-dialog__scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="ed-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ed-batch-rename-title"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation(); // 不外溢到全局退出手势（菜单/弹层同约定）
            onClose();
          }
        }}
      >
        <div className="ed-dialog__head">
          <span className="ed-dialog__title" id="ed-batch-rename-title">
            批量重命名 · {objects.length} 个对象
          </span>
          <button type="button" className="ed-btn ed-btn--ghost" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="ed-dialog__body">
          <div className="ed-batch-rename__modes" role="tablist" aria-label="重命名模式">
            <button
              type="button"
              role="tab"
              aria-selected={rule.mode === 'prefix'}
              className={`ed-chip ed-batch-rename__mode${rule.mode === 'prefix' ? ' ed-chip--active' : ''}`}
              onClick={() => patchRule({ mode: 'prefix' })}
            >
              前缀 + 序号
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rule.mode === 'replace'}
              className={`ed-chip ed-batch-rename__mode${rule.mode === 'replace' ? ' ed-chip--active' : ''}`}
              onClick={() => patchRule({ mode: 'replace' })}
            >
              查找替换
            </button>
          </div>

          {rule.mode === 'prefix' ? (
            <div className="ed-batch-rename__form">
              <div className="ed-field">
                <label className="ed-field__label" htmlFor="batch-rename-prefix">
                  前缀
                </label>
                <div className="ed-field__value">
                  <input
                    id="batch-rename-prefix"
                    className="ed-input"
                    type="text"
                    value={rule.prefix}
                    placeholder="如：宿舍（可空 = 纯序号）"
                    aria-label="名称前缀（批量重命名）"
                    onChange={(e) => patchRule({ prefix: e.target.value })}
                  />
                </div>
              </div>
              {numField('起始序号', 'start', { min: 0 })}
              {numField('步长', 'step', { min: 1 })}
              <div className="ed-field">
                <label className="ed-field__label" htmlFor="batch-rename-digits">
                  序号位数
                </label>
                <div className="ed-field__value">
                  <div className="ed-select-wrap">
                    <select
                      id="batch-rename-digits"
                      className="ed-input ed-select"
                      value={rule.digits}
                      aria-label="序号位数填充（批量重命名）"
                      onChange={(e) => patchRule({ digits: Number(e.target.value) as 1 | 2 | 3 })}
                    >
                      <option value={1}>1 位（1, 2, 3…）</option>
                      <option value={2}>2 位（01, 02…）</option>
                      <option value={3}>3 位（001, 002…）</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="ed-batch-rename__form">
              <div className="ed-field">
                <label className="ed-field__label" htmlFor="batch-rename-find">
                  查找
                </label>
                <div className="ed-field__value">
                  <input
                    id="batch-rename-find"
                    className="ed-input"
                    type="text"
                    value={rule.find}
                    placeholder="如：楼（空则不可确认）"
                    aria-label="查找内容（批量重命名）"
                    autoFocus
                    onChange={(e) => patchRule({ find: e.target.value })}
                  />
                </div>
              </div>
              <div className="ed-field">
                <label className="ed-field__label" htmlFor="batch-rename-replace">
                  替换为
                </label>
                <div className="ed-field__value">
                  <input
                    id="batch-rename-replace"
                    className="ed-input"
                    type="text"
                    value={rule.replaceWith}
                    placeholder="如：宿舍楼（可空 = 删除）"
                    aria-label="替换为（批量重命名）"
                    onChange={(e) => patchRule({ replaceWith: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="ed-batch-rename__preview" aria-label="重命名预览">
            <div className="ed-batch-rename__preview-title">
              预览
              <span className="ed-readout">
                {changedCount > 0 ? `前 ${preview.rows.length} 条` : '无变化'}
              </span>
            </div>
            {preview.rows.map((row, index) => (
              <div className="ed-batch-rename__row" key={`${index}-${row.from}`}>
                <span className="ed-batch-rename__from" title={row.from}>
                  {row.from}
                </span>
                <span className="ed-batch-rename__arrow" aria-hidden="true">
                  →
                </span>
                <span className="ed-batch-rename__to" title={row.to}>
                  {row.to}
                </span>
              </div>
            ))}
            {preview.more ? (
              <div className="ed-batch-rename__more ed-readout">…共 {preview.total} 项</div>
            ) : null}
          </div>

          <div className="ed-scenedlg__actions">
            <button type="button" className="ed-btn ed-btn--ghost" onClick={onClose}>
              取消
            </button>
            <button
              type="button"
              className="ed-btn ed-btn--primary"
              disabled={!submittable}
              title={submittable ? undefined : rule.mode === 'replace' ? '请输入查找内容' : '步长须为正数'}
              onClick={submit}
            >
              重命名（一条历史 · 可撤销）
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
