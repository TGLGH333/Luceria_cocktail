# Luceria iPad 应用 · 前端开发方案

> 版本：1.0 ・ 2026-11-15
> 目标：**Windows 本地开发 + PWA + 后天在 iPad 上演示**
> 依据：`Figma_design/` 下的开发指南、README、tokens、prototype-links、01 Foundations、02 Components、11 Handoff，以及 82 张基础屏幕 PNG。
> 原则：设计稿是唯一视觉依据；本文只裁剪实现范围，不改变设计语言。凡是推断/取舍，标注 **[实现建议]** 或 **[取舍]**。

---

## 0. 结论先行

- **不做原生 iOS**：没有 Mac/开发者账号，明天来不及；用 **PWA**。
- **不做 82 屏**：只做一条能讲清楚的演示线，7 个 P0 页面 + 2 个 P1 页面。
- **不做完整后端**：本地 mock 数据优先，后端 API 有就接、没有就 fallback，前端不能等后端。
- **技术栈**：Vue 3 + Vite + TypeScript + Pinia + Vue Router（hash）+ `vite-plugin-pwa`；用最熟的一套，不要临时学新框架。
- **交付形态**：Netlify/Vercel 免费 HTTPS；iPad Safari 打开 → 添加到主屏幕 → 全屏横屏演示；离线可开。

**两天目标**

| 时间 | 目标 |
|---|---|
| 今晚 2–3 小时 | 脚手架、tokens、AppShell、TabBar、部署空壳，iPad 能打开 |
| 明天一整天 | 7 个 P0 页面 + 数据/交互 + PWA/离线 + iPad 实测 |
| 后天早上 | 只排练、备份、重置数据，不再改功能 |

---

## 1. 文件依据与设计事实核对

### 1.1 本文实际依据的文件

| 文件 | 用途 |
|---|---|
| [DEVELOPER_GUIDE.md](Figma_design/DEVELOPER_GUIDE.md) | 前端 2.1–2.7：令牌、布局、配色、动效、无障碍 |
| [README.md](Figma_design/README.md) | 产品定位、屏幕目录、82 屏/5 流程/409 交互 |
| [tokens.json](Figma_design/data/tokens.json) | 颜色三模式、15 个文字样式、阴影、间距、圆角、屏幕尺寸 |
| [prototype-links.json](Figma_design/data/prototype-links.json) | 5 条流程、409 个交互、转场类型 |
| `Figma_design/pages/01_Foundations.png` | 颜色板、对比度表、字体、间距、HC 模式、插画/图标规则 |
| `Figma_design/pages/02_Components.pdf` | Button、Round button、Chip、Segmented、Stepper、Toggle、Status、Pill card、Recipe tile、Search、Rating、Tab bar、Toast |
| `Figma_design/pages/11_Handoff.png` | 布局数值、交互、无障碍、Hero 规则、素材清单、6 款配方数据 |
| `Figma_design/screens/` | 82 张基础屏幕 PNG；页面规格的直接来源 |
| `Figma_design/screens/09_themes/` | Dark/Light/High contrast 主题与 Hero 变色对照 |

### 1.2 屏幕清单（来自 `screens/`）

| 分组 | 数量 | 屏幕 |
|---|---|---|
| 03_onboarding | 12 | `L01_splash`、`L01a_splashStart`、`L02_welcome`、`L03_age`、`L03b_zeroProof`、`L04_bar`、`L05_taste`、`L06_comfort`、`L07_notify`、`L08_signin`、`L09_email`、`L10_code` |
| 04_tonight_recipes | 17 | `T01_tonight`、`T01b_tonightAlt`、`T02_tonightEmpty`、`T03_firstRun`、`R01_recipes`–`R05_loading`、`D01_recipe`–`D06_saved`、`N01_notifications`、`U01_profile` |
| 05_mixing | 14 | `M00_overview`–`M12_done`（含 `M06p_paused`、`M09_allSteps`、`M10_voice`、`M11_stop`） |
| 06_bar_shopping | 9 | `B01_bar`–`B05_detail`、`S01_list`–`S04_listEmpty` |
| 07_journal_party_learn | 14 | `J01_journal`–`J04_editor`、`C01_stories`–`C02_story`、`K01_learn`–`K02_ice`、`P01_party`–`P04b_wheelResult` |
| 08_settings_system | 16 | `X01_appearance`–`X11_deleteConfirm`、`A01_largeText`、`A02_voiceOver`、`Y01_offline`–`Y03_whatsNew` |
| **合计** | **82** | 与 README 的“82 个屏幕”一致 |

`09_themes/` 另有 34 张浅色/高对比度/Hero 变色对照图；不做新页面，只做主题验收。

### 1.3 固定布局数值（来自指南 2.3 / 11 Handoff / tokens）

| 项 | 值 |
|---|---|
| 画板 | 1194 × 834 pt，横屏；竖屏 834 × 1194 |
| 左右边距 | 40 pt；内容从 y 48 开始；状态栏 24 pt |
| 浮动标签栏 | 560 × 68 pt，水平居中，距底部 28 pt |
| 内容底部内边距 | 120 pt（滚动内容从 TabBar 下方穿过） |
| 触控目标 | 最小 44 pt；普通按钮 52；大按钮 60；调酒页底部按钮 88 |
| 配方网格 | 4 列 × 266 pt，间距 16；分屏 < 900 pt 时 3 列 / 单列 |
| Hero | 满版 540 pt 高；渐变；右侧插图 380 × 370；文案块从 y 152 开始；按钮行底部 y ≈ 482；“Also ready”从 y 546 开始，间距 64 |
| 画板 token | `screen.w=1194`、`h=834`、`portraitW=834`、`portraitH=1194`、`margin=40`、`status=24` |

### 1.4 原型数据（来自 `prototype-links.json`）

| 项 | 数值 |
|---|---|
| 流程 | 5 条：First launch & onboarding、Tonight → recipe → guided mixing、My bar & shopping list、Journal/community/party/learn、Settings & accessibility |
| 交互 | 409 个 |
| 动作 | `navigate` 370、`back` 39 |
| 转场 | `instant` 202、`DISSOLVE` 94、`MOVE_IN` 72、无转场 39、`SMART_ANIMATE` 2 |
| 触发 | `ON_CLICK` 403；`AFTER_TIMEOUT` 6（0.5、1.2、1.6、2、2.5、3 秒） |
| 涉及屏幕 | 82 个 |

> 前端只把 `instant / DISSOLVE / MOVE_IN / SMART_ANIMATE` 映射为 CSS；不为 409 条交互逐条写死，按页面/组件统一规则实现。

### 1.5 设计稿中需要先统一的冲突

这些冲突会影响前端文案/数据，**不要自己在代码里猜**：

| # | 冲突 | 建议 |
|---|---|---|
| 1 | Negroni 时间：`D01`/`T01` 为 2 min，`M00` 写 “About 3 min” | 以配方数据表为准；演示统一 2 min |
| 2 | Mojito 时间：只有 `T02` 标 5 min，其他屏未标 | 数据表统一 5 min 或由内容确认 |
| 3 | Margarita 杯型：11 Handoff 写 Old-fashioned，插图是 coupe | 以插图/设计评审为准，前端只显示数据 |
| 4 | ABV：只有 Negroni 21.6%、Mojito ≈12% 有明确值 | 其他配方不要编；显示 “—” 或数据表补齐 |
| 5 | 120 classics vs 设计只画 7 款 | 演示用 6–9 款 mock；标题用真实数量，不硬写 120 |
| 6 | `B01` “15 ingredients · 7 cocktails ready” | 7 是设计 mock；mock 数据要构造出 7 个 ready，或显示真实 computed 数 |
| 7 | `S01` “5 items · unlocks 6 cocktails” | 清单/解锁用 mock 计算，不写死 |
| 8 | `X01` App icon Amber/Ink | PWA 不能像原生一样换图标；**[取舍]** 本期不做 |
| 9 | `ASSET TODO` 标记 | 是开发提示，不是 UI；实现时不要画出来 |
| 10 | `B01` 15 材料不足以让 Whiskey Sour/Margarita ready（缺蛋清/agave） | mock 增补材料或把这两项标 optional；否则 7 不可复现 |

### 1.6 素材现状

- 设计指南第四部分明确：多数酒插图来自原仓库，**质量/风格不达标，只能作为位置和尺寸参考**；`ASSET TODO` 共 13 项。
- `screens/` 里是**整屏截图**，不是可用的透明杯子素材；不要直接把整张 PNG 当 Hero 图。
- **[实现建议]** 演示优先用：`drink/<id>` 渐变 + 简单玻璃杯 SVG 占位；如果 Figma 有导出权限，再导出 6 款单杯透明 PNG。不要使用 Difford's 照片。
- 图标：Foundations 说明是 Lucide 风格线性图标，1.6 px 线宽、20/24 px；没有独立文件，用内联 SVG 重绘/选用同风格图标。

---

## 2. 范围：只做演示闭环

### 2.1 演示脚本（2 分钟）

1. `Welcome` → 进入。
2. `My Bar`：点选材料，故意让 Fresh mint = Out。
3. `Tonight`：显示 7 个 ready、Also ready；点 Negroni。
4. `Recipe`：2 drinks、60 ml；切 oz；点 Start mixing。
5. `Mixing`：走 2–3 步，其中一个 20 s 计时；完成。
6. `Done`：4 星 + Just right + 保存到日记。
7. `Journal`：4 drinks · 3 nights；点设置。
8. `Settings`：切 Light → High contrast；字号 135%。
9. 收尾：PWA 可离线，范围外是登录/社区/OCR。

### 2.2 页面优先级

| 优先级 | 页面 | 依据屏幕 | 说明 |
|---|---|---|---|
| P0 | Welcome / 年龄门 | `L01`、`L02`、`L03`、`L03b` | 可合并成一个 Welcome；年龄门可选 |
| P0 | My Bar | `L04`、`B01`、`B02`、`B05` | 15 个材料、四档、下一瓶 |
| P0 | Tonight | `T01`、`T01b`、`T02`、`T03` | Hero、Also ready、空态 |
| P0 | Recipe | `D01`、`D02`、`D03` | 份数/单位/配料/步骤/替代 |
| P0 | Mixing | `M00`–`M12` | 计划、备料、步骤、计时、完成 |
| P0 | Done / Journal | `M12`、`J01` | 评分、口味、笔记、周统计 |
| P0 | Settings | `X01`、`X02`、`X06`、`X08` | 主题、字号、单位、重置 |
| P1 | Recipes 列表 | `R01`–`R05` | 4 列网格、搜索、筛选、空态 |
| P1 | Shopping List | `S01`–`S04` | 清单、解锁、空态；可只做空态 |
| P2 | Profile | `U01` | 38/11/6、设置入口 |
| 不做 | 登录/社区/派对/学习/通知/删除账号 | `L05`–`L10`、`C*`、`K*`、`P*`、`N01`、`X07`、`X09`–`X11` | 答辩讲范围外 |

### 2.3 明确不做

- 不做原生 SwiftUI/Xcode/TestFlight。
- 不做登录、注册、邮箱验证码。
- 不做社区、故事、评价、派对、游戏、学习内容。
- 不做真实 OCR、语音识别、推送、定位。
- 不做 120 款配方、82 屏全部页面。
- 不做 PWA 换 App 图标、原生触感、APNs。
- 不做复杂动画库/3D/视频背景。

