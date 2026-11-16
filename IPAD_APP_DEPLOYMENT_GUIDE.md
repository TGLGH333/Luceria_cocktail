# Luceria iPad App：开发与部署全流程

> 面向当前仓库状态（`luceria-pwa/`：Vue 3 + Vite + TS + Pinia，1194×834 固定舞台，hash 路由，生产环境注册 service worker，10 个配方，无后端）。
> 目标：用云 Mac + Apple 开发者账号，把现有 PWA 变成能上架 / 能 TestFlight 内测的 iPad 原生 App。
> 所有价格与政策核对时间为 2026-11，链接见文末。

---

## 0. 结论先行

| 决策 | 选择 | 理由 |
| --- | --- | --- |
| 技术路线 | **Capacitor 8 包装现有 PWA**（不重写） | 现有 6 MB 全静态产物 + hash 路由，天然适配 WKWebView；原生重写 82 屏要数月 |
| 最低 iOS | iOS 15+（Capacitor 8 最低要求），实际建议 16+ | 少兼容分支 |
| Xcode | **Xcode 26.x** | 2026-04-28 起，上传 App Store Connect 的 iOS/iPadOS App 必须用 iOS 26 / iPadOS 26 SDK 构建 |
| 云 Mac | **Apple silicon + macOS 26 (Tahoe)**，≥ 100 GB 磁盘 | Xcode 26 需 macOS 15.6+；Xcode 26.4+ 需 macOS 26.2+；Intel 机器跑 iOS 26 模拟器很痛苦 |
| 账号 | Apple Developer Program **$99/年** | TestFlight（100 内部 / 10 000 外部）、Ad Hoc 100 台、App Store 上架都需要它 |
| 首版分发 | **TestFlight 内测**（不公开上架） | 内部测试员无需 App Review，当天可装到 iPad；公开上架要过多轮 4.2 审核 |
| 工作量 | 首次跑通 TestFlight **2–3 天**；能过审的公开版 **2–4 周** | 主要工作不在"打包"，在 iPadOS 26 窗口化适配 + 原生能力 + 过 4.2 |

首月预算（人民币，按个人开发者、单机自测估）：

| 项 | 金额 | 备注 |
| --- | --- | --- |
| Developer Program | ≈ ¥700 / 年 | $99，Apple 收，可刷卡 |
| 云 Mac | ¥120 – ¥1 800 / 月 | 按小时租最省：AWS `mac2.metal` $0.65/h ≈ ¥4.7/h；整月托管 M4 ≈ $149/月 |
| iPad 真机 | 已有则 0 | 真机测试比模拟器可靠得多 |
| Apple 服务 | 0 | TestFlight、Xcode Cloud 25 计算小时/月都含在会员里 |

---

## 1. 三条路线，为什么选中间那条

| 路线 | 工作量 | 能上 App Store | 风险 |
| --- | --- | --- | --- |
| A. 纯 PWA（Safari「添加到主屏幕」） | 0（已完成） | 否 | 无推送、无图标角标、无商店曝光；iOS 对 PWA 仍有存储清理与后台限制 |
| **B. Capacitor 包装（推荐）** | 3–10 天 | 是 | 审核 4.2「最低功能」是唯一大坑，见第 5 章 |
| C. SwiftUI / UIKit 原生重写 | 6–12 周 | 是 | 82 屏 + 全部状态管理重写；设计稿在 Figma 里，等于第二次实现 |

**不要做**：`WKWebView.load(URLRequest("https://…"))` 直接套一个线上网址。这会被两条规则同时打：4.2（跟 Safari 没区别）+ 2.5.2（应用必须自包含）。你的场景还有第三个死因——酒谱类 App 在没网的地下室酒吧里就是废的。

---

## 2. 账号、证书与分发通道

### 2.1 先对齐「签证」指什么

这个词在 iOS 语境里可能指三件不同的事，对应完全不同的流程：

| 你说的可能是 | 实际含义 | 处理方式 |
| --- | --- | --- |
| 开发者账号资格 | Apple Developer Program 会员（个人 / 公司） | 见 2.2，必须买 |
| 签名证书 / 描述文件 | `.p12` 证书 + `.mobileprovision` | 见 2.4，由账号派生，不用单独"申请签证" |
| 企业签名 | Apple Developer Enterprise Program（$299/年） | 只能发给公司内部员工，**不能上架**，滥用会吊销整个公司账号 |

如果你已经能拿到「云 Mac + 企业签名」，说明你手上是**公司账号或企业账号**——那走 Ad Hoc / Enterprise 内部分发可以当天装到 iPad，但想出现在 App Store 仍需走 2.2 的正式流程。

