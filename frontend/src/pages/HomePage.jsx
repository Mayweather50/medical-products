import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import { Icon, CatIcon } from "../components/Icon";
import { Loading, LoadError } from "../components/StateBlock";
import { api } from "../api";
import { catalogUrl, plural } from "../lib/format";
import { useCatalog } from "../context/CatalogContext";
import { useLeadModal } from "../context/LeadModalContext";

/* Показываем, пока баннеры не загрузились и если из админки не пришло ни одного. */
const FALLBACK_SLIDES = [
  {
    id: "banner-1",
    tone: "teal",
    img: "/banners/banner-1.jpg",
    eyebrow: "Каталог",
    title: "Оборудование и материалы для стоматологии",
    cta: "Открыть каталог",
    to: "/catalog",
  },
  {
    id: "banner-2",
    tone: "deep",
    img: "/banners/banner-2.jpg",
    eyebrow: "Цифровая стоматология",
    title: "Cad/Cam технологии: сканеры и фрезерные станки",
    cta: "Смотреть раздел",
    to: catalogUrl({ cat: "cad-cam-tehnologii" }),
  },
  {
    id: "banner-3",
    tone: "azure",
    img: "/banners/banner-3.jpg",
    eyebrow: "Под ключ",
    title: "Оснащение стоматологического кабинета",
    cta: "Смотреть оборудование",
    to: catalogUrl({ cat: "stomatologicheskoe-oborudovanie" }),
  },
];

/* Слайд из админки → форма, которую рисует Hero. */
function toSlide(b) {
  return {
    id: `banner-${b.id}`,
    tone: b.tone || "teal",
    img: b.imageUrl || "",
    eyebrow: b.eyebrow || "",
    title: b.title,
    cta: b.ctaLabel || "",
    to: b.linkUrl || "",
  };
}

