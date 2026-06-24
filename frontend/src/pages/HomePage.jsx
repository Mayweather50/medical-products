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

const HERO_POINTS = [
  ["01", "Сертификация", "Регистрационные удостоверения и декларации соответствия на всю продукцию"],
  ["02", "Поставка", "Расходники, СИЗ и оборудование со склада с доставкой по всей России"],
  ["03", "Подбор", "Помогаем собрать заказ под профиль клиники, бюджет и нормативы"],
];

function Hero() {
  const navigate = useNavigate();
  const openLead = useLeadModal();

  return (
    <section className="hero">
      <div className="hero__panel">
        <div className="hero__stage" aria-hidden>
          <div className="implant implant--1"><div className="implant__body" /></div>
          <div className="implant implant--2"><div className="implant__body" /></div>
          <div className="implant implant--3"><div className="implant__body" /></div>
        </div>

        <div className="hero__copy">
          <span className="hero__eyebrow">
            <span className="dot" />
            Медкор · медтовары · оборудование
          </span>
          <h1 className="hero__title">
            Медтовары, <span className="hero__title-em">которые закрывают задачу</span>
          </h1>
        </div>

        {HERO_POINTS.map((p, i) => (
          <div key={p[0]} className={`hero__point hero__point--${i + 1}`}>
            <span className="hero__point-n">[ {p[0]} ]</span>
            <b>{p[1]}</b>
            <span>{p[2]}</span>
          </div>
        ))}

        <div className="hero__cta">
          <Button variant="primary" size="lg" iconRight="arrow" onClick={() => navigate("/catalog")}>
            Открыть каталог
          </Button>
          <Button variant="ghost" size="sm" icon="headset" onClick={() => openLead()}>
            Подбор и консультация
          </Button>
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
      <div className="home-reveal">
        <Categories />
        <Popular />
        <Advantages />
        <Certificates />
      </div>
    </div>
  );
}