### 2.2 三种账号

| 账号 | 年费 | 能做 | 不能做 |
| --- | --- | --- | --- |
| 免费 Apple ID（Xcode 个人团队） | 0 | 真机调试 | 7 天过期、无 TestFlight、不能上架 |
| **Developer Program 个人 / 公司** | $99 | App Store、TestFlight、Ad Hoc 100 台、Xcode Cloud | — |
| Enterprise Program | $299 | 内部员工 OTA 分发、免审核 | **不能上架 App Store**；要求公司实体 + D-U-N-S，审核很严 |

个人注册：身份证 + 实名支付即可，1–2 天通过。公司注册：要 **D-U-N-S 编号**（免费申请，1–2 周），账号持有人需为法人或授权人。

### 2.3 证书的种类（不用全申请，Xcode / fastlane 会按需生成）

| 证书 | 用途 |
| --- | --- |
| Apple Development | 真机调试（免费版也有） |
| Apple Distribution | App Store / Ad Hoc / Enterprise 签名 |
| APNs Key（.p8） | 推送（这版暂时不需要） |
| Pass Type ID | Wallet 凭证（不需要） |

**关键**：证书不是"签证"，它是从账号里生成的一对公私钥。真正决定能不能装到某台设备上的是 **Provisioning Profile**（把 App ID + 证书 + 设备 UDID 绑在一起）。云 Mac 上你不需要手工折腾这些——Xcode 自动签名或 fastlane match 会处理。

### 2.4 三种签名方式

| 方式 | 怎么做 | 适合 |
| --- | --- | --- |
| Xcode 自动签名 | Xcode 里勾 Team，其余全自动 | 手动开发、第一次跑通 |
| **fastlane match**（推荐给云 Mac） | 证书加密存私有 Git 仓库，机器上 `match(type: "appstore", readonly: true)` 拉下来 | 无 GUI 的 CI、换机器、多人协作 |
| 手动 p12 + profile | 开发者网站下载，塞进 Keychain 与 `~/Library/MobileDevice/Provisioning Profiles` | 冷门渠道（企业 OTA） |

云 Mac 上的现实问题：Xcode 首次登录 Apple ID 需要 2FA 验证码，走 VNC 可以完成；但**最稳的做法是用 App Store Connect API Key**（Key ID + Issuer ID + `.p8`），CI 里完全不需要 Apple ID 与 2FA。

App Store Connect → Users and Access → Integrations → App Store Connect API → 生成 Team Key（App Manager 权限），`.p8` **只能下载一次**，丢了下不了。

### 2.5 分发通道对比

| 通道 | 审核 | 人数 | 有效期 | 用途 |
| --- | --- | --- | --- | --- |
| 真机调试（免费签名） | 无 | 你的 3 台设备 | 7 天 | 改代码时看效果 |
| **TestFlight 内部** | 无 | 100（须是 App Store Connect 用户） | 构建 90 天 | 自测 + 小团队试喝 |
| TestFlight 外部 | 需 Beta App Review（首版每个版本一次） | 10 000 | 构建 90 天 | 招募试用用户 |
| Ad Hoc | 无 | 100 台 UDID / 年 | 1 年（profile 到期） | 给不方便用 TestFlight 的人 |
| App Store 公开 | 完整 App Review | 无限 | 长期 | 正式发布 |

**建议路径**：D+3 拿到内部 TestFlight → D+14 提交流程。

---

## 3. 云 Mac：选型、开机、避坑

### 3.1 必须 Apple silicon

Xcode 26 仍然有 Universal 版本能跑 Intel Mac，但：
- iOS 26 模拟器在 Intel 上依赖 Rosetta 与旧 Metal，启动慢、偶发黑屏；
- Capacitor 8 默认 **SwiftPM** 工程，Intel 机器上包解析与构建明显更慢；
- 云厂商的 Intel 机型（Mac Pro 2013 那批）通常停在旧 macOS，**装不上 Xcode 26.4+**（要求 macOS 26.2+）。

结论：要 **M 系列 + macOS 26 Tahoe**。租机器时直接问"能不能给我 macOS 26 + Xcode 26"。

### 3.2 价格（2026-10 价格页）

| 方案 | 价格 | 计费 | 适合 |
| --- | --- | --- | --- |
| AWS EC2 `mac2.metal`（M1, 16 GB） | $0.65/h ≈ ¥4.7/h；整月 ≈ $475 | **24 小时起租**（$15.60 起） | 短期集中开发 2–3 天 |
| AWS EC2 `mac2-m2.metal`（M2, 24 GB） | $0.878/h | 24 小时起租 | 构建更快，推荐 |
| AWS EC2 M4 机型 | ≈ $1.23/h ≈ $898/月 | 24 小时起租 | 团队长期 |
| MacStadium 托管 Mac mini M4 | ≈ $149/月 | 月付 | 长期独占、要 root |
| MacinCloud | 按小时/点数 | 共享机便宜、独占机 ≈ $164/月 | 只想试几个小时 |

