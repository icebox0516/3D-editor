# T001 Docs Bootstrap

## Goal

文档体系切换：一期 PLAN 体系整体归档，建立 AGENTS / TASKS / tasks / PROGRESS / DECISIONS 五件套轻量记忆体系（D2），并把二期设计共识落入 DECISIONS.md（D1–D15）。

## Requirements

- `docs/plan/` 整树 `git mv` 归档至 `docs/archive/plan-phase1/`（PROTOCOL / STATUS / CONTRACTS / METHODOLOGY / 61 份任务书 / history / screenshots），内容零删改
- 根级建立 `TASKS.md`（任务索引板）、`PROGRESS.md`（项目快照）、`DECISIONS.md`（决策记录）、`tasks/T001–T007.md`
- `AGENTS.md` 精简改写：只留项目级每次必知规则；three.js 调试取证细则拆至 `docs/threejs-debugging.md`
- README 中 `docs/plan` 引用与一期进度段更新为新体系路径；src / scripts 内 3 处注释路径同步修正

## Scope

- 仅文档与注释；`src/` 零行为改动（注释路径修正除外）

## Acceptance

- 五件套与 tasks/ 存在且互相引用一致；旧路径无悬空引用（README / src / scripts grep 为零）
- `npm test`（1989）/ `check:layers` / `typecheck` 三重门槛全绿

## Constraints

- 一期归档内容冻结只读，不回写
- 不动 `docs/architecture-audit/`（二期集成事实参考）

## 完成记录

2026-09-16 执行完毕：归档 + 五件套 + 7 任务文件 + README 4 处 / src+scripts 3 处注释路径修正；三重门槛复跑全绿（结果见 PROGRESS.md）。
