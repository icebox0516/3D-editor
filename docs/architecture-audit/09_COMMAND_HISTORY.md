# 09 · Command / History 架构

## 基础契约

### Command 接口（`src/editor/commands/Command.ts:16-29`）

```ts
interface Command {
  readonly id: ID;              // createId('cmd') → cmd_ 前缀（CommandBase :33）
  readonly name: string;        // scene:changed 归因 source（= 类名）
  execute(ctx: CommandContext): boolean;   // 失败 false 且零部分副作用
  undo(ctx: CommandContext): void;         // 幂等不抛错
  redo(ctx: CommandContext): void;         // 幂等不抛错
  canExecute(): boolean;                    // 无上下文前置检查
}
```

`CommandBase`（:32-56）提供：`emitSceneChanged`（成功后广播 `scene:changed{source:name}`——命令级归因，叠加在 SceneManager 方法级事件之上）、`deselectIfSelected`。

**无 label、无 merge/mergeInto 方法、无 transaction API**——这是重要事实：合并与事务全部由 BatchCommand + 调用方协议实现（见下文）。

### CommandContext（`CommandContext.ts:14-21`）

仅三成员：`sceneManager / selection / eventBus`。**不含 runtime（命令零渲染）与 history（防循环依赖，头注 :6-8）**。

### Command 注册

- `CommandRegistry.register(type, factory)`（registries 层，`CommandFactory = (data: any) => RegisteredCommand`）。
- 注册点：`app/bootstrap.ts:637-688 createCommandRegistry()`，共 **15 个 type 字符串**：CreateObjectCommand / DeleteObjectCommand / TransformCommand / ChangePropertyCommand / ChangeLayerCommand / BatchCommand / UpdateObjectCommand / UpdateLayerCommand / ChangeShapeCommand / ChangeSemanticCommand / ChangePresetCommand / SplitRoadCommand / MergeRoadCommand（+ MergeLayerCommand/GroupCommand 等未入注册表——注册清单以 bootstrap 代码为准，v1 ChangeStyle/ChangeGeometry 已退役 :636 注释）。
- **审计发现：无生产代码调用 `registry.create()`**——注册表挂 `facade.registries.commands`（:527）仅作扩展点；实际执行路径全部直接 `new XxxCommand()` + `facade.history.execute(...)`。即「命令工厂注册表」当前是**已装配但未消费**的设施。

### execute / undo / redo / history stack

`HistoryManager`（`src/editor/history/HistoryManager.ts`）：

- 双栈 `undoStack/redoStack: Command[]`，**无容量上限**（:18-19）。
- `execute(cmd)`（:27-40）：canExecute → execute → 成功入 undoStack + 清空 redoStack；失败零栈副作用；`mergeBatch=false`（默认 true）时 BatchCommand 按 `getChildren()` 展开逐条入栈（:31-33，「是否合并可配置」）。
- `undo()/redo()` 弹栈回放（LIFO）；`clear()` 清栈不回滚场景（openScene 后调用，:599）；每次变更 emit `history:changed{canUndo,canRedo}`。

### merge / batch / transaction 的真实实现

| 概念 | 实现 | 位置 |
|---|---|---|
| composite | `BatchCommand`：execute 顺序执行、**失败逆序回滚**已执行部分（:34-37）；undo 逆序 / redo 顺序；子命令可为任意 Command 含嵌套 Batch | `BatchCommand.ts` |
| 合并（历史段） | **会话批次协议**：每次提交先 `history.undo()` 弹出本会话批次（其对象随之移除）→ 与新命令重建更大 BatchCommand 入栈；弹批被外部命令顶替则 redo 还原另起会话 | `PlacementTool.ts:240-274`（连续放置）、`DrawPointTool.ts:107-142`（连续点绘制） |
| 拖拽聚合 | 微任务冲刷：一次手势 N 目标 → N×TransformCommand 包一个 BatchCommand | `TransformTool.ts:117-131` |
| merge（命令级） | **不存在**——Command 接口无 merge 语义 | — |

## 实际存在的主要 Command（16 类，`src/editor/commands/`）

| 命令 | 行为要点 | undo 机制 | 特殊点 |
|---|---|---|---|
| `CreateObjectCommand` | 构造 deepClone 快照；id 冲突 execute false | removeObject + 清选中 | redo 以**原 id** 恢复 |
| `DeleteObjectCommand` | 删组不删成员：子级上提（lifted 记账） | 加回 + 子级挂回 + `reorderObjects(beforeIds)` 复原数组位 | T8.5 |
| `TransformCommand` | before 以 execute 时实际状态覆盖（事务语义 :37） | transform 往返 | canExecute isTransform 拒 NaN |
| `UpdateObjectCommand` | 仅 name/visible/locked 白名单 | patch 快照往返 | 非法键构造期抛错 |
| `ChangePropertyCommand` | 存整个 properties 深拷贝（非 patch 键） | 整体往返 | 键增删可逆 |
| `ChangeLayerCommand` | layerId 往返；`executed` 标志区分未执行与 before=null | | |
| `UpdateLayerCommand` | 图层五键白名单 patch | | |
| `MergeLayerCommand` | 成员迁目标层 + 删源层一条历史 | addLayer(快照) 回迁 | redo 直接调 execute |
| `ChangeShapeCommand` | region shape 整体替换；isRegionObject 守卫 | | 顶点编辑/道路几何共用 |
| `ChangeSemanticCommand` | **三联动**：semantic + layerId(按 def.defaultLayerName 查名迁移) + style 重置为该类型默认预设；同类型仅换 semantic | | 类型切换语义核心 |
| `ChangePresetCommand` | style 整体替换 | | 额外 emit `style:changed` |
| `GroupCommand` | 组壳 createGroupObject 成型；成员同父→组落首成员原位，异父→根级 | parentId + 数组序复原 | 成功后 select(组壳) |
| `UngroupCommand` | 多组批量解散一条历史；成员上插组原兄弟位 | | 成功后 selectMany(成员) |
| `ReparentCommand` | 三态落点 into/before/after；环检测（挂自身/后代→false 零副作用）；整棵子树随迁 | | 大纲拖拽 |
| `SplitRoadCommand` | 一分为二（语义/样式保留）；副本 id 构造时生成一次（redo 稳定）；点名 `${原名} 2` | | 单命令单历史 |
| `MergeRoadCommand` | 世界坐标邻接判定 + 局部坐标回写拼接 | 还原 first + 重加 second | 恰选两条相邻道路 |