**坑**：EC2 Mac 关机不释放，24 小时内退不掉，按秒计费但也按 24 小时最低收。一次性做完首次上架，租 3 天约 $47（¥340）比月租划算。

### 3.3 首次开机清单（照着敲）

```bash
# 1. 系统与工具链
sw_vers                              # 期望 ProductVersion: 26.x
xcode-select -p || xcode-select --install
sudo xcodebuild -license accept
xcodebuild -version                  # 期望 Xcode 26.x

# 2. Xcode 26（若未预装）：developer.apple.com/download 下载 .xip，或 App Store
#    首次启动会安装额外组件（~2 GB），并下载 iOS 26 模拟器（~8 GB）

# 3. 前端工具链（Capacitor 8 要求 Node ≥ 22.22）
brew install node@22 fastlane
corepack enable pnpm
node -v && pnpm -v

# 4. 锁屏/休眠设置（VNC 断开后不要休眠，否则构建中断）
sudo pmset -a sleep 0 displaysleep 30

# 5. 磁盘确认（Xcode + 模拟器 + 构建缓存，100 GB 起步）
df -h /
```

### 3.4 云 Mac 特有的四个坑

| 坑 | 现象 | 处理 |
| --- | --- | --- |
| 虚拟化 Mac 无 Metal | 模拟器黑屏 / 卡在启动 | 换真机测试，或用真 Apple 硬件（AWS/MacStadium） |
| VNC 断开 | Xcode 归档失败、Keychain 锁住 | `security unlock-keychain -p <密码> login.keychain-db` 后再跑命令行构建；或在 tmux 里跑 `xcodebuild` |
| 会话闲置 | 系统休眠导致 SSH 断 | `caffeinate -dimsu` 包住长构建 |
| 首次登录 2FA | Xcode 登录 Apple ID 卡住 | 用 API Key + fastlane，绕开 Apple ID 登录 |

### 3.5 中国网络

App Store Connect、developer.apple.com、GitHub 在云 Mac 上的连通性因机房而异。**只在下大文件（Xcode、模拟器）时用代理**，签名与上传走 Apple 官方域名，加代理容易触发 `ITMS-90000` 类上传超时。

---

## 4. 把 `luceria-pwa` 变成 iOS 工程

### 4.1 接之前先改三处前端

`luceria-pwa/` 现状对 WebView 有四个隐患，先处理再 `cap add ios`：

1. **Service Worker**：`src/main.ts:10` 只在 `import.meta.env.PROD` 注册。原生壳里资源全是本地的，SW 会缓存旧版本导致"改了代码 App 不变"。加开关：

```ts
// src/main.ts
const isNative = import.meta.env.VITE_NATIVE === '1'
if ('serviceWorker' in navigator && import.meta.env.PROD && !isNative) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
```

构建原生版时用 `VITE_NATIVE=1 pnpm build`（或在 `.env.ios` 里设）。

2. **`100vh` / `100dvh`**：WebView 里 `vh` 不含安全区。改用 `height: 100dvh` 或 `100%` + `padding: env(safe-area-inset-*)`。

3. **文本选择与高亮**：全局加
```css
html, body { -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none;
  overscroll-behavior: none; }
input, textarea { -webkit-user-select: text; user-select: text; }
```

4. **滚动惯性**：`-webkit-overflow-scrolling: touch`（老键）已有；确认 `.stage` 外层不要 `overflow: hidden` 到把内层滚动也切掉。

### 4.2 Capacitor 8 接入（Xcode 26 是硬要求）

```bash
cd luceria-pwa

pnpm add -D @capacitor/cli@^8
pnpm add @capacitor/core@^8 @capacitor/ios@^8

pnpm exec cap init "Luceria" "app.luceria.cocktail" --web-dir dist
pnpm exec cap add ios          # Capacitor 8 默认用 SwiftPM，生成 ios/App/App.xcodeproj

VITE_NATIVE=1 pnpm build
pnpm exec cap sync ios         # 把 dist 拷进 ios/App/App/public
pnpm exec cap open ios         # 打开 Xcode（云 Mac 上走 VNC）
```

- 不用 CocoaPods：Capacitor 8 默认 SPM，只有维护老工程才需要 pod。如果你看到 `ios/App/App.xcworkspace`，说明装的是 pod 方式，命令里 `-project` 换成 `-workspace`。
- `pnpm build` 必须先跑 `vue-tsc --noEmit`（`package.json` 里已这样配），类型错会直接挡住构建。

