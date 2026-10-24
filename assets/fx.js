/* 不气了官网的卡片手感（2026-10-22，Cora 挑的方案 A「取景框对焦」，方案页 artifacts/site-hover-proposal-20261022）。
   - 图卡：鼠标放上去四个角收拢锁住、左上亮「● 对焦」、准星跟着鼠标、右下报坐标、画面往看的地方推近；点下去白光闪一下。
     手机上没有悬停：滑到屏幕中间那条带子里的卡自动对焦。
   - 三条路的卡：整张都能点（CSS 把「看截图 →」撑满整张），顶上那条刷黑，鼠标到哪个游戏哪个亮红。
   - 导航：底下那道线跟着鼠标滑。
   - 一组卡第一次进屏幕时一张接一张浮上来，只浮一次；一打开就在屏幕里的不浮。
   - 玩法页的截图点了放大看；从首页点卡片跳过去，落地那张会对焦一下。
   状态全是 class，样式在 unmad.css。没有这个脚本就是原来的静态页。 */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var EN = (root.lang || '').slice(0, 2) === 'en';
  var T = EN ? { focus: 'FOCUS', close: 'Close', zoom: 'Enlarge screenshot: ' } : { focus: '对焦', close: '关闭', zoom: '放大看截图：' };
  // 繁体页：store/site/tools/hant.mjs 从上面简体那份转出来写进来的，别手改
  if (/^zh-Hant/i.test(root.lang)) T = /*hant*/{ focus: '對焦', close: '關閉', zoom: '放大看截圖：' }/*/hant*/;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noHover = matchMedia('(hover: none)').matches;
  var hasIO = 'IntersectionObserver' in window;
  root.classList.add('fx');

  function el(tag, cls, parent, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function restart(n, cls) { n.classList.remove(cls); void n.offsetWidth; n.classList.add(cls); }
  // 悬停只认鼠标和触控笔；手指走「屏幕中间自动对焦」
  function hover(n, h) {
    n.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch' && h.enter) h.enter(e); });
    n.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch' && h.move) h.move(e); });
    n.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && h.leave) h.leave(e); });
  }
  // 普通的左键点（不是新标签页打开那种）
  function plainClick(e) { return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey; }

  // 准星跟手用的动画循环：只在有东西在动的时候跑
  var movers = [];
  function loop() { movers = movers.filter(function (m) { return m(); }); if (movers.length) requestAnimationFrame(loop); }
  function kick(m) { if (movers.indexOf(m) >= 0) return; movers.push(m); if (movers.length === 1) requestAnimationFrame(loop); }

  // 手机：屏幕中间那条带子里的卡算「对上焦」
  var band = null, bandSet = [];
  function inBand(n, set) {
    if (!hasIO) return;
    band = band || new IntersectionObserver(function (es) {
      es.forEach(function (en) { bandSet.forEach(function (b) { if (b[0] === en.target) b[1](en.isIntersecting); }); });
    }, { rootMargin: '-38% 0px -38% 0px' });
    bandSet.push([n, set]); band.observe(n);
  }

  // ---------- 图卡 ----------
  function shotFx(shot, owner, num) {
    var pic = shot.querySelector('.pic'), img = pic && pic.querySelector('img');
    if (!img) return null;
    el('i', 'cn tr', shot).setAttribute('aria-hidden', 'true');
    el('i', 'cn bl', shot).setAttribute('aria-hidden', 'true');
    var rd = el('span', 'fx-rd', pic);
    el('i', '', rd, '●'); rd.appendChild(doc.createTextNode(T.focus + (num ? ' · ' + num : '')));
    var cross = el('span', 'fx-cross', pic), xy = el('span', 'fx-xy', pic);
    for (var i = 0; i < 4; i++) el('b', '', cross);
    el('span', 'fx-flash', pic);
    [rd, cross, xy].forEach(function (n) { n.setAttribute('aria-hidden', 'true'); });

    var cur = { x: .5, y: .5 }, tgt = { x: .5, y: .5 };
    function step() {
      cur.x += (tgt.x - cur.x) * .22; cur.y += (tgt.y - cur.y) * .22;
      cross.style.left = (cur.x * 100) + '%'; cross.style.top = (cur.y * 100) + '%';
      if (!reduce) img.style.transformOrigin = (cur.x * 100) + '% ' + (cur.y * 100) + '%';
      return Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > .002;
    }
    function set(on) {
      shot.classList.toggle('hot', on);
      if (owner !== shot) owner.classList.toggle('hot', on);
      if (!on) { cross.classList.remove('on'); xy.classList.remove('on'); }
    }
    function track(e, jump) {
      var r = pic.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      var inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      cross.classList.toggle('on', inside); xy.classList.toggle('on', inside);
      if (!inside) return;
      tgt.x = x; tgt.y = y;
      if (jump) { cur.x = x; cur.y = y; step(); } else kick(step);
      // 坐标按截图原图的像素报（图是按宽铺满、从顶上裁的）
      var k = (img.naturalWidth || 400) / r.width;
      xy.textContent = 'X ' + String(Math.round(x * r.width * k)).padStart(3, '0') + ' · Y ' + String(Math.round(y * r.height * k)).padStart(3, '0');
    }
    hover(owner, {
      enter: function (e) { set(true); track(e, true); },
      move: function (e) { track(e); },
      leave: function () { set(false); }
    });
    if (noHover) inBand(owner, set);
    var api = {
      set: set,
      shutter: function () { if (reduce) return; restart(shot, 'shut'); setTimeout(function () { shot.classList.remove('shut'); }, 340); }
    };
    shot.fx = api;
    return api;
  }
  function numOf(scope) {
    var idx = scope && scope.querySelector('.idx'), m = idx && idx.textContent.match(/\d+/);
    return m ? m[0] : '';
  }

  // 首页「这一版还改了这些」：整张卡是链接，点下去先闪一下快门再走
  doc.querySelectorAll('a.card').forEach(function (card) {
    var shot = card.querySelector('.shot'), api = shot && shotFx(shot, card, numOf(card));
    if (!api) return;
    card.addEventListener('click', function (e) {
      if (!plainClick(e) || reduce) return;
      e.preventDefault(); api.shutter();
      var href = card.href;
      setTimeout(function () { location.href = href; }, 150);
    });
  });

  // 玩法页的截图：对焦 + 点了放大
  doc.querySelectorAll('.game .shot, .comfort .shot').forEach(function (shot) {
    var game = shot.closest('.game'), fig = shot.closest('figure');
    // 标题里的「1.3.0 新增」角标不算进说明
    var h = game ? game.querySelector('h3') : fig && fig.querySelector('figcaption'), cap = '';
    if (h) { h = h.cloneNode(true); h.querySelectorAll('.new, .soon').forEach(function (n) { n.remove(); }); cap = h.textContent.replace(/\s+/g, ' ').trim(); }
    var api = shotFx(shot, shot, numOf(game));
    if (!api) return;
    shot.setAttribute('role', 'button'); shot.tabIndex = 0;
    shot.setAttribute('aria-label', T.zoom + cap);
    function open() { api.shutter(); setTimeout(function () { zoom(shot.querySelector('img'), cap, shot); }, reduce ? 0 : 120); }
    shot.addEventListener('click', open);
    shot.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  // ---------- 三条路的卡 ----------
  doc.querySelectorAll('.mode').forEach(function (mode) {
    ['tl', 'tr', 'bl', 'br'].forEach(function (c) { el('i', 'cn ' + c, mode).setAttribute('aria-hidden', 'true'); });
    var lis = mode.querySelectorAll('li');
    function under(e) {
      lis.forEach(function (li) {
        var r = li.getBoundingClientRect();
        li.classList.toggle('on', e.clientY >= r.top && e.clientY < r.bottom);
      });
    }
    function set(on) { mode.classList.toggle('hot', on); if (!on) lis.forEach(function (li) { li.classList.remove('on'); }); }
    hover(mode, { enter: function (e) { set(true); under(e); }, move: under, leave: function () { set(false); } });
    if (noHover) inBand(mode, set);
  });

  // ---------- 导航：底下那道线跟着滑 ----------
  doc.querySelectorAll('.nav-links').forEach(function (nav) {
    var ind = el('span', 'nav-ind', nav); ind.setAttribute('aria-hidden', 'true');
    var links = [].slice.call(nav.querySelectorAll('a')), cur = nav.querySelector('[aria-current="page"]');
    function put(a, instant) {
      if (!a) { ind.classList.remove('on'); return; }
      if (instant) ind.style.transition = 'none';
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = 'translate(' + a.offsetLeft + 'px,' + (a.offsetTop + a.offsetHeight - 2) + 'px)';
      ind.classList.add('on');
      if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
    }
    function back() { nav.classList.remove('hov'); put(cur); }
    links.forEach(function (a) {
      a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; nav.classList.add('hov'); if (!ind.classList.contains('on')) put(a, true); put(a); });
      a.addEventListener('focus', function () { nav.classList.add('hov'); put(a); });
      a.addEventListener('blur', back);
    });
    nav.addEventListener('pointerleave', back);
    put(cur, true);
    addEventListener('resize', function () { put(nav.classList.contains('hov') ? null : cur, true); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { put(cur, true); });
  });

  // ---------- 一组卡依次浮上来 ----------
  if (hasIO && !reduce) {
    var items = [].slice.call(doc.querySelectorAll('.cards > *, .modes > *, .games > *, .comfort > *, .duo > *, .extras > *, .rel'));
    var vh = innerHeight;
    items = items.filter(function (n) { return n.getBoundingClientRect().top > vh * .92; });
    items.forEach(function (n) { n.classList.add('rv'); });
    var rio = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target, d = Math.min(k++, 5) * 80;
        rio.unobserve(n);
        n.style.setProperty('--d', d + 'ms'); n.classList.add('in');
        setTimeout(function () { n.classList.remove('rv', 'in'); n.style.removeProperty('--d'); }, 900 + d);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (n) { rio.observe(n); });
  }

  // ---------- 放大看截图 ----------
  var box = null, back = null;
  function zoom(img, cap, from) {
    if (box || !img) return;
    back = from || doc.activeElement;
    box = el('div', 'lb', doc.body);
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', cap);
    var fig = el('figure', '', box), big = el('img', '', fig);
    big.src = img.currentSrc || img.src; big.alt = img.alt;
    big.width = img.naturalWidth || 400; big.height = img.naturalHeight || 870;
    if (cap) el('figcaption', '', fig, cap);
    var x = el('button', 'lb-x', box, T.close + ' ✕'); x.type = 'button';
    root.classList.add('lb-open');
    box.addEventListener('click', shut);
    doc.addEventListener('keydown', key);
    requestAnimationFrame(function () { box && box.classList.add('on'); });
    x.focus();
  }
  function key(e) {
    if (e.key === 'Escape') shut();
    else if (e.key === 'Tab') { e.preventDefault(); box.querySelector('.lb-x').focus(); }
  }
  function shut() {
    if (!box) return;
    var n = box; box = null;
    n.classList.remove('on'); root.classList.remove('lb-open');
    doc.removeEventListener('keydown', key);
    setTimeout(function () { n.remove(); }, reduce ? 0 : 260);
    if (back && back.focus) back.focus();
  }

  // ---------- 从首页点卡片跳过来：落地那张对焦一下 ----------
  function arrive() {
    var id = decodeURIComponent(location.hash.slice(1)), t = id && doc.getElementById(id);
    if (!t) return;
    if (t.matches('li')) { setTimeout(function () { restart(t, 'ping'); }, 300); return; }
    var shot = t.querySelector('.shot');
    if (!shot || !shot.fx) return;
    // 浏览器跳过来时卡顶贴着屏幕上沿，角和读数会被切掉：挪到屏幕中间再对焦
    t.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(function () { shot.fx.set(true); setTimeout(function () { if (!shot.matches(':hover')) shot.fx.set(false); }, 1600); }, 550);
  }
  // 要等浏览器自己按 # 跳完再挪
  if (doc.readyState === 'complete') arrive(); else addEventListener('load', arrive);
  addEventListener('hashchange', arrive);
})();
