# T024.5 契约收口核对表（2026-09-28）

> 面一（契约收口）证据索引。三门槛当时态：`npm test` 279 文件 / 4289 全绿（Step 1 DEV 面 +10 后）、`check:layers` 631 全过、`typecheck` 零错。

## 1. presets 整表锁全绿

`tests/runtime/procedural/assets/assetColorPresets.test.ts`（T024.3 终态 13 树卡集全量）：

- L53 `19 资产色卡映射整表`——`metas.length` 与 `EXPECTED_PRESETS` 双向全等（多登/漏登皆红）。
- L61 `卡 id 资产内唯一`；L68 `非空卡集的 default 卡必在且居首`（DEFAULT_COLOR_PRESET_ID 单一真相源）。
- L75 `乔木族非空断言`（family broadleaf 至少 default 卡——族门承接面在现役 13 树锁定）。
- L83 `浏览语义三字段`（label 非空 / swatch 合法 hex——色点 UI 唯一视觉来源）。
- L92 `canopy 冠色覆写表与声明卡集同源`（防两处卡集漂移）。

## 2. typecheck 闸生效（必填字段层证明——现场演示）

操作：临时删除 `tests/registries/AssetRegistry.test.ts:28` fixture 的 `presets: []` 行 → `npm run typecheck`：

```
tests/registries/AssetRegistry.test.ts(19,3): error TS2322: Type '...' is not assignable to type 'ProceduralAssetMeta'.
  Types of property 'presets' are incompatible.
    Type 'readonly AssetColorPresetMeta[] | undefined' is not assignable to type 'readonly AssetColorPresetMeta[]'.
      Type 'undefined' is not assignable to type 'readonly AssetColorPresetMeta[]'.
```

→ 编译红（不声明 presets 无法通过类型层），随后 `git checkout --` 还原，工作树干净。**「出生即带 preset」强制位落在类型层实证**（024.1 记档的 10 处 fixture 编译红→机械适配同源证据，本演示为验收门现场复现）。

## 3. 卡 id 域记档核对

`docs/procedural-assets/metadata-taxonomy.md` §2.1「色卡预设字段（presets，T024 / D44）」（L46 起）：卡 id 域定稿 `{'default','autumn'}`（024.2 首批定稿、试点名零改名）；camphor/ligustrum 常绿 default 单卡终态记档。与整表锁 `EXPECTED_PRESETS` 一致。

## 4. 资源共享断言测试面（面三共享引用部分的证据收口）

- **geometry / customDepthMaterial 跨卡同引用**：`tests/runtime/procedural/assets/ginkgoPresetPipeline.test.ts` L59-69——「同槽两卡 geometry/深度同引用（共享层）」：`standard.geometry` toBe `autumn.geometry`（L67）、`customDepthMaterial` toBe（L68）、`cache.size` toBe 2（L69 两卡两桶——材质不同必须分桶）。
- **programs 不增**：`tests/runtime/procedural/tree/*Materials.test.ts` ×14（13 树 + facility）——样例 `ginkgoMaterials.test.ts` L692 `autumn.customProgramCacheKey()` toBe `base.customProgramCacheKey()`（同键 = programs 不增，D44 #3）；同 describe 含 autumn 四锚锁与默认卡零变化结构锁。
- **切卡不重建几何（缓存层）**：同 ginkgoPresetPipeline 缓存贯通断言（两卡同引用即共享单份、不重复构建；引用计数释放归 024.1 共享层测试）。
- **canopy 同源 drift-lock**：`broadleafCanopyMaterials.test.ts` L360-402 `SPECIES_LEAF_AUTUMN` 11 树（远近基调同源同值，远景不随卡会破所见即所得）。
- **放置/序列化透传**：`tests/editor/PlacementTool.presets.test.ts`（写侧 fail-fast）+ `tests/io/sceneSerializer.model-preset.test.ts`（保存/加载 preset 保真）+ `tests/app/tree3aPerf.test.ts`（DEV place preset/presets 落盘锁，T024.5 扩 +7）。

## 5. 结论

契约收口四判据（整表锁全绿 / typecheck 闸 / 卡 id 域记档 / 共享断言在测）全部成立；共享引用与 programs 不增为测试面构造性证明，像素面佐证见 `trunk-invariance/`（跨卡干区+投影逐位一致 = 深度材质与几何确实卡无关共享的行为级证据）。