### 4.3 `capacitor.config.ts`

```ts
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.luceria.cocktail',
  appName: 'Luceria',
  webDir: 'dist',
  ios: {
    contentInset: 'never',        // 自己处理安全区，避免 WebView 二次内缩
    backgroundColor: '#121110',   // 首帧不闪白
    scheme: 'App',                // 本地 scheme: app://localhost
    preferredContentMode: 'mobile',
  },
}
export default config
```

`appId` 一旦上传就不能改，定好再传。

### 4.4 第一次跑到 iPad 上

1. Xcode → `App` target → Signing & Capabilities → Team 选你的团队；Bundle Identifier 与 `appId` 一致。
2. iPad 用数据线连（或同 Wi-Fi 无线调试），iPad 上「信任此电脑」。
3. `⌘R` 跑起来；首次会因「不受信任的开发者」需在 iPad 设置 → 通用 → VPN与设备管理 里信任。
4. 免费账号 7 天过期；付费账号用 Apple Development 证书可长期调试。

### 4.5 日常循环

```bash
# 改前端
VITE_NATIVE=1 pnpm build && pnpm exec cap sync ios
# 改原生（Info.plist、插件）才需要在 Xcode 里重跑
```

### 4.6 版本号规则

| 字段 | 位置 | 规则 |
| --- | --- | --- |
| `MARKETING_VERSION`（CFBundleShortVersionString） | Xcode target | `0.1.0` → `0.1.1` → `1.0.0`，给用户看的 |
| `CURRENT_PROJECT_VERSION`（CFBundleVersion） | 同上 | 每次上传必须递增，可脚本自增 |

---

## 5. 让它"像 iPad App"——4.2 是唯一的生死线

### 5.1 审核员会看到的破绽（对照你现在这份代码）

| 破绽 | 现在的位置 | 审核员的判断 |
| --- | --- | --- |
| 固定 1194×834 舞台 + `transform: scale()` | `src/App.vue:20-36` | "网页截图套壳" |
| 用 `pointer: coarse` 区分 iPad 和桌面 | `src/App.vue:23` | 给网页写的自适应逻辑 |
| 没有原生返回手势、没有下级页面滑入方向感 | `router.ts` `push` transition | 缺 iOS 导航习惯 |
| 「coming next」占位 toast | `TonightView` / `SettingsView` 等 | 4.2 / 2.1：功能未完成 |
| 首屏白闪、无启动屏 | 无 `UILaunchScreen` | 非原生观感 |
| 无触感、无通知、无后台计时 | 全靠 JS | "跟 Safari 没区别" |

4.2 的判定标准很朴素：**把 App 删掉、用 Safari 打开同一个网址，功能是否完全等价**。等价就拒。

### 5.2 iPadOS 26 的硬变化：应用必须能改尺寸

- `UIRequiresFullScreen` 在 iOS/iPadOS 26 起 **已弃用**，系统会在窗口化多任务里忽略它，把你的界面整体缩放而不是重排（视觉上糊）。
- Apple 明确提示 "support for all orientations will soon be required"。
- 你的 App 是 iPad-only 横屏固定舞台，**现在就能过审，但下一轮 iPadOS 更新会强制重排**。既然要重做一次，第一次就做对。

### 5.3 舞台改造：分两步，先保命再变好

**阶段 1（半天，先让窗口缩放不糊）**——保留 1194×834 设计稿，改成等比信箱：

```css
/* src/styles/base.css 或 App.vue 内 */
.stage {
  display: grid;
  place-items: center;
  height: 100dvh;
  background: var(--bg);
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
.canvas-wrap {
  aspect-ratio: 1194 / 834;
  width: min(100%, calc(100dvh * 1194 / 834));
  max-height: 100%;
}
```

以此替掉 `App.vue` 里的 `scale` 计算：宽高由 CSS 定，缩放用 `transform: scale(var(--stage-scale))` 只在需要时补。好处是旋转/分屏/窗口拖动时由浏览器重排，不再依赖 `resize` 监听算像素。

**阶段 2（3–5 天，真正自适应）**：

```css
/* 竖屏单列，横屏双栏 */
.layout { display: grid; grid-template-columns: 1fr; }
@media (min-width: 900px) and (orientation: landscape) {
  .layout { grid-template-columns: minmax(320px, 420px) 1fr; }
}
/* 13 寸 iPad 横向时内容最大宽度收一下，避免一行 40 个字符 */
.prose { max-width: 68ch; }
```

