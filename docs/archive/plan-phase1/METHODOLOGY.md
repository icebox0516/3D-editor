# GUI 验收方法学（主代理浏览器实操经验 · 按需必读）

> 2026-09-11 自决策日志蒸馏（源条目见 history/decisions.md 对应日期）。**主代理执行里程碑验收（T5.9 / T6.10 / T7.8 / T8.5）前必读**；新增经验随验收会话追加（append-only）；T8.6 增补 33–36 四条。

## 一、宿主环境特性（IAB / 自动化桥）

1. **空闲冻结**：连续 rAF 渲染页面在 IAB 空闲时整体冻结——含 await 的长 evaluate 会 32s 超时，且冻结前动作其实已执行。对策：单步 evaluate + Node 侧等待 + 唤醒后读数；显隐类断言须禁过渡（`body.ed-dragging`）或唤醒后即时读。（T5.2）
2. **唤醒手段演进**：cua.move 早期可靠 → 空闲冻结加深后不可靠（旋转量积压至后续事件才结算）→ **手势/渲染类断言统一用 cua.scroll 唤醒**（落左面板避开画布缩放）。（T5.6→T5.8）
3. **键盘不达页面**：cua.keypress 零到达（IAB 桥挂起）；Playwright click 冻结超时；原生 `blur()` 不产生 focusout。Enter 提交 / 自然 blur 提交 / 键盘路径**不可自动测**——改 DOM 点按钮等价达成，或单元级同构验证后判非缺陷。（T5.3/T5.6；**T5.9 修正：blur 提交链可测**，见规则 18）
4. **帧暂停丢点**：快速连点会触发帧暂停丢事件——连击序列逐点唤醒 + 状态栏计数验证。（T5.1）
4b. **IAB 深冻五症状（T5.9 全集）**：①Playwright locator click 超时（actionability 检查等不到帧）；②cua.scroll 30s 超时；③`tab.reload()` 被静默吞掉（导航不发生、旧页与全部状态保留——可用作「冻结保活」的意外便利）；④带 React 重渲染副作用的 evaluate 报 "Promise was collected"（副作用多半已执行，紧跟一次 store 读数核实即可，勿当失败重放）；⑤截图桥僵尸（"A previous screenshot ... is still completing"，等待不可解，**换新标签页**立即恢复）。全程可靠通道：元素级 `.click()` / `.dispatchEvent`、动态 import 读 store、原生 setter 写值。React 重渲染在冻结下**仍会冲刷**（面板变量/菜单/Inspector 都更新过），滞塞的是「依赖上一轮渲染闭包」的路径（如隐藏态 ZoneToggle 的 onClick 旧 `hidden` 值）——reload 或经 store 直调绕开。（T5.9）

## 二、事件合成规则

5. **键盘事件必须元素级派发且先 focus**：window 级合成 keydown 到不了 React 根委托；NumberField 的 Enter→blur→commit 链要求输入框先 focus。（T3.4）
6. **PointerEvent 复用真实 pointerId=1**：three r186 OrbitControls onPointerDown 无 try/catch 调 setPointerCapture，未知 id 抛 NotFoundError 中断监听器挂载。（T5.8）
7. **事件必须派发到真实监听节点**：InputController 的 pointerup 挂在 canvas（down/up 都派 canvas，up 落 document 不达）；App 拖放监听为 canvas 原生 addEventListener（drop 探测派 canvas 而非 `.ed-viewport` 父容器）。（T5.8）
7b. **NumberField/NumberSlider 提交链可测（T5.9 解 T5.3 遗留）**：草稿与提交必须拆两个 evaluate——①本 evaluate：`inp.focus()` + 原生 value setter + `input` 事件（React 冲刷草稿）；②下一 evaluate：派 `new FocusEvent('focusout', { bubbles: true })`，React onBlur→commit 立即生效。同任务内连派 Enter 无效（commit 闭包读到批处理前的旧草稿，规则 9 的变体）；原生 `blur()` 真不产生 focusout，但**合成 focusout 与 keydown 同为冒泡委托、必达**。滑杆类「松手提交」控件对 `PointerEvent('pointerup')` 同理（NumberSlider 绑 onPointerUp 而非 change）。（T5.9）
8. **合成悬停会被真实事件重置**：合成 pointerover 后续真实 cua.move 触发 React enter/leave 链重算 hide——悬停断言期间禁真实鼠标事件。（T5.6）

## 三、断言时序

