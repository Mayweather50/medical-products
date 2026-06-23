/* Общие UI-компоненты витрины: Button, Badge, ProductImage, ProductCard,
   Header, Footer. Экспорт в window. */
(function () {
  const React = window.React;
  const { useState } = React;
  const h = React.createElement;
  const Icon = window.Icon;
  const CatIcon = window.CatIcon;

  const fmtPrice = (n) =>
    n == null
      ? ""
      : new Intl.NumberFormat("ru-RU").format(n) + " ₽";

  // ── Button ────────────────────────────────────────────────────────
  function Button(props) {
    const { variant = "primary", size = "md", icon, iconRight, children, className = "", ...rest } = props;
    const cls = `btn btn--${variant} btn--${size} ${className}`.trim();
    return h(
      "button",
      Object.assign({ className: cls }, rest),
      icon ? h(Icon, { name: icon, size: size === "lg" ? 20 : 18 }) : null,
      children != null ? h("span", null, children) : null,
      iconRight ? h(Icon, { name: iconRight, size: size === "lg" ? 20 : 18 }) : null
    );
  }

  // ── Badge ─────────────────────────────────────────────────────────
  function Badge(props) {
    const { tone = "neutral", icon, children } = props;
    return h(
      "span",
      { className: `badge badge--${tone}` },
      icon ? h(Icon, { name: icon, size: 13 }) : null,
      children
    );
  }

  // ── Плейсхолдер изображения товара ────────────────────────────────
  function ProductImage(props) {
    const { product, ratio = "1 / 1", size = 64, className = "" } = props;
    const cat = product.category || {};
    return h(
      "div",
      {
        className: "prod-img " + className,
        style: { aspectRatio: ratio },
        "data-cat": cat.icon,
      },
      h("div", { className: "prod-img__grid" }),
      h(
        "div",
        { className: "prod-img__ic" },
        h(CatIcon, { name: cat.icon, size: size })
      ),
      h("span", { className: "prod-img__art" }, product.article)
    );
  }

  // ── Карточка товара ───────────────────────────────────────────────
  function ProductCard(props) {
    const { product, onOpen, onRequest } = props;
    const p = product;
    return h(
      "article",
      { className: "card", onClick: () => onOpen(p), tabIndex: 0,
        onKeyDown: (e) => { if (e.key === "Enter") onOpen(p); } },
      h(
        "div",
        { className: "card__media" },
        h(ProductImage, { product: p, size: 58 }),
        h(
          "div",
          { className: "card__tags" },
          p.popular ? h(Badge, { tone: "accent", icon: "star" }, "Хит") : null,
          p.available
            ? h(Badge, { tone: "ok", icon: "check" }, "В наличии")
            : h(Badge, { tone: "muted" }, "Под заказ")
        )
      ),
      h(
        "div",
        { className: "card__body" },
        h("div", { className: "card__cat" }, p.category.shortTitle),
        h("h3", { className: "card__title" }, p.title),
        h("p", { className: "card__desc" }, p.shortDescription)
      ),
      h(
        "div",
        { className: "card__foot" },
        h(
          "div",
          { className: "card__price" },
          p.priceOnRequest
            ? h("span", { className: "card__price-req" }, "Цена по запросу")
            : h(React.Fragment, null,
                h("span", { className: "card__price-val" }, fmtPrice(p.price)),
                h("span", { className: "card__price-unit" }, "/ шт.")
              )
        ),
        h(
          "button",
          {
            className: "card__cta",
            "aria-label": "Запросить",
            onClick: (e) => { e.stopPropagation(); onRequest(p); },
          },
          h(Icon, { name: p.priceOnRequest ? "headset" : "arrowSm", size: 19 })
        )
      )
    );
  }

  // ── Header ────────────────────────────────────────────────────────
  function Header(props) {
    const { route, navigate, brand, onRequest, query, setQuery } = props;
    const [local, setLocal] = useState(query || "");
    const cats = window.MOCK.CATEGORIES;
    const [catOpen, setCatOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [headReveal, setHeadReveal] = useState(0);
    const [headHidden, setHeadHidden] = useState(false);
    const searchInput = React.useRef(null);

    React.useEffect(() => {
      setLocal(query || "");
    }, [query]);

    React.useEffect(() => {
      if (searchOpen && searchInput.current) {
        searchInput.current.focus();
      }
    }, [searchOpen]);

    const submitSearch = (e) => {
      if (e) e.preventDefault();
      const q = local.trim();
      if (!q) {
        setSearchOpen(true);
        return;
      }
      setQuery(q);
      setSearchOpen(false);
      navigate({ name: "catalog", query: q });
    };

    React.useEffect(() => {
      let ticking = false;
      const clamp01 = (x) => Math.max(0, Math.min(1, x));
      const smoothstep = (from, to, x) => {
        const p = clamp01((x - from) / (to - from || 1));
        return p * p * (3 - 2 * p);
      };

      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.pageYOffset || document.documentElement.scrollTop || 0;
          const vh = window.innerHeight;
          const hero = document.querySelector(".hero");
          let heroProgress = 0;

          if (hero) {
            const top = hero.getBoundingClientRect().top + y;
            const max = Math.max(1, hero.offsetHeight - vh);
            heroProgress = Math.max(0, Math.min(1, (y - top) / max));
          }

          // Середина общей прокрутки страницы — после неё плашка возвращается.
          const docEl = document.documentElement;
          const maxScroll = Math.max(1, docEl.scrollHeight - vh);
          const mid = maxScroll * 0.5;

          let reveal;
          let hidden;
          if (catOpen) {
            reveal = 1;
            hidden = false;
          } else if (hero) {
            // Главная: шапка уезжает наверх синхронно с надписями баннера
            // (та же hero-прогрессия), возвращается с плашкой после середины.
            if (heroProgress < 0.04) {
              reveal = 0;
              hidden = false;
            } else if (y < mid) {
              reveal = 0;
              hidden = true;
            } else {
              reveal = 1;
              hidden = false;
            }
          } else {
            // Прочие страницы — прежнее поведение, шапка не прячется.
            reveal = smoothstep(vh * 0.45, vh * 0.75, y);
            hidden = false;
          }

          setHeadReveal((prev) => Math.abs(prev - reveal) < 0.01 ? prev : reveal);
          setHeadHidden((prev) => prev === hidden ? prev : hidden);

          ticking = false;
        });
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }, [catOpen]);

    const mix = (from, to, p) => from.map((v, i) => Math.round(v + (to[i] - v) * p));
    const fg = mix([248, 248, 250], [37, 36, 42], headReveal);
    const muted = mix([232, 232, 236], [102, 101, 110], headReveal);
    const headStyle = {
      "--head-bg-opacity": headReveal.toFixed(3),
      "--head-fg-rgb": fg.join(","),
      "--head-muted-rgb": muted.join(","),
    };

    return h(
      "header",
      { className: "site-head" + (headHidden ? " is-hidden" : ""), style: headStyle, "data-screen-label": "Шапка" },
      h(
        "div",
        { className: "head-main" },
        h(
          "div",
          { className: "wrap head-main__in" },
          // ── Левая колонка: навигация ──
          h(
            "div",
            { className: "head-main__left head-main__nav" },
            h(
              "div",
              { className: "head-nav__links" },
              h("a", { href: "#", onClick: (e) => { e.preventDefault(); navigate({ name: "home", anchor: "advantages" }); } }, "О компании")
            ),
            h(
              "div",
              { className: "head-nav__cats", onMouseEnter: () => setCatOpen(true), onMouseLeave: () => setCatOpen(false) },
              h("button", { className: "head-nav__catbtn" + (catOpen ? " is-open" : ""),
                onClick: () => { setCatOpen(false); navigate({ name: "catalog" }); } },
                "Каталог",
                h(Icon, { name: "plus", size: 12, className: "head-nav__plus" })
              ),
              catOpen
                ? h(
                    "div",
                    { className: "megamenu" },
                    cats.map((c) =>
                      h(
                        "a",
                        { key: c.id, className: "megamenu__item", href: "#",
                          onClick: (e) => { e.preventDefault(); setCatOpen(false); navigate({ name: "catalog", category: c.slug }); } },
                        h("span", { className: "megamenu__ic", "data-cat": c.icon }, h(CatIcon, { name: c.icon, size: 22 })),
                        h("span", { className: "megamenu__t" },
                          h("b", null, c.shortTitle),
                          h("small", null, c.count + " товаров")
                        )
                      )
                    )
                  )
                : null
            ),
            null
          ),
          // ── Центр: логотип + название ──
          h(
            "a",
            { className: "brand", onClick: (e) => { e.preventDefault(); navigate({ name: "home" }); }, href: "#" },
            h("span", { className: "brand__mark" },
              h("svg", { viewBox: "0 0 24 24", width: 22, height: 22, "aria-hidden": true },
                h("path", { d: "M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z", fill: "currentColor" })
              )
            ),
            h("span", { className: "brand__name" }, brand)
          ),
          // ── Правая колонка: поиск, связь и корзина ──
          h(
            "div",
            { className: "head-main__right" },
            h(
              "form",
              { className: "head-search" + (searchOpen ? " is-open" : ""), onSubmit: submitSearch },
              h(
                "button",
                {
                  type: "button",
                  className: "head-search__toggle",
                  "aria-label": searchOpen ? "Искать" : "Открыть поиск",
                  onClick: () => {
                    if (!searchOpen) {
                      setSearchOpen(true);
                      return;
                    }
                    submitSearch();
                  },
                },
                h(Icon, { name: "search", size: 18 })
              ),
              h("input", {
                ref: searchInput,
                type: "search",
                value: local,
                placeholder: "Поиск",
                onChange: (e) => setLocal(e.target.value),
                onBlur: () => { if (!local.trim()) setSearchOpen(false); },
              })
            ),
            h(
              "button",
              {
                type: "button",
                className: "head-connect",
                onClick: () => onRequest(null),
              },
              h("span", null, "Связаться"),
              h(Icon, { name: "arrowUpRight", size: 14 })
            ),
            h(
              "button",
              {
                type: "button",
                className: "head-cart",
                "aria-label": "Корзина",
                onClick: () => navigate({ name: "catalog" }),
              },
              h(Icon, { name: "cart", size: 20 }),
              h("span", { className: "head-cart__count" }, "0")
            )
          )
        )
      )
    );
  }

  // ── Footer ────────────────────────────────────────────────────────
  function Footer(props) {
    const { brand, navigate, onRequest } = props;
    const cats = window.MOCK.CATEGORIES;
    return h(
      "footer",
      { className: "site-foot", id: "contacts", "data-screen-label": "Подвал" },
      h(
        "div",
        { className: "wrap site-foot__cta" },
        h("div", null,
          h("h2", null, "Нужна консультация или оптовый прайс?"),
          h("p", null, "Оставьте заявку — менеджер свяжется с вами в течение рабочего дня и подберёт товары под вашу задачу.")
        ),
        h(Button, { variant: "light", size: "lg", icon: "headset", onClick: () => onRequest(null) }, "Связаться с нами")
      ),
      h(
        "div",
        { className: "wrap site-foot__grid" },
        h(
          "div",
          { className: "site-foot__brandcol" },
          h("div", { className: "brand brand--foot" },
            h("span", { className: "brand__mark" },
              h("svg", { viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": true },
                h("path", { d: "M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z", fill: "currentColor" }))
            ),
            h("span", { className: "brand__name" }, brand)
          ),
          h("p", null, "Поставка медицинских товаров, расходных материалов и оборудования для клиник, больниц и частных покупателей."),
          h("div", { className: "site-foot__contacts" },
            h("a", { href: "tel:+78001234567" }, h(Icon, { name: "phone", size: 16 }), " 8 800 123-45-67"),
            h("a", { href: "mailto:zakaz@medkor.ru" }, h(Icon, { name: "mail", size: 16 }), " zakaz@medkor.ru"),
            h("span", null, h(Icon, { name: "pin", size: 16 }), " Москва, ул. Медицинская, 12")
          )
        ),
        h(
          "div",
          { className: "site-foot__col" },
          h("h4", null, "Каталог"),
          cats.slice(0, 6).map((c) =>
            h("a", { key: c.id, href: "#", onClick: (e) => { e.preventDefault(); navigate({ name: "catalog", category: c.slug }); } }, c.shortTitle)
          )
        ),
        h(
          "div",
          { className: "site-foot__col" },
          h("h4", null, "Компания"),
          h("a", { href: "#", onClick: (e) => { e.preventDefault(); navigate({ name: "home", anchor: "advantages" }); } }, "О компании"),
          h("a", { href: "#", onClick: (e) => { e.preventDefault(); navigate({ name: "home", anchor: "certificates" }); } }, "Сертификаты"),
          h("a", { href: "#", onClick: (e) => { e.preventDefault(); onRequest(null); } }, "Оптовым клиентам"),
          h("a", { href: "#", onClick: (e) => { e.preventDefault(); onRequest(null); } }, "Доставка и оплата")
        )
      ),
      h(
        "div",
        { className: "site-foot__bottom" },
        h("div", { className: "wrap site-foot__bottom-in" },
          h("span", null, "© 2026 " + brand + ". Все права защищены."),
          h("span", { className: "site-foot__note" }, "Не является публичной офертой. Имеются противопоказания, необходима консультация специалиста.")
        )
      )
    );
  }

  Object.assign(window, { Button, Badge, ProductImage, ProductCard, Header, Footer, fmtPrice });
})();