再配 `clamp()` 做字号：`font-size: clamp(1rem, 1.6vw + 0.5rem, 1.5rem)`；间距用 `--space-*` token（你已有 `tokens.css`）。竖屏要单独设计一个屏幕（Tonight 竖屏：英雄卡在上、推荐列表在下）。

**验收**：旋转、分屏（1/3 + 2/3）、台前调度拖窗口，三种情况下无裁切、无模糊、无横向滚动条。

### 5.4 `Info.plist` 关键键（不要加的也要知道）

```xml
<!-- 启动屏：用字典，别用 storyboard -->
<key>UILaunchScreen</key>
<dict>
  <key>UIColorName</key><string>LaunchBackground</string>
</dict>

<!-- iPad 四方向都要声明（iPadOS 26 窗口化会按方向重排） -->
<key>UISupportedInterfaceOrientations~ipad</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
  <string>UIInterfaceOrientationPortraitUpsideDown</string>
  <string>UIInterfaceOrientationLandscapeLeft</string>
  <string>UIInterfaceOrientationLandscapeRight</string>
</array>

<!-- 场景清单：单窗口，先不做多窗口 -->
<key>UIApplicationSceneManifest</key>
<dict>
  <key>UIApplicationSupportsMultipleScenes</key><false/>
</dict>

<!-- 出口合规：只用 HTTPS，免申报 -->
<key>ITSAppUsesNonExemptEncryption</key><false/>

<!-- 状态栏交给 App 自己画（深色主题） -->
<key>UIStatusBarStyle</key><string>UIStatusBarStyleLightContent</string>
<key>UIViewControllerBasedStatusBarAppearance</key><false/>

<!-- 高刷新率（iPad Pro 120 Hz），可选但要实测 -->
<key>CADisableMinimumFrameDurationOnPhone</key><true/>
```

**不要加**：`UIRequiresFullScreen`（已弃用，加了反而进兼容模式）。iPad-only 在 Xcode 里设 `TARGETED_DEVICE_FAMILY = 2`（只 iPad）。想同时在 Apple silicon Mac 上跑，保持默认（Designed for iPad），审核时不用额外说明。

### 5.5 必须补的原生能力（这不是加分项，是过审项）

| 能力 | 插件 | 解决什么 |
| --- | --- | --- |
| **本地通知** | `@capacitor/local-notifications` | M06 搅拌计时器在后台会被 WebView 挂起；用通知在 `endAt` 时刻提醒，回到前台用 `Date.now()` 重算剩余时间 |
| **触感** | `@capacitor/haptics` | 步骤切换、计时结束、勾选配方。轻触 `Light`，完成 `Success` |
| **屏幕常亮** | `@capacitor-community/keep-awake` | 调酒时要看步骤，屏幕不该黑 |
| **分享** | `@capacitor/share` | 导出配方卡片、分享购物清单 |
| **文件系统** | `@capacitor/filesystem` | Journal 导出 JSON/Markdown，走分享面板存到「文件」 |
| **状态栏 / 键盘** | `@capacitor/status-bar`、`@capacitor/keyboard` | 输入时不被键盘遮挡；状态栏风格跟主题 |

四个插件都在 Capacitor 官方/社区维护列表里，`pnpm add` 后 `cap sync` 即可，无额外原生代码。

### 5.6 把 4.2 焊死的三个"原生独占"功能（挑两个做）

| 功能 | 实现 | 审核价值 |
| --- | --- | --- |
| **Live Activity / 灵动岛式计时** | ActivityKit + App Intent，调酒时锁屏可见剩余时间 | 网页永远做不到，最强的"不是网站"证据 |
| **Widget（今日一杯）** | WidgetKit + App Group 读共享 UserDefaults | 有主屏入口，审核员第一眼就看到 |
| **Siri / App Intents**：「今晚喝什么」直接播报推荐 | App Intents + 共享数据 | 与系统深度集成 |
| **Spotlight 索引** | Core Spotlight 索引 10 个配方 | 搜「Negroni」能出 App |
| **HealthKit 酒精摄入** | 写「酒精摄入量」样本 | 与「mindful drinking」卡呼应；注意不要写医疗建议 |
| **相机扫酒标** | Vision + 你的 `ingredients.ts` 库 | 你现在没后端也能做（本地匹配） |

**最小可行组合**：本地通知 + 触感 + 常亮 + Live Activity（计时）+ Widget（今日一杯）。这五样做完，"跟 Safari 打开网页等价"这个论点就不成立了。

### 5.7 触控细节清单（审核员会摸的）

