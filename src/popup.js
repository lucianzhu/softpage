import {read, request, requestSiteAccess, siteFor} from './preferences.js';
const button = document.querySelector('#toggle'), status = document.querySelector('#status');
let tab, site, preferences;
function display() {
  const enabled = preferences.sites.includes(site);
  button.textContent = enabled ? '关闭此网站' : '为此网站开启';
  button.disabled = false;
  status.textContent = preferences.paused ? '目前已暂停全部网站，请在设置中恢复。' : enabled ? '已开启 · 文字与链接保持原色' : '点击开启此网站，其他网站保持原样。';
}
button.addEventListener('click', async () => {
  button.disabled = true;
  try {
    const enabled = !preferences.sites.includes(site);
    if (enabled) {
      status.textContent = '正在请求此网站的访问权限…';
      if (!await requestSiteAccess(site)) {
        status.textContent = '未获得此网站的访问权限，柔页没有开启。';
        return;
      }
    }
    preferences = await request({type: 'site', site, enabled});
    if (enabled) {
      try {await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['src/content.js']});}
      catch {display();status.textContent = '已保存，请刷新网页后使用。';return;}
    }
    display();
  } catch (error) {status.textContent = '操作未完成：' + error.message;}
  finally {button.disabled = false;}
});
const themes = document.querySelector('#quick-themes');
const themeStatus = document.querySelector('#theme-status');
function showTheme() {
  for (const input of themes.querySelectorAll('input')) input.checked = input.value === preferences.tint;
  themeStatus.textContent = ['#C7D2B7','#E0D7BB','#E2DED3'].includes(preferences.tint)
    ? '切换后应用到所有已开启的网站。' : '当前使用自定义颜色，可选择下方阅读偏好修改。';
}
themes.addEventListener('change', async event => {
  themes.disabled = true;
  try {
    preferences = await request({type:'theme', tint:event.target.value});
    showTheme();themeStatus.textContent = '主题已保存，已应用到开启的网站。';
  } catch (error) {showTheme();themeStatus.textContent = '保存失败：' + error.message;}
  finally {themes.disabled = false;}
});
document.querySelector('#settings').addEventListener('click', event => {event.preventDefault();chrome.runtime.openOptionsPage();});
try {
  [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  site = siteFor(tab?.url);
  document.querySelector('#current-site').textContent = site || '此页面不支持改色';
  preferences = await read();showTheme();themes.disabled = false;
  if (site) {display();}
  else {button.textContent = '请在普通网页中使用';status.textContent = '浏览器内部页面和扩展商店不能修改。';}
} catch (error) {status.textContent = error.message;}
