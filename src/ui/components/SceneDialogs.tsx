/**
 * ui/components/SceneDialogs —— 场景模板与批量导入弹层（T8.2）。
 *
 * 四个受控弹层（App 持有开关与数据，组件零副作用——回调全经 props 注入，
 * ui 不碰 io/storage，存储 CRUD 由 App 层中转）：
 *   - ConfirmSceneReplaceDialog：「新建场景 ▾」实例化前的 dirty 确认（沿
 *     beforeunload dirty 语义口径）；三行摘要：模板名 / 来源（内置 · 个人）/
 *     对象数 · 图层数（等宽读数）；
 *   - TemplateNamingDialog：「另存为模板…」命名（LayoutMenu 行内命名交互语言：
 *     空名禁用保存、重名提示「将覆盖」、Enter 提交 / Esc 取消）；
 *   - ManageTemplatesDialog：用户模板列表（名称 + 对象/图层计数 meta + 行尾
 *     重命名/删除图标按钮，删除无二次确认沿 LayoutMenu 先例；重命名 = 行内
 *     输入编辑）+ 内置模板只读展示 + 空列表友好占位；
 *   - ImportPreviewDialog：批量导入三态行清单（拟导入 N 对象 / W 告警 / 文件级
 *     失败置灰），控件形态对齐 Ant Design Upload file list 惯例（状态图标 +
 *     文件名 + 状态描述与计数）——全部用现有 tokens 实现，零新依赖；合计
 *     0 对象时确认禁用。
 * 交互（沿 HelpOverlay/菜单先例）：.ed-dialog/.ed-dialog__scrim 原语；Esc 关闭
 *   + scrim 点击关闭 + 初始焦点；Esc stopPropagation 不外溢到全局退出手势。
 * 跨 app↔ui 数据类型（SceneReplaceSummary / ImportPreviewRow / TemplateListItem）
 *   在本文件导出，app 层经 import type 消费（沿 RenderMode 先例）。
 * 边界：ui 层零 runtime / io；图标 lucide-react；零 emoji；过渡 150–300ms；
 *   图标按钮视觉小、::before 扩展 ≥40px 触达。
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, FileWarning, FileX, Pencil, Trash2 } from 'lucide-react';

/** 新建场景确认弹层的三行摘要载荷（app 层组装，import type 消费） */
export interface SceneReplaceSummary {
  /** 模板名 */
  name: string;
  /** 来源：内置（随构建打包）/ 个人（localStorage） */
  source: '内置' | '个人';
  objectCount: number;
  layerCount: number;
}

/** 批量导入预览行（app 层逐文件解析后组装；import type 消费） */
export type ImportPreviewRow =
  | {
      name: string;
      /** 解析成功（含 0 对象 + 告警的行；告警沿 JsonImporter errors 既有口径） */
      status: 'ok';
      objectCount: number;
      warningCount: number;
    }
  | {
      name: string;
      /** 文件级失败（JSON.parse / 映射非法 / 根非对象）——置灰不阻断其余行 */
      status: 'failed';
      message: string;
    };

/** 模板管理弹层清单条目（App 装配层从 TemplatePayload 映射） */
export interface TemplateListItem {
  id: string;
  name: string;
  builtin: boolean;
  objectCount: number;
  layerCount: number;
}

/** 弹层共用外壳：scrim + 对话框 + Esc 关闭（不外溢）+ 标题栏（R7 复用 .ed-dialog 原语） */
function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div className="ed-dialog__scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="ed-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ed-scene-dialog-title"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation(); // 不外溢到全局 ESC 退出手势（菜单/HelpOverlay 同约定）
            onClose();
          }
        }}
      >
        <div className="ed-dialog__head">
          <span className="ed-dialog__title" id="ed-scene-dialog-title">
            {title}
          </span>
          <button type="button" className="ed-btn ed-btn--ghost" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="ed-dialog__body">{children}</div>
      </div>
    </>
  );
}

