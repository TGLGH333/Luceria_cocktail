# 周三演示（2026-11-18）PWA 装机清单

目标：iPad 上从桌面图标启动，全屏无地址栏，断网可跑。**不需要** Xcode、云 Mac、TestFlight。

时间预算：今晚 60–90 分钟，周二整天作为缓冲，周三提前 30 分钟做现场检查。

---

## 1. 构建（约 5 分钟）

```powershell
cd D:\项目\Luceria_cocktail-main\luceria-pwa
pnpm build
```

- 确认 `dist\` 里 `index.html` 的构建时间晚于你最后一次改 `src\`。周一下午 `TonightView.vue` 改过而 `dist` 是 18:00 构建的，所以**先重建再上传**。
- 构建的最后一步是 `scripts/stamp-sw.mjs`，它把 `src/sw-template.js` 渲染成 `dist/sw.js` 并写入本次构建的缓存名（形如 `luceria-shell-0.1.0-20261116T100836Z`）。**不需要再手动改缓存版本号**。
- 构建完就冻结代码。演示前不再改 `src\`，否则要重走第 2 步到第 5 步。

## 2. 拿到一个 HTTPS 地址（约 5 分钟）

任选其一：

| 方式 | 命令/操作 | 适用 |
| --- | --- | --- |
| Netlify Drop（最快，免账号） | 浏览器打开 <https://app.netlify.com/drop>，把 `dist` 文件夹拖进去 | 一次性演示，几十秒拿到 `https://xxx.netlify.app` |
| Netlify CLI | `npx netlify-cli deploy --dir dist --prod` | 已有 Netlify 站点可复用 |
| 任意静态托管 | 上传 `dist` 内容（不是整个文件夹） | Cloudflare Pages / Vercel / 自建 |

必须在 **HTTPS** 下安装：Service Worker 只在 HTTPS 或 localhost 生效，没有 SW 就没有离线能力。

## 3. 装到 iPad 主屏幕（约 3 分钟）

1. iPad 用 **Safari** 打开上面拿到的网址（Landscape 放置）。
2. 工具栏「分享」→「添加到主屏幕」→ 名称填 `Luceria` → 添加。
3. **从桌面图标启动**（不是从 Safari 标签页）。这一步才进入 `display: standalone` 全屏模式，地址栏消失。

## 4. 预热离线缓存（约 10 分钟，必须做）

首次联网状态下，把每条路由都走一遍，让运行时缓存把 JS/CSS/图片/字体存下来：

`/#/` → `/#/tonight` → `/#/recipes` → 随机进 2 个 `/#/recipe/:slug` → `/#/mix/:slug` → `/#/bar` → `/#/list` → `/#/journal` → `/#/settings`

然后**打开飞行模式，从桌面图标重新启动，再走一遍**。断网可跑 = 现场没 Wi-Fi 也不会白屏。

## 4.5 复位演示数据（演示前一天）

正式演示前把酒柜、Journal、设置调成你想讲的状态，调乱了就一键还原：

- 在 **Safari 标签页**里打开 `https://<你的站点>/?demo=reset` 并回车。App 会在启动前清掉 `luceria.bar.*`、`luceria.journal.*`、`luceria.settings.*`、`luceria.mix.*` 这些键，回到初始演示数据（15 种酒的酒柜、3 条示例 Journal、默认设置），底部会闪一条 `Demo state restored · N keys cleared`。
- 主屏图标启动的 App 没有地址栏，敲不了这个 URL，所以这一步要在 Safari 里做；也可直接用它下次启动时的新状态接着演示。
- App 内等价入口：Settings → Reset demo。

## 5. iPad 系统设置（约 5 分钟，一次性）

- 控制中心 → **锁定横屏**（PWA 的 `orientation: landscape` 在 iOS 上不生效，靠系统锁）。
- 设置 → 显示与亮度 → **自动锁定 = 永不**（演示时不会黑屏）。
- 控制中心 → **勿扰模式 / 专注模式** 打开（挡掉通知横幅）。
- 设置 → 辅助功能 → 引导式访问 → 打开并设置密码。演示时**三击侧边键**即可把 iPad 锁在 Luceria 里，评审碰不到主屏和其他 App。
- 亮度调到约 70%，别开原彩显示（True Tone）以免投影偏色。

## 6. 演练（周二做 2 次）

- 完整走一遍你要讲的路径，记时间。
- **录一次屏**（控制中心 → 屏幕录制）存到「照片」。现场万一崩溃，直接放视频，比当场修好得多。
- 备份 1：同一台 iPad 的 Safari 标签页里也留着该网址（主屏图标异常时用它）。
- 备份 2：笔记本浏览器把窗口调成 1194×834 演示（`F11` 全屏），USB-C → HDMI 投到投影。

## 7. 周三当天，开始前 30 分钟

1. iPad 充电，接电源（演示时长不确定）。
2. 从桌面图标启动，确认全屏、无地址栏。
3. 飞行模式开关一次，确认 App 仍能启动（验证离线）。
4. 三击侧边键进引导式访问，再演示。
5. 演示当天不要再部署。如果周二之后又重传过，先在联网状态从桌面图标启动一次，让新的 service worker 装好（缓存名随构建变化，会自动切换），再进引导式访问。

---

## 三个会毁掉演示的坑

1. **service worker 是 cache-first**。装到 iPad 之后再重新部署，旧内容的消失要等 worker 更新：新构建的缓存名不同，worker 会在下次联网启动时安装并接管缓存。所以「重新部署 → 联网打开一次」这个顺序不能省；如果 iPad 上仍是旧版，删掉桌面图标、清 Safari 网站数据后重装最省事。绝不能靠手动改缓存名绕过——现在由构建自动写。
2. **地址栏只在「桌面图标启动」时消失**。在 Safari 标签页里打开，永远是网页的样子，演示效果大打折扣。
3. **没有方向锁定**。竖过来界面会被 `App.vue` 的缩放逻辑压小，务必在控制中心锁横屏。

## 不做的事

不在周三前动原生工程（Capacitor / Xcode）。原生包在 48 小时内要跨过「租云 Mac → 下 30 GB Xcode 26 → 编译 → 签名 → 设备开发者模式信任」，任一环节卡住就赶不上，而演示效果与 PWA 装机没有区别。原生路线等这次演示结束后按 [IPAD_APP_DEPLOYMENT_GUIDE.md](IPAD_APP_DEPLOYMENT_GUIDE.md) 走。