### 2.4 完成标准

- 7 个 P0 页面可导航，TabBar 五个入口不白屏。
- 一条完整演示线可走通，刷新后数据保留。
- 三主题可切，字号放大不截断。
- iPad 添加到主屏幕后全屏横屏，飞行模式可打开。
- 有 2 分钟录屏和截图备份。

---

## 3. 技术方案

### 3.1 技术栈

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | Vue 3 + Vite | 设计指南的 Web 映射是 Vue；原仓库也是 Vue |
| 语言 | TypeScript | 类型能减少改数据时的错误；不熟可用 JS |
| 路由 | Vue Router 4，**hash 模式** | 静态托管不用配 404；刷新不白屏 |
| 状态 | Pinia + `pinia-plugin-persistedstate` | 吧台/日记/设置需要持久化 |
| 样式 | 原生 CSS + CSS 变量 | 令牌驱动，避免 UI 库覆盖设计 |
| 字体 | `@fontsource/inter` | 本地打包，离线可用 |
| PWA | `vite-plugin-pwa` | manifest + Workbox 预缓存 |
| 图标 | 内联 SVG | 避免网络依赖；贴合 1.6 px 线性风格 |
| 部署 | Netlify（首选）或 Vercel | 免费 HTTPS、拖拽部署、快 |

不推荐：Nuxt/Next（SSR 对纯前端演示无收益）、Tailwind（会引入另一套间距/颜色体系，和 tokens 冲突）、大型动画库（时间和性能都不划算）。

### 3.2 目录结构

```text
luceria-pwa/
├─ public/
│  ├─ icons/icon-192.png
│  ├─ icons/icon-512.png
│  └─ apple-touch-icon.png
├─ src/
│  ├─ main.ts
│  ├─ App.vue
│  ├─ router.ts
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ base.css
│  │  └─ layout.css
│  ├─ components/
│  │  ├─ AppShell.vue
│  │  ├─ TabBar.vue
│  │  ├─ AppButton.vue
│  │  ├─ IconButton.vue
│  │  ├─ Pill.vue
│  │  ├─ RecipeCard.vue
│  │  ├─ BarCard.vue
│  │  ├─ StepTimer.vue
│  │  ├─ RatingStars.vue
│  │  ├─ ToastHost.vue
│  │  └─ BottomSheet.vue
│  ├─ views/
│  │  ├─ WelcomeView.vue
│  │  ├─ BarView.vue
│  │  ├─ TonightView.vue
│  │  ├─ RecipesView.vue
│  │  ├─ RecipeView.vue
│  │  ├─ MixView.vue
│  │  ├─ JournalView.vue
│  │  ├─ ListView.vue
│  │  └─ SettingsView.vue
│  ├─ stores/
│  │  ├─ useDemoStore.ts
│  │  └─ useToastStore.ts
│  ├─ data/
│  │  ├─ recipes.json
│  │  ├─ ingredients.json
│  │  └─ seed.ts
│  ├─ lib/
│  │  ├─ availability.ts
│  │  ├─ units.ts
│  │  ├─ storage.ts
│  │  └─ api.ts
│  └─ types.ts
├─ index.html
├─ vite.config.ts
└─ package.json
```

### 3.3 初始化命令

```bash
npm create vite@latest luceria-pwa -- --template vue-ts
cd luceria-pwa
npm i vue-router pinia pinia-plugin-persistedstate @fontsource/inter
npm i -D vite-plugin-pwa
npm run dev -- --host
```

`npm run dev -- --host` 只是让 iPad 在局域网快速看布局；**Service Worker/相机/安装必须在 HTTPS 部署地址上测**。

### 3.4 部署

- `npm run build` → `dist/`。
- Netlify Drop 拖 `dist/`；或连 GitHub 自动构建。
- Netlify 免费 HTTPS 域名即可，不需要自定义域名。
- 路由用 hash，不需要 `_redirects`。
- 每次部署生成新版本；演示前完成最后一次部署，演示中不更新。

---

## 4. 设计系统：严格使用 tokens

### 4.1 令牌管线

`tokens.json` 是唯一颜色/字号/间距来源。实现时转换为 CSS 变量：

```css
:root[data-theme="dark"] {
  --bg-base: #121110;
  --bg-elevated: #282522;
  --fill-1: #1D1B19;
  --fill-2: #282522;
  --fill-3: #3A3530;
  --text-primary: #F4F0E9;
  --text-secondary: #ACA59B;
  --text-tertiary: #8A837A;
  --accent: #F0A64B;
  --accent-on: #1A1206;
  --line-subtle: #2F2C29;
  --line-strong: #4A4540;
  --focus-ring: #8CC0F0;
  --status-ready: #8FC27A;
  --status-missing: #EFA54A;
  --status-danger: #F08A7A;
  --status-info: #8CC0F0;
  --outline-hc: rgba(255, 255, 255, 0);
  --scrim: rgba(0, 0, 0, 0.6);
}
```

**规则**

- 组件里只写 `var(--token)`，禁止写死 hex。
- 主题切换只改 `<html data-theme="...">`。
- `bg/clear` 用于“渐变到透明”，不要写 `#00000000`，否则浅色模式会出现灰边。
- `outline/hc` 在 Dark/Light 的 alpha 是 0，HC 是白色 1；所以容器统一写 `border: 1.5px solid var(--outline-hc)`，不需要条件判断。
- High contrast 下 Hero 背景纯黑，不显示 glow。

### 4.2 核心颜色（三模式）

| Token | Dark | Light | High contrast |
|---|---|---|---|
| `bg/base` | `#121110` | `#F7F6EF` | `#000000` |
| `bg/elevated` | `#282522` | `#FFFFFF` | `#000000` |
| `bg/sunken` | `#0C0B0A` | `#EEF1E4` | `#000000` |
| `fill/1` | `#1D1B19` | `#FFFFFF` | `#000000` |
| `fill/2` | `#282522` | `#EEF1E3` | `#000000` |
| `fill/3` | `#3A3530` | `#DFE6CF` | `#3D3D3D` |
| `fill/glass` | `#FFFFFF` 10% | `#FFFFFF` 72% | `#FFFFFF` 18% |
| `line/subtle` | `#2F2C29` | `#E3E6D8` | `#5C5C5C` |
| `line/strong` | `#4A4540` | `#C6CDB6` | `#BDBDBD` |
| `text/primary` | `#F4F0E9` | `#1A1C17` | `#FFFFFF` |
| `text/secondary` | `#ACA59B` | `#4D5348` | `#FFFFFF` |
| `text/tertiary` | `#8A837A` | `#6A7064` | `#E0E0E0` |
| `text/onAccent` | `#1A1206` | `#FFFFFF` | `#000000` |
| `accent/default` | `#F0A64B` | `#4E6B35` | `#FFD60A` |
| `accent/soft` | `#F0A64B` 16% | `#4E6B35` 12% | `#FFC266` 24% |
| `accent/gold` | `#F2B04F` | `#B0801E` | `#FFD60A` |
| `status/ready` | `#8FC27A` | `#3C6B26` | `#7DFF8F` |
| `status/missing` | `#EFA54A` | `#8F5D0C` | `#FFB340` |
| `status/danger` | `#F08A7A` | `#B23A2A` | `#FF9C8C` |
| `status/info` | `#8CC0F0` | `#2B67A6` | `#A9D2FF` |
| `focus/ring` | `#8CC0F0` | `#2B67A6` | `#40C8FF` |
| `bg/clear` | `#121110` 0% | `#F7F6EF` 0% | `#000000` 0% |
| `scrim` | `#000000` 60% | `#1A1C17` 30% | `#000000` 80% |
| `ink/illustration` | `#F4F0E9` | `#2F4A2E` | `#FFFFFF` |

### 4.3 酒色与光晕（Hero 用）

| 酒 | `drink/*` Dark | `drink/*` Light | `glow/*` |
|---|---|---|---|
| negroni | `#2E1C1D` | `#F4E2DA` | `#D0533F` |
| margarita | `#2C221F` | `#F6E8D8` | `#D9734F` |
| mojito | `#2A281D` | `#F3EECB` | `#A3B85A` |
| russian | `#1C2128` | `#E4E9EC` | `#6F8FB3` |
| sour | `#2C2419` | `#F5EACB` | `#D9A05B` |
| cosmo | `#2E1C24` | `#F3E1E6` | `#C9577A` |
| colada | `#2B2920` | `#F2F0D6` | `#D9C27A` |

- HC 下所有 `drink/*` = `#000000`，glow 全透明。
- Hero 渐变：`linear-gradient(180deg, var(--drink) 0%, var(--bg-base) 60%)`。
- glow：径向渐变，约 30% 不透明度，放在插图后；HC 不显示。
- 按钮/胶囊/标签栏永远用 `accent` + 中性色，不随酒变色。

### 4.4 字体（Inter，15 个样式）

| Token | 样式 | 字号/行高/字距 |
|---|---|---|
| `display` | Display/Hero, Bold | 88 / 92 / -2 |
| `displayM` | Display/Step, Semi Bold | 56 / 64 / -1.5 |
| `title1` | Title/1, Bold | 40 / 46 / -1 |
| `title2` | Title/2, Semi Bold | 24 / 30 / -0.5 |
| `title3` | Title/3, Semi Bold | 20 / 26 / -0.3 |
| `headline` | Headline, Semi Bold | 17 / 22 / -0.2 |
| `body` | Body, Regular | 17 / 24 / -0.2 |
| `callout` | Callout, Regular | 18 / 26 / -0.2 |
| `subhead` | Subhead, Regular | 15 / 20 / 0 |
| `subheadM` | Subhead/Medium, Medium | 15 / 20 / 0 |
| `footnote` | Footnote, Regular | 13 / 18 / 0 |
| `caption` | Caption, Medium | 11 / 14 / 0 |
| `overline` | Overline, Semi Bold | 13 / 16 / +12 |
| `timer` | Numeric/Timer, Light | 72 / 76 / -2 |
| `number` | Numeric/Large, Light | 44 / 48 / -1 |

**Web 实现**

- 字体权重：300/400/500/600/700；`@fontsource/inter` 本地引入。
- 用 `rem`，基准 16 px：88 px = 5.5rem，17 px = 1.0625rem；设置页调整 `html { font-size: calc(16px * var(--text-scale)); }`。
- Display 可用 `clamp(56px, 7.4vw, 88px)`，但大字号下必须允许换行/堆叠（`A01`）。
- 不要用全大写做正文；只有 `overline` 使用大写/宽字距。

### 4.5 间距、圆角、阴影

| 类别 | 值 |
|---|---|
| 间距 | `xxs 4`、`xs 8`、`sm 12`、`md 16`、`lg 24`、`xl 32`、`xxl 40`、`x3 56` |
| 圆角 | `sm 8`、`md 14`、`lg 20`、`xl 28`、`pill 999` |
| Elevation/Card | `0 2px 8px rgba(0,0,0,.18)` |
| Elevation/Floating | `0 12px 32px -4px rgba(0,0,0,.28)` |
| Elevation/Sheet | `0 24px 64px -8px rgba(0,0,0,.36)` |
| Focus/Ring | `0 0 0 3px rgba(140,192,240,1)` |

