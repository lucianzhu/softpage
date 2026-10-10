import {BASE, read, request} from './preferences.js';
const $ = id => document.getElementById(id);
const available = typeof chrome !== 'undefined' && chrome.storage?.local;
let saved, preferences, dirty = false, busy = false;
let customTint = '#C7D2B7';
function normalizedTint() {
  const value = $('tint').value.trim();
  return /^#?[0-9a-f]{6}$/i.test(value) ? '#' + value.replace(/^#/, '').toUpperCase() : null;
}
function syncTheme() {
  const value = normalizedTint();
  if (!value) return;
  $('theme').value = ['#C7D2B7','#E0D7BB','#E2DED3'].includes(value) ? value : 'custom';
  if ($('theme').value === 'custom') customTint = value;
}
function update() {
  const tint = normalizedTint();
  const valid = tint !== null;
  $('validation').textContent = valid ? '' : '请输入六位颜色值，例如 C7D2B7 或 #C7D2B7';
  $('tint').setAttribute('aria-invalid', String(!valid));
  if (valid) {$('sample').style.backgroundColor = tint; $('picker').value = tint;}
  const strength = Number($('image-strength').value);
  $('image-amount').value = strength + '%';
  $('image-strength').disabled = !$('soften-images').checked;
  const [red, green, blue] = (tint || saved.tint).slice(1).match(/../g).map(c => parseInt(c,16)).map(c => 1 - strength / 100 + strength / 100 * c / 255);
  document.querySelector('#image-preview-filter feColorMatrix').setAttribute('values', `${red} 0 0 0 0  0 ${green} 0 0 0  0 0 ${blue} 0 0  0 0 0 1 0`);
  $('image-sample').style.filter = $('soften-images').checked ? 'url(#image-preview-filter)' : 'none';
  $('image-preview-status').textContent = $('soften-images').checked ? `已预览：${strength}% 主题色。保存后应用到网站。` : '原图：图片柔化未开启。';
  $('amount').value = $('threshold').value + '%';
  dirty = tint !== saved.tint || Number($('threshold').value) / 100 !== saved.threshold || $('soften-images').checked !== saved.softenImages || strength !== saved.imageStrength;
  $('save').disabled = !valid || !dirty || busy;
  $('status').textContent = dirty ? '有未保存的更改' : available ? '设置已保存' : '界面预览，不会修改扩展设置';
}
function sites() {
  $('pause').textContent = preferences.paused ? '恢复全部' : '暂停全部';
  $('pause').disabled = !available || busy;
  $('site-list').replaceChildren();
  if (!preferences.sites.length) {const li = document.createElement('li');li.textContent = '还没有开启的网站。从工具栏图标开始吧。';$('site-list').append(li);}
  for (const site of preferences.sites) {
    const li = document.createElement('li'), label = document.createElement('span'), button = document.createElement('button');
    label.textContent = site;button.textContent = '关闭';button.className = 'quiet';button.disabled = busy;
    button.addEventListener('click', () => action({type: 'site', site, enabled: false}));
    li.append(label, button);$('site-list').append(li);
  }
}
async function action(message) {
  if (busy) return;
  busy = true;sites();
  try {preferences = await request(message);$('site-status').textContent = '';}
  catch (error) {$('site-status').textContent = error.message;}
  finally {busy = false;sites();}
}
$('pause').addEventListener('click', () => action({type: 'pause', paused: !preferences.paused}));
$('theme').addEventListener('change', () => {
  $('tint').value = $('theme').value === 'custom' ? customTint : $('theme').value;
  update();
});
$('tint').addEventListener('input', syncTheme);
$('appearance').addEventListener('input', update);
$('picker').addEventListener('input', () => {$('tint').value = $('picker').value.toUpperCase();syncTheme();update();});
$('reset').addEventListener('click', () => {$('tint').value = BASE.tint;syncTheme();update();});
$('appearance').addEventListener('submit', async event => {
  event.preventDefault();if (!available) {$('status').textContent = '请在扩展设置页保存';return;}
  if (busy || $('save').disabled) return;
  busy = true;$('form-fields').disabled = true;sites();
  try {
    preferences = await request({type: 'appearance', tint: normalizedTint(), threshold: Number($('threshold').value) / 100, softenImages: $('soften-images').checked, imageStrength: Number($('image-strength').value)});
    saved = {...preferences};$('tint').value = preferences.tint;syncTheme();update();$('status').textContent = '已保存，正在应用到已开启的网站';
  } catch (error) {$('status').textContent = '保存失败：' + error.message;}
  finally {busy = false;$('form-fields').disabled = false;$('save').disabled = !dirty;sites();}
});
window.addEventListener('beforeunload', event => {if (available && dirty) {event.preventDefault();event.returnValue = '';}});
try {
  preferences = available ? await read() : {...BASE, sites: []};saved = {...preferences};
  $('tint').value = preferences.tint;$('threshold').value = preferences.threshold * 100;$('soften-images').checked = preferences.softenImages;$('image-strength').value = preferences.imageStrength;
  $('form-fields').disabled = false;syncTheme();update();sites();
  if (available) chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.preferences || busy) return;
    void read().then(value => {preferences = value;if (!dirty) {saved = {...value};$('tint').value = value.tint;$('threshold').value = value.threshold * 100;$('soften-images').checked = value.softenImages;$('image-strength').value = value.imageStrength;syncTheme();update();}sites();}).catch(error => {$('site-status').textContent = error.message;});
  });
} catch (error) {$('status').textContent = '读取失败：' + error.message;}
