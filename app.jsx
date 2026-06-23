/* Главный компонент витрины: роутинг, модалка заявки, tweaks. */
(function () {
  const React = window.React;
  const { useState, useEffect, useCallback } = React;
  const h = React.createElement;
  const { HomePage, CatalogPage, ProductPage, Header, Footer, LeadModal } = window;

  // ── Tweaks ──────────────────────────────────────────────────────
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    accent: ["#4A4950", "#25242A", "#1B1B1F", "#E6E6E8", "#F2F2F4", "#6E6E78"],
    corners: "regular",
    font: "Onest",
  }/*EDITMODE-END*/;

  const RADIUS = {
    sharp:   { xs: "4px", sm: "7px", r: "9px", lg: "12px", xl: "16px", r2: "22px" },
    regular: { xs: "8px", sm: "12px", r: "16px", lg: "22px", xl: "30px", r2: "40px" },
    round:   { xs: "12px", sm: "16px", r: "22px", lg: "30px", xl: "40px", r2: "52px" },
  };

  function applyTweaks(t) {
    const s = document.documentElement.style;
    const a = t.accent || TWEAK_DEFAULTS.accent;
    s.setProperty("--accent", a[0]);
    s.setProperty("--accent-deep", a[1]);
    s.setProperty("--accent-press", a[2]);
    s.setProperty("--accent-soft", a[3]);
    s.setProperty("--accent-pale", a[4]);
    s.setProperty("--accent-bright", a[5]);
    const r = RADIUS[t.corners] || RADIUS.regular;
    s.setProperty("--r-xs", r.xs);
    s.setProperty("--r-sm", r.sm);
    s.setProperty("--r", r.r);
    s.setProperty("--r-lg", r.lg);
    s.setProperty("--r-xl", r.xl);
    s.setProperty("--r-2xl", r.r2);
    s.setProperty("--font", `"${t.font}", system-ui, sans-serif`);
  }

  function Tweaks() {
    const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
    useEffect(() => { applyTweaks(t); }, [t]);
    const {
      TweaksPanel, TweakSection, TweakColor, TweakRadio,
    } = window;
    return h(
      TweaksPanel, null,
      h(TweakSection, { label: "Акцентный цвет" }),
      h(TweakColor, {
        label: "Акцент", value: t.accent,
        options: [
          ["#4A4950", "#25242A", "#1B1B1F", "#E6E6E8", "#F2F2F4", "#6E6E78"],
          ["#5F5D64", "#2A282C", "#1B1B1F", "#E8E8EA", "#F4F4F6", "#86848D"],
          ["#3A3A42", "#202026", "#141417", "#E4E4E7", "#F1F1F3", "#66666F"],
          ["#6b6f76", "#26292d", "#16181b", "#e3e5e7", "#f1f2f3", "#9aa0a6"],
        ],
        onChange: (v) => setTweak("accent", v),
      }),
      h(TweakSection, { label: "Форма и типографика" }),
      h(TweakRadio, {
        label: "Скругления", value: t.corners,
        options: ["sharp", "regular", "round"],
        onChange: (v) => setTweak("corners", v),
      }),
      h(TweakRadio, {
        label: "Шрифт", value: t.font,
        options: ["Onest", "Golos Text"],
        onChange: (v) => setTweak("font", v),
      })
    );
  }

  // ── Роутинг ─────────────────────────────────────────────────────
  function parseHash() {
    const hash = (location.hash || "").replace(/^#/, "");
    if (!hash) return { name: "home" };
    const [path, qs] = hash.split("?");
    const params = new URLSearchParams(qs || "");
    const seg = path.split("/").filter(Boolean);
    if (seg[0] === "catalog")
      return { name: "catalog", category: params.get("cat") || "", popular: params.get("popular") === "1", query: params.get("q") || "" };
    if (seg[0] === "product")
      return { name: "product", slug: seg[1] || "" };
    return { name: "home" };
  }

  function routeToHash(r) {
    if (r.name === "catalog") {
      const p = new URLSearchParams();
      if (r.category) p.set("cat", r.category);
      if (r.popular) p.set("popular", "1");
      if (r.query) p.set("q", r.query);
      const qs = p.toString();
      return "#catalog" + (qs ? "?" + qs : "");
    }
    if (r.name === "product") return "#product/" + r.slug;
    return "#home";
  }

  function App() {
    const [route, setRoute] = useState(parseHash());
    const [query, setQuery] = useState("");
    const [modal, setModal] = useState({ open: false, product: null });
    const brand = "Ugodent";

    const navigate = useCallback((r) => {
      const anchor = r.anchor;
      const clean = Object.assign({}, r);
      delete clean.anchor;
      location.hash = routeToHash(clean);
      setRoute(clean);
      // прокрутка
      requestAnimationFrame(() => {
        if (anchor) {
          const el = document.getElementById(anchor);
          if (el) { window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 150, behavior: "smooth" }); return; }
        }
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }, []);

    useEffect(() => {
      const onHash = () => setRoute(parseHash());
      window.addEventListener("hashchange", onHash);
      return () => window.removeEventListener("hashchange", onHash);
    }, []);

    const onOpen = useCallback((p) => navigate({ name: "product", slug: p.slug }), [navigate]);
    const onRequest = useCallback((p) => setModal({ open: true, product: p }), []);
    const closeModal = useCallback(() => setModal((m) => Object.assign({}, m, { open: false })), []);

    const pageProps = { route, navigate, onOpen, onRequest, query, setQuery };

    let page;
    if (route.name === "catalog") page = h(CatalogPage, pageProps);
    else if (route.name === "product") page = h(ProductPage, pageProps);
    else page = h(HomePage, pageProps);

    return h(
      React.Fragment,
      null,
      h(Header, { route, navigate, brand, onRequest, query, setQuery }),
      h("main", { className: "app-main" }, page),
      h(Footer, { brand, navigate, onRequest }),
      h(LeadModal, { open: modal.open, product: modal.product, onClose: closeModal }),
      h(Tweaks, null)
    );
  }

  window.App = App;
})();