/** 新建场景 dirty 确认（取消 = 零副作用；初始焦点在「取消」——安全默认） */
export function ConfirmSceneReplaceDialog({
  summary,
  onConfirm,
  onCancel,
}: {
  summary: SceneReplaceSummary;
  onConfirm(): void;
  onCancel(): void;
}) {
  return (
    <DialogShell title="新建场景" onClose={onCancel}>
      <p className="ed-scenedlg__lead">当前场景有未保存的修改，新建将丢弃这些修改。</p>
      <dl className="ed-scenedlg__summary">
        <div className="ed-field">
          <span className="ed-field__label">模板</span>
          <span className="ed-readout">{summary.name}</span>
        </div>
        <div className="ed-field">
          <span className="ed-field__label">来源</span>
          <span className="ed-readout">{summary.source}</span>
        </div>
        <div className="ed-field">
          <span className="ed-field__label">规模</span>
          <span className="ed-readout">
            {summary.objectCount} 对象 · {summary.layerCount} 图层
          </span>
        </div>
      </dl>
      <div className="ed-scenedlg__actions">
        <button type="button" className="ed-btn ed-btn--ghost" onClick={onCancel} autoFocus>
          取消
        </button>
        <button type="button" className="ed-btn ed-btn--primary" onClick={onConfirm}>
          新建
        </button>
      </div>
    </DialogShell>
  );
}

/** 「另存为模板…」命名弹层（空名禁用保存；重名提示「将覆盖」；Enter/Esc 手势） */
export function TemplateNamingDialog({
  existingNames,
  onSubmit,
  onCancel,
}: {
  /** 既有模板名清单（重名「将覆盖」提示判定） */
  existingNames: string[];
  onSubmit(name: string): void;
  onCancel(): void;
}) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();
  const valid = trimmed !== '';
  const duplicate = valid && existingNames.includes(trimmed);

  const submit = (): void => {
    if (valid) onSubmit(trimmed);
  };

  return (
    <DialogShell title="另存为模板" onClose={onCancel}>
      <p className="ed-scenedlg__lead">把当前场景的完整快照（对象 · 图层 · 环境）保存为个人模板，存于本浏览器。</p>
      <input
        type="text"
        className="ed-input ed-scenedlg__input"
        value={value}
        placeholder="模板名称"
        aria-label="模板名称"
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="ed-scenedlg__hint" role="status">
        {!valid
          ? '请输入模板名称'
          : duplicate
            ? `同名模板「${trimmed}」将被覆盖`
            : '可随时经「文件 → 新建场景 ▾」从模板新建'}
      </div>
      <div className="ed-scenedlg__actions">
        <button type="button" className="ed-btn ed-btn--ghost" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="ed-btn ed-btn--primary" disabled={!valid} onClick={submit}>
          保存{duplicate ? '（覆盖）' : ''}
        </button>
      </div>
    </DialogShell>
  );
}

/** 模板管理弹层：用户模板行内重命名/删除 + 内置只读 + 空占位 */
export function ManageTemplatesDialog({
  items,
  onRename,
  onDelete,
  onClose,
}: {
  items: TemplateListItem[];
  onRename(id: string, name: string): void;
  onDelete(id: string): void;
  onClose(): void;
}) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const user = items.filter((t) => !t.builtin);
  const builtin = items.filter((t) => t.builtin);

  const trimmed = renameValue.trim();
  const renameValid =
    trimmed !== '' && !user.some((t) => t.id !== renamingId && t.name === trimmed);

  const submitRename = (): void => {
    if (renamingId !== null && renameValid) {
      onRename(renamingId, trimmed);
      setRenamingId(null);
      setRenameValue('');
    }
  };

  return (
    <DialogShell title="管理模板" onClose={onClose}>
      <div className="ed-scenedlg__section-title">个人模板</div>
      {user.length === 0 ? (
        <div className="ed-scenedlg__empty">暂无个人模板——用「文件 → 另存为模板…」创建</div>
      ) : (
        <ul className="ed-tpl__list">
          {user.map((tpl) =>
            renamingId === tpl.id ? (
              <li className="ed-tpl__item ed-tpl__item--renaming" key={tpl.id}>
                <input
                  type="text"
                  className="ed-input ed-tpl__rename-input"
                  value={renameValue}
                  aria-label={`重命名「${tpl.name}」`}
                  autoFocus
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submitRename();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      setRenamingId(null);
                      setRenameValue('');
                    }
                  }}
                />
                <button
                  type="button"
                  className="ed-btn ed-btn--primary ed-tpl__rename-save"
                  disabled={!renameValid}
                  onClick={submitRename}
                >
                  保存
                </button>
                <button
                  type="button"
                  className="ed-btn ed-btn--ghost"
                  onClick={() => {
                    setRenamingId(null);
                    setRenameValue('');
                  }}
                >
                  取消
                </button>
              </li>
            ) : (
              <li className="ed-tpl__item" key={tpl.id}>
                <span className="ed-tpl__name" title={tpl.name}>
                  {tpl.name}
                </span>
                <span className="ed-tpl__meta ed-readout" aria-label={`${tpl.objectCount} 个对象 · ${tpl.layerCount} 个图层`}>
                  {tpl.objectCount} 对象 · {tpl.layerCount} 图层
                </span>
                <button
                  type="button"
                  className="ed-tpl__rowbtn"
                  aria-label={`重命名模板「${tpl.name}」`}
                  title={`重命名模板「${tpl.name}」`}
                  onClick={() => {
                    setRenamingId(tpl.id);
                    setRenameValue(tpl.name);
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  className="ed-tpl__rowbtn ed-tpl__rowbtn--danger"
                  aria-label={`删除模板「${tpl.name}」`}
                  title={`删除模板「${tpl.name}」`}
                  onClick={() => onDelete(tpl.id)}
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ),
          )}
        </ul>
      )}

      <div className="ed-scenedlg__section-title">内置模板</div>
      <ul className="ed-tpl__list">
        {builtin.map((tpl) => (
          <li className="ed-tpl__item ed-tpl__item--builtin" key={tpl.id} aria-label={`内置模板「${tpl.name}」（只读）`}>
            <span className="ed-tpl__name" title={tpl.name}>
              {tpl.name}
            </span>
            <span className="ed-tpl__meta ed-readout">
              {tpl.objectCount} 对象 · {tpl.layerCount} 图层
            </span>
            <span className="ed-tpl__builtin-tag">内置</span>
          </li>
        ))}
      </ul>
      <div className="ed-scenedlg__hint">内置模板随应用提供（只读）；个人模板存于本浏览器，最多 20 套。</div>
    </DialogShell>
  );
}

