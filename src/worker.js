import './action-state.js';
import {read, clean, siteFor} from './preferences.js';
let writes = Promise.resolve();
async function registrations(preferences) {
  const granted = [];
  for (const site of preferences.sites) if (await chrome.permissions.contains({origins: [site + '/*']})) granted.push(site + '/*');
  const existing = await chrome.scripting.getRegisteredContentScripts({ids: ['softpage']});
  if (!granted.length) {if (existing.length) await chrome.scripting.unregisterContentScripts({ids: ['softpage']}); return;}
  const script = {id: 'softpage', matches: granted, js: ['src/content.js'], runAt: 'document_idle', allFrames: false, persistAcrossSessions: true};
  if (existing.length) await chrome.scripting.updateContentScripts([script]);
  else await chrome.scripting.registerContentScripts([script]);
}
async function change(message) {
  const current = await read();
  if (message.type === 'theme') {
    if (!['#C7D2B7','#E0D7BB','#E2DED3'].includes(message.tint)) throw new Error('主题无效');
    current.tint = message.tint;
  } else if (message.type === 'appearance') {
    if (!/^#[0-9a-f]{6}$/i.test(message.tint) || !Number.isFinite(message.threshold) || message.threshold < .5 || message.threshold > 1) throw new Error('颜色或阈值无效');
    if (message.imageStrength !== undefined) {
      if (!Number.isFinite(message.imageStrength) || message.imageStrength < 0 || message.imageStrength > 100) throw new Error('图片柔化强度无效');
      current.imageStrength = message.imageStrength;
    }
    current.tint = message.tint; current.threshold = message.threshold;
    if (message.softenImages !== undefined) {
      if (typeof message.softenImages !== "boolean") throw new Error("图片柔化设置无效");
      current.softenImages = message.softenImages;
    }
  } else if (message.type === 'pause') current.paused = Boolean(message.paused);
  else if (message.type === 'site') {
    const site = siteFor(message.site);
    if (!site || site !== message.site) throw new Error('不支持此网址');
    if (message.enabled && !await chrome.permissions.contains({origins: [site + '/*']})) throw new Error('请先允许此网站的访问权限');
    current.sites = current.sites.filter(item => item !== site);
    if (message.enabled) current.sites.push(site);
  } else throw new Error('未知操作');
  const next = clean(current);
  await registrations(next);
  try {await chrome.storage.local.set({preferences: next});}
  catch (error) {await registrations(await read()); throw error;}
  return next;
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  // An options page opened in a tab also has sender.tab. Authenticate the
  // extension ID and exact page URL instead of rejecting all tab senders.
  const page = typeof sender.url === 'string' ? sender.url.split(/[?#]/)[0] : '';
  const permittedPages = ['options.html', 'popup.html'].map(path => chrome.runtime.getURL(path));
  if (sender.id !== chrome.runtime.id || !permittedPages.includes(page)) {
    respond({ok: false, error: '请求来源不受支持，请从柔页的设置页或工具栏操作'});
    return;
  }
  const task = writes.then(() => change(message));
  writes = task.catch(() => {});
  task.then(preferences => respond({ok: true, preferences}), error => respond({ok: false, error: error.message}));
  return true;
});
const repair = () => {
  writes = writes.then(async () => {
    const preferences = await read();
    const permitted = [];
    for (const site of preferences.sites) if (await chrome.permissions.contains({origins: [site + '/*']})) permitted.push(site);
    const changed = permitted.length !== preferences.sites.length;
    preferences.sites = permitted;
    await registrations(preferences);
    if (changed) await chrome.storage.local.set({preferences});
  }).catch(console.error);
};
chrome.runtime.onInstalled.addListener(repair);
chrome.runtime.onStartup.addListener(repair);
chrome.permissions.onRemoved.addListener(repair);
chrome.permissions.onAdded.addListener(permissions => {
  const addedSites = (permissions.origins || [])
    .filter(origin => /^https?:\/\/[^*]+\/\*$/.test(origin))
    .map(siteFor)
    .filter(Boolean);
  if (!addedSites.length) return;
  writes = writes.then(async () => {
    const preferences = await read();
    preferences.sites = [...new Set([...preferences.sites, ...addedSites])];
    await registrations(preferences);
    await chrome.storage.local.set({preferences});
    const tabs = await chrome.tabs.query({url: addedSites.map(site => site + '/*')});
    await Promise.all(tabs.filter(tab => Number.isInteger(tab.id)).map(tab =>
      chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['src/content.js']}).catch(() => {})
    ));
  }).catch(console.error);
});