9. **交互后断言必须跨帧**：React 18+ setState 异步批处理，同一同步 evaluate 内 click 后立即读 DOM 必读旧值；store 真实数据经动态 `import('/src/ui/store.ts')` 读数验证始终最新。（T4.1/T5.3）
10. **轮询类读数以 FPS≥20 为有效性门槛**：1Hz 指标断言前先确认非冻结帧（冻结期轮询值陈旧，Triangles「增长」曾因此误报）。（T5.7）
11. **notice/Toast 断言注意 TTL 与读取时序**：4.5s 自动消失类提示要在窗口内读。（T5.5）

## 四、截图与视觉判读

12. **全屏 PNG 字节 diff 不可作 oracle**：场景逐帧微变淹没（99% 字节差异）；近景局部裁剪证据为准。（T5.1）
13. **截图桥偶发陈旧帧**：DOM present 但像素缺浮层——「同调用 DOM 读数 + 裁剪近景」双证裁决。（T5.6）
14. **远距 + JPEG 压缩易误报**：「无高亮/面板裁切」类疑点先局部放大或 DOM 实测洗清再立缺陷。（T5.1/T5.3）
14b. **截图桥陈旧缓存帧**：同页连拍可能返回与上一张**逐字节相同**的图（md5 一致）——存证前 md5 比对，重复帧作废：换新标签页重拍，或以已有同类证据替代（同会话 Shaded 模式即由早前截图代证）。（T5.9）

## 五、实操坑与归因纪律

15. **放置点击勿取视口过低位置**：射线俯角小 → 落点 z 极远，误判「模型未渲染」——先查属性面板坐标再怀疑渲染。（T4.1）
16. **保存/打开走真实管线**：URL.createObjectURL 钩子 + DataTransfer 注入，勿绕过序列化。（T3.4）
17. **疑点归因纪律**：疑似缺陷先洗清为自动化伪影（store 动态 import 读数 + git 基线二分 + 跨帧复验三件套），洗不清才立缺陷单走修复循环——历次会话半数疑点为伪影。（T4.1/T5.3/T5.7/T5.8）
17b. **拾取类疑点双探针定位法（T5.9）**：①`facade.pickObject` 全画布网格扫描（步长 20–40）量化「哪些类型/哪些区域可命中」；②**框选 vs 点选双路径判别**——pickInRect（锚点 bbox 投影）与 pickObject（射线）同源不同路，框选中而点选不中 ⇒ 缺陷锁定射线路径，渲染与包围盒数据即洗清。T5.8 观察项就此定级：「建筑不命中」为机位切换后旧坐标伪影，「模型不命中」为实例池射线拾取真缺陷（修复循环闭环）。（T5.9）

## 六、锁屏/深冻下的像素取证路径（T6.4 确立）

18. **宿主整体冻结（桌面锁屏）时的取证链**：IAB 全通道僵死（rAF 探针=0、截图桥 30s 超时、cua.scroll 超时、真实 click 不解冻）且系统浏览器标签 rAF 亦休眠时——①按 AGENTS.md 兜底拉起 threejs-devtools-mcp HTTP 变体（`run_js` 工具 = 页内任意 JS）；②**页内模块图直通**：`new Function('return import("/src/ui/store.ts")')()` 绕开 evaluate 转译限制（run_js 包装函数非 async，await 需 promise 链 + window 暂存跨调用读数）；③场景注入走真实管线（`SceneSerializer.deserialize → facade.openScene`），UI 动作可用 `session.setEnvironment({...getEnvironment(), renderMode})` 等与按钮同源的门面 API；④**强制单帧**：合成 `webglcontextlost` + `webglcontextrestored` 事件对触发 ContextLossWatchdog 恢复钩子 → `renderFrame()` 同步执行（不依赖 rAF，含分遍渲染全逻辑）；⑤**像素读回**：`canvas.toDataURL` 必须与强制帧**同一 run_js 任务**内调用（preserveDrawingBuffer=false 下缓冲跨任务即清）；跨进程取回用分块 slice（8KB/块）；JPEG 结构合法但部分解码器拒收时 GDI+（System.Drawing）转 PNG；⑥**菜单类 UI 是 toggle 状态机**：分步驱动时重复「点开按钮」即关闭，叶子项查找要等 React flush 跨任务再找（`.ed-menu__popup` 内）。MCP take_screenshot 在标签休眠时返回缓存帧（md5 同帧作废，规则 14b 变体）。（T6.4）

## 七、run_js 桥页通道执行纪律（T6.10 增补）

