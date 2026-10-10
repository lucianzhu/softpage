# 柔页 · Softpage

让明亮的网页柔和一点，让长时间阅读少一些刺眼感。

柔页是荞麦工作室 · Qiaomai Studio 开发的 Chrome 扩展。它将网页中过于明亮的背景调整为柔和底色，缓和大面积亮背景与文字之间的强烈反差，同时尽量保留文字和链接的辨识度。

如果你常在 X 阅读动态，或在 ChatGPT、DeepSeek、豆包等 AI 网站阅读长篇回答，柔页希望为这样的日常阅读场景提供一种更舒适的显示选择。它不是这些平台的官方产品，具体效果会随网页样式变化，不代表已逐一验证所有网站兼容性。

我们准备了三种柔和底色：**豆沙绿、羊皮纸、亮暖灰**，也支持自定义颜色。你可以按网站决定是否开启：默认不启用任何网站，只有你主动选择“为此网站开启”并授予所需的网站访问权限后，柔页才会调整该网站的显示。已经授权并开启的网站会记住你的选择，无需每次重复操作。

柔页只改变网页显示，不修改原始内容；“护眼”是设计出发点，不是预防眼病或改善视力的医学承诺。

当前版本：**0.1.19**。可从 GitHub 下载并按下方说明在本地安装。

## 下载

