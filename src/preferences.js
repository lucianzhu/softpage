export const BASE = Object.freeze({tint: '#C7D2B7', threshold: 0.9, sites: [], paused: false, softenImages: false, imageStrength: 20});
export function siteFor(address) {
  try {const url = new URL(address); return ['http:', 'https:'].includes(url.protocol) ? `${url.protocol}//${url.hostname}` : null;} catch {return null;}
}
export function clean(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) value = {};
  return {
    tint: /^#[0-9a-f]{6}$/i.test(value.tint) ? value.tint.toUpperCase() : BASE.tint,
    threshold: typeof value.threshold === 'number' && value.threshold >= 0.5 && value.threshold <= 1 ? value.threshold : BASE.threshold,
    sites: [...new Set((Array.isArray(value.sites) ? value.sites : []).filter(x => typeof x === 'string' && siteFor(x) === x))],
    softenImages: value.softenImages === true,
    imageStrength: Number.isFinite(value.imageStrength) && value.imageStrength >= 0 && value.imageStrength <= 100 ? value.imageStrength : 20,
    paused: value.paused === true
  };
}
export async function read() {const result = await chrome.storage.local.get('preferences'); return clean(result.preferences);}
export async function requestSiteAccess(site, permissions = chrome.permissions) {
  if (!site || siteFor(site) !== site) throw new Error('不支持此网址');
  return permissions.request({origins: [site + '/*']});
}
export async function request(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (!response?.ok) throw new Error(response?.error || '操作未完成，请重试');
  return response.preferences;
}