19. **草稿/提交类控件的「草稿→提交→读数」必须同一 run_js 任务**（规则 18⑤的 React 状态变体）：滑杆/NumberField 类控件草稿存 React 组件 state，跨任务分步时 pointerup/commit 闭包可能读到上一轮渲染的旧草稿（null/旧值）而不提交——曾造成图层透明度假阴性（提交未触发 + 顺手 undo 弹错栈顶，复活已删对象）。单任务内串联「设草稿(input)→提交(pointerup/focusout)→读 store+材质」一次成型；跨任务只做纯读数。（T6.10）

20. **带副作用的 run_js 脚本严禁双跑**：「脚本 && 同脚本 >/dev/null 取 promise 读数」的惯性对幂等读数安全，对含 undo/redo/放置/删除的脚本每次都真实生效——T6.10 两次事故均为此（undo 弹掉 DeleteCommand 复活粘贴副本 ×1、双跑 undo 复活整批已删模型 ×5）。副作用脚本单跑；读数用独立只读脚本跨任务取。（T6.10）

21. **单条历史断言三件套**：对象计数变化 + canUndo/canRedo 迁移 + undo×1 恰复原（再 redo×1 复现）——粘贴/删除/导入/透明度提交均按此证「恰一条 Command」，不依赖 HistoryManager 内部栈长（无公开读口）。（T6.10）

## 八、深冻下性能与像素取证口径（T6.10 增补）

22. **帧性能测量双口径**：强制帧（contextlost/restored 事件对）≈215ms/帧是 **ContextLossWatchdog 恢复路径成本**（含上下文恢复开销），不可当渲染循环成本；真实帧成本用 `renderer.renderFrame()` 直调循环计时（11 对象场景基线 1.73ms/帧、顶点拖拽中 0.8ms/帧）；FPS 验收在冻结环境采「tick 补丁逻辑帧证明（每强制帧恰 +1）+ 同步帧成本等效容量 + 拖拽事件吞吐（ms/事件）」三证口径，并在报告中注明冻结限制。（T6.10）

23. **PNG 取证两坑**：①chunk 长度字段是**大端**（readUInt32BE）——小端解析会把完好 PNG 误报为损坏（ zlib inflate "unexpected end of file" 先用解析器字节序自查再判传输损坏；与 18⑤"曾误判实际完好"互为镜像）；②分块取回用页内 djb2 校验和与本地重组值比对，一致即传输无损，损坏定位先怀疑解码端。（T6.10）

24. **视觉判读空间定位不可靠时的确定性替代**：远距/小目标在 analyze_image 里位置常被误述（导入楼被描述为"角落空"）——先用页内投影（world→NDC→canvas 像素）算出目标屏幕坐标，再本地解码 PNG 对该坐标邻域采样色块（uniq 颜色数 + 主色占比）做裁决；视觉分析仅作辅助。（T6.10）

25. **DOM 类证据深冻下不可像素化**：take_screenshot 返回 88×88 调试指示器碎片（非整页）；DOM 面板（预设网格/菜单等）验收以 DOM 断言读数（元素计数/aria 位/class 位）代证并在报告注明限制，待解冻后可用 IAB 补拍（分辨率亦更佳）。（T6.10）

## 九、通道与投影标定（T7.8 二次中断会话增补）

26. **node_repl → IAB evaluate 传输雷区**：`playwright.evaluate` 对某些载荷间歇性报 "Unexpected token '}'"（同内容重试可过、长细胞/块体函数/CJK 输入更易触发）——证据：同细胞 verbatim 重试约三成即过，>2.5KB 批量细胞几乎必败，1–2KB 单行细胞最稳。对策（按优先级）：①短单行字符串 + 简写箭头（无块体）；②选择器只用 ASCII（`header button` / `[role=menuitemradio]` + 索引，CJK 匹配靠读回 textContent 输出方向安全）；③跨任务两步走（点按钮→下一任务点叶子项，React flush 跨任务才可见，规则 18⑥ 同源）；④失败即重试 1–3 次或微变体重试；⑤多步序列用 ~1.5–2KB 批量细胞内置 `step()` 自动重试（650ms 间隔，>4KB 必拆）。块体返回值若为 DOMRect 等原型属性对象会序列化为 `{}`——先转普通对象。