- 所有可点元素 ≥ 44×44 pt；你已有 `--large-targets` 思路，直接映射。
- 禁用双击缩放：`<meta name="viewport" content="…, maximum-scale=1, user-scalable=no">`（无障碍允许缩放就别禁，二选一，别两头不讨好）。
- `touch-action: manipulation` 去掉 300 ms 点击延迟。
- 长按不要弹出网页选区；但文本要能选中（配方步骤允许复制）。
- 输入框 `font-size ≥ 16px`，否则 Safari/WebView 聚焦时会自动放大。
- 键盘弹起时用 `@capacitor/keyboard` 的 `resize: 'body'`，不要靠 `window.innerHeight`。

---

## 6. 素材：图标、启动屏、截图

### 6.1 图标

- **单尺寸 1024×1024 PNG，不能有 alpha 通道**（有透明像素 = `ITMS-90022` 拒收）。你现有 `public/icons/icon-512.png` 只有 512，需要重出 1024。
- Xcode 26 用单尺寸即可自动生成全部尺寸；再补两套外观变体（Dark / Tinted）出图更跟手。
- 图标主体要有边距（内容占 ~80%），系统会切圆角。

### 6.2 启动屏

`UILaunchScreen` 指向一个颜色名，配 `Assets.xcassets/LaunchBackground.colorset`（`#121110`）。这样冷启动不是白闪，而是深色底直接进 Welcome。

### 6.3 截图（App Store 硬性要求）

- 支持 iPad 的 App **必须**至少 1 张 13 寸 iPad 截图：**2064×2752（竖）或 2752×2064（横）**，每尺寸最多 10 张。
- 出图方式（云 Mac 上）：

```bash
xcrun simctl list devices | grep "iPad Pro 13"
xcrun simctl boot "iPad Pro 13-inch (M4)"
# 装 app 并跑到目标页面后：
xcrun simctl io booted screenshot ~/Desktop/shot-tonight.png
```

- 建议 6 张叙事顺序：Tonight（今晚一杯）→ Recipes（筛选）→ Recipe（配方详情）→ Mix（计时）→ Bar（我的酒柜）→ Journal（本周）。横屏更贴你的设计。
- 截图里**不要**出现：「coming next」占位、Lorem、调试条、动图外框假 UI（误导截图会被 2.3.3 拒）。

### 6.4 商店文案（提交前就备好）

| 字段 | 内容 |
| --- | --- |
| App 名称（≤30 字符） | Luceria |
| 副标题（≤30） | 用你手上的酒调出今晚一杯 |
| 分类 | 主：Food & Drink；次：Lifestyle |
| 隐私政策 URL | 必须可访问（没有后端也要写"数据仅存本机"） |
| 支持 URL | GitHub Pages / Notion 均可 |
| 关键词 | cocktail,bar,recipe,negroni,mixology |

---

## 7. 构建、上传与 TestFlight

### 7.1 GUI 三步（第一次建议走一遍，便于看清参数）

1. Scheme 选 `App`，目标选 `Any iPad`。
2. Product → Archive。
3. Organizer → Distribute App → App Store Connect → Upload。

### 7.2 CLI（之后都用这个）

```bash
# 归档
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/Luceria.xcarchive archive \
  DEVELOPMENT_TEAM=XXXXXXXXXX CODE_SIGN_STYLE=Automatic

# 导出 ipa
cat > ExportOptions.plist <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>   <!-- 老版 Xcode 写 app-store -->
  <key>teamID</key><string>XXXXXXXXXX</string>
  <key>signingStyle</key><string>automatic</string>
  <key>uploadSymbols</key><true/>
  <key>destination</key><string>export</string>
</dict></plist>
PLIST

xcodebuild -exportArchive -archivePath build/Luceria.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build/ipa

# 上传（API Key，无需 Apple ID 与 2FA）
xcrun altool --upload-app -f build/ipa/Luceria.ipa -t ios \
  --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER"
```

### 7.3 fastlane（一次配置，长期省事）

```ruby
# ios/fastlane/Fastfile
platform :ios do
  before_all do
    app_store_connect_api_key(
      key_id: ENV["ASC_KEY_ID"],
      issuer_id: ENV["ASC_ISSUER"],
      key_filepath: ENV["ASC_KEY_PATH"],
    )
  end

  lane :beta do
    increment_build_number(xcodeproj: "App/App.xcodeproj")
    match(type: "appstore", readonly: true)          # 证书从私有仓库拉
    build_app(project: "App/App.xcodeproj", scheme: "App",
              export_method: "app-store-connect",
              output_directory: "build")
    upload_to_testflight(skip_waiting_for_build_processing: true)
  end
end
```

`match` 初始化一次：`fastlane match init`（选 git 存储）→ `match(type: "appstore")` 生成并加密上传证书 → 之后任何机器 `readonly: true` 直接拉。