- 卡片圆角 20；Pill 999；Sheet 顶部 28；按钮 999。
- 阴影只用于卡片/浮层/Sheet，不要给每个文字加阴影。
- 焦点环用 `focus/ring`，3 px；键盘/开关都要可见。

### 4.6 组件基线（来自 `02_Components.pdf`）

`02_Components` 第 1 页给出的组件：

- **Button**：Primary / Secondary / Destructive，三种尺寸；常规 52、Large 60、Mixing 88；最小触控 44。
- **Round button**：44/52 圆形图标按钮。
- **Chip**：筛选/选择胶囊。
- **Segmented**：ml/oz、Any/Stirred/Shaken 等。
- **Stepper**：`- 2 drinks +`。
- **Toggle**：开/关。
- **Status**：`Ready · 2 min`、`Need fresh mint`，图标 + 文字，绝不只用颜色。
- **Pill card / Recipe tile / Thumb**：横条卡、网格卡、缩略图。
- **Search field + check**：搜索框、勾选状态。
- **Rating interactive**：1–5 星。
- **Asset slot**：图片占位，带 ASSET TODO 提示（实现时不要显示提示）。
- **Tab bar**：560 × 68，浮动，选中项 accent 图标 + 中性 pill。
- **Toast**：`Saved to your journal` + Undo；`You're offline. Recipes still work.` + Retry。

### 4.7 CSS 变量命名

| 设计 token | CSS 变量 |
|---|---|
| `bg/base` | `--bg-base` |
| `text/primary` | `--text-primary` |
| `accent/default` | `--accent` |
| `text/onAccent` | `--accent-on` |
| `fill/1` | `--fill-1` |
| `line/subtle` | `--line-subtle` |
| `drink/negroni` | `--drink-negroni` |
| `glow/negroni` | `--glow-negroni` |

按此规则批量生成；不要手动维护两套颜色。

---

## 5. 布局与响应式

### 5.1 App Shell

```css
html, body, #app { height: 100%; }
body {
  margin: 0;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: Inter, -apple-system, sans-serif;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}
.app {
  height: 100dvh;       /* 旧 iPad 加 100vh fallback */
  overflow: hidden;
  padding-top: env(safe-area-inset-top);
}
.screen {
  height: 100%;
  overflow-y: auto;
  padding: 24px 40px 120px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}
```

- 内容左右 40；顶部 24 状态栏 + 24 内容间距；底部 120 给 TabBar。
- 不要做假的 9:41/100% 状态栏；PWA 会显示系统状态栏。`L01` 等截图里的状态栏是 iPad 系统，不是 UI。
- 不要做假的 Home Indicator；系统提供。
- 横屏为主；竖屏显示“请横屏使用”或简单重排，不在竖屏做完整布局。

### 5.2 TabBar

- `position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); width: 560px; height: 68px;`
- 圆角 999；背景 `fill/glass` + `backdrop-filter: blur(...)`；HC 下纯黑 + 1.5 px 白边。
- 5 项：Tonight、Recipes、My Bar、List、Journal；图标 24，label `caption` 11/14。
- 选中：accent 图标 + 中性 pill 背景（见 `02_Components`）。
- 内容滚动到 TabBar 下方，不遮挡；给 120 底部内边距。
- 每个 tab 保留自己的滚动位置：`<KeepAlive>` 或 store 记录 `scrollTop`。

### 5.3 Hero

- 满版 540 pt 高；背景 `linear-gradient(180deg, var(--drink) 0%, var(--bg-base) 60%)`。
- 文案块从 y 152 起；overline 13/16 +12；标题 `display` 88/92；描述 `callout` 18/26；pills 36–40 高。
- 按钮行在 y ≈ 482；Start mixing 52，View recipe 52，shuffle 44 圆钮。
- 右侧插图 380×370，底部与按钮行底部对齐；没有素材就放渐变 + SVG 杯型，尺寸保持。
- “Also ready tonight” 从 y 546 开始；与 Hero 间距 64；3 张横条卡。
- 大字号（A01）下：Hero 文案和插图堆叠，行变全宽；不要在 88 px 字号下强行并排。

### 5.4 配方网格

- 4 列 × `minmax(0, 1fr)`，gap 16；卡宽约 266（1194 时）。
- 封面比例约 4:3；圆角 20；名称 `headline` 17/22；状态 `footnote` 13/18。
- `<900px` 3 列；`<700px` 1 列。
- Bar 网格在 `B01` 是 5 列卡片；用 `repeat(auto-fill, minmax(180px, 1fr))`，在 1194 下自然接近 5 列。
- 卡片高度一致；不要用瀑布流。

### 5.5 分屏与响应式

- 设计支持分屏到 678 pt；PWA 演示主要全屏 1194×834。
- 断点：`>= 1024` 4 列；`768–1023` 3 列；`< 768` 1 列。
- 两栏页面（Recipe/Mixing/Settings/Journal）在 `< 900` 改为单栏；Hero 堆叠。
- 不要写死 `width: 1194px`；用 `max-width: 1194px; margin: 0 auto;`。
- iPad 10 是 1180×820，布局应自然收缩，不出现横向滚动。

### 5.6 安全区域

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

- PWA 全屏后状态栏可能覆盖内容；顶部至少 24 px。
- TabBar 底部 28 px + safe area；引导式访问下也要留。
- 不要把 TabBar 贴死底部 0。

### 5.7 大字号与文本缩放

- 设置页提供 100%、125%、135%、150%、175%、200%（`X02` 展示 135%）。
- 根字号缩放；标题用 `clamp`，正文自然换行。
- 大字号下：Hero 堆叠、横条卡全宽、按钮全宽、TabBar label 可隐藏只留图标（但要有 aria-label）。
- 禁止 `overflow: hidden` 截断文字；`text-overflow: ellipsis` 只用于单行列表标题。
- 测试 200% 无横向滚动、无重叠。

---

## 6. 信息架构与路由

### 6.1 路由表

| 路由 | 页面 | 依据屏幕 | 是否 Tab |
|---|---|---|---|
| `/welcome` | Welcome / 年龄门 | `L01`、`L02`、`L03`、`L03b` | 否 |
| `/tonight` | Tonight | `T01`、`T01b`、`T02`、`T03` | 是 |
| `/recipes` | Recipes 列表 | `R01`–`R05` | 是 |
| `/recipe/:slug` | 配方详情 | `D01`、`D02`、`D03`、`D04`、`D05`、`D06` | 否 |
| `/mix/:slug` | 调制流程 | `M00`–`M12` | 否 |
| `/bar` | My Bar | `L04`、`B01`、`B02`、`B05` | 是 |
| `/list` | Shopping List | `S01`–`S04` | 是 |
| `/journal` | Journal | `J01`、`J02`、`J03` | 是 |
| `/settings` | Settings | `X01`、`X02`、`X06`、`X08` | 否 |
| `/profile` | Profile（P2） | `U01` | 否 |

- 使用 `createWebHashHistory()`：`/#/tonight`；静态托管无 404。
- `/` 重定向到 `/welcome`；完成 Welcome 后写 `localStorage`，后续启动直接 `/tonight`（演示时可保留 Welcome）。
- TabBar 五项固定：Tonight → `/tonight`、Recipes → `/recipes`、My Bar → `/bar`、List → `/list`、Journal → `/journal`。
- Settings 从 Tonight 右上角头像/齿轮进入；不做 `U01` 时头像直接进 `/settings`。
- Recipe/Mixing 是 push 页面，不显示 TabBar；返回用页面左上角圆形按钮。

### 6.2 转场映射

| 原型值 | 前端实现 | 时长 |
|---|---|---|
| `instant` | 无动画，直接切换 | 0 |
| `MOVE_IN` | 新页面 `translateX(100%) → 0`，旧页轻微左移 | 300 ms ease-out |
| `DISSOLVE` | 透明度 0 → 1（登录/引导/弹层） | 200–250 ms |
| `SMART_ANIMATE` | Hero 酒名/背景 crossfade | 300 ms |
| `back` | 反向 `MOVE_IN` 或淡出 | 250–300 ms |
| Bottom sheet | `translateY(100%) → 0` + scrim 淡入 | 250 ms |
| Toast | 上浮/淡入，4 s 后消失 | 200 ms |

- Tab 切换按指南 2.6 用 `instant`，不要给每个 tab 加滑动。
- 减少动态效果开启时，所有转场改为 **150 ms 淡入淡出**。
- 返回时保留来源页滚动位置（特别是 Recipes/Journal）。
- 浏览器返回键/手势与应用内返回保持一致；用 `router.back()`。

### 6.3 滚动位置

- 四个 Tab 页面保持各自滚动位置：用 `<KeepAlive>` 包住 Tab 视图，或存 `scrollTop` 到 Pinia。
- Recipe/Mixing 每次进入从顶部开始；Mixing 返回时按 10 分钟草稿恢复步骤。
- 页面切换后 `scrollTo(0,0)` 仅用于详情页。

### 6.4 导航守卫

- 没有登录，不需要 auth guard。
- `/mix/:slug` 若 slug 不存在 → 回到 `/tonight` + toast `Recipe not found`。
- `/recipe/:slug` 同理。
- 直接刷新 hash 路由应能恢复；数据从本地 mock 读取，不依赖上一页 state。

---

## 7. 页面规格

> 每个页面都按“结构 / 内容 / 交互 / 状态 / 验收”写。文案直接取设计稿；不要自行改写英文。

### 7.1 Welcome / 年龄门

**来源**：`L01_splash`、`L01a_splashStart`、`L02_welcome`、`L03_age`、`L03b_zeroProof`。

**MVP 取舍**：把 `L02` 做成唯一 Welcome；`L03` 年龄门做成进入前的一个可选步骤；`L03b` 只作为“未满年龄 → 零酒精”反馈，不单独做完整页面。`L01` 启动页可省略。

**结构**

- 全屏 Hero 渐变（Negroni `#2E1C1D` 或中性 `bg/base`）。
- 左侧文案区：overline、两行 Display、正文、3 条 benefits、按钮行。
- 右侧：三杯酒插图；没有素材时用渐变 + 3 个 SVG 杯型占位，保持构图。
- 底部无 TabBar。

**内容（原文）**

- Overline：`WELCOME TO LUCERIA`
- Display：`Your bar,` / `tonight.`
- 正文：`Tell us what's in your bar and we'll show what you can make, then guide you through every step.`
- Benefits：`Cocktails from the bottles you own`、`Hands-free, step-by-step mixing`、`A list that knows what unlocks the most`
- 按钮：`Get started`、`I have an account`

**交互**

- `Get started` → 若启用年龄门：`/welcome` 内切换到年龄卡片；否则 → `/bar`。
- `I have an account`：本期不做登录，点击显示 toast `Sign-in is out of scope for this demo`；或直接隐藏（但设计稿有，保留更完整）。
- 年龄门：`Year of birth` 输入、`This stays on your device`、`I'm under the legal age`、`Continue`。
- 选 `I'm under the legal age` → 设置 `zeroProof=true`，显示 `L03b` 的零酒精提示，再进 `/bar`。
- 出生年份只存本地，不上传；PWA 没有后端，天然满足“stays on your device”。

**验收**

