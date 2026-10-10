(() => {
  'use strict';
  if (globalThis.__softpageController) return;
  globalThis.__softpageController = true;
  const marker = 'data-softpage-surface';
  const sheets = new Map();
  const entries = new Map();
  const imageFilters = new Map();
  let sequence = 0, preferences, running = false, timer = null, configVersion = 0;
  const queue = new Set();
  const excluded = 'img,video,canvas,svg,iframe,object,embed,input,textarea,select,pre,code,[contenteditable="true"]';
  const RGB = /^rgba?\(([^)]+)\)$/;
  function components(value) {
    const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(value);
    if (srgb) {
      const values = srgb.slice(1,4).map(Number), alpha = srgb[4] === undefined ? 1 : Number(srgb[4]);
      if (values.some(x => !Number.isFinite(x) || x < 0 || x > 1) || !Number.isFinite(alpha) || alpha < 0 || alpha > 1) return null;
      return [...values.map(x => x * 255), alpha];
    }
    const match = RGB.exec(value);
    if (!match) return null;
    const pieces = match[1].trim().split(/[\s,/]+/);
    if (pieces.length < 3 || pieces.length > 4 || pieces.some(x => !/^\d*\.?\d+%?$/.test(x))) return null;
    const values = pieces.map((x, i) => parseFloat(x) * (x.endsWith('%') ? (i < 3 ? 2.55 : .01) : 1));
    return [...values.slice(0, 3), values[3] ?? 1];
  }
  function within(root, node) {
    for (let current = node; current; current = current.getRootNode()?.host) {
      if (root === current || root.contains(current)) return true;
    }
    return false;
  }
  function isExcluded(node) {
    for (let current = node; current; current = current.getRootNode()?.host) {
      if (current.closest(excluded)) return true;
    }
    return false;
  }
  function ensureSheet(root) {
    if (sheets.has(root)) return;
    const sheet = document.createElement('style');
    sheet.dataset.softpage = 'colors';
    sheets.set(root, sheet);
    if (preferences.softenImages) {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width','0');svg.setAttribute('height','0');
      svg.style.cssText = 'position:absolute;pointer-events:none';
      svg.setAttribute('aria-hidden','true');
      const filter = document.createElementNS(ns, 'filter');
      filter.id = 'softpage-image-' + crypto.randomUUID();
      filter.setAttribute('color-interpolation-filters','sRGB');
      const matrix = document.createElementNS(ns,'feColorMatrix');
      matrix.setAttribute('type','matrix');
      // Multiply by a mix of white and #C7D2B7; keep alpha and black unchanged.
      const strength = Number.isFinite(preferences.imageStrength) ? Math.min(100, Math.max(0, preferences.imageStrength)) / 100 : .2;
      const [red, green, blue] = preferences.tint.slice(1).match(/../g).map(c => parseInt(c,16)).map(c => 1 - strength + strength * c / 255);
      matrix.setAttribute('values',`${red} 0 0 0 0  0 ${green} 0 0 0  0 0 ${blue} 0 0  0 0 0 1 0`);
      filter.append(matrix);svg.append(filter);
      imageFilters.set(root,{svg,id:filter.id});
      (root === document ? document.documentElement : root).append(svg);
    }
  }
  function renderRules() {
    const rgb = preferences.tint.slice(1).match(/../g).map(x => parseInt(x, 16));
    const rules = new Map([...sheets.keys()].map(root => [root, []]));
    for (const [node, e] of entries) {
      const selector = `[${marker}="${e.id}"]`;
      for (const part of e.parts) rules.get(node.getRootNode())?.push(`${selector.repeat(4)}${part.pseudo}{transition:none!important;${part.color ? `background-color:rgba(${rgb.join(',')},${part.color[3]})!important;` : ''}${part.image ? `background-image:${part.image}!important;` : ''}${part.filter ? `filter:${part.filter}!important;` : ''}}`);
    }
    for (const [root, sheet] of sheets) {
      sheet.textContent = rules.get(root).join('\n');
      const parent = root === document ? document.documentElement : root;
      if (sheet.parentNode !== parent) parent.append(sheet);
    }
  }
  function scan(root) {
    ensureSheet(root.getRootNode());
    function visit(node) {
      assess(node);
      if (node.shadowRoot && !isExcluded(node)) scan(node.shadowRoot);
    }
    if (root.nodeType === 1) visit(root);
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    while (walk.nextNode()) visit(walk.currentNode);
  }
  function release(node) {
    const entry = entries.get(node);
    if (!entry) return;
    if (node.getAttribute(marker) === entry.id) {
      if (entry.previous === null) node.removeAttribute(marker); else node.setAttribute(marker, entry.previous);
    }
    entries.delete(node);
  }
  function bright(rgba) {
    return rgba && rgba[3] > 0 && (.2126 * rgba[0] + .7152 * rgba[1] + .0722 * rgba[2]) / 255 > preferences.threshold;
  }
  function softenGradient(value) {
    // Only neutral bright linear fades, never photographs or colorful gradients.
    if (!value.startsWith('linear-gradient(') || /url\(|(?:radial|conic|repeating)-gradient/.test(value)) return null;
    const colors = value.match(/(?:rgba?|color)\([^)]+\)/g);
    if (!colors || colors.length < 2) return null;
    const residue = value.replace(/(?:rgba?|color)\([^)]+\)/g, '');
    const syntax = residue.replace(/linear-gradient\(/g, '');
    if ((syntax.match(/[a-z]+/gi) || []).some(word => !['to','top','bottom','left','right','deg','grad','rad','turn','px','em','rem','vh','vw'].includes(word))) return null;
    if (colors.some(c => {const v = components(c); return !v || (v[3] > 0 && (!bright(v) || Math.max(...v.slice(0,3))-Math.min(...v.slice(0,3)) > 12));})) return null;
    const rgb = preferences.tint.slice(1).match(/../g).map(x => parseInt(x,16));
    return value.replace(/(?:rgba?|color)\([^)]+\)/g, c => `rgba(${rgb.join(',')},${components(c)[3]})`);
  }
  function assess(node) {
    const isBackgroundPicture = preferences.softenImages && node instanceof HTMLElement
      && node.children.length === 0 && !node.textContent.trim()
      && getComputedStyle(node).backgroundImage.startsWith('url(');
    if ((node instanceof HTMLImageElement || isBackgroundPicture) && preferences.softenImages) {
      const native = getComputedStyle(node).filter;
      const id = String(++sequence);
      const resource = imageFilters.get(node.getRootNode());
      if (resource && node.style.getPropertyPriority('filter') !== 'important') {
        entries.set(node, {id, parts:[{pseudo:'',filter:`${native === 'none' ? '' : native + ' '}url("#${resource.id}")`}],previous:node.getAttribute(marker)});
        node.setAttribute(marker,id);
      }
      return;
    }
    if (!(node instanceof HTMLElement) || isExcluded(node)) return;
    const parts = [];
    for (const pseudo of ['', '::before', '::after']) {
      const css = getComputedStyle(node, pseudo || null);
      if (pseudo && (css.content === 'none' || css.content === 'normal')) continue;
      if (!pseudo && node.style.getPropertyPriority('background-color') === 'important') continue;
      const image = css.backgroundImage === 'none' ? null : softenGradient(css.backgroundImage);
      if (css.backgroundImage !== 'none' && !image) continue;
      let color = components(css.backgroundColor);
      if (!pseudo && node === document.documentElement && color?.[3] === 0) {
        const body = document.body && components(getComputedStyle(document.body).backgroundColor);
        if (body && body[3] === 0) color = [255,255,255,1];
      }
      if (!bright(color)) color = null;
      if (color || image) parts.push({pseudo, color, image});
    }
    if (!parts.length) return;
    const id = String(++sequence);
    entries.set(node, {id, parts, previous: node.getAttribute(marker)});
    node.setAttribute(marker, id);
  }
  function schedule(node) {
    if (node?.nodeType === 1 && ![...sheets.values()].includes(node)) queue.add(node);
    if (running && timer === null) timer = setTimeout(flush, 40);
  }
  function accept(records) {
    for (const record of records) {
      if ([...sheets.values()].includes(record.target)) continue;
      if (record.type === 'attributes') schedule(record.target);
      else {
        record.addedNodes.forEach(schedule);
        if (record.removedNodes.length) schedule(document.documentElement);
      }
    }
  }
  function flush() {
    clearTimeout(timer); timer = null;
    if (!running) return;
    // Consume notifications before muting our own marker writes.
    const pending = observer.takeRecords();
    observer.disconnect();
    accept(pending); clearTimeout(timer); timer = null;
    const roots = [...queue].filter(node => node.isConnected && ![...queue].some(other => other !== node && within(other, node)));
    queue.clear();
    const measurementSheets = [];
    for (const root of sheets.keys()) {
      const sheet = document.createElement('style');
      const target = `[${marker}]`.repeat(4);
      sheet.textContent = `${target},${target}::before,${target}::after{transition:none!important}`;
      (root === document ? document.documentElement : root).append(sheet);
      measurementSheets.push(sheet);
    }
    try {
      // Disable our sheet while measuring native styles; no inline styles are changed.
      for (const sheet of sheets.values()) sheet.disabled = true;
      // Settle native colors while transition suppression still matches our markers.
      for (const [node, entry] of entries) if (node.isConnected) {
        for (const part of entry.parts) void getComputedStyle(node, part.pseudo || null).backgroundColor;
      }
      for (const node of entries.keys()) if (!node.isConnected || roots.some(root => within(root, node))) release(node);
      for (const [root, sheet] of sheets) {
        if (root !== document && !root.host.isConnected) {sheet.remove(); sheets.delete(root); imageFilters.get(root)?.svg.remove(); imageFilters.delete(root);}
      }
      for (const root of roots) scan(root);
      renderRules();
    } finally {
      for (const sheet of measurementSheets) sheet.remove();
      for (const [root, sheet] of sheets) {
        sheet.disabled = false;
        observer.observe(root === document ? document.documentElement : root, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'data-theme']});
      }
    }
  }
  const observer = new MutationObserver(accept);
  function stop() {
    running = false; observer.disconnect(); clearTimeout(timer); timer = null; queue.clear();
    for (const node of entries.keys()) release(node);
    for (const sheet of sheets.values()) sheet.remove();
    sheets.clear();
    for (const resource of imageFilters.values()) resource.svg.remove();
    imageFilters.clear();
  }
  async function configure() {
    const version = ++configVersion;
    let result;
    try {result = await chrome.storage.local.get('preferences');} catch {return;}
    if (version !== configVersion) return;
    stop(); preferences = result.preferences;
    const site = `${location.protocol}//${location.hostname}`;
    if (!preferences || !Number.isFinite(preferences.threshold) || preferences.threshold < .5 || preferences.threshold > 1 || preferences.paused || !preferences.sites?.includes(site) || !/^#[0-9a-f]{6}$/i.test(preferences.tint)) return;
    running = true; schedule(document.documentElement);
  }
  chrome.storage.onChanged.addListener((changes, area) => {if (area === 'local' && changes.preferences) void configure();});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => schedule(document.documentElement));
  void configure();
})();