### 7.4 TestFlight 规则

| 项 | 值 |
| --- | --- |
| 内部测试员 | 100（须在 App Store Connect 里有角色） |
| 外部测试员 | 10,000，首版需 Beta App Review |
| 构建有效期 | 上传后 **90 天**（过期连本地数据都没了） |
| Ad Hoc | 100 台 UDID / 年 |
| 单版本并行 | 可多个构建同时在测 |

### 7.5 上传报错速查

| 报错 | 原因 | 处理 |
| --- | --- | --- |
| `ITMS-90022` | 图标带 alpha | 导出 PNG 时去掉透明通道 |
| `ITMS-90189`/`90062` | 构建号重复 | `CURRENT_PROJECT_VERSION` 自增 |
| `ITMS-90725` | SDK 版本过低 | 必须 Xcode 26 / iOS 26 SDK |
| `ITMS-90362`/`91198` | Info.plist 键缺失或值类型错 | 对照 5.4 表 |
| `ITMS-91053` | 缺隐私清单（Required Reason API） | 见 8.3 |
| `ITMS-90000`/超时 | 网络/代理 | 直连 Apple，别走代理 |

---

## 8. 提交审核

### 8.1 App 记录字段（App Store Connect 里新建 App 时）

- 平台：iOS；名称、副标题、SKU（内部用，如 `luceria-ipad-001`）、语言（中文 + 英文）。
- Bundle ID：`app.luceria.cocktail`。
- 主分类 Food & Drink。

### 8.2 年龄分级（2026 新五档）

Apple 在 2025 年把分级改为 **4+ / 9+ / 13+ / 16+ / 18+**（去掉 12+/17+），并在 **2026-01-31** 前要求所有开发者重填问卷，否则无法提交更新。

对 Luceria：
- 「酒精、烟草或毒品提及」→ 通常落到 **13+**；
- 若出现"购买酒精""鼓励醉酒"之类内容，分级会更高；
- App Store China 对酒精类应用另有本地审核尺度，文案避免"喝醉""拼酒"，强调"适度饮酒"（你现有的 mindful drinking 卡正好加分）。

按新问卷如实填，最终分级由 Apple 计算，不要自己选一个更低的去试。

### 8.3 App 隐私 + 隐私清单

- App 隐私问卷：数据全部"仅存本机"→ 不收集 → 勾 Nothing collected（除诊断，可不勾）。
- `PrivacyInfo.xcprivacy`（Xcode target 里加 Resource）：

```xml
<key>NSPrivacyTracking</key><false/>
<key>NSPrivacyCollectedDataTypes</key><array/>
<key>NSPrivacyTrackingDomains</key><array/>
<key>NSPrivacyAccessedAPITypes</key>
<array>
  <dict>
    <key>NSPrivacyAccessedAPIType</key>
    <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
    <key>NSPrivacyAccessedAPITypeReasons</key><array><string>CA92.1</string></array>
  </dict>
</array>
```

Capacitor 8 的桥接层自带清单；如果 Xcode 的聚合隐私报告提示缺失某个 SDK，按报告补，别猜。

### 8.4 出口合规

`ITSAppUsesNonExemptEncryption = NO`（5.4 已给）。只用 HTTPS 的场景属于豁免，提交时不用再被问一次。

### 8.5 DSA（欧盟）

App Store Connect 要求所有开发者声明 **trader / non-trader**：
- 只给自己和团队内测 → non-trader，EU 不展示联系方式；
- 要公开上架欧盟 → trader，需提供公司地址、电话、邮箱并公开展示。

第一次提交时系统会强制你选一次，之后可按 App 单独关。

### 8.6 中国大陆（没有后端是你的优势）

- 工信部 2023 年 105 号文要求所有在中国大陆提供互联网信息服务的 App 有 **ICP 备案号**，App Store Connect 在「App 信息」里要填。
- **豁免路径**：App 不联网（或只连 Apple 服务）可向 Apple 申请豁免备案。你的 PWA 全部本地资源、无后端、无外链 → 符合豁免条件。做法：developer.apple.com/cn → 联系我们 → 分发 → 填写「应用的 Apple ID」，说明 App 无需联网，申请豁免 ICP 备案；通常次日回复要求一份声明。
- 若以后加"账号/云端同步/社区"，就必须备案（个人可备，企业主体更快）。
- 软著：App Store 目前不强制；但游戏与部分类目会要，酒谱类不涉及，先不办。

### 8.7 审核备注模板