- 两个按钮都有按下反馈；`Get started` 能进入 Bar。
- 年龄门不会阻塞“成年”用户超过 1 次点击。
- 大字号下按钮变全宽、文案不截断。

### 7.2 My Bar

**来源**：`B01_bar`（主）、`L04_bar`（可选首次引导）、`B02_add`（添加 sheet）、`B05_detail`（详情 sheet）。

**MVP 取舍**：主页面用 `B01`；`L04` 的“What's in your bar?”作为可选首跑，如果时间不够直接进 `B01`。`B02`、`B05` 用同一个 BottomSheet 组件。

**结构（B01）**

- 顶部：`My Bar` title1 40；副标题 `15 ingredients · 7 cocktails ready`；右上 `Scan label`、`+ Add`。
- 下一瓶推荐 banner：`Best next buy: fresh mint` + `Unlocks Mojito, Mint Julep and Southside` + `+ Add to list`。
- 筛选 pills：`All 15`、`Spirits`、`Liqueurs`、`Fresh & mixers`、`⚠ Running low · 2`。
- 5 列材料卡片（1194 下）；每张：勾选圆、名称、`Low`/`Out` 徽标。
- TabBar。

**材料卡状态（来自 B01/B05）**

| 状态 | 表现 |
|---|---|
| full / half | 绿色勾选圆；名称；无徽标 |
| low | 绿色勾选 + `⚠ Low` 徽标；仍算“有” |
| out | 虚线边框 + 空圆 + `Out` 徽标；算“没有” |

**B05 详情 sheet**

- 标题：材料名；副标题：`Italian red bitter liqueur · 25% ABV` 这类描述。
- `How much is left?` → 四档 Segmented：Full / Half / Low / Out。
- `Add to my list when it runs out` Toggle。
- `Used in 12 recipes · 5 you can make`。
- 2 个配方横条：Negroni、Boulevardier（来自 mock）。
- 底部 `Remove from my bar`（destructive）。
- 关闭：X 或点 scrim。

**B02 添加 sheet**

- 搜索框 `Search 300+ ingredients`；右侧 `Scan`（本期可只做占位/禁用）。
- 结果行：`Sweet vermouth` / `Already in your bar` + `Added`；`Dry vermouth` / `Unlocks 4 · Martini, Perfect Manhattan…` + `Add`；`Bianco vermouth` / `Unlocks 2 cocktails` + `Add`。
- 底部 `Done`。
- 搜索过滤本地 15 个材料；`Unlocks N` 用 availability 计算。
- 没有后端；不要真的请求 300+。

**交互**

- 点材料卡 → 打开 B05 sheet；点 `+ Add` → B02 sheet。
- 四档切换立即更新 B01 的 counts/`Best next buy`。
- `Add to my list` → 写入本地 shopping list（如果 P1 未做，toast `Added to list`）。
- `Running low · 2` 过滤 `low/out`。
- `Scan label` 本期禁用或 toast `Camera scanning is out of scope`；不要做一个假的相机页。

**数据**

- 15 个材料：见后端文档附录 B；`Light rum`/`Campari` = low，`Fresh mint` = out，其余 full。
- `readyCount` 由配方/材料计算，不写死；设计稿的 7 是目标演示值。

**验收**

- 初始显示 15 个材料；Low 2、Out 1。
- `Fresh mint` 设为 Out 时，Mojito 从 ready 变 almost。
- B05 的 `Used in`/`can make` 数字随库存变化（至少不是硬编码）。
- 材料卡 5 列在 1194 下不溢出；iPad 1180 下自然 4–5 列。

### 7.3 Tonight

**来源**：`T01_tonight`（主）、`T01b_tonightAlt`（换一杯后）、`T02_tonightEmpty`（空吧台）、`T03_firstRun`（首跑提示，可省略）。

**结构**

- 满版 Hero 540：左侧文案 + 按钮，右侧插图；背景为当前酒的渐变。
- 文案：
  - Overline `YOUR POUR FOR TONIGHT`（13/16 +12，accent）
  - Display `Negroni`（88/92）
  - 描述 `Bittersweet and balanced — gin, Campari and sweet vermouth in equal parts. Everything is already in your bar.`（18/26）
  - Pills：`Gin`、`Stirred`、`21.6% ABV`、`2 min`
  - 按钮：`Start mixing`（primary 52）、`View recipe`（secondary 52）、shuffle 圆钮 44
- 下方 `Also ready tonight`（title2 24/30）+ `All 7 you can make >`；3 张横条卡（缩略图 + 名称 + `Ready · 4 min`）。
- 右上：搜索/通知/头像圆钮（搜索可占位、通知可禁用、头像进 Settings）。
- TabBar。

**空态（T02）**

- 图标 + `Your bar is empty` + `Add a few bottles and Luceria will show what you can make tonight. Most people start with five to ten.`
- 按钮 `+ Add ingredients`、`Scan labels`。
- 下方 `Or start with a classic` + Negroni/Margarita/Mojito 三张横条卡。
- 本期 `Add ingredients` → `/bar`；`Scan labels` 禁用/toast。

**数据**

- `hero`：从 ready 配方里选一个；`alsoReady`：另外 3 个 ready；`counts.ready`、`counts.almost`。
- `nextBuy` 不显示在 T01（B01 才显示）；不要加。
- 换一杯：在 ready 列表里轮换，排除当前；也允许 shuffle 到 almost 并提示缺料（T01b 仍是 ready 风格，建议只轮换 ready）。

**交互**

- `Start mixing` → `/mix/:slug`；`View recipe` → `/recipe/:slug`；卡片 → `/recipe/:slug`。
- `All 7 you can make` → `/recipes` 并默认 `I can make` 筛选。
- 右上头像 → `/settings`；搜索 → `/recipes` 聚焦搜索（可选）。
- 离线时顶部显示 `Y01` 样式 banner：`You're offline. Recipes and your bar still work.` + `Retry`；Retry 只重新检查 `navigator.onLine`。

**验收**

- Hero 文案/按钮不与插图重叠；1080/1180 宽也不溢出。
- 3 张 Also ready 卡在 1194 下并排；大字号下改为纵向全宽（A01 的行为）。
- 空吧台进 T02，添加材料后回 T01 有 Hero。

### 7.4 Recipes 列表（P1）

**来源**：`R01_recipes`、`R02_filters`、`R03_search`、`R04_noResults`、`R05_loading`。

**结构**

- 标题 `Recipes`（40）；副标题 `120 classics · 7 you can make now`（本期用真实 mock 数，例如 `6 classics · 5 you can make now`，不要撒谎）。
- 搜索框 `Search recipes or ingredients`；右侧 `Filters`。
- 筛选 pills：`✓ I can make`、`Almost · 2`、`Gin`、`Shaken`、`Under 3 min`。
- 4 列配方网格（266 × ~226 封面 + 文字），卡片：封面、名称 `headline`、状态 `Ready · 2 min` 或 `Need fresh mint`、收藏心形。
- TabBar。

**状态**

- Loading：`R05` 的 8 个骨架卡。
- No results：`R04` 的搜索图标 + `No matches for “negroni”` + `Check the spelling, or search by an ingredient you have.` + `Did you mean Negroni?`。
- Empty bar：所有卡显示 `Need …`，不显示 ready。

**交互**

- 搜索本地名称/材料名（不做 300+ 分词）。
- 筛选 `I can make` / `Almost` / 基酒 / 方法 / 时长；计数从数据算。
- `Filters` 打开 R02 的 BottomSheet（基酒/风味/方法/强度 + Reset/Show N cocktails）；时间不够可只做 pills，不做完整 sheet。
- 卡片 → `/recipe/:slug`；心形 toggle 收藏（本地）。

**验收**

- 4 列在 1194 下对齐；1180 下仍 4 列或自然 3 列。
- 搜索无结果状态可返回。
- 筛选计数不写死。

### 7.5 Recipe 详情

**来源**：`D01_recipe`、`D02_method`、`D03_substitute`、`D04_reviews`、`D05_saveSheet`、`D06_saved`。

**结构（D01）**

- 左右分栏：左 433 插图区；右 761 内容区；顶部左侧返回圆钮，右侧收藏/分享圆钮。
- 右侧：
  - 标题 `Negroni`（40/46）
  - 描述 17/24
  - Pills：`Gin`、`Stirred`、`21.6% ABV`、`Old-fashioned`、`★ 4.8 · 326`
  - Tabs：`Ingredients`（选中）、`Method · 6 steps`
  - 单位 Segmented：`ml` / `oz`；份数 Stepper：`− 2 drinks +`
  - 配料列表：每行状态圆 + 名称 + 总量（60 ml）+ 可选 `Add to list`
  - 杯型/冰/装饰 pills：`Old-fashioned glass`、`Cubed ice`、`Garnish · orange zest`
  - 底部大按钮 `Start mixing`（88）
- 左侧插图：优先用导出 PNG；没有就用 `--drink-negroni` 渐变 + SVG 杯型。

**Method（D02）**

- 6 步列表：序号圆 + 标题 + 说明 + 右侧时间/计时器。
- 第 5 步 `Stir until well chilled` 显示 `⏱ 20 s timer`。
- 底部 `Start guided mixing`。

**替代（D03）**

- 点可选橙皮 `Add to list` 或缺料提示 → BottomSheet:
  - 标题 `No fresh mint?`
  - 说明 `These work in a Mojito. We'll adjust the recipe for you.`
  - 候选：`Fresh basil` / `In your bar · herbal, a little peppery` + `Use`；`Mint syrup` / `Use 10 ml and skip the sugar syrup` + `Add`
  - 底部 `Add fresh mint to my list`
- 本期可实现 Mojito 缺薄荷的静态候选；`Use` 应用调整后的配料量。

**评价/收藏 sheet（P2）**

- `D04` 评分分布 + 评论列表 + `Write a review`；`D05` 保存到合集；`D06` 保存 toast。时间不够不做，保留按钮 toast `Out of scope`。

**交互**

- Tabs 切换 Ingredients/Method，不做路由跳转。
- 单位切换只改显示；份数改变重算每行总量。
- `Add to list` 写本地 shopping list。
- `Start mixing` → `/mix/:slug?servings=2`（query 或 store）。
- 返回 → 上一页（Tonight 或 Recipes）。

**数据**

- `amountPerServing`、`amountTotal` 由前端根据份数计算；ml 为基准，oz = ml / 29.5735。
- `inBar`、`stockLevel`、`missing` 由 availability 计算。
- 可选材料（橙皮）缺料只显示 `Add to list`，不影响 ready。

**验收**

- Negroni 2 drinks：Gin/Campari/Sweet vermouth 各 60 ml。
- 切 oz：60 ml ≈ 2 oz，显示不出现 0。
- 橙皮 optional：缺料仍可 Start mixing。
- 6 步 Method 与 `D02` 一致。

### 7.6 Mixing

**来源**：`M00_overview`、`M01_gather`、`M02_ice`、`M03_gin`、`M04_campari`、`M05_vermouth`、`M06_stir`、`M06p_paused`、`M07_stirDone`、`M08_garnish`、`M09_allSteps`、`M10_voice`、`M11_stop`、`M12_done`。

**MVP 流程**