27. **MCP 桥页 = IAB 深冻的完整替代通道**：`threejs-devtools-mcp` HTTP 变体的桥标签页是同构建的独立编辑器实例（origin=9299，独立 localStorage）——IAB 深冻时整条验收流可在桥页走完。要点：①`run_js` 不回传 Promise 结果——副作用照跑，读数用紧跟的独立 run_js（规则 20 同源纪律）；②脚本**文件化**最稳（`.zcode/investigate/t78-*.js` + `t78-mcp.sh` curl 封装，python 组 JSON 载荷+SSE 解析）；③`take_screenshot` 默认返回 200×140 缩略图，**必须传 `width/height`**（如 1280×720）但只截主 WebGL 画布区（无 DOM 面板——UI chrome 证据仍需 IAB）；④桥页 `location.reload()` 会掉桥——重开 `http://localhost:9299`（系统浏览器同 profile，localStorage :9299 保留）数秒后自动重挂；⑤桥页 localStorage 跨 reload 存活可先写 marker 探测，持久化往返测试在桥页有效。

28. **合成 PointerEvent 与指针捕获 API**：非激活 pointerId 调 `setPointerCapture`/`releasePointerCapture` 抛 NotFoundError 并**中断监听器后续语句**（规则 6 的 OrbitControls 变体，MinimapRenderer onPointerDown 同样中招——this.pointer 未赋值、up 早退、导航静默不触发）。对策：派发前实例级 no-op 覆写 `cv.setPointerCapture = function () {}; cv.releasePointerCapture = function () {};`（按钮真实代码路径其余部分照走，本会话小地图点击/拖拽导航实证）；pointerId 仍用 1。

29. **groundPoint 屏幕标定法（世界点→像素反解）**：无 worldToScreen 端口时，取 canvas 中心与 +100px 两向三探针 `facade.groundPoint`（EditorHandle 组合根超集真实可达）解 2×2 仿射逆——顶视（透视相机正上+1e-3 偏轴）下双轴严格线性（实测 0.211–0.285 m/px），反解精度 4mm（道路节点命中）。两坑：①a1/a2 已是「每 100px」基，`sx=(ex·a2.z−ez·a2.x)/det` 直接出像素，**勿再乘 100**；②相机 setMode/focusObjects 后立即标定可能撞过渡态（近奇异/零增量）——先远角四点采样验证双轴独立再解；冻结期块体细胞的「零增量」读数多为传输污染（规则 26），简写单点采样为准。

## 十、three 实例与 runtime 后门（T7.8 三次中断会话增补）

30. **three 双实例雷区与 RuntimeObjectMap 后门**：①`window.__THREE__` 只是版本号字符串（r150+ three 自置），不是命名空间；②Vite 依赖优化 URL 带 `?v=<hash>` 查询串——`import('/node_modules/.vite/deps/three.js')`（无查询串）会得到**第二个 three 实例**（console 出 "Multiple instances of Three.js" 警告即为标志），prototype patch 打在错误类上静默无效；正确 URL 从 `performance.getEntriesByType('resource')` 里取页面实际加载的带 hash 版本；③合成 webglcontextlost/restored 强制帧（规则 18④）在桥页未复现（疑似 StrictMode 双挂载 watchdog 挂在已分离 canvas），**替代路径**：`facade.camera`（CameraController 实例）`.map`（RuntimeObjectMap）`.byId`（私有 Map，TS private 仅类型层）直达全部 THREE.Object3D，任一对象 `.parent` 链反查主场景 root——绕开 renderer 绑定问题（MCP renderer_info 可能误绑缩略图快照器离屏上下文：kickThumbnail 新建 WebGLRenderer 会抢桥的绑定，200×140 即其特征）；④**缩略图回填机制**：`loading=lazy` 是网络层延迟，占位→真实替换由首次交互（点卡/拖放）`kickThumbnail` 触发离屏快照生成 `data:image/png`——验收「真 PNG 数」=已交互资产数；隐藏标签页（visibilityState=hidden）原生 lazy 按规范推迟网络加载，非懒加载缺陷（对照非 lazy 同 URL 秒载即可洗清，规则 17 归因纪律变体）。

31. **MCP HTTP 桥上下文绑定雷区（T8.4）**：多 WebGLRenderer 页面（主视口+轴指示器+小地图）下，桥绑定的是**小地图上下文**（最后创建者）——renderer_info 读到 200×140 canvas、calls=0，take_screenshot 只截到小地图画面（还会向项目根 screenshots/ 落垃圾文件）。主视口取证替代法：**run_js 页内缩小快照**——强制单帧（合成 webglcontextlost/restored 事件对，规则 18④）后同任务 drawImage 主画布（取 clientWidth×clientHeight 最大者）到 480 宽离屏 canvas → toDataURL 单次取回（~76KB 字符串可整传；MCP 文本结果带 JSON 引号需再 parse 一次）。run_js 包装语义：**需显式 return**（尾表达式返回 undefined）、**非 async**（Promise 结果必须 window 暂存跨调用读数，规则 18② 同源）、副作用语句与读数语句分文件两步走。
32. **three r186 info.reset 口径（T8.4）**：info.reset() 在每次 render() **开头**执行——多遍渲染模式（wireframe/xray/clay/normals/islands）下帧间读 renderer.info 只剩**末遍**（辅助遍，无活动 gizmo 时 calls=0/tris=0），状态栏 Triangles 读数在诊断/线框档显示 0——T6.4 起既有口径非回归（shaded 单遍不受影响）。逐遍 draw call 取证需 in-render 钩子或临时 autoReset=false 窗口；T8.6 若需性能口径实测按此办理。

