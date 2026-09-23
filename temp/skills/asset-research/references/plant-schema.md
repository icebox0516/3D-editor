# 植物域 Schema（plant）

> 用途：定义植物类 Reference Spec **可描述的现实维度**。
>
> **本 Schema 不是逐资产强制调查清单。** 每棵植物只填写与当前生产目标相关的字段；不适用字段省略；关键但无法确认的字段保留 `Unknown`。

## 字段定义

### A. 干与枝（轴结构）

| 字段 key                  | 中文说明     | 取值形式        | 语义定义                                       |
| ----------------------- | -------- | ----------- | ------------------------------------------ |
| `trunk_height_ratio`    | 主干高度占比   | Range       | 主干分枝点（冠底）高度占全树高的比例                         |
| `trunk_taper_ratio`     | 主干锥度比    | Range       | 主干顶端直径与基部（胸高处）直径之比                         |
| `basal_flare_ratio`     | 根部扩张比    | Range       | 树干地面处直径相对其上行正常段直径的放大倍数                     |
| `trunk_lean_angle`      | 主干倾角     | Range       | 主干轴线偏离铅垂线的角度                               |
| `branching_levels`      | 分枝层级数    | Value       | 自主干（第 0 级）至末梢的分枝级数                         |
| `scaffold_branch_count` | 骨架枝数量    | Range       | 直接着生于主干的一级粗枝（骨架枝）典型数量                      |
| `scaffold_angle`        | 骨架枝仰角    | Range       | 骨架枝轴线与铅垂向上方向的夹角（横展度；现实照片可目测的主口径）           |
| `branch_angle`          | 分枝角      | Range       | 子枝轴线与父枝轴线的着生夹角（逐级；植被建模/异速生长研究惯用口径）         |
| `branch_orientation`    | 分枝方位分布   | Qualitative | 子枝绕父枝的方位排列模式（近轮生均分 / 螺旋 / 对生，及抖动幅度）        |
| `branch_length_decay`   | 分枝长度衰减比  | Range       | 子枝长度与父枝长度之比（可逐级给出）                         |
| `branch_radius_decay`   | 分枝径衰减比   | Range       | 子枝起径与父枝该处直径之比                              |
| `branch_attachment_t`   | 子枝着生区间   | Range       | 子枝沿父枝轴线的着生位置范围（归一化 t 域，0=近基 1=末梢）          |
| `apical_dominance`      | 顶枝优势     | Qualitative | 领导枝相对侧枝的形态优势状态（强领导 / 中庸 / 老龄失去）            |
| `branch_curvature`      | 枝条曲率倾向   | Qualitative | 枝沿长度的弯曲趋势（平展 / 末段上翘 / 下垂，重力向/背地向）          |
| `allometry_exponent`    | 异速生长指数 p | Value       | 分枝断面异速关系指数（Σ(子径)^p = (父径)^p 的 p；面积守恒时 p=2） |

### B. 叶与冠（冠层结构）

| 字段 key                  | 中文说明     | 取值形式        | 语义定义                                 |
| ----------------------- | -------- | ----------- | ------------------------------------ |
| `leaf_attachment_rule`  | 叶簇着生位置规则 | Qualitative | 叶/叶簇沿枝着生的位置规律（限末级外段受光区 / 全枝 / 限一年生枝） |
| `leaf_cluster_density`  | 叶簇密度     | Value       | 单位末级枝上的叶片（或叶簇）数量                     |
| `clump_scale`           | 簇团尺度     | Relative    | 冠内叶团聚块的空间尺度（相对冠幅半径的比例）               |
| `leaf_orientation_dist` | 叶片朝向分布   | Qualitative | 叶面法向的分布规律（近水平摊开为主 / 球面随机 / 沿枝成列）     |
| `leaf_size`             | 叶片尺寸     | Range       | 单叶长度×宽度                              |
| `leaf_aspect_ratio`     | 叶片长宽比    | Range       | 单叶长度与宽度之比                            |
| `crown_transparency`    | 冠层通透度    | Relative    | 冠层体积中空隙占比 / 逆光可透视程度（相对等级）            |
| `crown_fill_gradient`   | 冠层密度梯度   | Qualitative | 冠层密度由外壳向冠心的变化（外密内疏 / 均匀 / 内密外疏）      |

### C. 表皮与芽（近景表面现实）

| 字段 key           | 中文说明  | 取值形式        | 语义定义                                           |
| ---------------- | ----- | ----------- | ---------------------------------------------- |
| `bark_archetype` | 树皮类型  | Qualitative | 树皮结构原型（光滑 / 薄片剥落 / 脊状纵裂 / 板块状 / 网状开裂等；随树龄序列给出） |
| `bark_color`     | 树皮颜色  | Qualitative | 树皮颜色基调与沟/脊明暗关系（含树龄变化）                          |
| `bark_relief`    | 树皮浮雕感 | Relative    | 沟脊深浅与脊宽窄的相对浮雕强度（沟底—脊顶对比）                       |
| `bark_epiphytes` | 树皮附生  | Qualitative | 苔藓/地衣等附生斑块的有无、分布位置（冠下/背阴面/方位倾向）                |
| `twig_surface`   | 小枝表面  | Qualitative | 一年生小枝颜色、皮孔/被毛等表面特征（与主干树皮的分化）                   |
| `bud_aspect`     | 芽的形态  | Qualitative | 芽的形状、颜色、芽鳞特征（近景冬态可辨维度）                         |

## 填写约定

* 植物 Reference Spec = 通用骨架 + 本域**按需选取**的字段。
* 只填写与当前资产生产决策相关的字段。
* 不适用字段可以省略。
* 有关键证据需求但当前无法可靠确认 → `Unknown`。
* 有证据支持、但需要推断 → `Inferred`。
* 有直接可靠证据支持 → `Verified`。
* 每条关键事实继续带 `Form` + `Evidence Status` + `Source`。
* 不得为了填满 Schema 而寻找无实际用途的参数。
* Schema 只定义现实领域可以表达的字段，不绑定任何具体 Geometry / Shader / Runtime 实现。

## Schema 演进

* 新增字段必须有真实消费者或明确现实研究需求；
* 不为未来可能出现的资产预防性扩字段；
* 新增字段后同步更新 Schema 版本号；
* 已有 Spec 不强制回填新增字段，只有后续任务真正需要该字段时才补充。