1. `M00` 计划：`Here's the plan`、6 步、`You'll need`、`Gather ingredients`。
2. `M01` 备料：`Gather everything first.`、`5 of 7 ready`、材料/器具 checklist、`Start step 1`。
3. 逐步：`M03`/`M04`/`M05` 共用 step 模板；第 5 步 `M06` 计时；`M08` 装饰。
4. `M12` 完成页：`Cheers, Mira.`、`Two Negronis, done in 2:41`、4 星、`Just right`、笔记、`Save to journal`/`Done`。

**结构（step 模板）**

- 顶部：关闭 X、`Step 5 of 6`、分段进度条、`Negroni · 2 drinks`、`All steps`、voice 圆钮。
- 左侧：`STEP 5` overline、`displayM` 标题（56/64）、说明、glass tabs（`Glass 1`/`Glass 2`）、提示 chip。
- 右侧：计时环（400×400，track + accent progress）、`0:14` timer 72/76、`6 s left · glass 1`、暂停/重置/+10 s。
- 底部：`Back`（secondary 88）、`Next: garnish`（primary 88）。
- 非计时步骤：右侧改为插图/材料卡或留空；底部 Next。

**计时器**

- 默认 20 s；`requestAnimationFrame` + `performance.now()`；暂停/继续/+10 s/重置。
- 结束时：进度环满、对勾、视觉闪烁（Web 无震动）；可选 WebAudio 提示音，必须由用户点击触发过。
- 按指南 2.6：计时结束 2 秒后自动进入下一步；设置 `Extra time on timers` 时等待用户点 Done。
- 离开页面：`sessionStorage` 保存 `stepIndex`、`elapsed`、`servings`，10 分钟内回来恢复；`M11` 关闭确认。
- 屏幕常亮：`navigator.wakeLock?.request('screen')`；失败不报错，演示时 iPad Auto-Lock 设 Never。

**M00 / M01**

- M00 左侧酒图 + `Negroni · 2 drinks` + `About 3 min`（注意：`D01` 是 2 min，演示可统一 2 min 或按数据表）。
- M00 右侧步骤列表 + `You'll need`：`2 old-fashioned glasses`、`Jigger · 30 ml`、`Bar spoon`、`Peeler or knife`；底部 `Gather ingredients`。
- M01：`Gather everything first.` + `5 of 7 ready` + checklist：
  - `London dry gin · 60 ml` ✓
  - `Campari · 60 ml` ✓
  - `Sweet vermouth · 60 ml` ✓
  - `Orange, for the zest`（optional，未选）
  - `2 old-fashioned glasses` ✓
  - `Plenty of cubed ice`（未选）
  - `Jigger and bar spoon` ✓
- `Start step 1`。

**M10 / M11（可选）**

- M10 语音条：`Listening...` + `Say "next", "back", "repeat" or "pause timer"`；PWA 不做真实语音，点击 voice 圆钮显示一个静态提示即可。
- M11 `Stop mixing?` 确认：`Keep mixing` / `Stop`；Stop 保留草稿 10 分钟。

**M12**

- `Cheers, Mira.` 88；`Two Negronis, done in 2:41`；`That's your 4th Negroni. You're getting good at this.`
- `How was it?` 5 星（默认 4）；口味 chips `Too bitter` / `Just right` / `Too sweet`（单选）；笔记输入 `Add a note, e.g. "a touch less Campari next time"`。
- `Save to journal`（primary）→ 写 journal + toast `Saved to your journal` + `Undo`；`Done`（secondary）→ `/journal`。
- 星点闪烁装饰可省略；不要引动画库。

**验收**

- 步骤进度 1→6 与 M06 的 5/6 一致。
- 计时 20 s 可暂停/继续/+10 s，UI 显示 `0:14` 级别。
- 完成后 Journal 多一条，周统计 +1 servings。
- 关闭调酒有确认，重进能恢复。

### 7.7 Journal

**来源**：`J01_journal`、`J02_saved`、`J03_myRecipes`。

**结构**

- 标题 `Journal`（40）；副标题 `What you've mixed, saved and created`。
- 顶部右侧 tabs：`Mixes`（选中）、`Saved`、`My recipes`、`+ New recipe`。
- 左侧列表（约 760 宽）：每条 = 缩略图 + 名称 + 日期 + 笔记 + 5 星评分。
- 右侧栏（约 360）：
  - `This week` 卡：`4` 大数字 + `drinks · 3 nights` + 7 根柱（M–S）。
  - `Mindful drinking` 卡：`Set a weekly limit. Once you reach it, Tonight suggests zero-proof drinks.` + `Set a limit`。
- TabBar。

**数据**

- 初始 seed 2–3 条，保证演示有内容；M12 保存后新增。
- `drinks = sum(servings)`；`nights = distinct localDate`；柱状图按周一到周日。
- `Saved`/`My recipes` 本期空态；`New recipe` 禁用或 toast。

**交互**

- 列表行 → `/recipe/:slug`。
- `Set a limit` → `/settings`（或 toast `Out of scope`）。
- `Mixes` 选中；其他 tab 显示 S04 风格空态。

**验收**

- 初始 `4 drinks · 3 nights` 或按 seed 数据一致。
- 新增一条后数字/柱状图更新。
- 评分星显示正确。

### 7.8 Settings

**来源**：`X01_appearance`、`X02_vision`、`X06_mixing`、`X08_mindful`、`X10_about`。

**MVP 取舍**：只做一个 Settings 页面，左侧导航 + 右侧内容；实现 Appearance、Accessibility、Mixing & units、About/Reset。Notifications、Mindful、Account、Delete 不做。

**结构**

- 左侧 300 宽导航：`Appearance`、`Accessibility`、`Mixing & units`、`Notifications`（禁用）、`Mindful drinking`（禁用）、`Account`（禁用）、`About`。
- 右侧内容卡片。
- 返回左上。

**Appearance**

- `Theme` 四个选项卡：`Automatic`、`Dark`、`Light`、`High contrast`；选中 accent 边框 + 勾。
- 说明：`Automatic follows your iPad: dark in the evening, light by day. High contrast uses pure black and white with stronger outlines.`
- `App icon` Amber/Ink：**[取舍]** PWA 不支持动态换图标，隐藏或禁用。
- 切换立即生效，写 localStorage。

**Accessibility**

- Tabs：`Vision & text`、`Hearing`、`Motor & voice`、`Focus & memory`（可只做第一个，其余禁用）。
- `Text size` 滑块：100–200%，显示 `Larger · 135%`；右侧预览 `Stir until well chilled.` + 说明。
- Toggles：`Bold text`、`Increase contrast`、`Reduce transparency`、`Always show status icons`。
- 本期至少实现 Text size + Increase contrast；其余可静态。
- `Increase contrast` 等价于 High contrast 主题；不要和主题选择互相覆盖，明确优先级（最后设置生效）。

**Mixing & units**

- `Volume` Segmented：`ml` / `oz` / `cl`。
- `Default servings` Stepper：`− 2 +`。
- `Keep screen awake`、`Start timers automatically`、`Update my bar after mixing` 三个 toggle；本期只存设置，不改后端。

**About / Reset**

- 版本号 `2.1 (214)`（来自 `X10`/`Y03`）。
- `Recipe specs`、`Artwork`、`Privacy policy`、`Terms of use`、`Open-source licences` 可做成静态链接/弹层；没有内容就禁用。
- **`Reset demo data`**：清空 localStorage 并回到 seed；答辩前必用。

**验收**

- 三主题切换立即生效，刷新后保留。
- 字号 200% 后主页面不截断。
- 单位切换后 Recipe 详情显示变化。
- Reset 后 Bar/Journal 恢复 seed。

### 7.9 Shopping List（P1）

**来源**：`S01_list`、`S02_addItem`、`S03_share`、`S04_listEmpty`。

**MVP 取舍**：时间够做 S01 + S04；S02/S03 用 toast 或静态 sheet。若只做空态，TabBar 的 List 不白屏。

**结构**

- 标题 `Shopping list`；副标题 `5 items · unlocks 6 cocktails`；右上 `Share`、`+ Add item`。
- 列表按 `Produce`、`Bottles & mixers` 分组；每行：勾选圆、名称、副标题（`For Mojito` / `Running low` / `Negroni garnish`）、右侧 `...`。
- 右侧 `This list unlocks` 卡：`6 cocktails` + 3 个配方缩略图 + `+4 more` + `Clear checked items`。
- 空态 S04：`Nothing to buy` + 说明 + `See what one bottle unlocks`。

**数据**

- 从 Bar 缺料/低库存生成；勾选只改本地。
- `unlocks` 用“把未勾选条目加入 bar”模拟，不写死。
- 分享本期 toast `Share link is out of scope`。

### 7.10 Profile（P2）

`U01`：头像/名字/邮箱、`38 drinks mixed`、`11 ingredients`、`6 own recipes`、Collections、Community stories、Host a party、Learn、Sign out。时间不够不做；头像直接进 Settings。

---

## 8. 组件库

### 8.1 组件清单

| 组件 | 来源 | 关键状态/规格 |
|---|---|---|
| `AppShell` | 全局 | 背景、safe area、内容滚动、TabBar 占位 |
| `TabBar` | `02_Components`、各屏 | 560×68、5 项、active accent + pill、HC 描边 |
| `AppButton` | `02_Components` | primary/secondary/destructive；52/60/88；pressed/disabled/focus |
| `IconButton` | `02_Components`、D01/T01 | 44/52 圆形；返回/收藏/分享/关闭/语音 |
| `Pill` | `02_Components`、T01/R01 | 默认/选中/可关闭；36–40 高 |
| `Segmented` | `02_Components`、D01/X06 | ml/oz/cl；Full/Half/Low/Out；Any/Stirred… |
| `Stepper` | `02_Components`、D01 | `− 2 drinks +`；最小 0.5，最大 20 |
| `Toggle` | `02_Components`、X02 | 开/关；44×26 视觉，触控 44 |
| `RecipeCard` | `R01`、T01、D05 | grid 卡/横条卡/缩略图 |
| `BarCard` | `B01` | 勾选/低库存/out；5 列 |
| `SettingsRow` | `X01`/`X02` | 左图标 + 标题 + 副标题 + 右控件 |
| `SearchField` | `R01`/`R03`/`B02` | 搜索图标、清除、focus ring |
| `RatingStars` | `02_Components`/`M12`/`D04` | 1–5、hover/pressed（触屏无 hover）、可交互 |
| `StepTimer` | `M06` | 400 环、剩余秒、暂停/重置/+10s |
| `StepProgress` | `M06` | 6 段进度条 |
| `Toast` | `02_Components`/D06 | 4 s、Undo/Retry、底部悬浮 |
| `BottomSheet` | `D03`/`D05`/`R02`/`B02` | scrim、拖动、关闭、safe area |
| `EmptyState` | `R04`/`S04`/`T02` | 图标 + 标题 + 说明 + 行动 |
| `Skeleton` | `R05` | 网格骨架 |
| `OfflineBanner` | `Y01` | 顶部横幅 + Retry |
| `VoiceOverlay` | `M10` | 可选；静态提示即可 |

### 8.2 按钮规格

