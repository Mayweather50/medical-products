import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import { Icon, CatIcon } from "./Icon";
import { catalogUrl, plural } from "../lib/format";
import { useCatalog } from "../context/CatalogContext";
import { useLeadModal } from "../context/LeadModalContext";

const BRAND = "Медкор";

export default function Header() {
  const navigate = useNavigate();
  const { categories } = useCatalog();
  const openLead = useLeadModal();
  const [search, setSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(catalogUrl({ q: search.trim() }));
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
          <Link className="brand" to="/">
            <span className="brand__mark">
              <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden>
                <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" fill="currentColor" />
              </svg>
            </span>
            <span className="brand__name">{BRAND}</span>
          </Link>

          <form className="head-search" onSubmit={submitSearch}>
            <Icon name="search" size={19} className="head-search__ic" />
            <input
              type="text"
              placeholder="Поиск по каталогу: тонометр, перчатки, маски…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Поиск"
            />
            <button type="submit" className="head-search__btn">Найти</button>
          </form>

          <div className="head-actions">
            <a className="head-contact" href="tel:+78001234567">
              <span className="head-contact__ic">
                <Icon name="headset" size={20} />
              </span>
              <span className="head-contact__txt">
                <b>8 800 123-45-67</b>
                <small>Пн–Пт 9:00–19:00</small>
              </span>
            </a>
            <Button variant="primary" size="md" icon="doc" onClick={() => openLead()}>
              Оставить заявку
            </Button>
          </div>
        </div>
      </div>

      <nav className="head-nav">
        <div className="wrap head-nav__in">
          <div
            className="head-nav__cats"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button
              className={"head-nav__catbtn" + (catOpen ? " is-open" : "")}
              onClick={() => navigate("/catalog")}
            >
              <Icon name="grid" size={18} /> Каталог товаров
              <Icon name="chevronDown" size={16} className="head-nav__chev" />
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

          <div className="head-nav__links">
            <Link to={catalogUrl({ popular: true })}>Популярное</Link>
            <Link to="/#advantages">Почему мы</Link>
            <Link to="/#certificates">Сертификаты</Link>
            <Link to="/#contacts">Контакты</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
