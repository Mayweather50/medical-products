import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import ProductRow from "../components/ProductRow";
import { Icon, CatIcon } from "../components/Icon";
import { Loading, LoadError } from "../components/StateBlock";
import { api } from "../api";
import { plural } from "../lib/format";
import { useCatalog } from "../context/CatalogContext";
import { useLeadModal } from "../context/LeadModalContext";
import { usePageTitle } from "../lib/usePageTitle";

const PAGE_SIZE = 24;

export default function CatalogPage() {
  const { categories } = useCatalog();
  const openLead = useLeadModal();
  const [searchParams, setSearchParams] = useSearchParams();

  // Фильтры, влияющие на выдачу, живут в URL — ссылку можно переслать.
  const cat = searchParams.get("cat") || "";
  const onlyPopular = searchParams.get("popular") === "1";
  const query = searchParams.get("q") || "";
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [sort, setSort] = useState("default");
  const [view, setView] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* Пока открыта панель фильтров — страница под ней не прокручивается */
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filtersOpen]);

  const [searchInput, setSearchInput] = useState(query);
  useEffect(() => setSearchInput(query), [query]);

  const [state, setState] = useState({
    items: [],
    total: 0,
    hasNext: false,
    page: 0,
    loading: true,
    loadingMore: false,
    error: null,
  });

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next, { replace: true });
  };

  // Поиск с задержкой, чтобы не дёргать API на каждый символ
  const searchTimer = useRef(null);
  const onSearchInput = (value) => {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => updateParams({ q: value.trim() }), 350);
  };

  const fetchPage = (page, append) => {
    setState((s) => ({
      ...s,
      loading: !append,
      loadingMore: append,
      error: append ? s.error : null,
    }));
    api
      .getProducts({
        categorySlug: cat || undefined,
        available: onlyAvail || undefined,
        popular: onlyPopular || undefined,
        query: query || undefined,
        page,
        size: PAGE_SIZE,
      })
      .then((res) =>
        setState((s) => ({
          items: append ? [...s.items, ...res.content] : res.content,
          total: res.totalElements,
          hasNext: res.hasNext,
          page: res.page,
          loading: false,
          loadingMore: false,
          error: null,
        }))
      )
      .catch((error) =>
        setState((s) => ({ ...s, loading: false, loadingMore: false, error }))
      );
  };

  useEffect(() => {
    fetchPage(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, onlyPopular, query, onlyAvail]);

  const sorted = useMemo(() => {
    const r = state.items.slice();
    if (sort === "price-asc") r.sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    if (sort === "price-desc") r.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "name") r.sort((a, b) => a.title.localeCompare(b.title, "ru"));
    return r;
  }, [state.items, sort]);

  const activeCat = categories.find((c) => c.slug === cat);
  usePageTitle(activeCat ? activeCat.title : onlyPopular ? "Популярные товары" : "Каталог товаров");
  const hasFilters = cat || onlyAvail || onlyPopular || query;
  const filterCount = (cat ? 1 : 0) + (onlyAvail ? 1 : 0) + (onlyPopular ? 1 : 0);
  const reset = () => {
    setOnlyAvail(false);
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const chip = (label, onClear) => (
    <button className="active-chip" onClick={onClear}>
      {label} <Icon name="close" size={13} />
    </button>
  );

  return (
    <div className="page-catalog">
      <div className="wrap catalog-top">
        <Breadcrumbs
          items={[
            { label: "Главная", to: "/" },
            { label: activeCat ? activeCat.title : "Каталог товаров" },
          ]}
        />
        <h1 className="catalog-title">
          {activeCat ? activeCat.title : onlyPopular ? "Популярные товары" : "Каталог товаров"}
        </h1>
        {activeCat && <p className="catalog-desc">{activeCat.description}</p>}
      </div>

      <div className="wrap catalog-layout">
        {filtersOpen && (
          <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />
        )}
        <aside className={"filters" + (filtersOpen ? " is-open" : "")}>
          <div className="filters__head">
            <span>
              <Icon name="filter" size={18} /> Фильтры
            </span>
            {hasFilters && (
              <button className="filters__reset" onClick={reset}>
                Сбросить
              </button>
            )}
            <button
              className="filters__close"
              onClick={() => setFiltersOpen(false)}
              aria-label="Закрыть фильтры"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="filter-group">
            <h4>Категория</h4>
            <ul className="filter-cats">
              <li>
                <button className={!cat ? "is-active" : ""} onClick={() => updateParams({ cat: "" })}>
                  Все товары
                  <span className="filter-cats__n">
                    {categories.reduce((sum, c) => sum + c.count, 0)}
                  </span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    className={cat === c.slug ? "is-active" : ""}
                    onClick={() => updateParams({ cat: c.slug })}
                  >
                    <span className="filter-cats__ic" data-cat={c.icon}>
                      <CatIcon name={c.icon} size={17} />
                    </span>
                    <span className="filter-cats__t">{c.shortTitle}</span>
                    <span className="filter-cats__n">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h4>Наличие</h4>
            <label className="switch">
              <input
                type="checkbox"
                checked={onlyAvail}
                onChange={(e) => setOnlyAvail(e.target.checked)}
              />
              <span className="switch__track">
                <span className="switch__knob" />
              </span>
              <span className="switch__lbl">Только в наличии</span>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={onlyPopular}
                onChange={(e) => updateParams({ popular: e.target.checked ? "1" : "" })}
              />
              <span className="switch__track">
                <span className="switch__knob" />
              </span>
              <span className="switch__lbl">Популярные</span>
            </label>
          </div>

          <div className="filters__help">
            <span className="filters__help-ic">
              <Icon name="headset" size={20} />
            </span>
            <b>Не нашли нужное?</b>
            <p>Подберём аналог или привезём под заказ.</p>
            <Button variant="outline" size="sm" onClick={() => openLead()}>
              Оставить заявку
            </Button>
          </div>

          <div className="filters__apply">
            <Button variant="primary" size="md" onClick={() => setFiltersOpen(false)}>
              Показать {state.total} {plural(state.total, ["товар", "товара", "товаров"])}
            </Button>
          </div>
        </aside>

        <div className="catalog-main">
          <div className="catalog-bar">
            <button className="filters-toggle" onClick={() => setFiltersOpen(true)}>
              <Icon name="filter" size={17} /> Фильтры
              {filterCount > 0 && <span className="filters-toggle__n">{filterCount}</span>}
            </button>
            <div className="catalog-search">
              <Icon name="search" size={18} className="catalog-search__ic" />
              <input
                type="text"
                value={searchInput}
                placeholder="Поиск по названию или артикулу"
                onChange={(e) => onSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  className="catalog-search__clr"
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ q: "" });
                  }}
                  aria-label="Очистить"
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            <div className="catalog-bar__right">
              <div className="select">
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Сортировка">
                  <option value="default">По умолчанию</option>
                  <option value="price-asc">Сначала дешевле</option>
                  <option value="price-desc">Сначала дороже</option>
                  <option value="name">По названию</option>
                </select>
                <Icon name="chevronDown" size={16} className="select__chev" />
              </div>
              <div className="viewtoggle">
                <button
                  className={view === "grid" ? "is-active" : ""}
                  onClick={() => setView("grid")}
                  aria-label="Сетка"
                >
                  <Icon name="grid" size={18} />
                </button>
                <button
                  className={view === "list" ? "is-active" : ""}
                  onClick={() => setView("list")}
                  aria-label="Список"
                >
                  <Icon name="list" size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="catalog-count">
            <b>{state.total}</b> {plural(state.total, ["товар", "товара", "товаров"])}
            {hasFilters && (
              <div className="active-chips">
                {activeCat && chip(activeCat.shortTitle, () => updateParams({ cat: "" }))}
                {onlyAvail && chip("В наличии", () => setOnlyAvail(false))}
                {onlyPopular && chip("Популярные", () => updateParams({ popular: "" }))}
                {query &&
                  chip(`«${query}»`, () => {
                    setSearchInput("");
                    updateParams({ q: "" });
                  })}
              </div>
            )}
          </div>

          {state.loading ? (
            <Loading label="Загружаем каталог…" />
          ) : state.error ? (
            <LoadError error={state.error} retry={() => fetchPage(0, false)} />
          ) : sorted.length === 0 ? (
            <div className="empty">
              <span className="empty__ic">
                <Icon name="search" size={30} />
              </span>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить запрос или сбросить фильтры.</p>
              <Button variant="outline" size="md" onClick={reset}>
                Сбросить фильтры
              </Button>
            </div>
          ) : (
            <>
              <div className={view === "grid" ? "prod-grid prod-grid--cat" : "prod-list"}>
                {sorted.map((p) =>
                  view === "grid" ? (
                    <ProductCard key={p.id} product={p} />
                  ) : (
                    <ProductRow key={p.id} product={p} />
                  )
                )}
              </div>
              {state.hasNext && (
                <div className="catalog-more">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fetchPage(state.page + 1, true)}
                    disabled={state.loadingMore}
                  >
                    {state.loadingMore ? "Загружаем…" : "Показать ещё"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