## 十一、T8.6 首会话增补（合成交互取证四坑）

33. **合成 pointermove 必须带 `button:-1`**：不带 buttons 字段的合成 move 在部分交互路径被当作「带键拖拽」误分类；合成悬停/拖拽中转事件统一 `{ pointerId: 1, button: -1, buttons: 按需 }`（down 后 buttons=1、纯 move buttons=0 且 button=-1）。（T8.6 A 组）
34. **dragEndCb 微任务异步——up 同任务读数为旧值**：gizmo.onDragEnd 回调经 queueMicrotask 聚合（TransformTool.flushGesture），同一次 run_js 任务里 pointerup 后立即读场景 transform/command 栈必得**提交前旧值**——提交断言必须跨任务读数（独立只读脚本，规则 20 同源纪律）。（T8.6 A 组）
35. **合成交互累计致 gizmo 拾取衰减——fresh 判别实验定案伪影**：同一会话长序列合成 down/move 后 gizmo 轴柄拾取灵敏度下降，疑点先立「fresh 判别实验」——重载页面后单步复现同一拖拽，若 fresh 下正常即合成事件累计伪影（TransformControls 内部 pointer 态残留），非产品缺陷。（T8.6 A 组）
36. **正视中心区 Z 柄投影占据**：透视正视（前视）下变换 gizmo 的 Z 轴柄投影与 XY 平面柄在画布中心区重叠——「中心区点选命中 X 柄实为 Z 柄」类读数异常先做投影占据排查（页内 world→NDC→像素反解验证柄位置），再怀疑拾取缺陷。（T8.6 A 组）

## 十二、T9.3 会话增补（陈旧服务与通道降级两课）

37. **跨会话遗留 dev server 的 304 陈旧混合模块**：上个会话启动的 dev server 在本会话继续服务时，页面可能经 `?t=<HMR 时间戳>` URL + HTTP 304 再验证吃到**变换缓存/浏览器缓存的陈旧混合模块集**——症状极具迷惑性：同一文件内新旧代码并存（T9.1 实例：文件下拉已 portal 而子弹层仍 inline 渲染，fiber 链缺 HostPortal 层、AnchoredPopup 组件 fiber 缺失=挂的是旧版组件闭包），且 curl 服务端模块源码是新的（每请求重变换掩盖缓存）。**判别法**：DOM 矛盾时先 `performance.getEntriesByType('resource')` 查模块 URL 是否带 `?t=`（带=继承自 HMR 失效链）+ transferSize≈300（304 再验证）；**根因二分**：重启 dev server + 硬刷新（带 query 的 goto）后复测——复现即真缺陷、消失即缓存伪影（规则 17 变体，T9.3 实例洗清一次）。**预防**：验收会话一律重启 dev server，不沿用跨会话遗留进程。
38. **截图桥会话中退化与强制帧通道的适用边界**：IAB 截图桥（tab.screenshot）可在会话中途进入持续失败态（"activity capture failed for guest"/30s 超时/僵尸三种交替，换标签页仅偶发恢复）——DOM chrome 证据改用「DOM 断言读数+elementFromPoint 命中测试」双证（规则 25 扩展：命中测试即真实叠放次序，比截图更确定性；注意 pointer-events:none 元素（tooltip）天然被命中测试跳过，其叠放用「z 参与链推理」（祖先 z 全 auto + 自身 z 值 = 根层参与者对比）代证）。**视口像素证据走强制帧通道**（规则 18④ contextlost/restored + 同任务 drawImage/toDataURL）——rAF 死亡（深冻/后台标签）不影响其可用性，且 SHA-256 在页内算避免大字符串传输；连续帧稳定性证明用「多次独立 evaluate 各强制一帧 + md5 比对」（同任务连拍会拿到同一帧）。"activity capture failed" 期间 playwright.evaluate 通道完全健康。（T9.3 A/B 组全程实证）