| 类型 | 高度 | 背景 | 文字 | 用途 |
|---|---|---|---|---|
| Primary | 52 / 60 / 88 | `accent` | `text/onAccent` | Start mixing、Continue、Save |
| Secondary | 52 / 60 / 88 | `fill/2` | `text/primary` | View recipe、Done、Cancel |
| Destructive | 52 | `status/danger` 或透明红边 | `text/primary`/danger | Delete、Remove |
| Icon | 44 / 52 | `fill/glass` | `text/primary` | Back、Favorite、Share、Close |
| Text | — | 透明 | `accent` | Add to list、See all |

- 圆角 999；图标按钮圆形。
- 按下态：`transform: scale(.98)` + 轻微亮度变化，150 ms；减少动态关闭。
- Focus：3 px `focus/ring` + 2 px offset。
- 禁用：opacity .45，不响应。

### 8.3 卡片规格

- **Recipe grid card**：封面 4:3、圆角 20、`Elevation/Card`；标题 17/22；状态 13/18；心形 24。
- **Horizontal recipe card**：高 88–96，缩略图 72 圆角 16，标题 17，状态 13，右侧 chevron。
- **Bar card**：高约 150，背景 `fill/2`，圆角 20，勾选圆 28，名称 15–17，Low/Out 徽标 11–13。
- **Stat card**：大数字 `number` 44/48 light + 副标题 15。
- **Settings card**：`fill/2`/`bg/elevated`，圆角 20，行高 56–64，分隔线 `line/subtle`。

### 8.4 状态样式

| 状态 | 视觉 | 文案 |
|---|---|---|
| ready | `status/ready` 勾 | `Ready · 2 min` |
| almost | `status/missing` 加号 | `Need fresh mint` |
| missing | `status/missing` 加号 | `Need 2 ingredients`（详情） |
| low | `status/missing` 警告 | `Low` |
| out | 虚线 + 空圆 | `Out` |
| selected | accent 边框/填充 | 勾 |
| loading | `fill/2` 骨架 + shimmer | 无 |
| error | `status/danger` | 具体错误 |

### 8.5 组件实现顺序

1. `AppShell` + `TabBar` + `Pill` + `AppButton`。
2. `RecipeCard` + `BarCard`。
3. `SearchField` + `Segmented` + `Stepper`。
4. `StepTimer` + `StepProgress` + `RatingStars`。
5. `BottomSheet` + `Toast`。
6. `EmptyState` + `Skeleton` + `OfflineBanner`。

先做前 4 组，就能撑起 7 个 P0 页面；后 2 组是体验加分项。

---

## 9. 交互与动效

### 9.1 总规则（来自指南 2.6 / 11 Handoff）

| 触发 | 结果 | 动效 |
|---|---|---|
| 切换标签 | 每个标签保留滚动位置 | 无动画 |
| 打开配方/开始调制 | 推入新页面 | 从右滑入，300 ms |
| 筛选/添加材料/收藏 | 底部面板，下滑关闭 | 升起，250 ms |
| 调酒步骤 | Next、点屏幕任意处、语音 `next` | 300 ms |
| 计时 | 暂停/继续/+10 s；结束提示 | 圆环动画 |
| 开关/勾选/评分 | 即时切换 | 200 ms |
| 保存/加入清单 | 提示条 + Undo，4 s | 200 ms |
| 游戏 | 全屏独占 | push |
| 减少动态 | 所有转场 | 150 ms 淡入淡出 |

### 9.2 计时器

- 使用 `requestAnimationFrame`，不要 `setInterval` 累加误差。
- 显示 `m:ss`（`0:14`）；圆环 `stroke-dashoffset` 随进度。
- 暂停：进度条/数字停止，按钮变 `Resume`；+10 s 增加总时长；重置回到步骤默认。
- 结束：圆环 accent 满圈 + 勾；视觉闪烁 2–3 次（可访问性：不要过快）；Web 无震动，用视觉替代。
- 音效：可选 WebAudio `oscillator`，必须在用户点击后初始化。
- 自动下一步：2 s；`Extra time on timers` 时等待用户。
- 页面隐藏：`visibilitychange` 停 RAF，回到前台按 `performance.now()` 补时。

### 9.3 屏幕常亮

```ts
let wakeLock: WakeLockSentinel | null = null
async function keepAwake() {
  try { wakeLock = await navigator.wakeLock?.request('screen') } catch {}
}
```

- 进入 Mixing 请求，离开释放。
- 失败不报错；演示前 iPad 设置 Auto-Lock = Never。

### 9.4 语音

- 设计有 `M10` 和 `X04` 的语音命令，但 Web Speech API 在 iPad Safari 上支持不稳定。
- **[取舍]** 本期不做真实语音；`M10` 只做静态提示或隐藏 voice 圆钮。答辩话术：“语音是设备端能力，Web 版暂不启用。”
- 不要用云端语音识别（隐私 + 成本 + 网络）。

### 9.5 Haptics

- Web 没有 iOS 触感 API；`navigator.vibrate` 在 Safari 不支持。
- 用视觉反馈替代：按钮按下缩放、计时结束闪烁、勾选动画。
- 不要承诺“震动”。

### 9.6 减少动态

- `prefers-reduced-motion: reduce` 时：
  - 页面转场改 150 ms 淡入淡出；
  - 取消 parallax/缩放/弹跳；
  - 计时环仍更新，但不做脉冲。
- 设置页的 `Reduce motion` toggle 与系统偏好任一为真即生效。

### 9.7 Toast / Undo

- `Saved to your journal` + `Undo`；4 s 消失。
- Undo 撤销上一次 journal 写入/收藏/清单添加。
- 同时最多 1 条 toast；新 toast 替换旧的。
- 位置：TabBar 上方 100 px，宽度不超过 560。

---

## 10. 数据层与状态

### 10.1 数据文件

```text
src/data/
├─ ingredients.json
├─ recipes.json
└─ seed.ts
```

- `ingredients.json`：15 个演示材料，字段 `slug/name/category/abv`。
- `recipes.json`：6 款经典 + 必要补位（Boulevardier、Old Fashioned、Daiquiri 等）；多出的配方可不在 `R01` 首屏露出。
- `seed.ts`：初始 bar、初始 journal、初始 settings。

> `B01` 的 “15 ingredients · 7 cocktails ready” 是设计 mock，不是 6 款配方的自然结果：按 `11 Handoff`，Whiskey Sour 需要蛋清、Margarita 需要 agave，而 `B01` 的 15 个材料里没有这两项；Mojito 缺 mint、Cosmopolitan 缺 cranberry。演示数据要么补材料/把这两项标 optional，要么显示真实 computed 数；**不要写死 7**。

### 10.2 类型

```ts
export type Level = 'full' | 'half' | 'low' | 'out'
export type Unit = 'ml' | 'oz' | 'cl'

export interface Ingredient {
  slug: string
  name: string
  category: 'spirit' | 'liqueur' | 'fresh' | 'mixer' | 'bitters'
  abv?: number
}

export interface RecipeIngredient {
  slug: string
  amount: number
  unit: 'ml' | 'dash' | 'leaf' | 'piece'
  optional?: boolean
  note?: string
}

export interface Step {
  title: string
  instruction: string
  duration?: number
  timer?: number
}

export interface Recipe {
  slug: string
  name: string
  tagline: string
  description: string
  baseSpirit: string
  method: 'stirred' | 'shaken' | 'built' | 'blended' | 'churn'
  glassware: string
  ice: string
  garnish: string
  abv?: number
  minutes: number
  flavours: string[]
  hueDark: string
  hueLight: string
  image?: string
  ingredients: RecipeIngredient[]
  steps: Step[]
  rating?: { avg: number; count: number }
}

export interface JournalEntry {
  id: string
  recipeSlug: string
  date: string       // YYYY-MM-DD
  servings: number
  rating: number     // 1-5
  taste?: 'too_bitter' | 'just_right' | 'too_sweet'
  note?: string
}
```

### 10.3 Store

```ts
// stores/useDemoStore.ts
state: {
  bar: Record<string, Level>,       // 15 个
  journal: JournalEntry[],
  settings: {
    theme: 'auto' | 'dark' | 'light' | 'hc',
    textScale: 1 | 1.25 | 1.35 | 1.5 | 1.75 | 2,
    unit: Unit,
    defaultServings: number,
    reduceMotion: boolean,
    increaseContrast: boolean,
    updateBarAfterMixing: boolean,
  },
  readyRecipeSlugs: string[],
}
```

Getters：

- `readyRecipes`：所有必需材料都不是 `out`。
- `almostRecipes`：缺 1 个必需材料。
- `counts`：`{ total, ready, almost, low, out }`。
- `hero`：ready 中第一个/轮换。
- `nextBuy`：缺一个材料能解锁最多配方的材料。
- `journalStats`：本周 `drinks`、`nights`、7 天柱状数据。

Actions：

- `setLevel(slug, level)`
- `addJournal(entry)`
- `undoLastJournal()`
- `setTheme(theme)`
- `setTextScale(scale)`
- `setUnit(unit)`
- `resetDemo()`

持久化键：`luceria.bar`、`luceria.journal`、`luceria.settings`；首次启动用 seed。

### 10.4 可用性/缩放函数

```ts
// lib/availability.ts
export function missingIngredients(recipe: Recipe, bar: Record<string, Level>) {
  return recipe.ingredients.filter(i =>
    !i.optional && (!bar[i.slug] || bar[i.slug] === 'out')
  )
}

export function statusOf(recipe: Recipe, bar: Record<string, Level>) {
  const missing = missingIngredients(recipe, bar)
  return missing.length === 0 ? 'ready' : missing.length === 1 ? 'almost' : 'missing'
}
```

```ts
// lib/units.ts
export const ML_PER_OZ = 29.5735
export const toOz = (ml: number) => Math.round((ml / ML_PER_OZ) * 4) / 4
export const toCl = (ml: number) => Math.round(ml / 5) / 2
```

- `amountTotal = amount * servings`。
- `ml` 显示：≥10 取整；1–10 保留 1 位；<1 保留 2 位。
- `oz` 取最近 0.25；`cl` 取最近 0.5。
- `dash/leaf/piece` 四舍五入，至少 1。
- 先乘后舍入，禁止先舍入再乘。

### 10.5 下一瓶推荐

```ts
// 只差一个材料的配方，按缺失材料分组
const singleMissing = recipes.filter(r => missingIngredients(r, bar).length === 1)
const counts = new Map<string, string[]>()
for (const r of singleMissing) {
  const slug = missingIngredients(r, bar)[0].slug
  counts.set(slug, [...(counts.get(slug) ?? []), r.name])
}
// 取数量最多；同分按 usedIn 再按名称
```

- 至少返回 `{ slug, name, unlocksCount, recipeNames }`。
- `B01` 文案：`Best next buy: fresh mint` + `Unlocks Mojito, Mint Julep and Southside`。
- 如果 mock 没有 Mint Julep/Southside，就显示真实解锁的配方名，不要抄设计文案。

### 10.6 API 接入与 fallback

如果后端同学提供 API：

```ts
// lib/api.ts
const API = import.meta.env.VITE_API_BASE

export async function tryApi<T>(path: string, fallback: T): Promise<T> {
  if (!API) return fallback
  try {
    const res = await fetch(`${API}${path}`, {
      signal: AbortSignal.timeout(1500),
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(String(res.status))
    return (await res.json()).data ?? fallback
  } catch {
    return fallback
  }
}
```

