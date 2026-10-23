/* 不气了官网首页的砸砸屋（2026-10 改版，方案 A）。
   照 App 的 SmashRoom（src/room/）做的网页版：点 / 按住是锤，筐里扔，搁板上横划是扫，茶几、电视柜上往上推是掀，
   电视上横着狠推一把推下柜子（2026-10-23 Cora 要的，手势判断照 App）。拎起来摔、左右挪镜头没做。
   图是 App 那套（assets/room/，坐标照 roomArt.generated.ts），声音是 App 拼好的那一条 room.m4a（段落照 roomSprite.generated.ts）。
   方案页 artifacts/site-130-proposal-20261022 里三个方向共用的就是这一份，这里只留了 A 的读数。
   中英文按 <html lang> 换字；图的路径从 [data-stage] 的 data-base 读（英文页在 en/ 下要多一层 ../）。 */
(function () {
'use strict';

var NS = 'http://www.w3.org/2000/svg';
var INK = '#21180F';
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function rnd(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function f1(v) { return Math.round(v * 10) / 10; }
function pad2(n) { n = Math.max(0, Math.floor(n)); return n < 10 ? '0' + n : '' + n; }
function pad3(n) { n = Math.max(0, Math.round(n)); return ('00' + n).slice(-3); }
function easeOut(t) { return 1 - (1 - t) * (1 - t); }
function sv(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function hd(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
function tween(ms, fn, done) { var t0 = performance.now(); (function f(now) { var k = clamp((now - t0) / ms, 0, 1); fn(k); if (k < 1) requestAnimationFrame(f); else if (done) done(); })(t0); }
var UID = 0;

var EN = /^en/i.test(document.documentElement.lang);
var T = EN ? {
  names: { clock: ['Wall clock', 'glass'], plateA: ['Blue plate', 'china'], plateB: ['Pink plate', 'china'], mug: ['Mug', 'china'], lamp: ['Floor lamp', 'bulb'], tv: ['TV', 'screen'], table: ['Coffee table', 'wood'], vase: ['Vase', 'glass'], bowl: ['Fruit bowl', 'glass'], plant: ['Plant', 'clay pot'], mirror: ['Mirror', 'glass'], sofa: ['Armchair', 'wood frame'], stool: ['Stool', 'wood'] },
  brk: { clock: 'CLANG!', plateA: 'CRASH!', plateB: 'CRASH!', mug: 'SMASH!', lamp: 'POP!', tv: 'ZZZT!', table: 'CRASH!', vase: 'SMASH!', bowl: 'CRASH!', plant: 'THUD!', mirror: 'SMASH!', sofa: 'CRACK!', stool: 'CRACK!' },
  hit: ['BAM', 'THUD', 'BONK'], tvHit: 'BZZT', lampHit: 'FZZT', fullWall: 'BOOM!', fullItem: 'WHAM!',
  crate: 'THROW', wrecked: 'WRECKED · AGAIN', falling: '↓ FALLING', broke: '✕ BROKEN',
  sweepWord: 'CRASH—', flipWord: 'TABLE FLIP!', flipFace: '(╯°□°)╯︵ ┻━┻',
  stuck: { aim: 'Grab from the crate. Throw it!', sweep: 'Swipe the shelf clean!', flip: 'Push the table up. Flip it!', hammer: 'Tap to hit. Hold to hit harder.' },
  soundOn: '♪ SOUND ON', soundOff: '♪ SOUND OFF', wf: .68, fk: .8
} : {
  names: { clock: ['挂钟', '玻璃面'], plateA: ['青花盘', '瓷'], plateB: ['粉边盘', '瓷'], mug: ['杯子', '瓷'], lamp: ['落地灯', '灯泡'], tv: ['电视', '屏幕'], table: ['茶几', '木头'], vase: ['花瓶', '玻璃'], bowl: ['果盘', '玻璃'], plant: ['盆栽', '陶盆'], mirror: ['镜子', '玻璃'], sofa: ['小沙发', '木架'], stool: ['小板凳', '木头'] },
  brk: { clock: '当啷！', plateA: '啪嚓！', plateB: '啪嚓！', mug: '啪！', lamp: '啵！', tv: '滋啦！', table: '哐当！', vase: '哗啦！', bowl: '啪嚓！', plant: '啪！', mirror: '哗啦！', sofa: '咔嚓！', stool: '咔嚓！' },
  hit: ['砰', '咚', '哐'], tvHit: '滋——', lampHit: '滋滋', fullWall: '咚！', fullItem: '哐！',
  crate: '随便扔', wrecked: '已碎 · 补刀', falling: '↓ 掉下去了', broke: '✕ 碎了',
  sweepWord: '哗啦——', flipWord: '掀桌！', flipFace: '(╯°□°)╯︵ ┻━┻',
  stuck: { aim: '筐里的，往上甩！', sweep: '搁板上，横着扫！', flip: '茶几，往上掀！', hammer: '砸！按住更狠。' },
  soundOn: '♪ 声音 开', soundOff: '♪ 声音 关', wf: .92, fk: 1
};

/* ---------- 屋里的图（照 App 的 roomArt.generated.ts，屋里坐标） ---------- */
var ART = {
  'csh-plant': [16, 490, 80, 22], 'csh-table': [134, 593, 220, 26], 'csh-sofa': [367, 549, 120, 24], 'csh-stool': [447, 595, 88, 20],
  shelf: [2, 232, 179, 36], nail: [322, 50, 16, 16], stand: [93, 438, 144, 64], crate: [8, 534, 106, 84],
  'plateA-sh': [13, 178, 72, 72], plateA: [14, 178, 64, 64], 'plateB-sh': [76, 192, 58, 58], plateB: [77, 192, 50, 50],
  'mug-sh': [123, 207, 43, 45], mug: [124, 207, 45, 37], plant: [10, 383, 96, 121],
  'clock-sh': [295, 68, 76, 76], clock: [296, 54, 68, 82], 'clock-hands': [312, 84, 36, 36],
  'mirror-sh': [413, 108, 84, 120], mirror: [414, 84, 76, 136], 'mirror-glass': [425, 119, 54, 90], 'mirror-glass-broken': [425, 119, 54, 90],
  'lamp-pole': [314, 254, 52, 271], 'lamp-shade': [308, 212, 64, 50], sofa: [372, 400, 110, 164],
  tv: [101, 328, 128, 118], 'tv-screen': [114, 371, 102, 62], 'tv-static': [114, 371, 102, 62], 'tv-dead': [114, 371, 102, 62],
  table: [144, 541, 196, 68], bowl: [176, 505, 66, 47], vase: [262, 419, 63, 130], stool: [454, 550, 72, 58]
};
var OFF = { ammo: [-22, -22, 44, 44], leaf: [-10, -52, 20, 54], 'mug-handle': [-3, -12, 18, 24], spring: [-11, -15, 22, 32],
  'dent-1': [-19, -19, 38, 38], 'dent-2': [-24, -24, 48, 48], 'dent-3': [-28, -28, 56, 56], floordent: [-16, -10, 32, 20], 'splat-egg': [-30, -30, 60, 60] };

/* 十三样东西（照 roomLayout.ts）；cb 是裂缝能起头的那块，crk 是裂缝裁在里面的形状 */
var IT = {
  clock:  { bb: [298, 70, 362, 134], c: [330, 102], mat: 'glass', h: 30, pal: ['#FFFCF4', '#F2A65A', '#FFFCF4'], sh: 'clock-sh', cb: [314, 86, 346, 118], crk: '<circle cx="330" cy="102" r="28"/>' },
  plateA: { bb: [16, 180, 76, 240], c: [46, 210], mat: 'glass', pal: ['#FFFCF4', '#6F8FE8', '#CFDBFF'], sh: 'plateA-sh', cb: [32, 196, 60, 224], crk: '<circle cx="46" cy="210" r="26"/>' },
  plateB: { bb: [80, 194, 124, 240], c: [102, 217], mat: 'glass', pal: ['#FFFCF4', '#F28CA8', '#FFD3DF'], sh: 'plateB-sh', cb: [92, 207, 112, 227], crk: '<circle cx="102" cy="217" r="19"/>' },
  mug:    { bb: [126, 208, 168, 241], c: [144, 225], mat: 'glass', pal: ['#FFB7A0', '#FFFCF4', '#FFB7A0'], sh: 'mug-sh', cb: [133, 216, 150, 235], crk: '<rect x="129" y="212" width="25" height="27" rx="5"/>' },
  lamp:   { bb: [310, 212, 370, 262], bb2: [330, 262, 350, 520], c: [340, 238], mat: 'glass', pal: ['#FFE7A0', '#FFF4CC', '#E9C25A'], cb: [324, 222, 356, 254], crk: '<path d="M312 258 H368 L358 216 H322 Z"/>' },
  tv:     { bb: [101, 358, 229, 444], c: [165, 402], mat: 'glass', pal: ['#4A4E6B', '#9DB4D6', '#2E3147'], cb: [121, 377, 209, 427], crk: '<rect x="114" y="371" width="102" height="62" rx="7"/>' },
  table:  { bb: [146, 541, 338, 609], c: [242, 577], mat: 'wood', pal: ['#D6A370', '#B98859'], csh: 'csh-table', cb: [154, 548, 330, 556], crk: '<rect x="148" y="545" width="188" height="14" rx="6"/><rect x="164" y="557" width="11" height="48"/><rect x="309" y="557" width="11" height="48"/>' },
  vase:   { bb: [262, 429, 320, 545], c: [291, 515], mat: 'glass', h: 30, pal: ['#A8D4F5', '#D7EEFF', '#A8D4F5'], cb: [272, 497, 310, 539], crk: '<path transform="translate(232 83)" d="M44 462 C28 444 34 418 50 410 L50 398 L68 398 L68 410 C84 418 90 444 74 462 Z"/>' },
  bowl:   { bb: [176, 513, 240, 549], c: [208, 535], mat: 'glass', h: 16, pal: ['#A8D4F5', '#D7EEFF', '#A8D4F5'], cb: [188, 532, 230, 544], crk: '<path d="M180 529 H238 Q236 548 209 548 Q182 548 180 529 Z"/>' },
  plant:  { bb: [22, 384, 94, 502], c: [58, 472], mat: 'ceramic', h: 28, pal: ['#E8956B', '#7CC68F', '#D9805A'], csh: 'csh-plant', cb: [38, 452, 78, 496], crk: '<path d="M32 460 H84 L77 500 H39 Z"/><rect x="26" y="448" width="64" height="15" rx="4"/>' },
  mirror: { bb: [418, 112, 486, 216], c: [452, 164], mat: 'glass', pal: ['#D7EEFB', '#FFFFFF', '#B9DDF5'], sh: 'mirror-sh', cb: [430, 124, 474, 204], crk: '<rect x="425" y="119" width="54" height="90" rx="27"/>' },
  sofa:   { bb: [376, 402, 478, 562], c: [427, 482], mat: 'wood', need: 3, pal: ['#F4C25B', '#FBDC8E', '#D99A33'], csh: 'csh-sofa', cb: [388, 414, 466, 546], crk: '<rect x="378" y="404" width="98" height="154" rx="20"/>' },
  stool:  { bb: [458, 552, 522, 606], c: [490, 580], mat: 'wood', need: 3, pal: ['#C98B55', '#A9652C', '#D9A06A'], csh: 'csh-stool', cb: [463, 557, 517, 565], crk: '<rect x="458" y="554" width="64" height="14" rx="5"/><rect x="466" y="566" width="9" height="36"/><rect x="505" y="566" width="9" height="36"/>' }
};
var ORDER = ['vase', 'bowl', 'stool', 'plant', 'table', 'tv', 'lamp', 'mug', 'plateB', 'plateA', 'clock', 'mirror', 'sofa'];
var DRAW = ['plateA', 'plateB', 'mug', 'plant', 'clock', 'mirror', 'lamp', 'sofa', 'tv', 'table', 'bowl', 'vase', 'stool'];
var FURN = [[10, 238, 170, 262], [97, 442, 233, 498], [10, 512, 112, 616]];
var DENT_R = [0, 9, 12, 15];
var CRATE = [10, 512, 112, 616], AMMO = ['brick', 'bottle', 'egg', 'slipper'];
var TOTAL = 13;
/* 扫、掀、推（照 roomLayout.ts 和 SmashRoom.tsx）：电视柜砸不坏，往上一推翻过来还落在原地，绕 STAND_C 翻 */
var SHELF = [4, 162, 176, 252], STAND = [97, 442, 233, 498], STAND_C = [165, 470];
var SHELF_IDS = ['plateA', 'plateB', 'mug'], TABLE_IDS = ['vase', 'bowl'];
/* 手指落下多久还没动才把锤子举起来：扫、掀、推这些动作开头别冒出一把锤子 */
var HOLD_MS = 150;
/* 推电视要使大劲（10/20 Cora）：横着划只挪一点点（最多 PUSH_GIVE），松手那一下够快（屋里单位每秒）才推得下去 */
var PUSH_V = 1000, PUSH_GIVE = 14;
/* 卡住几秒才说一句，只教这一局还没做过、还做得到的那个 */
var STUCK_MS = 6000, MOVES = ['aim', 'sweep', 'flip', 'hammer'];

/* ---------- 声音：App 那一条拼好的 room.m4a，按段放（roomSprite.generated.ts） ---------- */
var SPR = {
  'glass/hit': [[.3, .1403], [.7403, .3037], [1.344, .2857]], 'glass/crack': [[1.9297, .392], [2.6217, .329], [3.2507, .366]],
  'glass/crack-big': [[3.9167, .7335]], 'glass/smash': [[4.9502, 1.5436]], 'glass/debris': [[6.7939, .236], [7.3298, .238], [7.8678, .237]],
  'wood/hit': [[8.4049, .3], [9.0049, .3], [9.6049, .3]], 'wood/crack': [[10.2049, .48], [10.9849, .48], [11.7649, .48]],
  'wood/crack-big': [[12.5449, .9]], 'wood/smash': [[13.7449, 1.4]], 'wood/debris': [[15.4448, .24], [15.9848, .24], [16.5248, .24]],
  'stone/hit': [[17.0648, .24], [17.6048, .24], [18.1448, .24]], 'ceramic/hit': [[23.5348, .55], [24.3848, .55], [25.2348, .55]],
  'ceramic/crack': [[26.0848, .5], [26.8848, .5], [27.6848, .5]],
  'stone/crack-big': [[18.6848, .86]], 'stone/debris': [[19.8448, .17], [20.3148, .17], [20.7848, .17]],
  toss: [[42.8849, .215], [43.3999, .195], [43.8949, .235]], egg: [[44.4299, .705]], slap: [[45.4349, .485]],
  crumble: [[28.4848, 1.165]], pole: [[29.9498, .495]], plate: [[30.7449, .915]], pot: [[31.9599, .625]], spin: [[32.8849, .595]],
  boing: [[33.7799, .45]], water: [[34.5299, 1.155]], fruit: [[35.9849, .355]], 'static': [[36.6399, .6]], tvoff: [[37.5399, .815]],
  buzz: [[38.6549, .5]], bulb: [[39.4549, .865]], lift: [[40.6199, .595]], land: [[41.5149, .445]], sweep: [[42.2599, .325]]
};
var SND = { on: true, ctx: null, buf: null, raw: null, decoding: false, url: '', asked: false };
/* 那一条 450KB，首屏不抢：页面加载完再拿，或者第一下砸的时候拿（哪个先到算哪个） */
function sndFetch() {
  if (SND.asked || !SND.url || !window.fetch) return;
  SND.asked = true;
  fetch(SND.url).then(function (r) { return r.arrayBuffer(); }).then(function (b) { SND.raw = b; decode(); }).catch(function () { SND.asked = false; });
}
function decode() {
  if (!SND.ctx || !SND.raw || SND.buf || SND.decoding) return;
  SND.decoding = true;
  try { SND.ctx.decodeAudioData(SND.raw.slice(0), function (b) { SND.buf = b; }, function () { SND.decoding = false; }); } catch (e) { SND.decoding = false; }
}
function sndWake() {
  sndFetch();
  if (!SND.on) return;
  if (!SND.ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; try { SND.ctx = new AC(); } catch (e) { return; } }
  if (SND.ctx.state === 'suspended') SND.ctx.resume();
  decode();
}
function snd(key, vol, delay) {
  if (!SND.on || !SND.buf || !SND.ctx) return;
  var list = SPR[key]; if (!list) return;
  var seg = list[(Math.random() * list.length) | 0];
  try {
    var src = SND.ctx.createBufferSource(), g = SND.ctx.createGain();
    src.buffer = SND.buf; g.gain.value = vol == null ? .8 : vol;
    src.connect(g); g.connect(SND.ctx.destination);
    src.start(SND.ctx.currentTime + (delay || 0) / 1000, seg[0], seg[1]);
  } catch (e) {}
}

/* ---------- 冲击帧：一下闪、集中线、拟声字 ---------- */
function animeFrame(ov, pt, word, opt) {
  opt = opt || {};
  var w = ov.clientWidth, hh = ov.clientHeight; if (!w || !hh) return;
  var now = performance.now(), quiet = ov._last && now - ov._last < 260; ov._last = now;
  var cs = getComputedStyle(ov), col = function (n, d) { return (cs.getPropertyValue(n) || '').trim() || d; };
  var s = sv('svg', { 'class': 'anime', width: w, height: hh, viewBox: '0 0 ' + w + ' ' + hh, 'aria-hidden': 'true' }, ov);
  if (!quiet) {
    sv('rect', { 'class': 'af-flash', x: 0, y: 0, width: w, height: hh, fill: col('--af-flash', 'rgba(255,255,255,.85)') }, s);
    var lines = sv('g', { 'class': 'af-lines', fill: col('--af-line', INK) }, s);
    var R0 = Math.min(w, hh) * (opt.big ? .2 : .25), R1 = Math.hypot(w, hh), N = opt.big ? 28 : 20;
    for (var i = 0; i < N; i++) {
      var a = (i + Math.random() * .7) / N * Math.PI * 2, da = rnd(.012, .03), r0 = R0 * rnd(.9, 1.6);
      var pts = [[pt.x + Math.cos(a) * r0, pt.y + Math.sin(a) * r0], [pt.x + Math.cos(a - da) * R1, pt.y + Math.sin(a - da) * R1], [pt.x + Math.cos(a + da) * R1, pt.y + Math.sin(a + da) * R1]];
      sv('polygon', { points: pts.map(function (q) { return f1(q[0]) + ',' + f1(q[1]); }).join(' ') }, lines);
    }
  }
  if (word) {
    var fs = clamp(w * (opt.big ? .15 : .12), 40, 92) * T.fk, n = Array.from(word).length;
    /* sub：底下一行小字（掀桌那张颜文字），宽按 0.62em 一个字估 */
    var ss = fs * .4, sw = opt.sub ? Array.from(opt.sub).length * ss * .62 : 0;
    var bw = Math.max(fs * n * T.wf, sw), bh = opt.sub ? fs + ss * 1.6 : fs;
    var x = clamp(pt.x + (opt.dx || 0), bw / 2 + 10, w - bw / 2 - 10), y = clamp(pt.y - fs * .35, fs / 2 + 10, hh - bh + fs / 2 - 10);
    var outer = sv('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ') rotate(-7) skewX(-8)' }, s);
    var pop = sv('g', { 'class': 'af-pop' }, outer);
    var layer = function (cls, attrs) { var t = sv('text', Object.assign({ 'class': cls, 'text-anchor': 'middle', 'font-size': f1(fs), x: 0, y: f1(fs * .36) }, attrs), pop); t.textContent = word; };
    layer('af-w0', { stroke: col('--af-halo', '#FFFCF4') });
    layer('af-w1', { stroke: col('--af-ink', INK) });
    layer('af-w2', { fill: col('--af-fill', '#F24738') });
    if (opt.sub) {
      var sub = function (attrs) { var t = sv('text', Object.assign({ 'class': 'af-sub', 'text-anchor': 'middle', 'font-size': f1(ss), x: 0, y: f1(fs * .36 + ss * 1.5) }, attrs), pop); t.textContent = opt.sub; };
      sub({ fill: 'none', stroke: col('--af-halo', '#FFFCF4'), 'stroke-width': 7, 'stroke-linejoin': 'round' });
      sub({ fill: col('--af-ink', INK) });
    }
  }
  setTimeout(function () { s.remove(); }, 950);
}

/* ---------- 砸砸屋 ---------- */
function Room(host, hooks) {
  hooks = hooks || {};
  var BASE = host.getAttribute('data-base') || 'assets/room/';
  SND.url = BASE + 'room.m4a';
  var R = null, G = null, HS = null;
  var H_LANDED = -78, H_RAISED = 70, H_CHARGED = 95, H_RECOIL = 15, H_MIN = 24, H_K = .62, GRAV = 1500;
  function src(id) { return BASE + id + '.webp'; }

  function img(id, parent, cls) {
    var a = ART[id], e = hd('img', cls || '', parent);
    e.src = src(id); e.alt = ''; e.draggable = false; e.decoding = 'async';
    e.style.cssText = 'left:' + a[0] + 'px;top:' + a[1] + 'px;width:' + a[2] + 'px;height:' + a[3] + 'px';
    return e;
  }
  function oimg(file, base, x, y, parent) {
    var o = OFF[base], e = hd('img', '', parent);
    e.src = src(file); e.alt = ''; e.draggable = false;
    e.style.cssText = 'left:' + f1(x + o[0]) + 'px;top:' + f1(y + o[1]) + 'px;width:' + o[2] + 'px;height:' + o[3] + 'px';
    return e;
  }
  function backSVG() {
    var u = 'rb' + (++UID), spread = (705 - 60) / (377 - 60), rays = '';
    [-1, 0, 1, 2, 3, 4].forEach(function (n) { var x0 = 47 + 143 * n, x1 = 267 + (x0 - 267) * spread; rays += '<line x1="' + x0 + '" y1="377" x2="' + f1(x1) + '" y2="705"/>'; });
    [418, 474, 544, 617].forEach(function (y) { rays += '<line x1="0" y1="' + y + '" x2="534" y2="' + y + '"/>'; });
    var shadows = [[342, 516, 32, 6], [64, 614, 58, 7], [171, 499, 80, 9, 'stand']].map(function (q) { return '<ellipse' + (q[4] ? ' data-sh="' + q[4] + '"' : '') + ' cx="' + q[0] + '" cy="' + q[1] + '" rx="' + q[2] + '" ry="' + q[3] + '" fill="url(#' + u + 'h)"/>'; }).join('');
    return '<svg class="full" viewBox="0 0 534 626" aria-hidden="true"><defs>'
      + '<linearGradient id="' + u + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7ECD9"/><stop offset="1" stop-color="#EFE3CA"/></linearGradient>'
      + '<linearGradient id="' + u + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECD8B8"/><stop offset=".45" stop-color="#E8CDAD"/><stop offset="1" stop-color="#E2C19F"/></linearGradient>'
      + '<pattern id="' + u + 's" width="26" height="360" patternUnits="userSpaceOnUse"><rect width="10" height="360" fill="#8C6E3C" fill-opacity=".045"/></pattern>'
      + '<pattern id="' + u + 'd" width="52" height="52" patternUnits="userSpaceOnUse"><circle cx="26" cy="26" r="1.6" fill="#21180F" fill-opacity=".05"/></pattern>'
      + '<radialGradient id="' + u + 'h"><stop offset="0" stop-color="rgb(150,105,65)" stop-opacity=".26"/><stop offset=".7" stop-color="rgb(150,105,65)" stop-opacity=".2"/><stop offset="1" stop-color="rgb(150,105,65)" stop-opacity="0"/></radialGradient>'
      + '</defs>'
      + '<rect width="534" height="360" fill="url(#' + u + 'w)"/><rect width="534" height="360" fill="url(#' + u + 's)"/><rect width="534" height="360" fill="url(#' + u + 'd)"/>'
      + '<rect y="376" width="534" height="250" fill="url(#' + u + 'f)"/>'
      + '<g stroke="#B08A62" stroke-width="1.3" opacity=".24">' + rays + '</g>'
      + '<rect y="360" width="534" height="16.5" fill="#D0AE8C"/><rect y="361.4" width="534" height="3.6" fill="#FCEDD9"/>'
      + '<rect y="359.8" width="534" height="1.6" fill="#72624C"/><rect y="375" width="534" height="1.6" fill="#72624C"/>'
      + shadows + '</svg>';
  }

  function build() {
    var keepS = R ? R.s : 1;
    R = { items: {}, parts: [], bodies: [], dents: [], fdents: [], dead: 0, s: keepS, shx: 0, shy: 0, raf: 0, alive: true, ammo: 0, used: {}, standFlipped: false };
    host.innerHTML = '';
    var world = R.world = hd('div', 'world', host);
    world.insertAdjacentHTML('beforeend', backSVG());
    var wc = hd('div', 'clipw', world); R.glow = hd('div', 'glow', wc); R.wallMarks = hd('div', 'lay', wc);
    var fc = hd('div', 'clipf', world); R.floorMarks = hd('div', 'lay', fc);
    var scene = R.scene = hd('div', 'lay', world);
    var csh = {};
    ['csh-plant', 'csh-table', 'csh-sofa', 'csh-stool'].forEach(function (id) { csh[id] = img(id, scene, 'sh'); });
    img('shelf', scene); img('nail', scene);
    DRAW.forEach(function (id) {
      var I = IT[id], t = R.items[id] = { id: id, hits: 0, dead: false, flying: false, dx: 0, dy: 0, rot: 0 };
      if (I.sh) t.sh = img(I.sh, scene, 'sh');
      if (I.csh) t.csh = csh[I.csh];
      if (id === 'lamp') { t.pole = hd('div', 'lay', scene); t.pole.style.transformOrigin = '340px 512px'; img('lamp-pole', t.pole); }
      if (id === 'tv') { R.stand = hd('div', 'lay', scene); R.stand.style.transformOrigin = STAND_C[0] + 'px ' + STAND_C[1] + 'px'; img('stand', R.stand); }
      if (id === 'table') { R.peek = oimg('ammo-' + AMMO[0], 'ammo', 50, 538, scene); R.peek.style.transform = 'rotate(-12deg)'; img('crate', scene); hd('div', 'crate-lbl', scene).textContent = T.crate; }
      var g = t.g = hd('div', 'it', scene);
      g.style.transformOrigin = I.c[0] + 'px ' + I.c[1] + 'px';
      if (id === 'lamp') img('lamp-shade', g);
      else if (id === 'tv') { img('tv', g); t.scr = img('tv-screen', g); t.stat = img('tv-static', g); t.stat.style.opacity = 0; t.deadImg = img('tv-dead', g); t.deadImg.style.opacity = 0; }
      else if (id === 'mirror') { img('mirror', g); t.glass = img('mirror-glass', g); }
      else if (id === 'clock') { img('clock', g); t.hands = img('clock-hands', g); }
      else img(id, g);
      var ck = sv('svg', { 'class': 'full', viewBox: '0 0 534 626' }, g), cid = 'ck' + (++UID);
      ck.innerHTML = '<defs><clipPath id="' + cid + '">' + I.crk + '</clipPath></defs>';
      t.cr = sv('g', { 'clip-path': 'url(#' + cid + ')', fill: 'none', stroke: INK, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ck);
    });
    R.debris = sv('svg', { 'class': 'full', viewBox: '0 0 534 626' }, world);
    R.debImg = hd('div', 'lay', world);
    R.fx = sv('svg', { 'class': 'full', viewBox: '0 0 534 626' }, world);
    R.ham = sv('svg', { 'class': 'full', viewBox: '0 0 534 626' }, world);
    R.dimEl = hd('div', 'dim', world);
    R.standSh = world.querySelector('[data-sh="stand"]');
    /* 筐、茶几、电视柜上各盖一块不让页面跟着滑的：从筐里往上甩、往上掀，手机上不然会变成滚页面。
       掀完了就拿掉，那块又能拿来滚页面。横着的（扫、推电视）不用盖，舞台本来就只让页面上下滑 */
    grabBox(CRATE);
    R.grabTable = grabBox(IT.table.bb);
    R.grabStand = grabBox(STAND);
    fit();
  }
  function grabBox(b) {
    var e = hd('div', '', host);
    e.style.cssText = 'position:absolute;left:' + (b[0] / 5.34) + '%;top:' + (b[1] / 6.26) + '%;width:' + ((b[2] - b[0]) / 5.34) + '%;height:' + ((b[3] - b[1]) / 6.26) + '%;touch-action:none';
    return e;
  }

  function fit() { var w = host.clientWidth; if (w) R.s = w / 534; place(); }
  function place() { R.world.style.transform = 'scale(' + R.s.toFixed(5) + ') translate(' + f1(R.shx) + 'px,' + f1(R.shy) + 'px)'; }
  function placeT(t) { t.g.style.transform = 'translate(' + f1(t.dx) + 'px,' + f1(t.dy) + 'px) rotate(' + f1(t.rot) + 'deg)'; }
  function hideSh(t) { if (t.sh) t.sh.style.opacity = 0; if (t.csh) t.csh.style.opacity = 0; }
  function inBB(b, x, y, p) { p = p || 0; return x >= b[0] - p && x <= b[2] + p && y >= b[1] - p && y <= b[3] + p; }
  function targetAt(x, y, pad, except) {
    for (var i = 0; i < ORDER.length; i++) {
      var t = R.items[ORDER[i]], I = IT[ORDER[i]];
      if (t.dead || t.flying || t.id === except) continue;
      var b = [I.bb[0] + t.dx, I.bb[1] + t.dy, I.bb[2] + t.dx, I.bb[3] + t.dy];
      if (inBB(b, x, y, pad) || (I.bb2 && inBB(I.bb2, x, y, pad))) return t;
    }
    return null;
  }
  function wreckAt(x, y) {
    var it = R.items;
    if (it.tv.dead && !it.tv.gone && !it.tv.flying && inBB(IT.tv.bb, x, y)) return it.tv;
    if (it.mirror.dead && inBB(IT.mirror.bb, x, y)) return it.mirror;
    if (it.lamp.dead && inBB(IT.lamp.bb2, x, y)) return it.lamp;
    if (it.table.flipped && inBB(IT.table.bb, x, y)) return it.table;
    return null;
  }

  /* 物理：碎片、飞出去的东西 */
  function loop() {
    if (R.raf) return;
    var me = R, last = performance.now();
    var step = function (now) {
      if (me !== R || !me.alive) return;
      var dt = Math.min(.033, Math.max(0, (now - last) / 1000)); last = now;
      var busy = false;
      me.bodies.slice().forEach(function (b) {
        if (me.bodies.indexOf(b) < 0) return;
        b.vy += GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt;
        if (b.x < 16 || b.x > 518) { b.vx *= -.5; b.x = clamp(b.x, 16, 518); }
        /* 半空撞上别的东西：两样一起碎（扫下来的盘子砸到电视上那种）。电视沉，压过去不停（plow），落地才碎 */
        if (b.t && b.vy > 0 && Math.hypot(b.vx, b.vy) > 260) {
          var hit = targetAt(b.x, b.y, 0, b.t.id);
          if (hit && b.plow) {
            if (!b.plow[hit.id]) { b.plow[hit.id] = 1; b.vx *= .6; struck(hit, { x: b.x, y: b.y }, b.dmg || 1); }
          } else if (hit) {
            me.bodies.splice(me.bodies.indexOf(b), 1); b.place();
            smash(b.t, b.x, b.y); struck(hit, { x: b.x, y: b.y }, b.dmg || 1);
            return;
          }
        }
        if (b.y >= b.floor) { b.y = b.floor; me.bodies.splice(me.bodies.indexOf(b), 1); b.place(); b.land(b.x, b.y); }
        else { b.place(); busy = true; }
      });
      me.parts.slice().forEach(function (p) {
        if (p.rest) return;
        p.vy += GRAV * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.y >= p.floor) {
          p.y = p.floor;
          if (p.vy > 170) { p.vy *= -.28; p.vx *= .55; p.vr *= .5; }
          else { p.vy = p.vx = p.vr = 0; p.rest = true; if (!p.keep) fadePart(p); }
        }
        p.set(); if (!p.rest) busy = true;
      });
      if (me.bodies.length) busy = true;
      if (busy) me.raf = requestAnimationFrame(step); else me.raf = 0;
    };
    R.raf = requestAnimationFrame(step);
  }
  function fadePart(p) { setTimeout(function () { p.el.style.transition = 'opacity .4s'; p.el.style.opacity = 0; setTimeout(function () { p.el.remove(); var i = R.parts.indexOf(p); if (i >= 0) R.parts.splice(i, 1); }, 420); }, 700); }
  function addPart(p) {
    R.parts.push(p); p.set();
    if (p.keep) { var kept = R.parts.filter(function (q) { return q.keep; }); if (kept.length > 36) { kept[0].keep = false; if (kept[0].rest) fadePart(kept[0]); } }
    loop();
  }
  function svgPart(el, x, y, opt) {
    opt = opt || {};
    var dir = opt.dir === undefined ? rnd(0, Math.PI * 2) : opt.dir + rnd(-.8, .8), sp = rnd(120, 320) * (opt.power || 1);
    var p = { el: el, x: x, y: y, vx: Math.cos(dir) * sp, vy: Math.sin(dir) * sp - rnd(80, 240), r: rnd(0, 360), vr: rnd(-500, 500), floor: opt.floor || rnd(560, 612), keep: !!opt.keep };
    p.set = function () { el.setAttribute('transform', 'translate(' + f1(p.x) + ' ' + f1(p.y) + ') rotate(' + f1(p.r) + ')'); };
    addPart(p);
  }
  function shard(x, y, color, size, opt) {
    var s = size || rnd(7, 12), pts = [], n = 3 + (Math.random() < .4 ? 1 : 0);
    for (var i = 0; i < n; i++) { var a = i / (n + .4) * Math.PI * 2 + rnd(-.4, .4), rr = s * rnd(.55, 1); pts.push(f1(Math.cos(a) * rr) + ',' + f1(Math.sin(a) * rr)); }
    svgPart(sv('polygon', { points: pts.join(' '), fill: color, stroke: INK, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, R.debris), x, y, opt);
  }
  function stick(x, y, len, th, color) {
    svgPart(sv('rect', { x: -len / 2, y: -th / 2, width: len, height: th, rx: 3.5, fill: color, stroke: INK, 'stroke-width': 2.6 }, R.debris), x, y, { dir: -Math.PI / 2, power: .9, keep: true, floor: rnd(596, 612) });
  }
  function dot(x, y, r, color, opt) { svgPart(sv('circle', { r: r, fill: color, stroke: INK, 'stroke-width': 2.2 }, R.debris), x, y, opt); }
  function imgPart(file, base, x, y, opt) {
    var o = OFF[base], e = hd('img', '', R.debImg);
    e.src = src(file); e.alt = '';
    e.style.cssText = 'left:' + o[0] + 'px;top:' + o[1] + 'px;width:' + o[2] + 'px;height:' + o[3] + 'px;transform-origin:' + (-o[0]) + 'px ' + (-o[1]) + 'px';
    var dir = opt.dir === undefined ? rnd(0, Math.PI * 2) : opt.dir + rnd(-.8, .8), sp = rnd(140, 260) * (opt.power || 1);
    var p = { el: e, x: x, y: y, vx: Math.cos(dir) * sp, vy: Math.sin(dir) * sp - rnd(120, 220), r: rnd(-60, 60), vr: rnd(-300, 300), floor: opt.floor || rnd(590, 610), keep: opt.keep !== false };
    p.set = function () { e.style.transform = 'translate(' + f1(p.x) + 'px,' + f1(p.y) + 'px) rotate(' + f1(p.r) + 'deg)'; };
    addPart(p);
  }
  function blot(x, y, rx, ry, color, op) {
    var e = hd('div', 'blot', R.floorMarks);
    e.style.cssText = 'left:' + f1(x - rx) + 'px;top:' + f1(y - ry) + 'px;width:' + rx * 2 + 'px;height:' + ry * 2 + 'px;background:' + color + ';opacity:' + op;
  }

  /* 小特效：黄星、墙灰、小字、镜头一抖 */
  function burst(x, y, big) {
    var g = sv('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ')' }, R.fx), n = 8, pts = [];
    for (var i = 0; i < n * 2; i++) { var a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 9 : (big ? 30 : 22); pts.push(f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r)); }
    sv('polygon', { points: pts.join(' '), fill: '#FFE05D', stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    tween(260, function (t) { g.setAttribute('transform', 'translate(' + f1(x) + ' ' + f1(y) + ') scale(' + (.6 + t * .7).toFixed(2) + ')'); g.style.opacity = (1 - t).toFixed(2); }, function () { g.remove(); });
  }
  function word(x, y, text) {
    var t = sv('text', { x: f1(x), y: f1(y), 'text-anchor': 'middle', 'paint-order': 'stroke', stroke: '#FFFCF4', 'stroke-width': 5, 'stroke-linejoin': 'round', fill: '#F24738', style: 'font:900 22px ' + getComputedStyle(host).fontFamily }, R.fx);
    t.textContent = text;
    tween(800, function (k) { t.setAttribute('y', f1(y - k * 22)); t.style.opacity = k > .6 ? ((1 - k) / .4).toFixed(2) : 1; }, function () { t.remove(); });
  }
  function plaster(p, lv) {
    var g = sv('g', {}, R.fx), puffs = [0, 1, 2, 3].map(function (i) { return { c: sv('circle', { r: 3, fill: '#F6ECDA', stroke: '#E5D3B5', 'stroke-width': 1 }, g), a: i / 4 * Math.PI * 2 + rnd(-.4, .4), v: rnd(9, 15) * (.8 + lv * .2) }; });
    tween(420, function (k) { var e = easeOut(k); puffs.forEach(function (q) { q.c.setAttribute('cx', f1(p.x + Math.cos(q.a) * q.v * e)); q.c.setAttribute('cy', f1(p.y + Math.sin(q.a) * q.v * e + 6 * k)); q.c.setAttribute('r', f1(3 + 3 * e)); }); g.style.opacity = (1 - k).toFixed(2); }, function () { g.remove(); });
    for (var i = 0; i < lv; i++) shard(p.x + rnd(-4, 4), p.y + rnd(-3, 3), i % 2 ? '#F3E6CF' : '#E6D3B4', rnd(3, 4.5), { dir: Math.PI / 2, power: .35 });
  }
  function camShake(a) { var me = R; tween(220, function (t) { if (me !== R) return; R.shx = Math.sin(t * Math.PI * 6) * a * (1 - t); R.shy = Math.cos(t * Math.PI * 5) * a * .6 * (1 - t); place(); }); }
  function shake(t) { var x0 = t.dx; tween(180, function (k) { t.dx = x0 + Math.sin(k * Math.PI * 5) * 4 * (1 - k); placeT(t); }); }
  function crackPaths(parent, p, n, segR, w, color) {
    var c = sv('g', { 'stroke-width': w }, parent); if (color) c.setAttribute('stroke', color);
    for (var i = 0; i < n; i++) {
      var a = rnd(0, Math.PI * 2), x = p.x, y = p.y, d = 'M' + f1(x) + ' ' + f1(y);
      for (var j = 0; j < 4; j++) {
        a += rnd(-.6, .6); var L = rnd(segR[0], segR[1]); x += Math.cos(a) * L; y += Math.sin(a) * L; d += ' L' + f1(x) + ' ' + f1(y);
        if (j === 1 && Math.random() < .5) { var b = a + rnd(.6, 1.1) * (Math.random() < .5 ? -1 : 1); sv('path', { d: 'M' + f1(x) + ' ' + f1(y) + ' l' + f1(Math.cos(b) * L * .8) + ' ' + f1(Math.sin(b) * L * .8) }, c); }
      }
      sv('path', { d: d }, c);
    }
  }
  function crackOn(t, p, n) {
    var b = IT[t.id].cb, q = { x: clamp(p.x - t.dx, b[0], b[2]), y: clamp(p.y - t.dy, b[1], b[3]) }, m = Math.max(b[2] - b[0], b[3] - b[1]);
    crackPaths(t.cr, q, n || 3, [clamp(m * .14, 3, 9), clamp(m * .26, 5, 14)], m < 36 ? 1.6 : 2);
  }

  /* 墙上的坑、地上的印子（App 的 dent-* / floordent-* 图），各留 30 个 */
  function dentAt(p, lv) {
    var near = null;
    R.dents.forEach(function (d) { if (!near && Math.hypot(d.x - p.x, d.y - p.y) < DENT_R[d.lv] + 4) near = d; });
    if (near) near.lv = Math.min(3, near.lv + Math.max(1, lv - 1));
    else {
      if (R.dents.length >= 30) { var old = R.dents.shift(); if (old.el) old.el.remove(); }
      near = { x: p.x, y: p.y, lv: lv, v: 1 + ((Math.random() * 3) | 0), el: null }; R.dents.push(near);
    }
    if (near.el) near.el.remove();
    near.el = oimg('dent-' + near.lv + '-' + near.v, 'dent-' + near.lv, near.x, near.y, R.wallMarks);
    plaster(p, near.lv);
    return near.lv;
  }
  function floorDent(p, lv) {
    if (R.fdents.length >= 30) R.fdents.shift().remove();
    R.fdents.push(oimg('floordent-' + clamp(lv, 1, 3), 'floordent', p.x, p.y, R.floorMarks));
    shard(p.x, p.y, '#E3C39A', 4, { dir: -Math.PI / 2, power: .35 });
  }

  /* 碎掉 */
  /* quiet：只记账不出冲击帧（掀桌那一下已经出过「掀桌！」） */
  function report(t, x, y, quiet) {
    R.dead++;
    if (hooks.brk) hooks.brk({ id: t.id, x: x, y: y, word: quiet ? '' : T.brk[t.id], count: R.dead, all: R.dead >= TOTAL });
  }
  function pop(x, y, w, opt) { if (hooks.pop) hooks.pop({ x: x, y: y, word: w, big: !!(opt && opt.big), sub: opt && opt.sub }); }
  function use(m) { if (!R.used[m]) { R.used[m] = 1; if (hooks.used) hooks.used(m); } }
  /* 不是锤出来的一下（半空撞上、电视压过去）：照样出引线标签 */
  function struck(t, p, dmg) {
    var r = hitItem(t, p, dmg), ev = { x: p.x, y: p.y, kind: 'item', id: t.id, dmg: dmg };
    for (var k in r) ev[k] = r[k];
    if (hooks.hit) hooks.hit(ev);
  }
  function launch(t, vx, vy, vr) {
    if (t.dead || t.flying) return;
    t.flying = true; hideSh(t); R.scene.appendChild(t.g);
    var I = IT[t.id], b = { t: t, x: I.c[0] + t.dx, y: I.c[1] + t.dy, vx: vx, vy: vy, r: t.rot, vr: vr || 0, floor: rnd(590, 606) - (I.h || 20) };
    b.place = function () { t.dx = b.x - I.c[0]; t.dy = b.y - I.c[1]; t.rot = b.r; placeT(t); };
    b.land = function (x, y) { smash(t, x, y); };
    R.bodies.push(b); loop();
  }
  function smash(t, x, y) {
    if (t.dead) return;
    var id = t.id, I = IT[id];
    t.dead = true; t.flying = false; hideSh(t);
    t.g.style.transition = 'opacity .1s'; t.g.style.opacity = 0;
    burst(x, y, true);
    if (id === 'plateA' || id === 'plateB' || id === 'bowl') snd('plate', .95);
    else if (id === 'plant') { snd('pot', .95); snd('crumble', .4, 200); }
    else if (I.mat === 'wood') { snd('wood/smash', .95); snd('wood/debris', .4, 320); }
    else { snd('glass/smash', .9); snd('glass/debris', .35, 320); }
    if (id === 'vase') snd('water', .6);
    if (id === 'bowl') snd('fruit', .6, 380);
    if (id === 'clock') snd('boing', .6);
    var low = y > 520;
    for (var i = 0; i < (I.mat === 'wood' ? 3 : 5); i++) shard(x + rnd(-12, 12), y + rnd(-8, 8), I.pal[i % I.pal.length], rnd(9, 14), low ? { dir: -Math.PI / 2, power: .7 } : {});
    if (id === 'vase') { blot(x, 604, 50, 10, 'rgba(159,211,236,.55)', 1); ['#FF8FB1', '#FFD34D', '#FF9D2E'].forEach(function (c) { dot(x + rnd(-10, 10), y - 30, 8, c, { dir: -Math.PI / 2, power: .6, keep: true, floor: rnd(590, 610) }); }); }
    if (id === 'bowl') ['#FFB45C', '#F2777A'].forEach(function (c) { dot(x, y - 10, 9, c, { dir: Math.random() < .5 ? -.4 : Math.PI + .4, power: 1, keep: true, floor: rnd(598, 610) }); });
    if (id === 'clock') imgPart('spring', 'spring', x, y, { dir: -Math.PI / 2, power: 1.1 });
    if (id === 'mug') imgPart('mug-handle', 'mug-handle', x, y, { power: 1 });
    if (id === 'plant') {
      var home = Math.abs(t.dx) < 2 && Math.abs(t.dy) < 2, soilY = home ? I.c[1] + I.h : clamp(y + I.h, 588, 612);
      blot(x, soilY, 32, 7, '#8A5E3C', .8);
      for (var lf = 0; lf < 3; lf++) imgPart('leaf', 'leaf', x + rnd(-14, 14), y - 20, { dir: -Math.PI / 2, power: .9, floor: soilY - 2 });
    }
    if (id === 'sofa') { [[76, 14], [86, 16], [60, 11], [50, 10]].forEach(function (k, i) { stick(x + rnd(-20, 20), y + rnd(-20, 10), k[0], k[1], I.pal[i % 3]); }); camShake(4); }
    if (id === 'stool') { [[64, 13], [40, 9], [40, 9]].forEach(function (k, i) { stick(x + rnd(-14, 14), y, k[0], k[1], I.pal[i % 2]); }); camShake(3); }
    loop(); report(t, x, y);
  }

  /* 每样东西挨一锤 */
  function hitItem(t, p, dmg) {
    var id = t.id, I = IT[id];
    if (id === 'tv') return hitTV(t, p, dmg);
    if (id === 'lamp') return hitLamp(t, p, dmg);
    if (id === 'mirror') return hitMirror(t, p, dmg);
    if (id === 'table') return hitTable(t, p, dmg);
    var need = I.need || 2;
    t.hits += dmg;
    if (t.hits < need) {
      snd(I.mat + '/hit', .7); snd(I.mat + '/crack', .75, 30);
      crackOn(t, p); shake(t);
      if (id === 'clock' && !t.spun) { t.spun = true; snd('spin', .6); tween(900, function (k) { t.hands.style.transform = 'rotate(' + f1(easeOut(k) * 540) + 'deg)'; }); }
      return { hits: t.hits, need: need };
    }
    if (id === 'clock') { snd('glass/hit', .6); launch(t, rnd(-40, 40), -40, rnd(-220, 220)); return { hits: need, need: need, broke: true, delayed: true }; }
    smash(t, I.c[0] + t.dx, I.c[1] + t.dy);
    return { hits: need, need: need, broke: true };
  }
  function hitTV(t, p, dmg) {
    t.hits += dmg;
    if (t.hits < 2) { snd('glass/hit', .45); snd('static', .7); t.stat.style.opacity = 1; t.scr.style.opacity = 0; crackOn(t, p); shake(t); return { hits: 1, need: 2, word: T.tvHit }; }
    t.dead = true; t.stat.style.opacity = 0; t.scr.style.opacity = 0; t.deadImg.style.opacity = 1;
    snd('glass/crack-big', .9); snd('glass/smash', .75, 90); snd('glass/debris', .35, 420); snd('tvoff', .7);
    crackPaths(t.cr, { x: 165, y: 402 }, 6, [9, 15], 2.4, '#9DB4D6');
    for (var i = 0; i < 3; i++) (function (i) { setTimeout(function () { if (R.alive) burst(165 + rnd(-40, 40), 402 + rnd(-24, 24), false); }, i * 90); })(i);
    for (var s = 0; s < 6; s++) shard(165 + rnd(-30, 30), 410, s % 2 ? '#9DB4D6' : '#2E3147', rnd(6, 10), { dir: Math.PI / 2, power: .6 });
    shake(t); report(t, 165, 402);
    return { hits: 2, need: 2, broke: true };
  }
  function hitLamp(t, p, dmg) {
    t.hits += dmg;
    if (t.hits < 2) {
      snd('glass/hit', .3); snd('buzz', .7); crackOn(t, p); shake(t);
      tween(600, function (k) { R.glow.style.opacity = Math.sin(k * 40) > 0 ? 1 : .25; }, function () { if (!t.dead) R.glow.style.opacity = .6; });
      return { hits: 1, need: 2, word: T.lampHit };
    }
    t.dead = true; R.glow.style.opacity = 0; R.dimEl.style.opacity = .12; snd('bulb', .85);
    tween(300, function (k) { t.pole.style.transform = 'rotate(' + f1(7 * easeOut(k)) + 'deg)'; });
    var b = { x: 340, y: 238, vx: rnd(-80, 20), vy: -60, r: 0, vr: rnd(-260, 120), floor: 588 };
    b.place = function () { t.dx = b.x - 340; t.dy = b.y - 238; t.rot = b.r; placeT(t); };
    b.land = function (x, y) { t.g.style.opacity = 0; burst(x, y, true); snd('glass/smash', .9); snd('glass/debris', .35, 300); for (var i = 0; i < 7; i++) shard(x, y, IT.lamp.pal[i % 3], rnd(7, 12), { dir: -Math.PI / 2, power: .7 }); };
    R.bodies.push(b); loop(); report(t, 340, 238);
    return { hits: 2, need: 2, broke: true };
  }
  function hitMirror(t, p, dmg) {
    t.hits += dmg;
    var lp = { x: clamp(p.x, 430, 474), y: clamp(p.y, 124, 204) };
    if (t.hits < 2) { snd('glass/hit', .7); snd('glass/crack', .8, 30); crackPaths(t.cr, lp, 7, [7, 13], 1.8); shake(t); return { hits: 1, need: 2 }; }
    t.dead = true; t.glass.src = src('mirror-glass-broken'); t.cr.innerHTML = '';
    snd('glass/crack-big', .9); snd('glass/smash', .9, 70); snd('glass/debris', .4, 400);
    for (var i = 0; i < 8; i++) shard(rnd(432, 472), rnd(128, 200), IT.mirror.pal[i % 3], rnd(8, 13), { dir: Math.PI / 2, power: .45 });
    burst(452, 164, true); shake(t); report(t, 452, 164);
    return { hits: 2, need: 2, broke: true };
  }
  function hitTable(t, p, dmg) {
    t.hits += dmg;
    var on = ['vase', 'bowl'].map(function (k) { return R.items[k]; }).filter(function (q) { return !q.dead && !q.flying; });
    if (t.hits < 2) { snd('wood/hit', .7); snd('wood/crack', .7, 30); crackOn(t, p); shake(t); on.forEach(shake); return { hits: 1, need: 2 }; }
    t.dead = true; hideSh(t); t.g.style.transition = 'opacity .1s'; t.g.style.opacity = 0;
    snd('wood/crack-big', .9); snd('wood/smash', .9, 80); snd('wood/debris', .4, 380);
    burst(242, 570, true); camShake(4);
    [[96, 14], [70, 12], [48, 11], [48, 11]].forEach(function (k, i) { stick(242 + rnd(-60, 60), 568 + rnd(-8, 8), k[0], k[1], IT.table.pal[i % 2]); });
    on.forEach(function (q) { launch(q, rnd(-60, 60), -80, rnd(-200, 200)); });
    unGrab('grabTable');
    report(t, 242, 575);
    return { hits: 2, need: 2, broke: true };
  }
  function unGrab(k) { if (R[k]) { R[k].remove(); R[k] = null; } }

  /* ---- 掀茶几：整个翻过来落回原地（算碎了一样），上面的花瓶果盘被掀飞 ---- */
  function flipTable(dx) {
    var t = R.items.table, dir = dx >= 0 ? 1 : -1, me = R;
    if (t.dead) return;
    t.dead = true; t.flipped = true; use('flip'); unGrab('grabTable');
    snd('lift', .7);
    TABLE_IDS.forEach(function (k) { var q = R.items[k]; if (!q.dead && !q.flying) launch(q, rnd(-120, 120) + dir * 90, -rnd(620, 780), dir * rnd(300, 600)); });
    pop(242, 493, T.flipWord, { big: true, sub: T.flipFace });
    tween(620, function (k) {
      if (me !== R) return;
      t.rot = dir * 180 * easeOut(k); t.dy = -120 * Math.sin(Math.PI * k); placeT(t);
      if (t.csh) t.csh.style.opacity = (1 - .85 * Math.sin(Math.PI * k)).toFixed(2);
    }, function () {
      if (me !== R) return;
      t.rot = dir * 180; t.dy = 0; placeT(t);
      burst(242, 601, true); camShake(4); snd('land', 1);
      for (var i = 0; i < 3; i++) shard(242 + rnd(-60, 60), 605, '#E3C39A', 5, { dir: -Math.PI / 2, power: .5 });
      report(t, 242, 577, true);
    });
  }
  /* ---- 掀电视柜：和茶几一样翻过来落回原地；电视还在上面就被掀飞摔地上。柜子砸不坏，不记账 ---- */
  function flipStand(dx) {
    var dir = dx >= 0 ? 1 : -1, tv = R.items.tv, me = R;
    if (R.standFlipped) return;
    R.standFlipped = true; use('flip'); unGrab('grabStand');
    snd('lift', .8);
    if (!tv.gone && !tv.flying) dropTV(165 + tv.dx, 402 + tv.dy, dir * rnd(140, 220), -rnd(520, 620), dir * rnd(260, 420));
    tween(720, function (k) {
      if (me !== R) return;
      R.stand.style.transform = 'translate(0,' + f1(-80 * Math.sin(Math.PI * k)) + 'px) rotate(' + f1(dir * 180 * easeOut(k)) + 'deg)';
      if (R.standSh) R.standSh.style.opacity = (1 - .85 * Math.sin(Math.PI * k)).toFixed(2);
    }, function () {
      if (me !== R) return;
      R.stand.style.transform = 'rotate(' + dir * 180 + 'deg)';
      burst(STAND_C[0], 500, true); camShake(4); snd('land', 1); snd('wood/hit', .7);
      for (var i = 0; i < 3; i++) shard(STAND_C[0] + rnd(-60, 60), 502, '#E3C39A', 5, { dir: -Math.PI / 2, power: .5 });
    });
  }

  /* ---- 电视：横着狠推一把滑下柜子摔地上；柜子被掀翻时也一起飞下来 ---- */
  /* 摔碎：屏幕的碴子飞一片，壳子碎成两半、天线掉两根留在地上。锤黑了的再摔一回不重复记账 */
  function crashTV(t, x, y) {
    if (t.gone) return;
    var was = t.dead;
    t.dead = t.gone = true; t.flying = false;
    t.g.style.transition = 'opacity .1s'; t.g.style.opacity = 0; t.cr.innerHTML = '';
    burst(x, y, true); setTimeout(function () { if (R.alive) burst(x + rnd(-34, 34), y + rnd(-20, 10), false); }, 80);
    camShake(5);
    snd('land', .9); snd('glass/crack-big', .95); snd('glass/smash', .9, 70); snd('glass/debris', .4, 400);
    if (!was) snd('tvoff', .7);
    for (var i = 0; i < 8; i++) shard(x + rnd(-30, 30), y + rnd(-16, 10), i % 2 ? '#9DB4D6' : '#2E3147', rnd(7, 12), { dir: -Math.PI / 2, power: .8 });
    [[56, 30, '#4A4E6B'], [44, 26, '#4A4E6B'], [30, 5, INK], [26, 5, INK]].forEach(function (k) { stick(x + rnd(-24, 24), y + rnd(-14, 6), k[0], k[1], k[2]); });
    if (!was) report(t, x, y);
    else pop(x, y, T.brk.tv);
  }
  /* 离开柜子往下掉：半空压过花盆、花瓶就把它们砸了（沉，算两下），自己落了地才碎 */
  function dropTV(x, y, vx, vy, vr) {
    var t = R.items.tv;
    t.flying = true; R.scene.appendChild(t.g);
    var b = { t: t, x: x, y: y, vx: vx, vy: vy, r: t.rot, vr: vr, floor: rnd(552, 560), dmg: 2, plow: {} };
    b.place = function () { t.dx = b.x - 165; t.dy = b.y - 402; t.rot = b.r; placeT(t); };
    b.land = function (lx, ly) { crashTV(t, lx, ly); };
    R.bodies.push(b); loop();
  }
  /* 推够劲了：顺着柜面滑到边上，快到边时往外歪，过了边就翻下去 */
  function shoveTV(dir, speed) {
    var t = R.items.tv, me = R;
    if (t.gone || t.flying) return;
    t.flying = true; snd('wood/hit', .45);
    var x0 = 165 + t.dx, edge = dir > 0 ? STAND[2] : STAND[0], v = clamp(speed * .45, 420, 900), r0 = t.rot;
    tween(Math.abs(edge - x0) / v * 1000, function (k) {
      if (me !== R) return;
      t.dx = x0 + (edge - x0) * k - 165; t.rot = r0 + (dir * 8 - r0) * k * k; placeT(t);
    }, function () { if (me === R) dropTV(edge, 402, dir * clamp(v * .3, 130, 240), 0, dir * rnd(200, 300)); });
  }
  /* 劲不够：挪回原处，咚一声 */
  function settleTV() {
    var t = R.items.tv, x0 = t.dx, r0 = t.rot;
    if (t.gone || t.flying) return;
    snd('wood/hit', .35);
    tween(260, function (k) { var e = easeOut(k); t.dx = x0 * (1 - e); t.rot = r0 * (1 - e); placeT(t); });
  }

  /* ---- 扫：搁板上横着一划，还在的一样样飞出去 ---- */
  function doSweep(dir) {
    var list = SHELF_IDS.map(function (k) { return R.items[k]; }).filter(function (q) { return !q.dead && !q.flying; }), me = R;
    list.sort(function (a, b) { return (IT[a.id].c[0] - IT[b.id].c[0]) * dir; });
    list.forEach(function (q, i) { setTimeout(function () { if (me === R) launch(q, dir * rnd(260, 420), -rnd(80, 200), dir * rnd(300, 700)); }, i * 70); });
    if (list.length) { pop(92, 164, T.sweepWord); snd('sweep', .7); }
  }

  /* 锤子（照 App 的 hammerPose） */
  function turn(x, y, deg) { var a = deg * Math.PI / 180; return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) }; }
  function hammerPose(h) {
    var k = h.k, L = 125 * k, W = 45 * k, Hh = 26 * k, face = turn(-W, -L, H_LANDED);
    h.px = h.sp.x - h.side * face.x; h.py = h.sp.y - face.y;
    var fits = function (lift) { var d = H_LANDED + lift; return [turn(-W, -L - Hh, d), turn(W, -L - Hh, d), turn(-W, -L + Hh, d), turn(W, -L + Hh, d)].every(function (q) { var x = h.px + h.side * q.x, y = h.py + q.y; return y >= 6 && x >= 6 && x <= 528; }); };
    h.max = H_MIN; while (h.max < H_CHARGED && fits(h.max + 1)) h.max += 1;
  }
  function poseH(h, lift, jit) {
    h.lift = lift;
    var a = H_LANDED + Math.min(lift, h.max) + (jit || 0), k = h.k * (.8 + .2 * h.pop);
    var tf = function (dx, dy) { return 'translate(' + f1(h.px + dx) + ' ' + f1(h.py + dy) + ') scale(' + h.side + ' 1) rotate(' + f1(a) + ') scale(' + k.toFixed(3) + ')'; };
    h.ink.setAttribute('transform', tf(4 * h.k, 5 * h.k)); h.body.setAttribute('transform', tf(0, 0));
  }
  function makeHammer(sp) {
    dropHammer();
    var g = sv('g', {}, R.ham), ink = sv('use', { href: '#mallet-ink' }, g), body = sv('use', { href: '#mallet' }, g);
    var ring = sv('circle', { cx: f1(sp.x), cy: f1(sp.y), r: 34, fill: 'none', stroke: '#F24738', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '0 999', transform: 'rotate(-90 ' + f1(sp.x) + ' ' + f1(sp.y) + ')', opacity: .9 }, R.ham);
    HS = { g: g, ink: ink, body: body, ring: ring, sp: sp, side: sp.x < 267 ? 1 : -1, k: H_K, pop: 0, lift: H_RAISED, jit: 0 };
    hammerPose(HS); poseH(HS, H_RAISED);
    var h = HS; tween(60, function (t) { h.pop = t; poseH(h, h.lift, h.jit); });
  }
  function dropHammer() { if (HS) { HS.g.remove(); if (HS.ring) HS.ring.remove(); HS = null; } }
  function moveHammer(p) {
    if (!HS) return;
    HS.sp = p; HS.side = p.x < 267 ? 1 : -1; hammerPose(HS); poseH(HS, HS.lift, HS.jit);
    if (HS.ring) { HS.ring.setAttribute('cx', f1(p.x)); HS.ring.setAttribute('cy', f1(p.y)); HS.ring.setAttribute('transform', 'rotate(-90 ' + f1(p.x) + ' ' + f1(p.y) + ')'); }
  }
  function charge() {
    var g0 = G;
    (function tick() {
      if (G !== g0 || !HS || !HS.ring) return;
      var held = performance.now() - g0.t0, p = clamp((held - 150) / 550, 0, 1);
      HS.ring.setAttribute('stroke-dasharray', f1(213.6 * p) + ' 999');
      HS.jit = Math.sin(held / 16.5) * 1.8 * clamp((p - .8) / .2, 0, 1);
      poseH(HS, H_RAISED + (H_CHARGED - H_RAISED) * (1 - (1 - p) * (1 - p)), HS.jit);
      if (hooks.charge) hooks.charge(p);
      requestAnimationFrame(tick);
    })();
  }
  function swing(p, dmg, full, lv) {
    if (!HS) makeHammer(p);
    var h = HS; HS = null;
    if (h.ring) { h.ring.remove(); h.ring = null; }
    h.jit = 0;
    var from = Math.min(h.lift, h.max), me = R;
    tween(40, function (t) { poseH(h, from * (1 - t * t)); }, function () {
      if (me === R) impact(p, dmg, full, lv);
      tween(200, function (t) { poseH(h, H_RECOIL * easeOut(Math.min(1, t / .55))); h.g.style.opacity = t < .25 ? 1 : (1 - (t - .25) / .75).toFixed(2); }, function () { h.g.remove(); });
    });
  }

  function ammoFx(kind, p) {
    if (kind === 'brick') { snd('stone/crack-big', .8); snd('stone/debris', .4, 260); ['#E07A5F', '#C8553D'].forEach(function (c) { shard(p.x, p.y, c, rnd(7, 10), { dir: Math.PI / 2, power: .5 }); }); }
    else if (kind === 'bottle') { snd('glass/smash', .7); ['#9CD3B0', '#CDEBD6', '#7FBF98'].forEach(function (c) { shard(p.x, p.y, c, rnd(6, 10)); }); }
    else if (kind === 'egg') { snd('egg', .85); ['#FFFCF4', '#FFD34D'].forEach(function (c) { shard(p.x, p.y, c, rnd(5, 8), { dir: Math.PI / 2, power: .4 }); }); }
    else { snd('slap', .85); imgPart('ammo-slipper', 'ammo', p.x, p.y, { dir: Math.PI / 2, power: .3 }); }
  }
  function impact(p, dmg, full, lv, via) {
    if (!R.alive) return;
    var t = targetAt(p.x, p.y, via ? 10 : 6), ev = { x: p.x, y: p.y, full: full, lv: lv, dmg: dmg, via: via };
    burst(p.x, p.y, dmg > 1); if (full) camShake(5);
    if (via) ammoFx(via, p);
    if (t) {
      var r = hitItem(t, p, dmg);
      ev.kind = 'item'; ev.id = t.id;
      for (var k in r) ev[k] = r[k];
    } else {
      var w = wreckAt(p.x, p.y);
      if (w) {
        shake(w);
        if (w.id === 'lamp') snd('pole', .7); else if (w.id === 'table') snd('wood/hit', .6); else snd('glass/hit', .5);
        ev.kind = 'wreck'; ev.id = w.id;
      } else {
        var f = FURN.some(function (b) { return inBB(b, p.x, p.y); });
        if (f) { if (!via) snd('wood/hit', .5); ev.kind = 'furn'; }
        else if (p.y < 360 && via === 'egg') { splat(p); ev.kind = 'wall'; ev.lv = 1; }
        else if (p.y < 360) { if (!via) snd('stone/hit', .55); var L = dentAt(p, lv); if (L > 2) snd('crumble', .45, 90); ev.kind = 'wall'; ev.lv = L; }
        else if (p.y > 377 && via === 'egg') { blot(p.x, p.y, 16, 6, '#FFD34D', .85); ev.kind = 'floor'; }
        else if (p.y > 377) { if (!via) snd('wood/hit', .45); floorDent(p, lv); ev.kind = 'floor'; }
        else { if (!via) snd('wood/hit', .5); ev.kind = 'furn'; }
      }
    }
    if (!ev.broke && !full) word(p.x, p.y - 34, ev.word || T.hit[(Math.random() * T.hit.length) | 0]);
    if (hooks.hit) hooks.hit(ev);
  }
  function splat(p) {
    var n = R.wallMarks.querySelectorAll('.egg').length; if (n >= 12) R.wallMarks.querySelector('.egg').remove();
    oimg('splat-egg-' + (1 + ((Math.random() * 3) | 0)), 'splat-egg', p.x, p.y, R.wallMarks).className = 'egg';
  }

  /* 从筐里扔（照 App：筐里探出头的是下一个要扔的）；不拖、点一下就挑一样还立着的扔过去 */
  function pickTarget() {
    var left = ORDER.filter(function (id) { var t = R.items[id]; return !t.dead && !t.flying; });
    if (!left.length) return { x: rnd(60, 480), y: rnd(70, 320) };
    var id = left[(Math.random() * left.length) | 0], I = IT[id], t = R.items[id];
    return { x: I.c[0] + t.dx + rnd(-6, 6), y: I.c[1] + t.dy + rnd(-6, 6) };
  }
  function throwAt(p) {
    var kind = AMMO[R.ammo % AMMO.length]; R.ammo++;
    if (R.peek) R.peek.src = src('ammo-' + AMMO[R.ammo % AMMO.length]);
    snd('toss', .8);
    var e = hd('img', '', R.debImg); e.src = src('ammo-' + kind); e.alt = '';
    e.style.cssText = 'left:-22px;top:-22px;width:44px;height:44px;transform-origin:22px 22px';
    var x0 = 58, y0 = 530, d = Math.hypot(p.x - x0, p.y - y0), dur = 260 + d * .45, apex = Math.min(y0, p.y) - 60 - d * .12;
    var cx = (x0 + p.x) / 2, cy = 2 * apex - (y0 + p.y) / 2, spin = rnd(360, 640) * (p.x < x0 ? -1 : 1), me = R;
    tween(dur, function (k) {
      var u = 1 - k, bx = u * u * x0 + 2 * u * k * cx + k * k * p.x, by = u * u * y0 + 2 * u * k * cy + k * k * p.y;
      e.style.transform = 'translate(' + f1(bx) + 'px,' + f1(by) + 'px) rotate(' + f1(spin * k) + 'deg) scale(' + (1 - .2 * k).toFixed(3) + ')';
    }, function () { e.remove(); if (me === R && R.alive) impact(p, kind === 'brick' ? 2 : 1, false, 2, kind); });
  }

  /* 手指 */
  function toWorld(e) { var r = host.getBoundingClientRect(); return { x: (e.clientX - r.left) * 534 / r.width, y: (e.clientY - r.top) * 534 / r.width }; }
  /* 松手前最后 90ms 的快慢（屋里单位每秒）；停住 80ms 以上才松的不算甩（照 App 的 vel） */
  function vel(g) {
    var h = g.hist, b = h[h.length - 1], a = h[0];
    if (performance.now() - b.t > 80) return { x: 0, y: 0 };
    for (var i = h.length - 1; i >= 0; i--) { a = h[i]; if (b.t - h[i].t > 90) break; }
    var dt = Math.max(16, b.t - a.t) / 1000;
    return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
  }
  function raise(g) {
    if (g.charging) return;
    clearTimeout(g.hold); g.charging = true; makeHammer(g.p); charge();
  }
  function lower(g) {
    clearTimeout(g.hold);
    if (g.charging) { g.charging = false; dropHammer(); if (hooks.charge) hooks.charge(0); }
  }
  function endTrail(g) {
    var tr = g.trail; if (!tr) return;
    tween(300, function (k) { tr.setAttribute('opacity', (.14 * (1 - k)).toFixed(3)); }, function () { tr.remove(); });
  }
  function down(e) {
    if (e.button > 0 || G || !R.alive) return;
    sndWake();
    var p = toWorld(e), now = performance.now();
    var g = G = { id: e.pointerId, t0: now, p: p, s: p, hist: [{ x: p.x, y: p.y, t: now }], mode: null };
    try { host.setPointerCapture(e.pointerId); } catch (x) {}
    if (hooks.touch) hooks.touch();
    if (inBB(CRATE, p.x, p.y, 4)) { g.crate = true; g.line = sv('line', { x1: 58, y1: 530, x2: f1(p.x), y2: f1(p.y), stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round', opacity: .55 }, R.fx); }
    else {
      var tv = R.items.tv;
      g.target = targetAt(p.x, p.y, 4);
      g.shelf = inBB(SHELF, p.x, p.y);
      g.tv = !tv.gone && !tv.flying && (g.target === tv || (!g.target && inBB(IT.tv.bb, p.x, p.y, 4)));
      g.hold = setTimeout(function () { if (G === g && !g.mode) raise(g); }, HOLD_MS);
    }
    if (hooks.aim) hooks.aim(p);
  }
  function move(e) {
    var p = toWorld(e), g = G;
    if (g && e.pointerId === g.id) {
      g.p = p; g.hist.push({ x: p.x, y: p.y, t: performance.now() }); if (g.hist.length > 10) g.hist.shift();
      if (g.crate) { g.line.setAttribute('x2', f1(p.x)); g.line.setAttribute('y2', f1(p.y)); }
      else {
        var dx = p.x - g.s.x, dy = p.y - g.s.y;
        /* 头 10 个单位往哪儿走定是什么动作（照 App 的先后）；都不是就是拿着锤子挪 */
        if (!g.mode && Math.hypot(dx, dy) > 10) {
          if (g.shelf && Math.abs(dx) > Math.abs(dy) * 1.2) {
            g.mode = 'sweep'; lower(g); use('sweep');
            g.trail = sv('polyline', { points: f1(g.s.x) + ',' + f1(g.s.y), fill: 'none', stroke: INK, 'stroke-width': 18, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .14 }, R.fx);
            g.last = g.s;
          } else if (g.target && g.target.id === 'table' && dy < 0 && Math.abs(dy) > Math.abs(dx)) { g.mode = 'flip'; g.flip = 'table'; lower(g); }
          else if (!g.target && !R.standFlipped && inBB(STAND, g.s.x, g.s.y) && dy < 0 && Math.abs(dy) > Math.abs(dx)) { g.mode = 'flip'; g.flip = 'stand'; lower(g); }
          else if (g.tv && Math.abs(dx) > Math.abs(dy) * 1.2) { g.mode = 'push'; lower(g); }
          else { g.mode = 'ham'; raise(g); }
        }
        if (g.mode === 'sweep') {
          if (Math.hypot(p.x - g.last.x, p.y - g.last.y) > 6) { g.last = p; g.trail.setAttribute('points', g.trail.getAttribute('points') + ' ' + f1(p.x) + ',' + f1(p.y)); }
          if (!g.swept && Math.abs(dx) > 40) { g.swept = true; doSweep(dx > 0 ? 1 : -1); }
        } else if (g.mode === 'push') {
          /* 电视沉：划多远也只挪一点点，越往外越挪不动 */
          var tv = R.items.tv;
          if (!tv.flying && !tv.gone) { var give = (dx < 0 ? -1 : 1) * PUSH_GIVE * (1 - Math.exp(-Math.abs(dx) / 80)); tv.dx = give; tv.rot = give * .25; placeT(tv); }
        } else if (g.mode === 'flip') {
          if (dy < -30) { g.mode = 'done'; if (g.flip === 'stand') flipStand(dx); else flipTable(dx); }
        } else moveHammer(p);
      }
    }
    if (hooks.aim && (e.pointerType === 'mouse' || G)) hooks.aim(p);
  }
  function up(e) {
    if (!G || e.pointerId !== G.id) return;
    var g = G; G = null;
    clearTimeout(g.hold);
    if (hooks.idle) hooks.idle();
    if (e.pointerType !== 'mouse' && hooks.aim) setTimeout(function () { if (!G) hooks.aim(null); }, 700);
    if (g.crate) {
      g.line.remove(); use('aim');
      throwAt(Math.hypot(g.p.x - g.s.x, g.p.y - g.s.y) > 24 ? g.p : pickTarget());
      return;
    }
    var dx = g.p.x - g.s.x;
    if (g.mode === 'sweep') { endTrail(g); if (!g.swept && Math.abs(dx) > 20) doSweep(dx > 0 ? 1 : -1); return; }
    if (g.mode === 'push') {
      var v = vel(g), dir = dx < 0 ? -1 : 1;
      if (Math.abs(dx) > 24 && (v.x < 0 ? -1 : 1) === dir && Math.abs(v.x) > PUSH_V) shoveTV(dir, Math.abs(v.x)); else settleTV();
      return;
    }
    if (g.mode === 'flip' || g.mode === 'done') return;
    var held = performance.now() - g.t0, pw = clamp((held - 150) / 550, 0, 1), full = pw >= 1;
    if (hooks.charge) hooks.charge(0);
    use('hammer');
    swing(g.p, full ? 2 : 1, full, full ? 3 : pw > .45 ? 2 : 1);
  }
  function cancel(e) {
    if (!G || e.pointerId !== G.id) return;
    var g = G; G = null;
    if (g.line) g.line.remove();
    endTrail(g); lower(g); dropHammer();
    if (g.mode === 'push') settleTV();
    if (hooks.charge) hooks.charge(0);
    if (hooks.aim) hooks.aim(null);
    if (hooks.idle) hooks.idle();
  }
  function leave(e) { if (e.pointerType === 'mouse' && !G && hooks.aim) hooks.aim(null); }
  host.addEventListener('pointerdown', down);
  host.addEventListener('pointermove', move);
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', cancel);
  host.addEventListener('pointerleave', leave);
  host.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(host);
  window.addEventListener('resize', function () { fit(); });

  build();
  return {
    toStage: function (p) { return { x: p.x * R.s, y: p.y * R.s }; },
    scale: function () { return R.s; },
    /* 卡住时该教哪个：这一局没做过、还做得到的第一个（能扫的都碎了就别说扫，茶几没了就别说掀） */
    stuck: function () {
      var it = R.items;
      for (var i = 0; i < MOVES.length; i++) {
        var m = MOVES[i];
        if (R.used[m]) continue;
        if (m === 'sweep' && !SHELF_IDS.some(function (k) { return !it[k].dead && !it[k].flying; })) continue;
        if (m === 'flip' && it.table.dead) continue;
        return m;
      }
      return null;
    },
    busy: function () { return !!G; },
    reset: function () { R.alive = false; if (R.raf) cancelAnimationFrame(R.raf); if (G) clearTimeout(G.hold); G = null; HS = null; build(); }
  };
}

/* ---------- A 的读数：取景框十字线、引线标签、力度条、计数 ---------- */
function blocks(h, n) { var s = ''; for (var i = 0; i < n; i++) s += i < h ? '▮' : '▯'; return s; }
function mount(root) {
  var stage = $('[data-stage]', root), fxo = $('[data-fxo]', root), tags = $('[data-tags]', root), cross = $('[data-cross]', root);
  var xy = $('[data-xy]', root), hint = $('[data-hint]', root), count = $('[data-count]', root), pw = $('[data-pw]', root), segs = $$('i', pw), clear = $('[data-clear]', root);
  var live = [];
  function callout(ev) {
    var b = IT[ev.id].bb, s = room.scale(), W = stage.clientWidth, H = stage.clientHeight, nm = T.names[ev.id];
    var hp = { x: ev.x * s, y: ev.y * s }, right = b[2] * s + 150 < W, tx = right ? b[2] * s + 14 : b[0] * s - 14, ty = clamp(b[1] * s - 4, 10, H - 60);
    live = live.filter(function (w) { if (w._id === ev.id) { w.remove(); return false; } return true; });
    var wrap = hd('div', '', tags), line = sv('svg', { width: W, height: H }, wrap); wrap._id = ev.id;
    sv('line', { x1: f1(hp.x), y1: f1(hp.y), x2: f1(tx), y2: f1(ty + 12) }, line);
    sv('circle', { cx: f1(hp.x), cy: f1(hp.y), r: 4 }, line);
    var tag = hd('div', 'ctag' + (right ? '' : ' left') + (ev.broke ? ' broke' : ''), wrap);
    tag.style.left = f1(tx) + 'px'; tag.style.top = f1(ty) + 'px';
    var prog = ev.kind === 'wreck' ? T.wrecked : ev.delayed ? T.falling : ev.broke ? T.broke : blocks(ev.hits, ev.need) + ' ' + ev.hits + '/' + ev.need;
    tag.innerHTML = '<b></b><span></span><em></em>';
    tag.children[0].textContent = nm[0]; tag.children[1].textContent = nm[1]; tag.children[2].textContent = prog;
    live.push(wrap);
    while (live.length > 2) live.shift().remove();
    setTimeout(function () { tag.classList.add('out'); line.style.transition = 'opacity .3s'; line.style.opacity = 0; setTimeout(function () { wrap.remove(); var i = live.indexOf(wrap); if (i >= 0) live.splice(i, 1); }, 320); }, 1700);
  }
  var room = Room(stage, {
    charge: function (p) {
      var on = p <= 0 ? 0 : Math.max(1, Math.ceil(p * 5));
      segs.forEach(function (s, i) { s.classList.toggle('on', i < on); });
      pw.classList.toggle('max', p >= 1);
    },
    aim: function (p) {
      if (!p) { cross.hidden = true; return; }
      var s = room.scale(); cross.hidden = false;
      cross.style.setProperty('--x', f1(p.x * s) + 'px'); cross.style.setProperty('--y', f1(p.y * s) + 'px');
      xy.textContent = 'X ' + pad3(p.x) + ' · Y ' + pad3(p.y);
    },
    hit: function (ev) {
      if (ev.kind === 'item' || ev.kind === 'wreck') callout(ev);
      if (ev.full && !ev.broke) animeFrame(fxo, room.toStage(ev), ev.kind === 'wall' ? T.fullWall : T.fullItem, {});
    },
    brk: function (ev) {
      count.textContent = pad2(ev.count);
      if (ev.word) animeFrame(fxo, room.toStage(ev), ev.word, { big: true });
      if (ev.all) clear.hidden = false;
    },
    pop: function (ev) { animeFrame(fxo, room.toStage(ev), ev.word, { big: ev.big, sub: ev.sub }); },
    touch: function () { clearTimeout(stuckT); hint.classList.add('gone'); },
    idle: function () { clearTimeout(stuckT); stuckT = setTimeout(stuck, STUCK_MS); }
  });
  /* 提示平时不说：手停了好几秒才冒一句，只教这一局还没做过的（照 App 的 useStuck）。舞台不在屏幕上就等它回来再说 */
  var stuckT = 0;
  function stuck() {
    var r = stage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) { stuckT = setTimeout(stuck, 1500); return; }
    var m = room.busy() ? null : room.stuck();
    if (!m) return;
    hint.textContent = T.stuck[m]; hint.classList.remove('gone');
  }
  var sb = $$('[data-sound]', root);
  function paint() { sb.forEach(function (b) { b.textContent = SND.on ? T.soundOn : T.soundOff; b.setAttribute('aria-pressed', SND.on ? 'true' : 'false'); }); }
  sb.forEach(function (b) { b.addEventListener('click', function () { SND.on = !SND.on; if (SND.on) sndWake(); paint(); }); });
  paint();
  $('[data-reset]', root).addEventListener('click', function () { room.reset(); clearTimeout(stuckT); count.textContent = '00'; clear.hidden = true; hint.textContent = T.stuck.hammer; hint.classList.remove('gone'); live.forEach(function (w) { w.remove(); }); live = []; });
  window.addEventListener('load', function () { setTimeout(sndFetch, 1200); });
}

/* ---------- 冷静箱小演示：点 5 / 10 / 30 换一句 ---------- */
function timers() {
  $$('[data-timer]').forEach(function (box) {
    var btns = $$('button', box), msg = $('[data-timer-msg]', box.parentNode);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (msg) msg.textContent = b.getAttribute('data-msg');
      });
    });
  });
}

var root = $('[data-room]');
if (root) mount(root);
timers();
})();
