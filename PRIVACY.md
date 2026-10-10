# 柔页 · Softpage 隐私政策

生效日期：2026 年 9 月 21 日  
适用版本：柔页 · Softpage 0.1.17 及后续未实质改变数据处理方式的版本  
发布者：荞麦工作室 · Qiaomai Studio（产品对外署名，不表示已注册企业或商标）  
语言：中文 / English

## 概要

柔页是一款按网站调整网页显示外观的 Chrome 扩展。扩展不包含广告、遥测、用户行为统计、账号系统、远程脚本或数据上传功能。柔页处理的数据仅用于提供用户主动开启的网页显示调整功能，并保存在用户自己的浏览器中。

## 处理的数据

为了判断哪些网页区域需要调整，柔页会在用户已经授权并开启的网站中，在本地读取网页的 DOM 结构、元素样式和计算样式。柔页不会主动读取或保存表单输入、账号密码、Cookie 或完整浏览历史，也不会将网页正文或上述信息发送给发布者或第三方。

柔页使用 `chrome.storage.local` 在本机保存以下设置：

- 用户选择的背景颜色与亮度阈值；
- 图片柔化开关与柔化强度；
- 全局暂停状态；
- 用户主动开启的网站协议和主机名。

这些设置不使用 Chrome 同步存储，不会由柔页上传到外部服务器。

## 数据用途

上述数据只用于：

- 判断当前网站是否已经由用户开启；
- 在获准网站中识别明亮、中性的网页背景并调整显示颜色；
- 应用用户选择的主题、阈值、暂停状态和可选图片柔化效果；
- 在浏览器重启、扩展后台恢复或权限撤销后，保持网站配置、动态脚本注册和工具栏状态一致。

图片柔化只在浏览器显示阶段应用本地颜色滤镜。柔页不读取图片像素，不下载额外图片，不修改原始图片文件，也不上传图片。开启图片柔化后，图片显示颜色会轻微偏向用户选择的主题色。

## 权限说明

- `storage`：在本机保存上述偏好和已开启网站列表。
- `activeTab`：用户打开工具栏弹窗时识别当前活动页面，并在用户操作后使设置立即生效。
- `scripting`：在已经获得网站权限且由用户开启的网站中注册或执行本地改色脚本。
- 可选网站访问权限：柔页在安装时不要求访问所有网站。只有用户点击“为此网站开启”时，浏览器才会请求当前 HTTP 或 HTTPS 网站的访问权限。拒绝授权不会把该网站加入开启列表。

关闭某个网站会停止改色并从柔页的开启列表中移除该网站，但 Chrome 已授予的访问权限可能仍保留。用户可以在 Chrome 的扩展详情页撤销网站权限；权限被撤销后，柔页会清理对应的网站配置和动态脚本。

## 数据分享与传输

柔页不会将用户数据出售、出租、分享或传输给发布者、广告商或其他第三方。扩展没有用于上传网页内容、浏览活动、设置或图片的网络功能，也不执行远程托管代码。

柔页对网站内容和浏览活动信息的使用，仅限于向用户提供其主动开启的网页显示调整功能；不会用于广告、用户画像、信用评估或与该单一用途无关的目的，也不会允许人工读取这些数据。

## 保存与删除

设置会保存在用户本机，直到用户修改设置、关闭网站、撤销相应权限、清除扩展数据或卸载扩展。柔页没有发布者控制的服务器副本，因此发布者无法从远端查看、导出或删除用户本机的数据。

## 隐私政策变更

如果柔页的数据处理方式发生实质变化，本政策会相应更新生效日期和内容，并确保 Chrome Web Store 开发者后台的披露、商店说明与扩展实际行为保持一致。

## 联系方式

如对本政策或柔页的数据处理方式有疑问，请通过 [GitHub Issues](https://github.com/lucianzhu/softpage/issues) 提交。请勿在公开反馈中包含个人敏感信息或未脱敏截图。

---

# Softpage Privacy Policy

Effective date: September 21, 2026  
Applies to: Softpage 0.1.17 and later versions that do not materially change data practices  
Publisher: Qiaomai Studio (a public-facing product name that does not imply a registered company or trademark)

## Summary

Softpage is a Chrome extension that adjusts the appearance of web pages on a per-site basis. It contains no advertising, telemetry, user-behavior analytics, account system, remotely hosted code, or data-upload feature. Softpage processes data only to provide display adjustments that the user has explicitly enabled, and the data remains in the user's own browser.

## Data processed

To determine which areas of a page should be adjusted, Softpage locally reads the DOM structure, element styles, and computed styles on websites that the user has authorized and enabled. Softpage does not intentionally read or store form input, account passwords, cookies, or complete browsing history, and it does not send page content or any of the foregoing information to the publisher or third parties.

Softpage uses `chrome.storage.local` to store the following on the user's device:

- the selected background color and brightness threshold;
- the image-softening setting and intensity;
- the global pause state; and
- the protocol and hostname of websites the user has enabled.

These settings are not stored with Chrome Sync and are not uploaded by Softpage to external servers.

## How data is used

The data is used only:

- to determine whether the current website has been enabled by the user;
- to identify bright, neutral page backgrounds on authorized websites and adjust their displayed color;
- to apply the user's selected theme, threshold, pause state, and optional image-softening effect; and
- to keep site settings, dynamic script registrations, and toolbar state consistent after browser restart, extension background recovery, or permission revocation.

Image softening applies a local color filter only while an image is displayed in the browser. Softpage does not read image pixels, download additional images, modify original image files, or upload images. When image softening is enabled, displayed image colors may shift slightly toward the user's selected theme color.

## Permissions

- `storage`: stores the preferences and enabled-site list described above on the user's device.
- `activeTab`: identifies the active page when the user opens the toolbar popup and applies settings immediately after a user action.
- `scripting`: registers or runs the local color-adjustment script on websites that have both been granted permission and enabled by the user.
- Optional site access: Softpage does not request access to all websites at installation. Chrome requests access to the current HTTP or HTTPS website only when the user clicks “Enable for this site.” If permission is denied, the website is not added to the enabled list.

Disabling a website stops the color adjustment and removes the site from Softpage's enabled list, but access already granted by Chrome may remain. The user can revoke site access on Chrome's extension details page. When permission is revoked, Softpage removes the corresponding site setting and dynamic script registration.

## Data sharing and transmission

Softpage does not sell, rent, share, or transmit user data to the publisher, advertisers, or other third parties. The extension has no network feature for uploading page content, browsing activity, settings, or images, and it does not execute remotely hosted code.

Softpage uses website content and browsing-activity information only to provide the user-initiated page-display adjustment feature. It does not use this information for advertising, user profiling, credit assessment, or any purpose unrelated to that single purpose, and it does not allow humans to read this data.

## Retention and deletion

Settings remain on the user's device until the user changes them, disables a website, revokes the relevant permission, clears extension data, or uninstalls the extension. Softpage has no publisher-controlled server copy, so the publisher cannot remotely view, export, or delete data stored in the user's browser.

## Changes to this policy

If Softpage's data practices materially change, this policy's effective date and content will be updated, and the disclosures in the Chrome Web Store Developer Dashboard, the store listing, and the extension's actual behavior will be kept consistent.

## Contact

For questions about this policy or Softpage's data practices, please use [GitHub Issues](https://github.com/lucianzhu/softpage/issues). Do not include sensitive personal information or unredacted screenshots in public reports.
