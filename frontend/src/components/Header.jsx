import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import { Icon, CatIcon } from "./Icon";
import { catalogUrl, plural } from "../lib/format";
import { useCatalog } from "../context/CatalogContext";
import { useLeadModal } from "../context/LeadModalContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const BRAND = "Ugodent";

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { categories } = useCatalog();
  const openLead = useLeadModal();
  const { user, isAdmin, logout } = useAuth();
  const cart = useCart();

  const [search, setSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [hoverCat, setHoverCat] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const catsRef = useRef(null);
  const searchRef = useRef(null);

  /* Стекло при скролле. Над баннером оно плотное, дальше по странице —
     заметно прозрачнее: текст в шапке тёмный, и на тёмном кадре баннера
     прозрачная плашка его съедает, а над светлым телом страницы — нет. */
  useEffect(() => {
    let queued = false;
    const measure = () => {
      queued = false;
      setScrolled(window.scrollY > 8);
      const hero = document.querySelector(".mc-banner");
      setOverHero(!!hero && hero.getBoundingClientRect().bottom > 96);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    /* баннеры приходят с бэкенда уже после первого рендера — без этого
       над только что появившимся баннером шапка осталась бы прозрачной */
    const mo = new MutationObserver(onScroll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
    };
  }, [pathname]);

  /* Тап мимо мегаменю закрывает его */
  useEffect(() => {
    if (!catOpen) return;
    const onDown = (e) => {
      if (catsRef.current && !catsRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [catOpen]);

  /* Пока открыто мобильное меню — страница под ним не прокручивается */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setSearchOpen(true);
      setTimeout(() => searchRef.current && searchRef.current.focus(), 60);
      return;
    }
    setMenuOpen(false);
    setSearchOpen(false);
    navigate(catalogUrl({ q: search.trim() }));
  };

  const toggleSearch = () => {
    setSearchOpen((v) => {
      const next = !v;
      if (next) setTimeout(() => searchRef.current && searchRef.current.focus(), 60);
      return next;
    });
  };

  /* Десктоп: hover уже открыл меню, клик ведёт в каталог.
     Тач: первый тап открывает меню, повторный — переход. */
  const onCatBtn = () => {
    if (catOpen) {
      setCatOpen(false);
      navigate("/catalog");
    } else {
      setCatOpen(true);
    }
  };

  return (
    <header
      className={
        "site-head" + (scrolled ? " is-scrolled" : "") + (overHero ? " is-over-hero" : "")
      }
    >
      <div className="head-bar">
        <div className="wrap head-bar__in">
          {/* Левая навигация */}
          <nav className="head-bar__nav">
            <Link className="head-link" to="/#advantages">О компании</Link>
            <div
              ref={catsRef}
              className="head-cat-wrap"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                type="button"
                className={"head-link head-cat" + (catOpen ? " is-open" : "")}
                onClick={onCatBtn}
              >
                Каталог
                <Icon name="plus" size={15} className="head-cat__plus" />
              </button>
              {catOpen && categories.length > 0 && (() => {
                const active =
                  categories.find((c) => c.id === hoverCat) ||
                  categories.find((c) => c.children?.length > 0) ||
                  categories[0];
                return (
                  <div className="megamenu">
                    <ul className="megamenu__cats">
                      {categories.map((c) => (
                        <li
                          key={c.id}
                          onMouseEnter={() => setHoverCat(c.id)}
                        >
                          <Link
                            className={"megamenu__cat" + (active?.id === c.id ? " is-active" : "")}
                            to={catalogUrl({ cat: c.slug })}
                            onClick={() => setCatOpen(false)}
                          >
                            <span className="megamenu__ic" data-cat={c.icon}>
                              <CatIcon name={c.icon} size={22} />
                            </span>
                            <b>{c.shortTitle}</b>
                            {c.children?.length > 0 && (
                              <Icon name="chevron" size={14} className="megamenu__cat-arr" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="megamenu__panel">
                      <Link
                        className="megamenu__panel-head"
                        to={catalogUrl({ cat: active.slug })}
                        onClick={() => setCatOpen(false)}
                      >
                        {active.shortTitle}
                        <Icon name="arrowSm" size={15} />
                      </Link>
                      {active.children?.length > 0 ? (
                        <ul className="megamenu__sub">
                          {active.children.map((s) => (
                            <li key={s.id}>
                              <Link to={catalogUrl({ cat: s.slug })} onClick={() => setCatOpen(false)}>
                                {s.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="megamenu__empty">Смотреть все товары раздела</p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </nav>

          {/* Центр: логотип */}
          <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
            <span className="brand__name">{BRAND}</span>
          </Link>

          {/* Правые действия */}
          <div className="head-bar__actions">
            <form
              className={"head-search" + (searchOpen ? " is-open" : "")}
              onSubmit={submitSearch}
            >
              <input
                ref={searchRef}
                type="text"
                placeholder="Поиск: тонометр, перчатки, маски…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => { if (!search.trim()) setSearchOpen(false); }}
                tabIndex={searchOpen ? 0 : -1}
                aria-label="Поиск"
              />
              <button
                type="button"
                className="head-icon head-search__toggle"
                aria-label={searchOpen ? "Искать" : "Открыть поиск"}
                onClick={(e) => {
                  if (searchOpen && search.trim()) submitSearch(e);
                  else toggleSearch();
                }}
              >
                <Icon name="search" size={19} />
              </button>
            </form>

            <button className="head-connect" type="button" onClick={() => openLead()}>
              Связаться
              <svg
                className="head-connect__arr"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M7 17L17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </button>

            <Link className="head-cart" to="/cart" aria-label="Корзина">
              <Icon name="cart" size={19} />
              <b className="head-cart__n">{cart.count}</b>
            </Link>

            {user && (
              <Link
                className="head-icon"
                to={isAdmin ? "/admin" : "/"}
                onClick={(e) => {
                  setMenuOpen(false);
                  if (!isAdmin) { e.preventDefault(); logout(); }
                }}
                aria-label={isAdmin ? "Админ-панель" : "Выйти"}
                title={isAdmin ? `Админ-панель (${user.username})` : `Выйти (${user.username})`}
              >
                <Icon name={!isAdmin ? "logout" : "user"} size={20} />
                <span className="head-icon__dot" />
              </Link>
            )}

            <button
              className="head-burger"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={24} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={submitSearch}>
            <Icon name="search" size={19} />
            <input
              type="text"
              placeholder="Поиск по каталогу…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Поиск"
            />
            <button type="submit">Найти</button>
          </form>

          <nav className="mobile-menu__cats">
            <span className="mobile-menu__label">Каталог</span>
            {categories.map((c) => (
              <div key={c.id} className="mobile-menu__group">
                <Link
                  className="mobile-menu__cat"
                  to={catalogUrl({ cat: c.slug })}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="megamenu__ic" data-cat={c.icon}>
                    <CatIcon name={c.icon} size={26} />
                  </span>
                  <span>{c.shortTitle}</span>
                </Link>
                {c.children?.length > 0 && (
                  <ul className="mobile-menu__sub">
                    {c.children.map((s) => (
                      <li key={s.id}>
                        <Link to={catalogUrl({ cat: s.slug })} onClick={() => setMenuOpen(false)}>
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>

          <nav className="mobile-menu__links">
            <Link to={catalogUrl({ popular: true })} onClick={() => setMenuOpen(false)}>Популярное</Link>
            <Link to="/#advantages" onClick={() => setMenuOpen(false)}>О компании</Link>
            <Link to="/#certificates" onClick={() => setMenuOpen(false)}>Сертификаты</Link>
            <Link to="/#contacts" onClick={() => setMenuOpen(false)}>Контакты</Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>Корзина ({cart.count})</Link>
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Админ-панель</Link>}
          </nav>

          <div className="mobile-menu__foot">
            <a className="mobile-menu__phone" href="tel:+78001234567">
              <Icon name="phone" size={17} /> 8 800 123-45-67
            </a>
            <Button
              variant="primary"
              size="md"
              icon="headset"
              onClick={() => { setMenuOpen(false); openLead(); }}
            >
              Связаться
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