- 字段与后端对齐：`amountPerServing`、`amountTotal`、`hueDark`、`readyCount`、`nextBuy`、`missing`。
- 先 mock 开发；API 只作为增强，不是依赖。
- 如果 API 是 HTTP 而 PWA 是 HTTPS，浏览器会拦截；直接用 mock，不要在现场调。
- 后端未部署时，`VITE_API_BASE` 留空。

### 10.7 加载/空/错误状态

- 本地 mock 没有网络加载；只有“首次 hydrate”可显示 100 ms 骨架，避免闪烁。
- 如果接 API：1.5 s 超时后 fallback；不显示无限 spinner。
- 空状态：
  - Bar 空 → `T02`。
  - Recipes 无结果 → `R04`。
  - List 空 → `S04`。
  - Journal 无记录 → 简单空态 + `Start mixing`。
- 错误状态：toast + 保留本地数据；不要白屏。

---

## 11. PWA 与 iPad 展示

### 11.1 `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt', // 不要 autoUpdate，避免演示中自动刷新
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Luceria',
        short_name: 'Luceria',
        description: 'Your bar, tonight.',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#121110',
        theme_color: '#121110',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
```

### 11.2 `index.html`

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Luceria">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#121110">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### 11.3 图标

- 需要 192、512、180（apple-touch-icon）。
- 没有设计资源时，用纯色底 + 白色 “L”/酒杯线条；不要花时间绘制。
- PWA 图标固定，不能像 `X01` 的 Amber/Ink 一样切换；这是 Web 限制。

### 11.4 离线

- Service Worker 预缓存 HTML/JS/CSS/字体/图标。
- 数据在 localStorage；没有 API 也能完整演示。
- 首次部署后，在 iPad 上打开一次，确保缓存写入；之后开飞行模式仍能打开。
- 如果接了 API，API 失败 fallback mock，不要卡死。
- 更新：`registerType: 'prompt'`；演示前完成最后一次部署，演示中不点更新。若 iPad 仍显示旧版：删除主屏幕图标 → Safari 清除网站数据 → 重新添加。

### 11.5 iPad 安装步骤

1. Safari 打开 Netlify HTTPS 地址。
2. 分享按钮 → **添加到主屏幕**。
3. 从主屏幕打开；确认无地址栏、横屏、状态栏正常。
4. 设置 → 辅助功能 → **引导式访问**：开启，密码设置；演示时三击侧边按钮锁定。
5. 控制中心锁定旋转；Auto-Lock = Never；勿扰开启。
6. 首次加载后开飞行模式再打开，验证离线。
7. 用 `vconsole` 或页面内错误浮层查看 iPad 上的 JS 错误；演示前移除调试入口。

### 11.6 iOS/PWA 限制

| 限制 | 影响 | 处理 |
|---|---|---|
| 无 `beforeinstallprompt` | 不能自定义安装按钮 | UI 提示“分享 → 添加到主屏幕” |
| 无原生触感 | 不能震动 | 视觉反馈替代 |
| 无 APNs | 不能收远程推送 | 本期不做通知 |
| 无动态 App 图标 | `X01` 的 Amber/Ink 不能换 | 隐藏该区块 |
| `backdrop-filter` 性能 | 大面积模糊可能掉帧 | 只用于 TabBar/Sheet，限制面积 |
| Safari 语音识别不稳定 | 语音命令不可用 | 本期不做真实语音 |
| 相机需 HTTPS + 用户手势 | 扫码页可能失败 | 本期不做真实扫码 |
| PWA 进程可能被回收 | 重新打开回到首页 | 数据持久化，Mixing 草稿存 sessionStorage |

### 11.7 部署检查

- `npm run build` 无错误；`dist/` 可离线。
- Netlify 域名 HTTPS 有效；iPad 能访问。
- 资源路径以 `/` 开头；hash 路由刷新不白屏。
- 首屏体积尽量 < 1 MB（不含字体子集）；Inter 只引入使用的字重。
- 部署后立即在 iPad 上完整走一遍。

---

## 12. 无障碍

### 12.1 设计依据

- 开发指南 2.7 的 6 条清单。
- `A01_largeText`：最大字号下 Hero 堆叠、行全宽、不截断。
- `A02_voiceOver`：朗读顺序编号。
- `X02_vision`：文字大小 135%、Bold text、Increase contrast、Reduce transparency、Always show status icons。
- `X03_hearing`：Chime、Haptic、Flash screen、Read steps aloud、Show captions、Speaking rate。
- `X04_motor`：Tap anywhere、Larger touch targets 64、Hold to confirm、Voice control。
- `X05_focus`：One instruction per screen、Extra time on timers、Reduce motion、Confirm before leaving mixing。
- `Foundations` 的对比度表：三模式都通过 WCAG 2.2 AA。

### 12.2 实现清单

- [ ] 所有文字用令牌颜色；不在正文上用 alpha 自造灰色。
- [ ] 所有图标按钮有 `aria-label`（Back、Favorite、Share、Close、Voice）。
- [ ] 装饰性插图 `aria-hidden="true"`。
- [ ] 触控目标 ≥44 px；`Larger touch targets` 时 64 px。
- [ ] 焦点环 3 px `focus/ring` + 2 px offset；Tab 顺序按视觉顺序。
- [ ] `prefers-reduced-motion` / 设置 `Reduce motion` → 150 ms 淡入淡出。
- [ ] 字号 200% 不截断、不重叠、无横向滚动。
- [ ] 状态一律“图标 + 文字”（Ready/Need/Low/Out），不只靠颜色。
- [ ] 计时结束同时有视觉闪烁；声音可选，不依赖。
- [ ] `One instruction per screen` 开启时，步骤文案拆分为单句。
- [ ] `Extra time on timers` 开启时，计时结束不自动跳转。
- [ ] `Confirm before leaving mixing` 开启时，离开弹 `Stop mixing?`。
- [ ] 键盘/辅助功能：Tab 可到所有按钮；Escape 关闭 sheet/modal。
- [ ] 对比度：用 tokens；HC 下纯黑 + 1.5 px 白边 + 信号黄。
- [ ] 文案不使用“颜色”作为唯一提示（例如不要只写 “Red = missing”）。

### 12.3 PWA 限制说明

- iOS Safari 的 VoiceOver 对 Web 支持有限；用语义化 HTML + aria-label 做到最好，不承诺与原生一致。
- 震动/触感不可用；用视觉替代。
- 屏幕常亮用 Wake Lock；失败时依赖 iPad Auto-Lock 设置。
- 无障碍是加分项，不是 demo 的阻塞项；至少做字号、主题、状态图标、焦点环。

---

## 13. 资产与插画

### 13.1 设计稿的素材状态

开发指南第四部分列出 13 项 `ASSET TODO`，包括 Black Russian/Margarita/Mojito/Whiskey Sour/Cosmopolitan 的插图、L02 三杯、K02 冰块、J03 默认图、B03 示例酒标、K01 器具、头像方案、120 款新增酒、App 图标/启动页。

**结论**：没有合格的透明单杯素材；不要花时间找图/抠图。演示用：

- Hero：`drink/<id>` 渐变 + 一个简洁的玻璃杯 SVG（线条色用 `ink/illustration`）。
- 配方卡/列表：同一渐变 + 杯型小图；不同酒用 `hue` 区分。
- 头像：首字母圆形（设计也是首字母）。
- 图标：内联 SVG，Lucide 风格，1.6 px 线宽。

### 13.2 如果 Figma 有权限

- 导出 6–7 个单杯透明 PNG（600×750 左右），放 `src/assets/drinks/`。
- 同时导出 192/512/180 图标。
- 不要导出整屏 PNG 当素材；不要把 `ASSET TODO` 批注带进来。
- 不要使用 Difford's 照片。

### 13.3 字体与图标

- Inter：`@fontsource/inter/300.css`、`400.css`、`500.css`、`600.css`、`700.css`；只引用的字重。
- 图标：手写 8–12 个 SVG（搜索、铃铛、用户、月亮、书、瓶子、购物车、日历、返回、收藏、分享、关闭、播放、暂停、重置、加号、勾）。统一 `stroke="currentColor"`、`stroke-width="1.6"`、`viewBox="0 0 24 24"`。

---

## 14. 测试与验收

### 14.1 设备与环境

| 设备 | 分辨率 | 用途 |
|---|---|---|
| iPad Pro 11（2018–2022） | 1194×834 | 设计基准，必须测 |
| iPad 10 / iPad Air 11 | 1180×820 | 验证不溢出 |
| Windows Chrome/Edge | 1194×834 设备模式 | 日常开发 |
| Playwright WebKit | 1194×834 | 近似 Safari 布局回归 |
| iPad Safari | 真机 | 最终验收 |

### 14.2 视觉检查

- [ ] Dark / Light / High contrast 三套主题。
- [ ] Hero 渐变、酒色、glow（HC 无 glow）。
- [ ] TabBar 560×68、底部 28、内容不被遮挡。
- [ ] 4 列配方网格、5 列 Bar 网格。
- [ ] 字号 100%、135%、200%。
- [ ] 横屏 1194×834；1180×820 不横向滚动。
- [ ] 卡片圆角/阴影/描边与 tokens 一致。
- [ ] 没有假状态栏/假 Home Indicator。

### 14.3 功能检查

- [ ] 选/取消材料，ready/almost 数字变化。
- [ ] Fresh mint = Out → Mojito almost；nextBuy 合理。
- [ ] Negroni 2 drinks → 60 ml；切 oz 约 2 oz。
- [ ] 配方 Tabs、份数、单位、Add to list。
- [ ] Mixing 步骤 1–6、计时暂停/继续/+10s/重置。
- [ ] 完成页评分/口味/笔记；Save 后 Journal 更新。
- [ ] Journal 周统计/柱状图。
- [ ] Settings 主题/字号/单位/Reset 持久化。
- [ ] 刷新后数据不丢；Reset 恢复。

### 14.4 PWA/iPad 检查

- [ ] HTTPS 访问；添加到主屏幕。
- [ ] 全屏、横屏、无地址栏。
- [ ] 飞行模式可打开；数据在。
- [ ] 引导式访问锁定；旋转锁定；Auto-Lock Never。
- [ ] 冷启动 < 3 s；滚动不卡。
- [ ] 更新后旧缓存不干扰（删除图标重新添加）。

### 14.5 无障碍检查

- [ ] 键盘 Tab 顺序、焦点环。
- [ ] VoiceOver 能读按钮名称；装饰图不读。
- [ ] 200% 字号不截断。
- [ ] 减少动态效果生效。
- [ ] 状态不只靠颜色。
- [ ] HC 1.5 px 白边、信号黄、青色焦点。

### 14.6 演示前 10 分钟

1. iPad 充电/插电；亮度调高。
2. 打开 PWA，走一遍完整流程。
3. 开飞行模式再打开，确认离线。
4. `Reset demo data`。
5. 播放一遍录屏备份。
6. 关闭通知/勿扰；锁定引导式访问。

---

## 15. 两天排期

### 15.1 今晚（2–3 小时）

| 时间 | 任务 | 产出 |
|---|---|---|
| 0–20 min | 脚手架、装依赖、清默认样式 | `npm run dev` 可跑 |
| 20–60 min | `tokens.css`、`AppShell`、`TabBar`、空路由 | 五个 tab 可切 |
| 60–90 min | Welcome + Tonight 静态版 | 假 Hero 可看 |
| 90–110 min | `npm run build` + Netlify Drop | HTTPS URL |
| 110–120 min | iPad 打开、添加主屏幕 | 全屏验证 |

**今晚不做**：Recipe/Mixing/Journal/Settings 的完整逻辑；只保证部署链路和 iPad 全屏。

### 15.2 明天（一整天）

| 时间 | 任务 | 验收 |
|---|---|---|
| 08:30–09:30 | 设计系统、按钮/Pill/卡片、主题切换 | 三主题可切 |
| 09:30–11:00 | Bar：15 材料、四档、B02/B05 sheet | 计数变化 |
| 11:00–12:30 | Tonight：Hero、Also ready、空态、换一杯 | 7 ready / 2 almost |
| 13:30–15:00 | Recipe：Tabs、份数、单位、配料、步骤 | 60 ml / 2 oz |
| 15:00–17:00 | Mixing：计划、备料、步骤、计时、完成 | 计时/完成可用 |
| 17:00–18:00 | Journal：列表、周统计、柱状图 | 数据更新 |
| 18:00–19:00 | Settings：主题/字号/单位/Reset | 持久化 |
| 19:00–20:00 | Recipes 列表 / List 空态（P1） | tab 不白屏 |
| 20:00–21:00 | PWA、离线、iPad 实测、修 bug | 飞行模式可开 |
| 21:00–22:00 | 录屏、排练、截图备份 | 2 分钟视频 |

**如果 15:00 落后**：砍 Recipes 列表、List、Profile、年龄门；保 6 个 P0：Welcome/Bar/Tonight/Recipe/Mixing/Journal/Settings。

### 15.3 后天早上

- 只做设备设置、重置、排练；不改代码。
- 提前 30 分钟到场测试 Wi-Fi/亮度/声音。
- 准备视频备份和截图。

---

## 16. 风险与取舍

| 风险 | 概率 | 影响 | 处理 |
|---|---|---|---|
| 设计数据冲突（时间/ABV/杯型） | 高 | 文案不一致 | 以数据表为准；演示统一 |
| 没有合格酒插图 | 高 | 视觉不完整 | 渐变 + SVG；不抠图 |
| 后端 API 未就绪/CORS/HTTPS | 中 | 数据空 | mock fallback；不依赖 API |
| iPad PWA 安装/全屏问题 | 中 | 演示形态差 | 今晚先验证；Safari 手动添加 |
| 计时器/状态在切换页面丢失 | 中 | 流程断裂 | sessionStorage + Pinia |
| 免费托管被墙/网络差 | 中 | 打不开 | 离线缓存 + 录屏备份 |
| 时间不足 | 高 | 功能不全 | 按 P0 砍；先保闭环 |
| `backdrop-filter` 卡顿 | 中 | 滚动掉帧 | 限制模糊面积；必要时纯色 |
| 字号 200% 截断 | 中 | 无障碍扣分 | 早测；布局堆叠 |
| 自动更新 Service Worker | 低 | 演示中刷新 | `registerType:'prompt'`；演示前不部署 |

---

## 附录 A：82 屏与前端优先级

| 屏幕 | 优先级 | 说明 |
|---|---|---|
| `L01_splash` | P2 | 启动页；可省略 |
| `L01a_splashStart` | P2 | 启动页；可省略 |
| `L02_welcome` | P0 | Welcome |
| `L03_age` | P1 | 年龄门；可合并 |
| `L03b_zeroProof` | P1 | 未满年龄提示/零酒精 |
| `L04_bar` | P1 | 首次选吧台；可跳过 |
| `L05_taste` | 不做 | 口味偏好 |
| `L06_comfort` | P2 | 舒适度；可并到 Settings |
| `L07_notify` | 不做 | 通知权限 |
| `L08_signin` | 不做 | 登录 |
| `L09_email` | 不做 | 邮箱 |
| `L10_code` | 不做 | 验证码 |
| `T01_tonight` | P0 | 主 Tonight |
| `T01b_tonightAlt` | P1 | 换一杯后状态 |
| `T02_tonightEmpty` | P0 | 空吧台 |
| `T03_firstRun` | 不做 | 首跑提示 |
| `R01_recipes` | P1 | 配方列表 |
| `R02_filters` | P2 | 筛选 sheet |
| `R03_search` | P1 | 搜索 |
| `R04_noResults` | P1 | 无结果 |
| `R05_loading` | P1 | 骨架 |
| `D01_recipe` | P0 | 配方详情 |
| `D02_method` | P0 | 方法/步骤 |
| `D03_substitute` | P0 | 替代 sheet |
| `D04_reviews` | P2 | 评价 |
| `D05_saveSheet` | P2 | 保存合集 |
| `D06_saved` | P2 | 保存 toast |
| `N01_notifications` | 不做 | 通知中心 |
| `U01_profile` | P2 | 个人页 |
| `M00_overview` | P0 | 调酒计划 |
| `M01_gather` | P0 | 备料 |
| `M02_ice` | P2 | 加冰步骤；可数据驱动 |
| `M03_gin` | P0 | 倒酒步骤模板 |
| `M04_campari` | P0 | 倒酒步骤模板 |
| `M05_vermouth` | P0 | 倒酒步骤模板 |
| `M06_stir` | P0 | 计时 |
| `M06p_paused` | P1 | 暂停态 |
| `M07_stirDone` | P1 | 计时完成 |
| `M08_garnish` | P0 | 装饰 |
| `M09_allSteps` | P2 | 全部步骤 |
| `M10_voice` | 不做 | 语音；静态提示 |
| `M11_stop` | P1 | 停止确认 |
| `M12_done` | P0 | 完成页 |
| `B01_bar` | P0 | 我的吧台 |
| `B02_add` | P0 | 添加材料 sheet |
| `B03_scan` | 不做 | 扫码 |
| `B04_camera` | 不做 | 相机 |
| `B05_detail` | P0 | 材料详情 sheet |
| `S01_list` | P1 | 购物清单 |
| `S02_addItem` | P2 | 加条目 |
| `S03_share` | 不做 | 分享 |
| `S04_listEmpty` | P1 | 空清单 |
| `J01_journal` | P0 | 日记 |
| `J02_saved` | P2 | 收藏 |
| `J03_myRecipes` | P2 | 我的配方 |
| `J04_editor` | 不做 | 配方编辑器 |
| `C01_stories` | 不做 | 社区 |
| `C02_story` | 不做 | 社区详情 |
| `K01_learn` | 不做 | 学习 |
| `K02_ice` | 不做 | 冰块 |
| `P01_party` | 不做 | 派对 |
| `P02_games` | 不做 | 游戏 |
| `P03_dice` | 不做 | 骰子 |
| `P03b_diceRolled` | 不做 | 骰子 |
| `P04_wheel` | 不做 | 转盘 |
| `P04b_wheelResult` | 不做 | 转盘 |
| `X01_appearance` | P0 | 主题 |
| `X02_vision` | P0 | 字号/对比度 |
| `X03_hearing` | P2 | 声音/字幕 |
| `X04_motor` | P2 | 触控/语音 |
| `X05_focus` | P1 | 专注/动效 |
| `X06_mixing` | P0 | 单位/份数 |
| `X07_notifications` | 不做 | 通知设置 |
| `X08_mindful` | P2 | 理性饮酒 |
| `X09_account` | 不做 | 账号 |
| `X10_about` | P1 | 关于/Reset |
| `X11_deleteConfirm` | 不做 | 删除 |
| `A01_largeText` | P1 | 大字号验收参考 |
| `A02_voiceOver` | P2 | 朗读顺序参考 |
| `Y01_offline` | P1 | 离线 banner |
| `Y02_syncError` | 不做 | 同步失败 |
| `Y03_whatsNew` | P2 | What's New |

`09_themes/` 的 34 张图不作为页面，只作为三主题验收对照。

## 附录 B：关键文案与数据

### B.1 关键文案（直接使用）

- `WELCOME TO LUCERIA`
- `Your bar, tonight.`
- `Cocktails from the bottles you own`
- `Hands-free, step-by-step mixing`
- `A list that knows what unlocks the most`
- `What's in your bar?`
- `My Bar`
- `Best next buy: fresh mint`
- `All 7 you can make`
- `YOUR POUR FOR TONIGHT`
- `Also ready tonight`
- `Recipes`
- `120 classics · 7 you can make now`
- `I can make`
- `Almost · 2`
- `Ingredients`
- `Method · 6 steps`
- `Start mixing`
- `View recipe`
- `Here's the plan`
- `Gather everything first.`
- `You'll need`
- `Stir until well chilled.`
- `About 20 seconds per glass. Move the ice, not the drink.`
- `Cheers, Mira.`
- `Two Negronis, done in 2:41`
- `How was it?`
- `Too bitter` / `Just right` / `Too sweet`
- `Save to journal`
- `Journal`
- `This week`
- `4 drinks · 3 nights`
- `Mindful drinking`
- `Settings`
- `Appearance`
- `Accessibility`
- `Mixing & units`
- `High contrast`
- `Reset demo data`
- `You're offline. Recipes and your bar still work.`

