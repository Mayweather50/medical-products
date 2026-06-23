/* Главная страница: hero, категории, популярное, преимущества, сертификаты. */
(function () {
  const React = window.React;
  const h = React.createElement;
  const Icon = window.Icon;
  const CatIcon = window.CatIcon;
  const Button = window.Button;
  const ProductCard = window.ProductCard;

  function Hero(props) {
    const { navigate, onRequest } = props;
    const stageRef = React.useRef(null);
    const points = [
      ["01", "Сертификация", "Регистрационные документы и декларации соответствия на продукцию"],
      ["02", "Поставка", "Расходники, СИЗ и оборудование со склада с доставкой по России"],
      ["03", "Подбор", "Помогаем собрать заказ под профиль клиники, бюджет и нормативы"],
    ];

    React.useEffect(() => {
      const head = document.querySelector(".site-head");
      const setHeadH = () => {
        const hh = head ? head.getBoundingClientRect().height : 0;
        document.documentElement.style.setProperty("--head-h", hh + "px");
      };
      setHeadH();
      window.addEventListener("resize", setHeadH);
      return () => window.removeEventListener("resize", setHeadH);
    }, []);

    return h(
      "section",
      { className: "hero", "data-screen-label": "Главная — Hero" },
      h(
        "div",
        { className: "hero__panel" },
        // парящие импланты (декоративный слой)
        h("div", { className: "hero__stage", ref: stageRef, "aria-hidden": true },
          h("div", { className: "implant implant--1" }, h("div", { className: "implant__body" })),
          h("div", { className: "implant implant--2" }, h("div", { className: "implant__body" })),
          h("div", { className: "implant implant--3" }, h("div", { className: "implant__body" }))
        ),
        // заголовок
        h("div", { className: "hero__copy" },
          h("span", { className: "hero__eyebrow" }, h("span", { className: "dot" }), "Ugodent · медтовары · оборудование"),
          h("h1", { className: "hero__title" },
            "Медтовары, ",
            h("span", { className: "hero__title-em" }, "которые закрывают задачу")
          )
        ),
        // выноски с коннекторами
        points.map((p, i) =>
          h("div", { key: i, className: "hero__point hero__point--" + (i + 1) },
            h("span", { className: "hero__point-n" }, "[ " + p[0] + " ]"),
            h("b", null, p[1]),
            h("span", null, p[2]))
        ),
        // центральная кнопка
        h("div", { className: "hero__cta" },
          h(Button, { variant: "primary", size: "lg", iconRight: "arrow", onClick: () => navigate({ name: "catalog" }) }, "Открыть каталог"),
          h(Button, { variant: "ghost", size: "sm", icon: "headset", onClick: () => onRequest(null) }, "Подбор и консультация")
        )
      )
    );
  }

  function Categories(props) {
    const { navigate } = props;
    const cats = window.MOCK.CATEGORIES;
    return h(
      "section",
      { className: "wrap section", id: "categories" },
      h("div", { className: "section__head" },
        h("div", null,
          h("h2", { className: "section__title" }, "Категории товаров"),
          h("p", { className: "section__sub" }, "8 направлений — от расходников до оснащения клиник под ключ")
        ),
        h("a", { className: "section__more", href: "#", onClick: (e) => { e.preventDefault(); navigate({ name: "catalog" }); } },
          "Весь каталог", h(Icon, { name: "arrowSm", size: 16 }))
      ),
      h(
        "div",
        { className: "cat-grid" },
        cats.map((c) =>
          h(
            "button",
            { key: c.id, className: "cat-card", "data-cat": c.icon,
              onClick: () => navigate({ name: "catalog", category: c.slug }) },
            h("span", { className: "cat-card__ic" }, h(CatIcon, { name: c.icon, size: 30 })),
            h("span", { className: "cat-card__body" },
              h("b", null, c.shortTitle),
              h("small", null, c.count + " " + plural(c.count, ["товар", "товара", "товаров"]))
            ),
            h("span", { className: "cat-card__arr" }, h(Icon, { name: "arrowSm", size: 18 }))
          )
        )
      )
    );
  }

  function plural(n, forms) {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
    return forms[2];
  }

  function Popular(props) {
    const { navigate, onOpen, onRequest } = props;
    const popular = window.MOCK.PRODUCTS.filter((p) => p.popular).slice(0, 4);
    return h(
      "section",
      { className: "section section--soft", id: "popular" },
      h(
        "div",
        { className: "wrap" },
        h("div", { className: "section__head" },
          h("div", null,
            h("h2", { className: "section__title" }, "Популярные товары"),
            h("p", { className: "section__sub" }, "Чаще всего заказывают клиники и частные покупатели")
          ),
          h(Button, { variant: "ghost", size: "md", iconRight: "arrowSm", onClick: () => navigate({ name: "catalog", popular: true }) }, "Смотреть все")
        ),
        h("div", { className: "prod-grid" },
          popular.map((p) => h(ProductCard, { key: p.id, product: p, onOpen: onOpen, onRequest: onRequest }))
        )
      )
    );
  }

  function Advantages() {
    const items = [
      ["shield", "Только сертификат", "Регистрационные удостоверения Росздравнадзора и декларации ТР ТС на всю продукцию."],
      ["truck", "Поставка со склада", "Большинство позиций в наличии. Отгрузка и доставка по всей России от 1 дня."],
      ["box", "Опт и розница", "Гибкие цены для клиник и больниц, спецусловия для постоянных и оптовых клиентов."],
      ["headset", "Подбор специалистом", "Поможем подобрать оборудование и расходники под задачу, бюджет и нормативы."],
    ];
    return h(
      "section",
      { className: "wrap section", id: "advantages" },
      h("div", { className: "section__head section__head--center" },
        h("h2", { className: "section__title" }, "Почему выбирают нас"),
        h("p", { className: "section__sub" }, "Работаем с медицинскими учреждениями и частными покупателями с 2010 года")
      ),
      h("div", { className: "adv-grid" },
        items.map((it, i) =>
          h("div", { key: i, className: "adv-card" },
            h("span", { className: "adv-card__ic" }, h(Icon, { name: it[0], size: 24 })),
            h("h3", null, it[1]),
            h("p", null, it[2])
          )
        )
      )
    );
  }

  function Certificates() {
    const certs = window.MOCK.CERTIFICATES;
    return h(
      "section",
      { className: "section section--ink", id: "certificates" },
      h(
        "div",
        { className: "wrap" },
        h("div", { className: "section__head section__head--inverse" },
          h("div", null,
            h("h2", { className: "section__title" }, "Сертификаты и документы"),
            h("p", { className: "section__sub" }, "Вся продукция зарегистрирована и разрешена к применению на территории РФ")
          ),
          h("span", { className: "cert-shield" }, h(Icon, { name: "shield", size: 22 }), " Проверено")
        ),
        h("div", { className: "cert-grid" },
          certs.map((c) =>
            h("div", { key: c.id, className: "cert-card" },
              h("span", { className: "cert-card__ic" }, h(Icon, { name: "doc", size: 22 })),
              h("div", { className: "cert-card__b" },
                h("b", null, c.title),
                h("small", null, c.description),
                h("code", null, c.code)
              )
            )
          )
        )
      )
    );
  }

  function HomePage(props) {
    return h(
      "div",
      { className: "page-home", "data-screen-label": "Главная" },
      h(Hero, props),
      h("div", { className: "home-reveal" },
        h(Categories, props),
        h(Popular, props),
        h(Certificates, null)
      )
    );
  }

  Object.assign(window, { HomePage, plural });
})();