**[下载柔页 0.1.19 ZIP](https://github.com/lucianzhu/softpage/releases/download/v0.1.19/softpage-0.1.19.zip)** · [版本说明与所有下载](https://github.com/lucianzhu/softpage/releases)

解压后选择包内的 `softpage` 文件夹加载。无需编译；不是一键安装，也不会自动更新。请长期保留安装文件夹。Chrome Web Store 是未来的另一个安装渠道，不影响 GitHub 下载和版本更新。

## 功能

- 默认不启用任何网站。用户主动开启时，才申请该网站的访问权限。
- 豆沙绿、羊皮纸、亮暖灰主题，以及自定义底色与亮度阈值。
- 工具栏快速切换主题；设置页管理网站和全局暂停。
- 图片柔化默认关闭，可调整强度；只改变显示，不修改原图文件。
- 偏好保存在本机，不使用 Chrome 同步存储。

## 浏览器兼容性

柔页目前仅在 Google Chrome 中进行过实际测试。Microsoft Edge 及其他基于 Chromium 的浏览器尚未测试，不保证能够正常安装或完整运行。欢迎通过 GitHub Issues 反馈，并注明浏览器名称、版本和遇到的问题；请勿提交敏感信息或未脱敏截图。

## 本地安装

1. 下载并解压项目，找到包含 `manifest.json` 的文件夹。
2. 在 Chrome 中打开 `chrome://extensions`，开启开发者模式。
3. 点击“加载已解压的扩展程序”，选择上述文件夹。
4. 打开普通 HTTP 或 HTTPS 网页，在柔页弹窗中点击“为此网站开启”，按浏览器提示授权。
5. 如效果没有出现，刷新页面。其他同时修改网页颜色的扩展可能产生冲突。

关闭网站会停止柔页效果，但 Chrome 已授予的网站权限可能仍保留，可在扩展详情中撤销。HTTP、HTTPS 和不同子域名分别配置；同一协议与主机名的不同端口共用开关。

## 隐私与权限

扩展没有广告、遥测、账号系统或数据上传功能。获准网站的 DOM 和样式在浏览器本地处理；设置使用 `chrome.storage.local` 保存。

- `storage`：保存偏好与开启网站列表。
- `activeTab`：识别用户主动操作的当前页面。
- `scripting`：在获准并开启的网站执行本地显示调整脚本。
- 可选网站权限：首次为网站开启时逐站申请，不在安装时取得所有网站访问权限。

完整政策见 [PRIVACY.md](PRIVACY.md)。公开政策网址：https://privacy.qiaomai.win/softpage/

## 已知限制

不支持 Chrome 内部页面、Chrome Web Store 页面、iframe 和封闭 Shadow DOM。复杂背景、特殊样式和动态页面可能存在遗漏；深色自定义底色可能降低文字对比度。长页面性能尚未完成系统基准测试。

工具栏状态表示网站开关及权限状态，不保证页面所有元素都已调整。柔页是显示外观工具，不提供医疗效果承诺。

## 开发与支持

原生 JavaScript、Manifest V3，无第三方包依赖，无构建步骤。首批公开范围不包含本地测试目录；这不表示没有测试，也不保证所有网站兼容。

项目按功能需求独立重新编写。曾参考其他扩展的使用体验，不宣称严格净室开发；未纳入旧第三方扩展代码或素材。

请通过 [GitHub Issues](https://github.com/lucianzhu/softpage/issues) 提交问题。提交反馈时，请勿公开密码、令牌、私人对话、完整浏览记录或未脱敏截图。

## 许可证

采用 [MIT License](LICENSE)，版权署名为 `lucianzhu`。允许使用、修改及商业使用，须保留许可证和版权声明。荞麦工作室是产品品牌，不表示已注册企业或商标。

---

## English

Softer pages, less glare during long reading sessions.

Softpage is a Chrome extension by Qiaomai Studio. It replaces overly bright page backgrounds with gentler colors, easing the stark contrast between large bright surfaces and text while aiming to keep text and links readable.

Whether you read posts on X or long answers on AI websites such as ChatGPT, DeepSeek, and Doubao, Softpage is designed with these everyday reading situations in mind. It is not an official product of these platforms. Results depend on page styling; mentioning a website does not mean its compatibility has been individually verified.

Choose from three gentle background colors—**bean-paste green, parchment, and light warm gray**—or use your own. You stay in control: no websites are enabled by default. Softpage adjusts a site only after you choose to enable it and grant the required site access. Your choice is remembered for sites that remain authorized and enabled.

Softpage changes the display, not the original content. Visual comfort is its design goal, not a medical claim to prevent eye disease or improve eyesight.

**Version: 0.1.19.** Download from GitHub and install locally using the instructions below. The extension interface is currently in Chinese.

### Download

**[Download Softpage 0.1.19 ZIP](https://github.com/lucianzhu/softpage/releases/download/v0.1.19/softpage-0.1.19.zip)** · [Release notes and all downloads](https://github.com/lucianzhu/softpage/releases)

Extract the ZIP and load the included `softpage` folder. No build step is required. This is not one-click installation and does not auto-update; keep the installation folder in a permanent location. Chrome Web Store will be a separate installation channel; GitHub downloads and releases are maintained independently.

### Browser compatibility

Softpage has only been tested in Google Chrome. Microsoft Edge and other Chromium-based browsers have not been tested; successful installation and full functionality are not guaranteed. Feedback through GitHub Issues is welcome. Please include your browser name, version, and the issue encountered, without sensitive information or unredacted screenshots.

### Features and installation

No websites are enabled by default. Site access is requested only when you explicitly enable a website. Choose a preset or custom background color, adjust the brightness threshold, manage enabled sites, or pause all effects. Image softening is off by default and does not alter original files.

Download and extract the project. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the folder containing `manifest.json`. Open an HTTP or HTTPS page, enable it through the Softpage popup, and grant the requested site permission. Refresh if necessary. Other page-color extensions may conflict.

Disabling a site stops the effect but may leave Chrome's granted permission in place; revoke it in the extension details if desired. HTTP, HTTPS, and subdomains are configured separately; ports on the same scheme and hostname share a setting.

### Privacy and limitations

Preferences stay in `chrome.storage.local`, not Chrome Sync. Authorized page structure and styles are processed locally. There is no advertising, telemetry, account system, or data-upload feature. See the bilingual [privacy policy](PRIVACY.md) for permission details and data practices.

Chrome internal pages, Chrome Web Store pages, iframes, and closed Shadow DOM are unsupported. Complex styles may be missed. Dark custom colors can reduce text contrast. Systematic long-page performance benchmarks are incomplete. This is a display tool, not a medical product.

### Development, support, and license

Native JavaScript and Manifest V3, with no third-party packages or build step. Local tests are excluded from this initial publication. The implementation was independently rewritten after exposure to other extensions; it is not claimed to be a strict clean-room implementation. Old third-party extension code and assets are excluded.

Report problems through [GitHub Issues](https://github.com/lucianzhu/softpage/issues). Do not post credentials, private conversations, browsing histories, or unredacted screenshots.

Licensed under the [MIT License](LICENSE), copyright `lucianzhu`. Qiaomai Studio is a public-facing brand name, not a claim of company or trademark registration.