### B.2 演示数据

- 15 个材料：Gin、Bourbon、Vodka、Tequila、Light rum、Campari、Sweet vermouth、Cointreau、Coffee liqueur、Angostura、Lemons、Limes、Sugar syrup、Soda water、Fresh mint。
- 初始档位：Light rum / Campari = low；Fresh mint = out；其余 full。
- 6 款经典：Negroni、Margarita、Whiskey Sour、Black Russian、Mojito、Cosmopolitan；可加 Boulevardier、Old Fashioned、Daiquiri 等补位，并把蛋清/agave 等补进 mock 或标 optional，最终让 computed ready = 7。
- Journal seed：Negroni（今晚，4 星）、Whiskey Sour（周四，5 星）、Margarita（周二，3 星）、Black Russian（8 Nov，4 星），对应 “4 drinks · 3 nights”。

## 附录 C：文件索引

| 需要查什么 | 看哪个文件 |
|---|---|
| 颜色/字号/间距/圆角/阴影/屏幕尺寸 | [tokens.json](Figma_design/data/tokens.json) |
| 布局数值、动效、无障碍、Hero、素材、6 款配方 | `Figma_design/pages/11_Handoff.png` |
| 颜色板、对比度、字体、HC、图标 | `Figma_design/pages/01_Foundations.png` |
| 组件与状态 | `Figma_design/pages/02_Components.pdf` |
| 页面视觉 | `Figma_design/screens/<分组>/<屏名>.png` |
| 浅色/高对比度/Hero 变色 | `Figma_design/screens/09_themes/` |
| 5 条流程/409 交互 | [prototype-links.json](Figma_design/data/prototype-links.json) |
| 整体设计说明 | [DEVELOPER_GUIDE.md](Figma_design/DEVELOPER_GUIDE.md) |
| 产品定位/目录 | [README.md](Figma_design/README.md) |

---

> 这份方案的目标是“后天在 iPad 上稳定演示”，不是“复刻 82 屏”。任何新增功能先问：它是否出现在 2 分钟演示脚本里？不在就砍。