工厂层共享动作（app/editorActionsCore.ts）：`deleteSelection`（每对象一 Delete 包 Batch）、`paste/duplicate`（offsetClone 新 id + 偏移 1m）、`dropSelectionToGround`（贴地批量）、`groupSelection`（组名自动去重编号）、`ungroupSelection`。

## 全链路图（实际代码路径）

```
UI Action                        Command                     Scene Mutation              Render Update
─────────────────────────────────────────────────────────────────────────────────────────────────
Inspector 数值提交      →  TransformCommand            →  updateObject(id,{transform}) → object:updated
(InspectorPanel:392)        (before/after)                 (SceneManager:69-96)         → SceneSync:40
                                                                                        → Renderer.update:524
                                                                                        → applySceneObjectState/
                                                                                          pool.update 单槽
─────────────────────────────────────────────────────────────────────────────────────────────────
绘制完成               →  CreateObjectCommand         →  addObject                    → object:created
(DrawToolBase:264)                                        → scene:changed               → attach → RegionRenderer
─────────────────────────────────────────────────────────────────────────────────────────────────
连续放置第 N 次         →  [undo 弹本会话批] →          →  addObject                    → （弹批时 detach,
(PlacementTool:240)       重建 BatchCommand                                            增量 attach 仅新对象）
─────────────────────────────────────────────────────────────────────────────────────────────────
Gizmo 松手             →  TransformCommand ×N         →  updateObject ×N              → object:updated ×N
(TransformTool:117)       包 BatchCommand                                              （拖拽期间已直写预览，
                                                                                          提交后按权威数据收敛）
─────────────────────────────────────────────────────────────────────────────────────────────────
Ctrl+Z                 →  history.undo()              →  cmd.undo → removeObject/    → object:removed
(input.ts:207)             (HistoryManager:43)            updateObject(before)          → detach → dispose 归置
─────────────────────────────────────────────────────────────────────────────────────────────────
类型芯片一步赋型        →  BatchCommand[ChangeSemantic →  updateObject(semantic+layer  → object:updated
(regionQuickApply:104)     + ChangePreset]                + style 三键)                  → RegionRenderer 分派
```

渲染更新**不需要显式 invalidate**——连续渲染循环下一帧自然呈现（RenderLoop）。

## 绕过 Command 直接修改 Scene 的地方（审计结论）

1. **UI 图层新建/删除——授权例外（审计新发现，代码注释自证）**：
   - `OutlinerPanel.tsx:1062-1077` `addLayer()` **直接调 `facade.scene.addLayer`**，注释原文「SceneManager.addLayer 专用路径（任务书授权，P0 不可撤销）」；
   - `OutlinerPanel.tsx:1084-1087` `removeLayer()` **直接调 `facade.scene.removeLayer`**（成员 layerId 置 null 落未分层），注释「P0 不可撤销」。
   - 即图层的**创建与删除是可见修改但不经 Command、Ctrl+Z 不可撤销**——README「一切可见修改经 Command（可撤销重做）」（`README.md:145`）与代码存在**明确不一致**（代码注释自认授权例外，README 未提及）。图层**合并**走 MergeLayerCommand（可撤销，`OutlinerPanel.ts:1090` mergeLayer）。
2. **组合根 openScene / 默认装配**（`bootstrap.ts:510` addLayer、:591-593 addObject）：场景全量替换语义（openScene 先 clear + history.clear），非用户编辑动作。**设计内**。
3. **`importElements`**（bootstrap.ts:178-184）：导入对象经 CreateObjectCommand/BatchCommand 入库——**走 Command**，不算绕过。
4. editor/runtime 两层：**未发现绕过路径**（grep 全部写方法调用点位于 commands/ 与上述例外）。
5. 选中集（SelectionManager）不经 Command——按设计不入历史（`SelectTool.ts:15-16`）。

## 可撤销性覆盖面（现状盘点）

- **入历史**：对象增删、transform、name/visible/locked、properties、图层归属/属性/合并、shape、semantic（含三联动）、style、分组/解散/层级拖拽、道路分割合并、对齐/阵列/批量编辑/批量重命名/贴地、复制粘贴、导入。
- **不入历史（设计明确）**：选中集、工具状态、环境/网格（setEnvironment/setGrid「环境类配置不入历史」，bootstrap.ts:543,555 注释）、工作模式、布局、测量（阶段 10 契约：不入场景不入 Command 历史）、相机。
- **保存剥离**：诊断渲染模式（会话级视口态，bootstrap.ts:607-608）。
