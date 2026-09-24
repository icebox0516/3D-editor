/**
 * domain/lod 汇总导出：Runtime 表示与提交状态契约（representation，T021.1/D41）
 * + Runtime 全局策略常量（lodPolicy / batchPolicy，T006.4 起 含批次控制）
 * + 选档评估器纯函数（lodEvaluation）+ 确定性抽稀规则（batchPolicy）
 * + 表示过渡状态机纯函数（transition，T021.3/D41 §五）。
 */
export * from './representation';
export * from './lodPolicy';
export * from './lodEvaluation';
export * from './batchPolicy';
export * from './transition';
