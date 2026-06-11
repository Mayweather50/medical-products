import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import { Icon, CatIcon } from "../components/Icon";
import { Loading, LoadError } from "../components/StateBlock";
import { api } from "../api";
import { catalogUrl, plural } from "../lib/format";
import { useCatalog } from "../context/CatalogContext";
import { useLeadModal } from "../context/LeadModalContext";

function Hero() {
  const navigate = useNavigate();
  const { categories } = useCatalog();
  const openLead = useLeadModal();

  return (
    <section className="hero">
      <div className="wrap hero__in">
        <div className="hero__copy">
          <span className="hero__eyebrow">
            <span className="dot" />
            Медтехника и расходные материалы оптом и в розницу
          </span>
          <h1 className="hero__title">
            Медицинские товары <span className="hero__title-em">для клиник и дома</span>
          </h1>
          <p className="hero__lead">
            Сертифицированное оборудование, СИЗ, расходные материалы и средства
            реабилитации. Поставка со склада, документы в комплекте, консультация
            специалиста.
          </p>
          <div className="hero__cta">
            <Button variant="primary" size="lg" iconRight="arrow" onClick={() => navigate("/catalog")}>
              Открыть каталог
            </Button>
            <Button variant="ghost" size="lg" icon="headset" onClick={() => openLead()}>
              Подбор и консультация
            </Button>
          </div>
          <div className="hero__stats">
            {[
              ["1 200+", "позиций в каталоге"],
              ["от 1 дня", "доставка по РФ"],
              ["100%", "сертифицировано"],
            ].map(([num, label]) => (
              <div key={label} className="hero__stat">
                <b>{num}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__card hero__card--main">
            <div className="hero__cross">
              <svg viewBox="0 0 24 24" width={64} height={64} aria-hidden>
                <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" fill="currentColor" />
              </svg>
            </div>
            <div className="hero__pulse">
              <svg viewBox="0 0 240 60" preserveAspectRatio="none" aria-hidden>
                <path
                  d="M0 30h60l12-22 16 44 14-32 10 20h118"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          {categories.slice(0, 4).map((c, i) => (
            <button
              key={c.id}
              className={`hero__chip hero__chip--${i + 1}`}
              data-cat={c.icon}
              onClick={() => navigate(catalogUrl({ cat: c.slug }))}
            >
              <CatIcon name={c.icon} size={22} />
              <span>{c.shortTitle}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
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
            <Link key={c.id} className="cat-card" data-cat={c.icon} to={catalogUrl({ cat: c.slug })}>
              <span className="cat-card__ic">
                <CatIcon name={c.icon} size={30} />
              </span>
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
          ))}
        </div>
      )}
    </section>
  );
}

function Popular() {
  const navigate = useNavigate();
  const [state, setState] = useState({ items: [], loading: true, error: null });

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .getPopular()
      .then((items) => setState({ items: items.slice(0, 4), loading: false, error: null }))
      .catch((error) => setState({ items: [], loading: false, error }));
  };
  useEffect(load, []);

  return (
    <section className="section section--soft" id="popular">
      <div className="wrap">
        <div className="section__head">
          <div>
            <h2 className="section__title">Популярные товары</h2>
            <p className="section__sub">Чаще всего заказывают клиники и частные покупатели</p>
          </div>
          <Button
            variant="ghost"
            size="md"
            iconRight="arrowSm"
            onClick={() => navigate(catalogUrl({ popular: true }))}
          >
            Смотреть все
          </Button>
        </div>
        {state.loading ? (
          <Loading />
        ) : state.error ? (
          <LoadError error={state.error} retry={load} />
        ) : (
          <div className="prod-grid">
            {state.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Advantages() {
  const items = [
    ["shield", "Только сертификат", "Регистрационные удостоверения Росздравнадзора и декларации ТР ТС на всю продукцию."],
    ["truck", "Поставка со склада", "Большинство позиций в наличии. Отгрузка и доставка по всей России от 1 дня."],
    ["box", "Опт и розница", "Гибкие цены для клиник и больниц, спецусловия для постоянных и оптовых клиентов."],
    ["headset", "Подбор специалистом", "Поможем подобрать оборудование и расходники под задачу, бюджет и нормативы."],
  ];
  return (
    <section className="wrap section" id="advantages">
      <div className="section__head section__head--center">
        <h2 className="section__title">Почему выбирают нас</h2>
        <p className="section__sub">
          Работаем с медицинскими учреждениями и частными покупателями с 2010 года
        </p>
      </div>
      <div className="adv-grid">
        {items.map(([icon, title, text]) => (
          <div key={title} className="adv-card">
            <span className="adv-card__ic">
              <Icon name={icon} size={24} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
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
    <section className="section section--ink" id="certificates">
      <div className="wrap">
        <div className="section__head section__head--inverse">
          <div>
            <h2 className="section__title">Сертификаты и документы</h2>
            <p className="section__sub">
              Вся продукция зарегистрирована и разрешена к применению на территории РФ
            </p>
          </div>
          <span className="cert-shield">
            <Icon name="shield" size={22} /> Проверено
          </span>
        </div>
        <div className="cert-grid">
          {certs.map((c) => (
            <div key={c.id} className="cert-card">
              <span className="cert-card__ic">
                <Icon name="doc" size={22} />
              </span>
              <div className="cert-card__b">
                <b>{c.title}</b>
                <small>{c.description}</small>
                <a className="cert-card__link" href={c.fileUrl} target="_blank" rel="noreferrer">
                  Открыть документ
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="page-home">
      <Hero />
      <Categories />
      <Popular />
      <Advantages />
      <Certificates />
    </div>
  );
}
