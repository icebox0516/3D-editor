---

name: asset-research
description: 程序化资产的现实调研方法论：确认现实对象身份，检索可靠资料，提取结构化事实，标注证据状态，并落盘 Reference Spec。由 asset-production（.zcode/skills/asset-production）对应 Workflow 的 Research Step 按需加载；照片判读与证据验证规程见 references/photo-verification.md。
-----------------------------------------------------------------------------------------------------------------

# Asset Research

> 本技能是**现实调研方法论**，不是事实源，也不定义具体资产类型的生产流程。
>
> 调研结论统一落盘 `docs/research/<asset>-reference.md`；该 Reference Spec 是该资产现实事实的唯一来源。
>
> 工程预算、LOD 面数、性能阈值、Runtime/Shader 实现方案不属于本技能。

## 调用边界

* 是否必须进行 Research：由 `AGENTS.md` 与对应资产 Workflow 决定。
* 本技能只负责 Research 的执行，不负责资产任务派遣、实现或最终视觉验收。
* 调研完成后，必须形成可版本化的 Reference Spec。

## 工作流

### 1. 明确身份

确认：

* 资产是什么；
* 具体种 / 型号 / 品种 / 亚型；
* 使用语境；
* 当前调研对象与相近对象如何区分。

身份无法可靠确认时，向主代理报告，不自行猜定。

### 2. 检索可靠来源

按事实类型选择最适合的来源：

* 结构 / 尺度 / 专业事实 → 权威文献、官方资料、专业数据库；
* 型号 / 规格 → 官方产品资料、技术文档；
* 形态 / 材质 / 自然变体 → 真实照片、现场资料、专业数据库；
* 3D / CG / 艺术图 → 仅作实现参考，不作为现实事实依据。

规则：

* 核心结论必须可追溯；
* 来源数量按对象复杂度决定，不设固定数量；
* 关键形态、比例、变体等结论应尽量交叉验证；
* 单张图片或单一个体不得直接外推为普遍规律；
* 无法可靠交叉确认时，降低为 `Inferred`；
* 按当前领域选择对应的结构化数据端点、静态页面或浏览器通道，不把某一领域的数据源写成通用规则。

### 3. 提取与转译

来源事实必须转译为可执行描述：

* 数值；
* 范围；
* 结构关系；
* 相对关系；
* 可观察特征。

参考图可暂存于 `screenshots/ref-tmp/`，不进入产品运行时与 Git。

禁止：

* 凭经验补造现实事实；
* 用其他资产的参数直接替代当前资产事实；
* 把工程参数伪装成现实事实。

### 4. 落盘 Reference Spec

按：

`references/spec-template.md`

写入：

`docs/research/<asset>-reference.md`

领域扩展字段按对应 Domain Schema 填写。

### 5. Evidence Status

关键事实必须标注：

```text
Verified
Inferred
Unknown
```

表达形式独立标注：

```text
Value
Range
Relative
Qualitative
```

示例：

```text
- 树高：7–9m
  - Form: Range
  - Evidence Status: Verified
  - Source: 来源编号
```

### 6. Unknown Gate

若 Unknown 会影响当前资产的：

* 结构；
* 形态；
* 材质；
* 变体；
* 身份判定；

则不得忽略。

继续调研仍无法确认时：

* 保留 `Unknown`；
* 报告主代理；
* 不伪造答案；
* 不为边缘问题无限补研。

### 7. Domain Schema

Reference Spec = 通用骨架 + Domain Schema。

* 已有 Domain Schema：按现有 Schema 填写；
* 新领域首次出现：允许起草 Schema 草案，由主代理审阅后纳入；
* Schema 定义现实领域字段，不反向服从当前代码实现。

## 交付自检

* [ ] Spec Version / Domain / Asset 完整
* [ ] 核心结论有可追溯来源
* [ ] 关键事实已标 Evidence Status
* [ ] Unknown 已显式记录
* [ ] 无伪精确工程数值
* [ ] 现实事实与工程设定分离
* [ ] 参考图片仅作为研究 / 开发对照，不进入 Runtime
* [ ] Reference Spec 可被后续开发 Agent 直接消费

## 边界

本技能：

* 只负责现实调研；
* 只产出 Research / Reference Spec；
* 不写产品代码；
* 不决定 Geometry / Shader / LOD / Runtime 实现；
* 不替代资产 Workflow；
* 不替代最终视觉验收。
