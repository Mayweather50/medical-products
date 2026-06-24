import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon, CatIcon } from "./Icon";
import Button from "./Button";
import { catalogUrl, plural } from "../lib/format";
import { useCatalog } from "../context/CatalogContext";
import { useLeadModal } from "../context/LeadModalContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const BRAND = "Ugodent";

export default function Header() {
  const navigate = useNavigate();
  const { categories } = useCatalog();
  const openLead = useLeadModal();
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const catsRef = useRef(null);
  const searchRef = useRef(null);

  /* Тап мимо мегаменю закрывает его (на тач-устройствах нет mouseleave) */
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

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const submitSearch = (e) => {
    if (e) e.preventDefault();
    const q = search.trim();
    if (!q) {
      setSearchOpen(true);
      return;
    }
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(catalogUrl({ q }));
  };

  /* Десктоп: hover уже открыл меню, клик ведёт в каталог.
     Тач: hover нет, первый тап открывает меню, повторный — переход. */
  const onCatBtn = () => {
    if (catOpen) {
      setCatOpen(false);
      navigate("/catalog");
    } else {
      setCatOpen(true);
    }
  };

  return (
    <header className="site-head">
      <div className="head-top">
        <div className="wrap head-top__in">
          <span>
            <Icon name="truck" size={14} /> Доставка по РФ от 1 дня
          </span>
          <span>
            <Icon name="shield" size={14} /> Все товары сертифицированы
          </span>
          <a href="tel:+78001234567">
            <Icon name="phone" size={14} /> 8 800 123-45-67
          </a>
        </div>
      </div>

      <div className="head-main">
        <div className="wrap head-main__in">
          {/* Левая колонка: навигация + каталог */}
          <div className="head-main__left head-main__nav">
            <div className="head-nav__links">
              <Link to="/#advantages">О компании</Link>
              <Link to="/#certificates">Сертификаты</Link>
            </div>
            <div
              ref={catsRef}
              className="head-nav__cats"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                className={"head-nav__catbtn" + (catOpen ? " is-open" : "")}
                onClick={onCatBtn}
              >
                Каталог
                <Icon name="plus" size={12} className="head-nav__plus" />
              </button>
              {catOpen && categories.length > 0 && (
                <div className="megamenu">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      className="megamenu__item"
                      to={catalogUrl({ cat: c.slug })}
                      onClick={() => setCatOpen(false)}
                    >
                      <span className="megamenu__ic" data-cat={c.icon}>
                        <CatIcon name={c.icon} size={22} />
                      </span>
                      <span className="megamenu__t">
                        <b>{c.shortTitle}</b>
                        <small>
                          {c.count} {plural(c.count, ["товар", "товара", "товаров"])}
                        </small>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Центр: логотип */}
          <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
            <span className="brand__mark">
              <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden>
                <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" fill="currentColor" />
              </svg>
            </span>
            <span className="brand__name">{BRAND}</span>
          </Link>

          {/* Правая колонка: поиск, связь, аккаунт */}
          <div className="head-main__right">
            <form
              className={"head-search" + (searchOpen ? " is-open" : "")}
              onSubmit={submitSearch}
            >
              <button
                type="button"
                className="head-search__toggle"
                aria-label={searchOpen ? "Искать" : "Открыть поиск"}
                onClick={() => (searchOpen ? submitSearch() : setSearchOpen(true))}
              >
                <Icon name="search" size={18} />
              </button>
              <input
                ref={searchRef}
                type="search"
                value={search}
                placeholder="Поиск по каталогу"
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => { if (!search.trim()) setSearchOpen(false); }}
              />
            </form>

            <button type="button" className="head-connect" onClick={() => openLead()}>
              <span>Связаться</span>
              <Icon name="arrowUpRight" size={14} />
            </button>

            <Link
              className="head-icobtn"
              to="/cart"
              onClick={() => setMenuOpen(false)}
              aria-label="Корзина"
              title="Корзина"
            >
              <Icon name="cart" size={20} />
              {count > 0 && <span className="head-icobtn__n">{count}</span>}
            </Link>

            <Link
              className="head-icobtn"
              to={user ? (isAdmin ? "/admin" : "/") : "/login"}
              onClick={(e) => {
                setMenuOpen(false);
                if (user && !isAdmin) { e.preventDefault(); logout(); }
              }}
              aria-label={user ? (isAdmin ? "Админ-панель" : "Выйти") : "Войти"}
              title={user ? (isAdmin ? `Админ-панель (${user.username})` : `Выйти (${user.username})`) : "Войти"}
            >
              <Icon name={user && !isAdmin ? "logout" : "user"} size={20} />
              {user && <span className="head-icobtn__dot" />}
            </Link>

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
          <form className="head-search mobile-menu__search" onSubmit={submitSearch}>
            <button type="button" className="head-search__toggle" onClick={submitSearch} aria-label="Искать">
              <Icon name="search" size={18} />
            </button>
            <input
              type="search"
              placeholder="Поиск по каталогу…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <nav className="mobile-menu__cats">
            <span className="mobile-menu__label">Каталог</span>
            {categories.map((c) => (
              <Link
                key={c.id}
                className="mobile-menu__cat"
                to={catalogUrl({ cat: c.slug })}
                onClick={() => setMenuOpen(false)}
              >
                <span className="megamenu__ic" data-cat={c.icon}>
                  <CatIcon name={c.icon} size={20} />
                </span>
                <span>{c.shortTitle}</span>
              </Link>
            ))}
          </nav>

          <nav className="mobile-menu__links">
            <Link to={catalogUrl({ popular: true })} onClick={() => setMenuOpen(false)}>Популярное</Link>
            <Link to="/#advantages" onClick={() => setMenuOpen(false)}>Почему мы</Link>
            <Link to="/#certificates" onClick={() => setMenuOpen(false)}>Сертификаты</Link>
            <Link to="/#contacts" onClick={() => setMenuOpen(false)}>Контакты</Link>
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Админ-панель</Link>}
          </nav>

          <div className="mobile-menu__foot">
            <a className="mobile-menu__phone" href="tel:+78001234567">
              <Icon name="phone" size={17} /> 8 800 123-45-67
            </a>
            <Button
              variant="primary"
              size="md"
              icon="doc"
              onClick={() => { setMenuOpen(false); openLead(); }}
            >
              Оставить заявку
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
