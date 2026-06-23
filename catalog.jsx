/* Каталог с фильтрами/поиском/сортировкой и страница карточки товара. */
(function () {
  const React = window.React;
  const { useState, useMemo } = React;
  const h = React.createElement;
  const Icon = window.Icon;
  const CatIcon = window.CatIcon;
  const Button = window.Button;
  const Badge = window.Badge;
  const ProductCard = window.ProductCard;
  const ProductImage = window.ProductImage;
  const fmtPrice = window.fmtPrice;
  const plural = window.plural;

  function Breadcrumbs(props) {
    const { items } = props;
    return h(
      "nav",
      { className: "crumbs" },
      items.map((it, i) =>
        h(React.Fragment, { key: i },
          i > 0 ? h("span", { className: "crumbs__sep" }, h(Icon, { name: "chevron", size: 14 })) : null,
          it.onClick
            ? h("a", { href: "#", onClick: (e) => { e.preventDefault(); it.onClick(); } }, it.label)
            : h("span", { className: "crumbs__cur" }, it.label)
        )
      )
    );
  }

  // ── Каталог ───────────────────────────────────────────────────────
  function CatalogPage(props) {
    const { route, navigate, onOpen, onRequest } = props;
    const all = window.MOCK.PRODUCTS;
    const cats = window.MOCK.CATEGORIES;

    const [cat, setCat] = useState(route.category || "");
    const [onlyAvail, setOnlyAvail] = useState(false);
    const [onlyPopular, setOnlyPopular] = useState(!!route.popular);
    const [query, setQuery] = useState(route.query || "");
    const [sort, setSort] = useState("default");
    const [view, setView] = useState("grid");

    React.useEffect(() => {
      setCat(route.category || "");
      setOnlyPopular(!!route.popular);
      setQuery(route.query || "");
    }, [route.category, route.popular, route.query]);

    const result = useMemo(() => {
      let r = all.slice();
      if (cat) r = r.filter((p) => p.categorySlug === cat);
      if (onlyAvail) r = r.filter((p) => p.available);
      if (onlyPopular) r = r.filter((p) => p.popular);
      if (query.trim()) {
        const q = query.toLowerCase();
        r = r.filter((p) =>
          p.title.toLowerCase().includes(q) ||
          (p.article || "").toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q));
      }
      if (sort === "price-asc") r.sort((a, b) => (a.price || 1e12) - (b.price || 1e12));
      if (sort === "price-desc") r.sort((a, b) => (b.price || -1) - (a.price || -1));
      if (sort === "name") r.sort((a, b) => a.title.localeCompare(b.title, "ru"));
      return r;
    }, [cat, onlyAvail, onlyPopular, query, sort, all]);

    const activeCat = cats.find((c) => c.slug === cat);
    const reset = () => { setCat(""); setOnlyAvail(false); setOnlyPopular(false); setQuery(""); };
    const hasFilters = cat || onlyAvail || onlyPopular || query;

    return h(
      "div",
      { className: "page-catalog", "data-screen-label": "Каталог" },
      h(
        "div",
        { className: "wrap catalog-top" },
        h(Breadcrumbs, { items: [
          { label: "Главная", onClick: () => navigate({ name: "home" }) },
          { label: activeCat ? activeCat.title : "Каталог товаров" },
        ] }),
        h("h1", { className: "catalog-title" }, activeCat ? activeCat.title : (onlyPopular ? "Популярные товары" : "Каталог товаров")),
        activeCat ? h("p", { className: "catalog-desc" }, activeCat.description) : null
      ),
      h(
        "div",
        { className: "wrap catalog-layout" },
        // ── Сайдбар фильтров ──
        h(
          "aside",
          { className: "filters" },
          h("div", { className: "filters__head" },
            h("span", null, h(Icon, { name: "filter", size: 18 }), " Фильтры"),
            hasFilters ? h("button", { className: "filters__reset", onClick: reset }, "Сбросить") : null
          ),
          h("div", { className: "filter-group" },
            h("h4", null, "Категория"),
            h("ul", { className: "filter-cats" },
              h("li", null,
                h("button", { className: !cat ? "is-active" : "", onClick: () => setCat("") },
                  "Все товары", h("span", { className: "filter-cats__n" }, all.length))
              ),
              cats.map((c) =>
                h("li", { key: c.id },
                  h("button", { className: cat === c.slug ? "is-active" : "", onClick: () => setCat(c.slug) },
                    h("span", { className: "filter-cats__ic", "data-cat": c.icon }, h(CatIcon, { name: c.icon, size: 17 })),
                    h("span", { className: "filter-cats__t" }, c.shortTitle),
                    h("span", { className: "filter-cats__n" }, c.count))
                )
              )
            )
          ),
          h("div", { className: "filter-group" },
            h("h4", null, "Наличие"),
            h("label", { className: "switch" },
              h("input", { type: "checkbox", checked: onlyAvail, onChange: (e) => setOnlyAvail(e.target.checked) }),
              h("span", { className: "switch__track" }, h("span", { className: "switch__knob" })),
              h("span", { className: "switch__lbl" }, "Только в наличии")
            ),
            h("label", { className: "switch" },
              h("input", { type: "checkbox", checked: onlyPopular, onChange: (e) => setOnlyPopular(e.target.checked) }),
              h("span", { className: "switch__track" }, h("span", { className: "switch__knob" })),
              h("span", { className: "switch__lbl" }, "Популярные")
            )
          ),
          h("div", { className: "filters__help" },
            h("span", { className: "filters__help-ic" }, h(Icon, { name: "headset", size: 20 })),
            h("b", null, "Не нашли нужное?"),
            h("p", null, "Подберём аналог или привезём под заказ."),
            h(Button, { variant: "outline", size: "sm", onClick: () => onRequest(null) }, "Оставить заявку")
          )
        ),
        // ── Контент ──
        h(
          "div",
          { className: "catalog-main" },
          h(
            "div",
            { className: "catalog-bar" },
            h("div", { className: "catalog-search" },
              h(Icon, { name: "search", size: 18, className: "catalog-search__ic" }),
              h("input", { type: "text", value: query, placeholder: "Поиск по названию или артикулу",
                onChange: (e) => setQuery(e.target.value) }),
              query ? h("button", { className: "catalog-search__clr", onClick: () => setQuery(""), "aria-label": "Очистить" }, h(Icon, { name: "close", size: 16 })) : null
            ),
            h("div", { className: "catalog-bar__right" },
              h("div", { className: "select" },
                h("select", { value: sort, onChange: (e) => setSort(e.target.value), "aria-label": "Сортировка" },
                  h("option", { value: "default" }, "По умолчанию"),
                  h("option", { value: "price-asc" }, "Сначала дешевле"),
                  h("option", { value: "price-desc" }, "Сначала дороже"),
                  h("option", { value: "name" }, "По названию")
                ),
                h(Icon, { name: "chevronDown", size: 16, className: "select__chev" })
              ),
              h("div", { className: "viewtoggle" },
                h("button", { className: view === "grid" ? "is-active" : "", onClick: () => setView("grid"), "aria-label": "Сетка" }, h(Icon, { name: "grid", size: 18 })),
                h("button", { className: view === "list" ? "is-active" : "", onClick: () => setView("list"), "aria-label": "Список" }, h(Icon, { name: "list", size: 18 }))
              )
            )
          ),
          h("div", { className: "catalog-count" },
            h("b", null, result.length), " ", plural(result.length, ["товар", "товара", "товаров"]),
            // активные чипы
            hasFilters ? h("div", { className: "active-chips" },
              activeCat ? chip(activeCat.shortTitle, () => setCat("")) : null,
              onlyAvail ? chip("В наличии", () => setOnlyAvail(false)) : null,
              onlyPopular ? chip("Популярные", () => setOnlyPopular(false)) : null,
              query ? chip('«' + query + '»', () => setQuery("")) : null
            ) : null
          ),
          result.length === 0
            ? h("div", { className: "empty" },
                h("span", { className: "empty__ic" }, h(Icon, { name: "search", size: 30 })),
                h("h3", null, "Ничего не найдено"),
                h("p", null, "Попробуйте изменить запрос или сбросить фильтры."),
                h(Button, { variant: "outline", size: "md", onClick: reset }, "Сбросить фильтры"))
            : h("div", { className: view === "grid" ? "prod-grid prod-grid--cat" : "prod-list" },
                result.map((p) => view === "grid"
                  ? h(ProductCard, { key: p.id, product: p, onOpen: onOpen, onRequest: onRequest })
                  : h(ProductRow, { key: p.id, product: p, onOpen: onOpen, onRequest: onRequest }))
              )
        )
      )
    );

    function chip(label, onX) {
      return h("button", { className: "active-chip", onClick: onX },
        label, h(Icon, { name: "close", size: 13 }));
    }
  }

  function ProductRow(props) {
    const { product: p, onOpen, onRequest } = props;
    return h(
      "article",
      { className: "prow", onClick: () => onOpen(p) },
      h(ProductImage, { product: p, size: 40, className: "prow__img" }),
      h("div", { className: "prow__main" },
        h("div", { className: "prow__cat" }, p.category.shortTitle, " · ", p.article),
        h("h3", { className: "prow__title" }, p.title),
        h("p", { className: "prow__desc" }, p.shortDescription),
        h("div", { className: "prow__tags" },
          p.popular ? h(Badge, { tone: "accent", icon: "star" }, "Хит") : null,
          p.available ? h(Badge, { tone: "ok", icon: "check" }, "В наличии") : h(Badge, { tone: "muted" }, "Под заказ"))
      ),
      h("div", { className: "prow__side" },
        p.priceOnRequest
          ? h("span", { className: "prow__price-req" }, "Цена по запросу")
          : h("span", { className: "prow__price" }, fmtPrice(p.price)),
        h(Button, { variant: "primary", size: "sm", icon: p.priceOnRequest ? "headset" : "doc",
          onClick: (e) => { e.stopPropagation(); onRequest(p); } }, p.priceOnRequest ? "Запросить" : "Заявка")
      )
    );
  }

  // ── Карточка товара (стиль CliniQ) ─────────────────────────────
  function ProductPage(props) {
    const { route, navigate, onOpen, onRequest } = props;
    const product = window.MOCK.PRODUCTS.find((p) => p.slug === route.slug);
    if (!product) {
      return h("div", { className: "wrap section" },
        h("p", null, "Товар не найден."),
        h(Button, { variant: "primary", onClick: () => navigate({ name: "catalog" }) }, "В каталог"));
    }
    const p = product;
    const related = window.MOCK.PRODUCTS.filter((x) => x.categorySlug === p.categorySlug && x.id !== p.id).slice(0, 4);
    const chars = Object.entries(p.characteristics || {});

    return h(
      "div",
      { className: "page-product cliniq", "data-screen-label": "Карточка товара" },
      // Верхняя навигация
      h("div", { className: "wrap cliniq-nav" },
        h("button", { className: "cliniq-back", onClick: () => navigate({ name: "catalog", category: p.categorySlug }) },
          h(Icon, { name: "chevron", size: 18, style: { transform: "rotate(180deg)" } })
        ),
        h(Breadcrumbs, { items: [
          { label: "Главная", onClick: () => navigate({ name: "home" }) },
          { label: p.category.shortTitle, onClick: () => navigate({ name: "catalog", category: p.categorySlug }) },
          { label: p.title },
        ] })
      ),
      // Hero-зона товара (мягкий градиент)
      h("div", { className: "wrap" },
        h("div", { className: "cliniq-hero" },
          h("div", { className: "cliniq-hero__img" },
            h(ProductImage, { product: p, size: 130, className: "cliniq-hero__pic" })
          ),
          h("div", { className: "cliniq-hero__info" },
            h("div", { className: "cliniq-hero__tags" },
              p.popular ? h(Badge, { tone: "accent", icon: "star" }, "Хит продаж") : null,
              p.available ? h(Badge, { tone: "ok", icon: "check" }, "В наличии") : h(Badge, { tone: "muted" }, "Под заказ")
            ),
            h("h1", { className: "cliniq-hero__title" }, p.title),
            h("div", { className: "cliniq-hero__meta" },
              h("span", null, p.category.title),
              h("code", null, p.article)
            ),
            h("p", { className: "cliniq-hero__desc" }, p.shortDescription),
            // Круглые действия
            h("div", { className: "cliniq-actions" },
              h("button", { className: "cliniq-action", onClick: () => onRequest(p) },
                h(Icon, { name: "doc", size: 18 }), h("span", null, "Оставить заявку"))
            ),
            // Чипы характеристик (как stat-бейджи CliniQ)
            chars.length ? h("div", { className: "cliniq-chips" },
              chars.slice(0, 4).map(([k, v], i) =>
                h("div", { key: i, className: "cliniq-chip" },
                  h("b", null, v),
                  h("span", null, k)
                )
              )
            ) : null
          )
        )
      ),
      // Buybox — белая карточка
      h("div", { className: "wrap" },
        h("div", { className: "cliniq-buy" },
          h("div", { className: "cliniq-buy__left" },
            h("div", { className: "cliniq-buy__price" },
              p.priceOnRequest
                ? h(React.Fragment, null,
                    h("span", { className: "cliniq-buy__req" }, "Цена по запросу"),
                    h("small", null, "Зависит от комплектации"))
                : h(React.Fragment, null,
                    h("b", null, fmtPrice(p.price)),
                    h("span", null, " / шт."),
                    h("small", null, "Опт — по запросу"))
            ),
            h("ul", { className: "cliniq-buy__perks" },
              h("li", null, h("span", { className: "cliniq-perk-ic" }, h(Icon, { name: "truck", size: 16 })), "Доставка от 1 дня"),
              h("li", null, h("span", { className: "cliniq-perk-ic" }, h(Icon, { name: "shield", size: 16 })), "Сертификаты в комплекте"),
              h("li", null, h("span", { className: "cliniq-perk-ic" }, h(Icon, { name: "box", size: 16 })), "Спеццены для клиник")
            )
          ),
          h("div", { className: "cliniq-buy__right" },
            h(Button, { variant: "primary", size: "lg", icon: p.priceOnRequest ? "headset" : "doc",
              className: "cliniq-buy__cta", onClick: () => onRequest(p) },
              p.priceOnRequest ? "Запросить цену" : "Оставить заявку"),
            h(Button, { variant: "outline", size: "md", icon: "phone",
              className: "cliniq-buy__cta2", onClick: () => onRequest(p) },
              "Заказать звонок")
          )
        )
      ),
      // Описание и характеристики
      h("div", { className: "wrap cliniq-details" },
        h("section", { className: "cliniq-panel" },
          h("h2", null, "Описание"),
          h("p", null, p.description)
        ),
        chars.length > 4
          ? h("section", { className: "cliniq-panel" },
              h("h2", null, "Все характеристики"),
              h("table", { className: "spec" },
                h("tbody", null,
                  chars.map(([k, v], i) =>
                    h("tr", { key: i }, h("th", null, k), h("td", null, v))
                  )
                )
              ))
          : null,
        chars.length && chars.length <= 4
          ? h("section", { className: "cliniq-panel" },
              h("h2", null, "Характеристики"),
              h("table", { className: "spec" },
                h("tbody", null,
                  chars.map(([k, v], i) =>
                    h("tr", { key: i }, h("th", null, k), h("td", null, v))
                  )
                )
              ))
          : null
      ),
      // Похожие товары (карточки-сервисы CliniQ)
      related.length
        ? h("section", { className: "section" },
            h("div", { className: "wrap" },
              h("div", { className: "section__head" },
                h("h2", { className: "section__title" }, "Похожие товары")),
              h("div", { className: "cliniq-related" },
                related.map((r) =>
                  h("button", { key: r.id, className: "cliniq-rcard", onClick: () => onOpen(r) },
                    h("div", { className: "cliniq-rcard__top" },
                      h("span", { className: "cliniq-rcard__cat" }, r.category.shortTitle),
                      h("h3", null, r.title)
                    ),
                    h("div", { className: "cliniq-rcard__bot" },
                      r.priceOnRequest
                        ? h("span", { className: "cliniq-rcard__price" }, "По запросу")
                        : h(React.Fragment, null,
                            h("b", null, fmtPrice(r.price)),
                            h("span", null, " / шт.")),
                      h("span", { className: "cliniq-rcard__arr" }, h(Icon, { name: "arrowSm", size: 18 }))
                    )
                  )
                )
              )
            ))
        : null
    );
  }

  Object.assign(window, { CatalogPage, ProductPage });
})();
