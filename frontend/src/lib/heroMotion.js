/* Motion-слой витрины (портирован из прототипа ui-prototype/motion.js).
   Intro-баннер и непрерывное движение рисуются покадрово через rAF —
   JS пишет inline-стили. Hero-сцена на 360vh: при скролле текст и пункты
   уплывают вверх, импланты парят/вращаются, выезжают scroll-фразы, а блок
   с контентом (.home-reveal) поднимается снизу. Экспортирует initHeroMotion(),
   которая возвращает функцию очистки (для useEffect в React). */

export function initHeroMotion() {
  const mq = window.matchMedia ? window.matchMedia.bind(window) : null;
  const reduce = mq ? mq("(prefers-reduced-motion: reduce)").matches : false;
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const small = mq ? mq("(max-width: 860px)").matches : window.innerWidth < 861;
  const animate = !reduce && !small;
  const parallaxOn = animate && !touch;

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function prog(el, delay, dur) { return clamp01((el - delay) / dur); }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function lerp(a, b, p) { return a + (b - a) * p; }
  function smoothstep(from, to, x) {
    const p = clamp01((x - from) / (to - from || 1));
    return p * p * (3 - 2 * p);
  }

  const REVEAL_SEL = [
    ".cat-card", ".card", ".prow", ".cert-card", ".adv-card",
    ".filter-group", ".section__head", ".empty",
  ].join(",");

  const io = !reduce && "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 })
    : null;

  function tagReveal() {
    const els = document.querySelectorAll(REVEAL_SEL);
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (el.dataset.reveal) continue;
      el.dataset.reveal = "1";
      const sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--rd", Math.min(sib, 8) * 70 + "ms");
      if (reduce) { el.classList.add("in"); continue; }
      if (io) io.observe(el); else el.classList.add("in");
    }
  }

  function injectMarkers(panel) {
    if (panel.querySelector(".hero__markers")) return;
    const m = document.createElement("div");
    m.className = "hero__markers"; m.setAttribute("aria-hidden", "true");
    m.innerHTML =
      '<span class="tm tm--tl"></span><span class="tm tm--tr"></span>' +
      '<span class="tm tm--bl"></span><span class="tm tm--br"></span>' +
      '<span class="hl hl--1"></span><span class="hl hl--2"></span>' +
      '<span class="md md--1"></span><span class="md md--2"></span>' +
      '<span class="md md--3"></span><span class="md md--4"></span><span class="md md--5"></span>';
    panel.insertBefore(m, panel.firstChild);
  }

  function injectScrollCopy(panel) {
    if (panel.querySelector(".hero__scroll-copy")) return;
    const box = document.createElement("div");
    box.className = "hero__scroll-copy";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML =
      '<div class="hero__scroll-phrase hero__scroll-phrase--1">' +
        "<span>[ 04 ]</span><b>Поставка без пауз</b><small>Склад, документы и сроки видны до заявки</small>" +
      "</div>" +
      '<div class="hero__scroll-phrase hero__scroll-phrase--2">' +
        "<span>[ 05 ]</span><b>Подбор под задачу</b><small>Расходники и оборудование собираются в один комплект</small>" +
      "</div>" +
      '<div class="hero__scroll-phrase hero__scroll-phrase--3">' +
        "<span>[ 06 ]</span><b>Каталог готов к выбору</b><small>Ниже открываются категории и популярные позиции</small>" +
      "</div>";
    panel.appendChild(box);
  }

  function wrapImplants(stage) {
    const imps = stage.querySelectorAll(".implant");
    for (let i = 0; i < imps.length; i++) {
      const el = imps[i];
      if (el.parentNode && el.parentNode.classList && el.parentNode.classList.contains("implant-in")) continue;
      const w = document.createElement("div");
      w.className = "implant-in implant-in--" + (i + 1);
      el.parentNode.insertBefore(w, el);
      w.appendChild(el);
    }
  }

  let P = null;
  let t0 = null, raf = 0;
  let rx = 0, ry = 0, tx = 0, ty = 0;
  const IMP_BASE = [-22, 26, -12];

  function setHeadH() {
    const head = document.querySelector(".site-head");
    const hh = head ? head.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty("--head-h", hh + "px");
  }

  function collect(panel) {
    const stage = panel.querySelector(".hero__stage");
    const qs = (s, r) => (r || panel).querySelector(s);
    const implants = stage ? Array.prototype.slice.call(stage.querySelectorAll(".implant")) : [];
    const wraps = Array.prototype.slice.call(panel.querySelectorAll(".implant-in"));
    const pts = [".hero__point--1", ".hero__point--2", ".hero__point--3"].map((s) => qs(s));

    P = {
      panel, hero: panel.closest ? panel.closest(".hero") : null, stage,
      bg: qs(".hero__bg"), veil: qs(".hero__veil"), markers: qs(".hero__markers"),
      copy: qs(".hero__copy"), eyebrow: qs(".hero__eyebrow"), title: qs(".hero__title"), cta: qs(".hero__cta"),
      scrollPhrases: Array.prototype.slice.call(panel.querySelectorAll(".hero__scroll-phrase")),
      reveal: document.querySelector(".home-reveal"),
      points: [
        { el: pts[0], d: 920 }, { el: pts[1], d: 1120 }, { el: pts[2], d: 1320 },
      ].filter((o) => o.el),
      corners: ["tm--tl", "tm--tr", "tm--bl", "tm--br"].map((c, i) => ({ el: qs(".hero__markers ." + c), d: 850 + i * 100 })).filter((o) => o.el),
      hairs: [
        { el: qs(".hero__markers .hl--1"), d: 1000, rot: -18 },
        { el: qs(".hero__markers .hl--2"), d: 1120, rot: 14 },
      ].filter((o) => o.el),
      dots: ["md--1", "md--2", "md--3", "md--4", "md--5"].map((c, i) => ({ el: qs(".hero__markers ." + c), d: 1250 + i * 120, ph: i * 1.3 })).filter((o) => o.el),
      wraps: [
        { el: wraps[0], d: 500, tx: 58, ty: 30, sc: 0.9 },
        { el: wraps[1], d: 660, tx: -42, ty: 34, sc: 0.92 },
        { el: wraps[2], d: 820, tx: 46, ty: 40, sc: 0.92 },
      ].filter((o) => o.el),
      implants: implants.map((el, i) => ({
        el, base: IMP_BASE[i] != null ? IMP_BASE[i] : 0,
        da: 2.8, amp: 8 - i * 1.2, wa: 0.34 + i * 0.04, wb: 0.42 + i * 0.05, ph: i * 2.1,
      })),
    };
  }

  function showFinal() {
    if (!P) return;
    if (P.veil && P.veil.parentNode) P.veil.parentNode.removeChild(P.veil);
    if (P.hero) P.hero.style.setProperty("--hero-scroll-progress", 0);
    if (P.bg) P.bg.style.opacity = 1;
    if (P.copy) { P.copy.style.opacity = 1; P.copy.style.transform = "none"; }
    [P.eyebrow, P.title].forEach((el) => { if (el) { el.style.opacity = 1; el.style.transform = "none"; } });
    if (P.cta) { P.cta.style.opacity = 1; P.cta.style.transform = "none"; }
    P.points.forEach((o) => { o.el.style.opacity = 1; o.el.style.transform = "none"; o.el.style.setProperty("--ln", 1); o.el.style.setProperty("--dot", 1); });
    P.corners.forEach((o) => { o.el.style.opacity = 0.5; });
    P.hairs.forEach((o) => { o.el.style.opacity = 1; o.el.style.transform = "rotate(" + o.rot + "deg) scaleX(1)"; });
    P.dots.forEach((o) => { o.el.style.opacity = 1; o.el.style.transform = "none"; });
    P.scrollPhrases.forEach((el) => { el.style.opacity = 0; el.style.transform = "translate3d(-50%, 80px, 0)"; });
    P.wraps.forEach((o) => { o.el.style.opacity = 1; o.el.style.transform = "none"; });
    P.implants.forEach((o) => { o.el.style.transform = "rotate(" + o.base + "deg)"; });
    if (P.reveal) {
      P.reveal.style.setProperty("--home-reveal-y", "0px");
      P.reveal.style.setProperty("--home-reveal-opacity", "1");
    }
  }

  function initHidden() {
    if (P.copy) { P.copy.style.opacity = 1; P.copy.style.transform = "none"; }
    if (P.bg) P.bg.style.opacity = 0;
    if (P.veil) P.veil.style.opacity = 1;
    if (P.eyebrow) { P.eyebrow.style.opacity = 0; P.eyebrow.style.transform = "translateY(20px)"; }
    if (P.title) { P.title.style.opacity = 0; P.title.style.transform = "translateY(28px)"; }
    if (P.cta) { P.cta.style.opacity = 0; P.cta.style.transform = "translateY(12px) scale(0.95)"; }
    P.points.forEach((o) => { o.el.style.opacity = 0; o.el.style.transform = "translateY(14px)"; o.el.style.setProperty("--ln", 0); o.el.style.setProperty("--dot", 0); });
    P.corners.forEach((o) => { o.el.style.opacity = 0; });
    P.hairs.forEach((o) => { o.el.style.opacity = 0; o.el.style.transform = "rotate(" + o.rot + "deg) scaleX(0)"; });
    P.dots.forEach((o) => { o.el.style.opacity = 0; o.el.style.transform = "scale(0.4)"; });
    P.scrollPhrases.forEach((el) => { el.style.opacity = 0; el.style.transform = "translate3d(-50%, 120px, 0)"; });
    P.wraps.forEach((o) => { o.el.style.opacity = 0; o.el.style.transform = "translate(" + o.tx + "px," + o.ty + "px) scale(" + o.sc + ")"; });
    if (P.reveal) {
      P.reveal.style.setProperty("--home-reveal-y", "72px");
      P.reveal.style.setProperty("--home-reveal-opacity", "0");
    }
  }

  function scrollProgress() {
    if (!P || !P.hero) return 0;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const top = P.hero.getBoundingClientRect().top + scrollY;
    const max = Math.max(1, P.hero.offsetHeight - window.innerHeight);
    return clamp01((scrollY - top) / max);
  }

  function syncReveal(sp) {
    if (!P || !P.reveal) return;
    const r = smoothstep(0.56, 0.88, sp);
    P.reveal.style.setProperty("--home-reveal-y", lerp(340, 0, r).toFixed(2) + "px");
    P.reveal.style.setProperty("--home-reveal-opacity", lerp(0, 1, r).toFixed(3));
    P.reveal.style.pointerEvents = r < 0.08 ? "none" : "";
  }

  function syncScrollPhrases(sp) {
    if (!P || !P.scrollPhrases) return;
    const windows = [[0.02, 0.62], [0.2, 0.82], [0.38, 1.0]];
    const panelH = P.panel ? P.panel.getBoundingClientRect().height : window.innerHeight || 800;
    P.scrollPhrases.forEach((el, i) => {
      const w = windows[i] || windows[0];
      const travel = smoothstep(w[0], w[1], sp);
      const fadeIn = smoothstep(w[0], w[0] + 0.12, sp);
      const fadeOut = 1 - smoothstep(w[1] - 0.14, w[1], sp);
      const opacity = fadeIn * fadeOut;
      const y = lerp(panelH * 0.62, -panelH * 0.72, travel);
      const x = i === 1 ? -42 : i === 2 ? -56 : -50;
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = "translate3d(" + x + "%," + y.toFixed(2) + "px,0)";
    });
  }

  function frame(now) {
    if (t0 == null) t0 = now;
    const el = now - t0;
    const ts = now * 0.001;
    const sp = scrollProgress();
    const scrollEase = easeOut(clamp01(sp * 1.04));
    const textLift = -360 * easeOut(clamp01(sp / 0.52));
    const ctaLift = -260 * easeOut(clamp01(sp / 0.58));
    const textFade = 1 - smoothstep(0.26, 0.62, sp);

    if (P.hero) P.hero.style.setProperty("--hero-scroll-progress", sp.toFixed(4));
    if (P.copy) P.copy.style.transform = "translate3d(0," + textLift.toFixed(2) + "px,0)";
    syncScrollPhrases(sp);
    syncReveal(sp);

    if (P.bg) P.bg.style.opacity = easeOut(prog(el, 150, 1500));
    if (P.veil) {
      const vo = 1 - easeOut(prog(el, 0, 1050));
      P.veil.style.opacity = vo;
      if (vo <= 0.001 && P.veil.parentNode) { P.veil.parentNode.removeChild(P.veil); P.veil = null; }
    }
    if (P.eyebrow) { const pe = easeOut(prog(el, 420, 900)); P.eyebrow.style.opacity = (pe * textFade).toFixed(3); P.eyebrow.style.transform = "translateY(" + 20 * (1 - pe) + "px)"; }
    if (P.title) { const pt = easeOut(prog(el, 540, 1050)); P.title.style.opacity = (pt * textFade).toFixed(3); P.title.style.transform = "translateY(" + 28 * (1 - pt) + "px)"; }
    if (P.cta) { const pc = easeOut(prog(el, 1000, 850)); P.cta.style.opacity = (pc * textFade).toFixed(3); P.cta.style.transform = "translateY(" + (12 * (1 - pc) + ctaLift).toFixed(2) + "px) scale(" + lerp(0.95, 1, pc) + ")"; }

    P.points.forEach((o, i) => {
      const p = easeOut(prog(el, o.d, 800));
      const start = 0.04 + i * 0.06;
      const pointLift = -240 * easeOut(clamp01((sp - start) / 0.42));
      const pointFade = 1 - smoothstep(start + 0.48, start + 0.78, sp);
      o.el.style.opacity = (p * pointFade).toFixed(3);
      o.el.style.transform = "translateY(" + (14 * (1 - p) + pointLift).toFixed(2) + "px)";
      o.el.style.setProperty("--ln", easeOut(prog(el, o.d + 160, 850)));
      o.el.style.setProperty("--dot", prog(el, o.d + 630, 400));
    });
    P.corners.forEach((o) => { o.el.style.opacity = 0.5 * easeOut(prog(el, o.d, 600)); });
    P.hairs.forEach((o) => {
      const p = easeOut(prog(el, o.d, 750));
      o.el.style.opacity = p;
      o.el.style.transform = "rotate(" + o.rot + "deg) scaleX(" + p + ")";
    });
    P.dots.forEach((o) => {
      const rev = easeOut(prog(el, o.d, 600));
      const pulse = 0.5 + 0.5 * Math.sin(ts * 1.7 + o.ph);
      o.el.style.opacity = rev * (0.35 + 0.65 * pulse);
      const sc = lerp(0.4, 1, rev) * (0.85 + 0.4 * pulse * rev);
      o.el.style.transform = "scale(" + sc + ")";
    });
    P.wraps.forEach((o) => {
      const p = easeOut(prog(el, o.d, 1250));
      o.el.style.opacity = p;
      o.el.style.transform = "translate(" + lerp(o.tx, 0, p) + "px," + lerp(o.ty, 0, p) + "px) scale(" + lerp(o.sc, 1, p) + ")";
    });
    P.implants.forEach((o, i) => {
      const scrollRot = (i === 0 ? -3.8 : i === 1 ? 2.8 : -2.4) * scrollEase;
      const scrollY = (i === 1 ? 12 : -10) * scrollEase;
      const rot = o.base + scrollRot + o.da * Math.sin(ts * o.wa + o.ph);
      const yy = scrollY + o.amp * Math.sin(ts * o.wb + o.ph * 0.7);
      o.el.style.transform = "rotate(" + rot.toFixed(2) + "deg) translateY(" + yy.toFixed(2) + "px)";
    });

    tx += (rx - tx) * 0.06; ty += (ry - ty) * 0.06;
    const dx = Math.sin(now * 0.00007) * 16, dy = Math.cos(now * 0.00009) * 11;
    if (P.bg) P.bg.style.transform = "translate3d(" + (dx - tx * 0.22 - 14 * scrollEase).toFixed(2) + "px," + (dy - ty * 0.22 - 22 * scrollEase).toFixed(2) + "px,0) scale(" + (1.045 + 0.018 * scrollEase).toFixed(3) + ")";
    if (P.stage) P.stage.style.transform = "translate3d(" + (tx + 8 * scrollEase).toFixed(2) + "px," + (ty - 30 * scrollEase).toFixed(2) + "px,0)";
    if (P.markers) P.markers.style.transform = "translate3d(" + (-tx * 0.45 - 7 * scrollEase).toFixed(2) + "px," + (-ty * 0.45 - 16 * scrollEase).toFixed(2) + "px,0)";

    raf = requestAnimationFrame(frame);
  }

  function onMove(e) {
    const w = window.innerWidth || 1, h = window.innerHeight || 1;
    rx = (e.clientX / w - 0.5) * 42;
    ry = (e.clientY / h - 0.5) * 30;
  }

  function setupHero() {
    const panel = document.querySelector(".hero__panel");
    if (!panel) return false;
    // data-hero-fx помечает уже инициализированную панель (для MutationObserver),
    // но саму инициализацию повторяем — иначе после cleanup (StrictMode/возврат
    // на страницу) rAF-цикл не перезапустится. Инъекции узлов идемпотентны.
    panel.dataset.heroFx = "1";

    if (!panel.querySelector(".hero__bg")) {
      const bg = document.createElement("div");
      bg.className = "hero__bg"; bg.setAttribute("aria-hidden", "true");
      panel.insertBefore(bg, panel.firstChild);
    }
    injectMarkers(panel);
    injectScrollCopy(panel);
    const stage = panel.querySelector(".hero__stage");
    if (stage) wrapImplants(stage);

    if (animate) {
      if (!panel.querySelector(".hero__veil")) {
        const veil = document.createElement("div");
        veil.className = "hero__veil"; veil.setAttribute("aria-hidden", "true");
        panel.appendChild(veil);
      }
      collect(panel);
      initHidden();
      t0 = null;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
      if (parallaxOn) window.addEventListener("mousemove", onMove, { passive: true });
    } else {
      collect(panel);
      showFinal();
    }
    return true;
  }

  // ── boot ──
  let mo = null;
  setHeadH();
  window.addEventListener("resize", setHeadH);
  tagReveal();
  setupHero();

  const app = document.getElementById("app");
  if (app && "MutationObserver" in window) {
    mo = new MutationObserver((muts) => {
      let need = false;
      for (let i = 0; i < muts.length; i++) { if (muts[i].addedNodes.length) { need = true; break; } }
      if (need) {
        tagReveal();
        if (!document.querySelector(".hero__panel[data-hero-fx]")) setupHero();
      }
    });
    mo.observe(app, { childList: true, subtree: true });
  }

  // ── cleanup для useEffect ──
  return function cleanup() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener("resize", setHeadH);
    window.removeEventListener("mousemove", onMove);
    if (mo) mo.disconnect();
    if (io) io.disconnect();
    document.documentElement.style.removeProperty("--head-h");
  };
}
