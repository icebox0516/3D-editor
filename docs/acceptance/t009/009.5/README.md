# T009.5 程序化资产公共 Shadow 能力 — 验收取证（2026-09-19）

环境：Chromium 151（chrome-for-testing）/ WebGL2 / ANGLE RTX 2080 Ti D3D11 / 1920×1080 DPR=1 / day 预设（sun (80,120,60) castShadow 2048² / ground receiveShadow）。

## 取证文件

| 文件 | 内容 | 判定 |
|---|---|---|
| `prod-3trees-shadow-22m-az215.png` | 产品路径（放置命令管线 → 池 InstancedMesh）3 棵夏栎，逆光机位 22m/az215/el14 | 树影锯齿叶形边缘 + 冠影内部透光斑驳（SDF 裁切影，非整卡实心剪影）✓ |
| `prod-shadow-closeup-15m-el3.png` | 同场景低机位贴地 15m/el3 影近景 | 单叶裂片缺口轮廓与叶间隙透光点可辨 ✓ |
| `prod-single-25m-az35.png` | 产品路径单树 25m 标准机位（seed 槽路由 bucket） | 整树正常 + 地面叶形裁切影 ✓ |
| `dev-single-25m-az35.png` | DEV 舞台（tree3aStage.mount）同机位对照 | 同样叶形裁切影——`source.customDepthMaterial` 同源消费（单测锁同一材质实例，tests/runtime/procedural/tree/tree3aStage.test.ts）✓ |
| `ghost-active-shadow-intact-25m.png` | 放置模式激活（资产卡点击，产品路径）+ 指针入画布 | Ghost 半透明在位、**自身不投影**；已放置树影完好（锯齿+斑驳不变）；无渲染异常 ✓ |

## renderer.info 取证（draw call 变化）

| 场景 | drawCalls | triangles | geometries | 说明 |
|---|---|---|---|---|
| 空场景 | 3 | 4 | 3 | 环境（地面/网格等） |
| 产品路径 1 棵 | 7 | 57,512 | 4 | 桶 2 主材质组 + 2 影 pass + 环境 3 |
| 产品路径 3 棵 | 15 | 205,188 | 6 | 3 桶 × 4 + 环境 |
| Ghost 激活（1 棵在场） | 9 | 91,288 | 7 | +2（ghost 主绘制 ×2 组）、+1 几何（ghost 槽源新建缓存） |

影 pass 深度材质使每桶影 pass 走 customDepthMaterial（SDF 裁切）；Shadow pass 开销 A/B 见 009.7 性能验收（1000 棵：5.6ms ↔ 12.4ms）。

## 分口径验收对账（任务书 Requirements）

- **正式放置对象 = 投影 + 叶形裁切**：✓（上表 5 图 + 单测三建网格点挂载）
- **Ghost/Preview = 不破坏 Shadow 契约、不要求投影**：✓（Ghost 不投影、场景影无变化、渲染无异常；Ghost Mesh 共享源材质声明 aSeed——非实例绘制读缓冲首元素/GL 缺省 0，确定性相位无未定义行为，实测渲染正常）
- **ScatterChunkManager = 仅契约兼容**：✓ 零代码改动，typecheck 过（类型层面通过；行为零触碰）
- **AssetLoader（GLB 端）= 类型兼容零行为**：✓ 零改动，GLB 源不设新字段 → 池不赋值 → 行为逐位不变
- **dispose 链**：✓ 单测锁定（缓存 evict/dispose 释放深度材质恰一次；缩略图 captureProcedural finally 释放；池任何生命周期点不 dispose（归源所有）；舞台 unmount 幂等零泄漏）

## 回归

`npm test` 2542 全绿 / `check:layers` 446 文件过 / `typecheck` 无错。GLB 与设施资产构造性零变化（`customDepthMaterial` undefined → 不赋值路径）。