```
Luceria is an offline-first cocktail companion for iPad.

• Everything is bundled: 10 recipes, 19 ingredients, bar inventory, journal.
  The app makes no network requests; no account is required.
• Native integration: local notifications for step timers (works when the
  app is backgrounded), haptics, keep-awake during mixing, and a Live
  Activity / widget so the current drink is visible on the Lock Screen.
• No in-app purchases, no external links, no user-generated content.

Review notes: open the app → "Get started" → Tonight. Tap "Start mixing"
on the header card to see the timer flow. Settings → Appearance switches
themes. No login is needed.
```

### 8.8 时间线

- 上传 → TestFlight 可装：**5–15 分钟**（处理完构建）。
- 首次提交公开审核：通常 **24–48 小时**；被拒后回复最快数小时。

---

## 9. 拒审 Top 10 与对策

| # | 条款 | 常见描述 | 对策 |
| --- | --- | --- | --- |
| 1 | 4.2 | "与网站无区别" | 5.5 + 5.6，两个原生独占功能 |
| 2 | 2.1 | "功能未完成" | 删掉所有「coming next」占位；按钮要么能用要么不显示 |
| 3 | 2.5.2 | 下载可执行代码 | WebView 只加载包内资源，别 remote load |
| 4 | 2.3.3 | 截图与实际不符 | 截图必须来自当前包 |
| 5 | 5.1.1 | 未授权内容 | 配方文案、图片版权自证；酒标图案别用真品牌 |
| 6 | 1.4.1 | 酒精/健康暗示 | 不做医疗建议；有"适度饮酒"提示 |
| 7 | 4.0 | 设计不达标 | 用系统字体、系统控件、动态字体、深色模式（你基本都有） |
| 8 | 3.1.1 | 内购 | 这版没有付费内容，别在 UI 里露"订阅"字样 |
| 9 | 2.1 | 崩溃 | 云 Mac 上真机跑一遍所有路由；打开 VoiceOver 过一遍 |
| 10 | 4.3 | 模板化 | 品牌视觉 + 真实内容（你 82 屏 Figma 已是差异化） |

---

## 10. 里程碑与验收

| 阶段 | 天 | 交付 | 验收 |
| --- | --- | --- | --- |
| P0 账号 | D0 | Developer Program 批下来，App ID 注册 | App Store Connect 能建 App |
| P1 云 Mac | D0–D1 | Xcode 26 + Node 22 + fastlane | `xcodebuild -version` 与 `pnpm build` 都过 |
| P2 壳子跑通 | D1–D2 | `ios/` 工程 + 真机运行 | iPad 上看到 Tonight 页面，无白屏 |
| P3 TestFlight | D3 | 内部构建 | 自己 iPad 从 TestFlight 装上 |
| P4 原生适配 | D4–D8 | 5.3 阶段 2 + 5.5 四插件 | 旋转/分屏无裁切；计时器后台能响 |
| P5 审核素材 | D9–D10 | 1024 图标、启动屏、6 张截图、隐私 URL | 素材清单全绿 |
| P6 提交 | D11 | 公开版提交 | 状态变 Waiting for Review |
| P7 过审 | D12–D20 | 上架或被拒 | 首轮大概率被 4.2 打回，按 9 章改 |

---

## 11. 需要你确认的三件事

1. **账号类型**：个人 $99 / 公司 $99 / 企业 $299？决定分发通道与 D-U-N-S 流程。
2. **目标**：先 TestFlight 给自己用，还是必须公开上架？前者 3 天，后者 3 周起。
3. **设计锁定**：1194×834 横屏必须像素级保真，还是允许为竖屏/分屏做重排？这决定 5.3 走阶段 1 还是阶段 2。

---

## 参考

- [Apple：SDK 最低要求（2026-04-28 起必须 iOS/iPadOS 26 SDK）](https://developer.apple.com/news/?id=ueeok6yw)
- [UIRequiresFullScreen（iOS/iPadOS 26 起弃用）](https://developer.apple.com/documentation/BundleResources/Information-Property-List/UIRequiresFullScreen)
- [Capacitor 8 环境要求（Node 22.22+ / Xcode 26+ / iOS 15+）](https://capacitorjs.com/docs/getting-started/environment-setup)
- [TestFlight 限制（100 内部 / 10 000 外部 / 90 天）](https://developer.apple.com/testflight/)
- [App Store 截图规格（iPad 13 寸 2064×2752 / 2752×2064）](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
- [App Store 审核指南 4.2 最低功能](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality)
- [Xcode Cloud 定价（会员含 25 计算小时/月）](https://developer.apple.com/xcode-cloud/)
- [DSA trader 声明](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements)
- [EC2 Mac 计费（mac2.metal $0.65/h，24 小时起租）](https://instances.vantage.sh/)