function Hero() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  /* Баннеры редактируются в админке; при ошибке остаются запасные. */
  useEffect(() => {
    let cancelled = false;
    api.getBanners()
      .then((list) => {
        if (!cancelled && list?.length) {
          setSlides(list.map(toSlide));
          setActive(0);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const go = (i) => setActive((i + slides.length) % slides.length);

  /* Автолистание с паузой при наведении */
  const start = () => {
    stop();
    timer.current = setInterval(() => setActive((a) => (a + 1) % slides.length), 6000);
  };
  const stop = () => { if (timer.current) clearInterval(timer.current); };
  useEffect(() => { start(); return stop; }, [slides.length]);

  return (
    <section
      className="mc-banner"
      onMouseEnter={stop}
      onMouseLeave={start}
      aria-label="Баннер"
    >
      <div className="mc-banner__track">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`mc-banner__slide mc-banner__slide--${s.tone}`}
            style={{ opacity: i === active ? 1 : 0, transition: "opacity 0.8s ease" }}
            aria-hidden={i !== active}
          >
            {s.img && <img className="mc-banner__img" src={s.img} alt="" loading={i === 0 ? "eager" : "lazy"} />}
            <div className="mc-banner__scrim" aria-hidden />
            <div className="mc-banner__copy">
              {s.eyebrow && <span className="mc-banner__eyebrow">{s.eyebrow}</span>}
              <h1 className="mc-banner__title">{s.title}</h1>
              {s.cta && s.to && (
                <div className="mc-banner__cta">
                  <Button variant="primary" size="lg" iconRight="arrow" onClick={() => navigate(s.to)}>
                    {s.cta}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="mc-banner__arrow mc-banner__arrow--prev"
        type="button"
        aria-label="Предыдущий слайд"
        onClick={() => go(active - 1)}
      >
        <Icon name="arrow" size={22} />
      </button>
      <button
        className="mc-banner__arrow mc-banner__arrow--next"
        type="button"
        aria-label="Следующий слайд"
        onClick={() => go(active + 1)}
      >
        <Icon name="arrow" size={22} />
      </button>

      <div className="mc-banner__dots" role="tablist">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={"mc-banner__dot" + (i === active ? " is-active" : "")}
            aria-label={`Слайд ${i + 1}`}
            aria-selected={i === active}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ c }) {
  const photo = c.imageUrl && !c.imageUrl.startsWith("icon:") ? c.imageUrl : null;
  const [showPhoto, setShowPhoto] = useState(Boolean(photo));

  return (
    <Link
      className={"cat-card" + (showPhoto ? " cat-card--photo" : "")}
      data-cat={c.icon}
      to={catalogUrl({ cat: c.slug })}
    >
      {showPhoto ? (
        <img
          className="cat-card__img"
          src={photo}
          alt=""
          loading="lazy"
          onError={() => setShowPhoto(false)}
        />
      ) : (
        <span className="cat-card__ic">
          <CatIcon name={c.icon} size={40} />
        </span>
      )}
      <span className="cat-card__body">
        <b>{c.shortTitle}</b>
        <small>
          {c.count} {plural(c.count, ["товар", "товара", "товаров"])}
        </small>
      </span>
      <span className="cat-card__arr">
        <Icon name="arrowSm" size={18} />
      </span>
    </Link>
  );
}

function Categories() {
  const { categories, loading } = useCatalog();

  return (
    <section className="wrap section" id="categories">
      <div className="section__head">
        <div>
          <h2 className="section__title">Категории товаров</h2>
          <p className="section__sub">
            {categories.length || 8} направлений — от расходников до оснащения клиник под ключ
          </p>
        </div>
        <Link className="section__more" to="/catalog">
          Весь каталог <Icon name="arrowSm" size={16} />
        </Link>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="cat-grid">
          {categories.map((c) => (
            <CategoryCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}

function Popular() {
  const navigate = useNavigate();
  const [state, setState] = useState({ items: [], loading: true, error: null });
  const trackRef = useRef(null);

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .getPopular()
      .then((items) => setState({ items, loading: false, error: null }))
      .catch((error) => setState({ items: [], loading: false, error }));
  };
  useEffect(load, []);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".pop-slide");
    const step = card ? card.offsetWidth + 18 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="section section--soft" id="popular">
      <div className="wrap">
        <div className="section__head">
          <div>
            <h2 className="section__title">Популярные товары</h2>
            <p className="section__sub">Чаще всего заказывают клиники и частные покупатели</p>
          </div>
          <div className="pop-actions">
            {state.items.length > 1 && (
              <div className="pop-nav">
                <button type="button" className="pop-nav__btn" onClick={() => scroll(-1)} aria-label="Назад">
                  <Icon name="chevron" size={18} style={{ transform: "rotate(180deg)" }} />
                </button>
                <button type="button" className="pop-nav__btn" onClick={() => scroll(1)} aria-label="Вперёд">
                  <Icon name="chevron" size={18} />
                </button>
              </div>
            )}
            <Button
              variant="ghost"
              size="md"
              iconRight="arrowSm"
              onClick={() => navigate(catalogUrl({ popular: true }))}
            >
              Смотреть все
            </Button>
          </div>
        </div>
        {state.loading ? (
          <Loading />
        ) : state.error ? (
          <LoadError error={state.error} retry={load} />
        ) : (
          <div className="pop-track" ref={trackRef}>
            {state.items.map((p) => (
              <div className="pop-slide" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Certificates() {
  const [certs, setCerts] = useState([]);
  useEffect(() => {
    api.getCertificates().then(setCerts).catch(() => setCerts([]));
  }, []);

  if (!certs.length) return null;

  return (
    <section className="wrap section" id="advantages">
      <div className="section__head section__head--center">
        <h2 className="section__title" id="certificates">Сертификаты и документы</h2>
        <p className="section__sub">
          Вся продукция зарегистрирована и разрешена к применению на территории РФ
        </p>
      </div>
      <div className="adv-grid">
        {certs.map((c) => (
          <a
            key={c.id}
            className="adv-card adv-card--link"
            href={c.fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span className="adv-card__ic">
              <Icon name="doc" size={24} />
            </span>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <span className="adv-card__more">
              Открыть документ <Icon name="arrowSm" size={14} />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="page-home">
      <Hero />
      <div className="home-reveal">
        <Categories />
        <Popular />
        <Certificates />
      </div>
    </div>
  );
}
