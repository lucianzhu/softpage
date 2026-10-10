import {read, siteFor} from './preferences.js';

// Draw a vector paper icon at toolbar resolutions. The inactive icon stays unchanged.
function enabledIcon() {
  const images = {};
  for (const size of [16, 32]) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    ctx.scale(size / 32, size / 32);
    // A fixed signal color stays legible independently of the page tint.
    ctx.fillStyle = '#8DE969';
    ctx.strokeStyle = '#F5FFF0';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(5, 3, 22, 26, 4); ctx.stroke();
    ctx.strokeStyle = '#244A2D';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(5, 3, 22, 26, 4); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    for (const [y, end] of [[11, 22], [17, 22], [23, 18]]) {
      ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(end, y); ctx.stroke();
    }
    images[size] = ctx.getImageData(0, 0, size, size);
  }
  return images;
}

let pending = Promise.resolve();
function refresh() {
  pending = pending.then(async () => {
    const prefs = await read();
    const tabs = await chrome.tabs.query({});
    let icon;
    await Promise.all(tabs.map(async tab => {
      if (tab.id === undefined) return;
      const site = siteFor(tab.url);
      const enabled = !!site && !prefs.paused && prefs.sites.includes(site)
        && await chrome.permissions.contains({origins: [site + '/*']});
      try {
        await chrome.action.setIcon(enabled
          ? {tabId: tab.id, imageData: icon ||= enabledIcon()}
          : {tabId: tab.id, path: {16: 'icons/icon16.png', 32: 'icons/icon48.png'}});
        await chrome.action.setTitle({tabId: tab.id, title: prefs.paused ? '柔页 · 已暂停' : enabled ? '柔页 · 已为此网站开启' : '柔页 · 此网站未开启'});
      } catch { /* A tab may close while its icon is being updated. */ }
    }));
  }).catch(console.error);
  return pending;
}
chrome.tabs.onActivated.addListener(refresh);
chrome.tabs.onUpdated.addListener((_id, change) => {
  if (change.url !== undefined || change.status === 'complete') void refresh();
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.preferences) void refresh();
});
chrome.permissions.onAdded.addListener(refresh);
chrome.permissions.onRemoved.addListener(refresh);
chrome.runtime.onInstalled.addListener(refresh);
chrome.runtime.onStartup.addListener(refresh);
void refresh();