/** 导入行状态图标（Ant Upload file list 惯例：状态图标 + 文件名 + 状态描述） */
function ImportRowIcon({ row }: { row: ImportPreviewRow }) {
  if (row.status === 'failed') {
    return (
      <span className="ed-import__icon ed-import__icon--fail" aria-hidden="true">
        <FileX size={14} />
      </span>
    );
  }
  if (row.warningCount > 0) {
    return (
      <span className="ed-import__icon ed-import__icon--warn" aria-hidden="true">
        <FileWarning size={14} />
      </span>
    );
  }
  return (
    <span className="ed-import__icon ed-import__icon--ok" aria-hidden="true">
      <CheckCircle2 size={14} />
    </span>
  );
}

/** 批量导入预览弹层（确认前零副作用；合计 0 对象 → 确认禁用） */
export function ImportPreviewDialog({
  rows,
  onConfirm,
  onCancel,
}: {
  rows: ImportPreviewRow[];
  onConfirm(): void;
  onCancel(): void;
}) {
  const totalObjects = rows.reduce((sum, r) => sum + (r.status === 'ok' ? r.objectCount : 0), 0);
  const totalWarnings = rows.reduce((sum, r) => sum + (r.status === 'ok' ? r.warningCount : 0), 0);
  const failedCount = rows.filter((r) => r.status === 'failed').length;

  return (
    <DialogShell title="导入预览" onClose={onCancel}>
      <ul className="ed-import__list">
        {rows.map((row, index) => (
          <li
            className={`ed-import__row${row.status === 'failed' ? ' ed-import__row--failed' : ''}`}
            key={`${row.name}-${index}`}
          >
            <ImportRowIcon row={row} />
            <span className="ed-import__name" title={row.name}>
              {row.name}
            </span>
            <span className="ed-import__desc">
              {row.status === 'ok'
                ? `${row.objectCount} 对象${row.warningCount > 0 ? ` · ${row.warningCount} 告警` : ''}`
                : row.message}
            </span>
          </li>
        ))}
      </ul>
      <div className="ed-import__summary" role="status">
        合计 <span className="ed-readout">{totalObjects}</span> 个对象 ·{' '}
        <span className="ed-readout">{totalWarnings}</span> 条告警 ·{' '}
        <span className="ed-readout">{failedCount}</span> 个失败文件
      </div>
      <div className="ed-scenedlg__actions">
        <button type="button" className="ed-btn ed-btn--ghost" onClick={onCancel}>
          取消
        </button>
        <button
          type="button"
          className="ed-btn ed-btn--primary"
          disabled={totalObjects === 0}
          autoFocus
          onClick={onConfirm}
          title={totalObjects === 0 ? '没有可导入的对象' : undefined}
        >
          导入
        </button>
      </div>
    </DialogShell>
  );
}
