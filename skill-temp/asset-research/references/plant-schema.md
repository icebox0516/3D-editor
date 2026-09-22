# 植物域 Schema（plant）

> 草案 v0.2：T008.6 首跑起草（v0.1），主代理审阅修订合入（v0.2：`branch_angle` 拆分为 `scaffold_angle` + `branch_angle` 两字段——原定义「子枝对父枝夹角」与首跑填写/现实观察口径「骨架枝对垂直方向横展角」不一致；新增 C 组表皮与芽字段——树皮/小枝/芽是乔木资产的近景现实维度）。
> 用途：定义 Reference Spec 域扩展节 `plant` 的结构化字段。字段按现实植物学域定义（植物形态学/植被建模通用概念），可对齐 L-system / 植被建模技法参考的参数命名，但不被项目当前实现反向绑死。每条关键事实的 Form/Evidence Status 规则见上级 SKILL.md。

## 字段定义

### A. 干与枝（轴结构）

| 字段 key | 中文说明 | 取值形式 | 语义定义 |
|---|---|---|---|
| `trunk_height_ratio` | 主干高度占比 | Range | 主干分枝点（冠底）高度占全树高的比例 |
| `trunk_taper_ratio` | 主干锥度比 | Range | 主干顶端直径与基部（胸高处）直径之比 |
| `basal_flare_ratio` | 根部扩张比 | Range | 树干地面处直径相对其上行正常段直径的放大倍数 |
| `trunk_lean_angle` | 主干倾角 | Range | 主干轴线偏离铅垂线的角度 |
| `branching_levels` | 分枝层级数 | Value | 自主干（第 0 级）至末梢的分枝级数 |
| `scaffold_branch_count` | 骨架枝数量 | Range | 直接着生于主干的一级粗枝（骨架枝）典型数量 |
| `scaffold_angle` | 骨架枝仰角 | Range | 骨架枝轴线与铅垂向上方向的夹角（横展度；现实照片可目测的主口径） |
| `branch_angle` | 分枝角 | Range | 子枝轴线与父枝轴线的着生夹角（逐级；植被建模/异速生长研究惯用口径） |
| `branch_orientation` | 分枝方位分布 | Qualitative | 子枝绕父枝的方位排列模式（近轮生均分 / 螺旋 / 对生，及抖动幅度） |
| `branch_length_decay` | 分枝长度衰减比 | Range | 子枝长度与父枝长度之比（可逐级给出） |
| `branch_radius_decay` | 分枝径衰减比 | Range | 子枝起径与父枝该处直径之比 |
| `branch_attachment_t` | 子枝着生区间 | Range | 子枝沿父枝轴线的着生位置范围（归一化 t 域，0=近基 1=末梢） |
| `apical_dominance` | 顶枝优势 | Qualitative | 领导枝相对侧枝的形态优势状态（强领导 / 中庸 / 老龄失去） |
| `branch_curvature` | 枝条曲率倾向 | Qualitative | 枝沿长度的弯曲趋势（平展 / 末段上翘 / 下垂，重力向/背地向） |
| `allometry_exponent` | 异速生长指数 p | Value | 分枝断面异速关系指数（Σ(子径)^p = (父径)^p 的 p；面积守恒时 p=2） |

### B. 叶与冠（冠层结构）

| 字段 key | 中文说明 | 取值形式 | 语义定义 |
|---|---|---|---|
| `leaf_attachment_rule` | 叶簇着生位置规则 | Qualitative | 叶/叶簇沿枝着生的位置规律（限末级外段受光区 / 全枝 / 限一年生枝） |
| `leaf_cluster_density` | 叶簇密度 | Value | 单位末级枝上的叶片（或叶簇）数量 |
| `clump_scale` | 簇团尺度 | Relative | 冠内叶团聚块的空间尺度（相对冠幅半径的比例） |
| `leaf_orientation_dist` | 叶片朝向分布 | Qualitative | 叶面法向的分布规律（近水平摊开为主 / 球面随机 / 沿枝成列） |
| `leaf_size` | 叶片尺寸 | Range | 单叶长度×宽度 |
| `leaf_aspect_ratio` | 叶片长宽比 | Range | 单叶长度与宽度之比 |
| `crown_transparency` | 冠层通透度 | Relative | 冠层体积中空隙占比 / 逆光可透视程度（相对等级） |
| `crown_fill_gradient` | 冠层密度梯度 | Qualitative | 冠层密度由外壳向冠心的变化（外密内疏 / 均匀 / 内密外疏） |

### C. 表皮与芽（近景表面现实）

| 字段 key | 中文说明 | 取值形式 | 语义定义 |
|---|---|---|---|
| `bark_archetype` | 树皮类型 | Qualitative | 树皮结构原型（光滑 / 薄片剥落 / 脊状纵裂 / 板块状 / 网状开裂等；随树龄序列给出） |
| `bark_color` | 树皮颜色 | Qualitative | 树皮颜色基调与沟/脊明暗关系（含树龄变化） |
| `bark_relief` | 树皮浮雕感 | Relative | 沟脊深浅与脊宽窄的相对浮雕强度（沟底—脊顶对比） |
| `bark_epiphytes` | 树皮附生 | Qualitative | 苔藓/地衣等附生斑块的有无、分布位置（冠下/背阴面/方位倾向） |
| `twig_surface` | 小枝表面 | Qualitative | 一年生小枝颜色、皮孔/被毛等表面特征（与主干树皮的分化） |
| `bud_aspect` | 芽的形态 | Qualitative | 芽的形状、颜色、芽鳞特征（近景冬态可辨维度） |

## 填写约定

- 通用骨架八节（身份/尺度/轮廓比例/结构层级/材质表面/变体/远近景/来源）+ 本域扩展节共同构成植物类 Reference Spec。
- 域扩展节逐字段填写，每条带 Form（Value/Range/Relative/Qualitative）与 Evidence Status（Verified/Inferred/Unknown）及 Source；无可靠来源的结构数值宁可标 Unknown，禁止伪精确。
- 本 Schema 独立演进：新增字段须同步本文件版本号并在 spec 落盘处引用。
