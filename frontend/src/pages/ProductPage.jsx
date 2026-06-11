import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/Badge";
import Breadcrumbs from "../components/Breadcrumbs";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import { Icon } from "../components/Icon";
import { Loading, LoadError } from "../components/StateBlock";
import { api } from "../api";
import { catalogUrl, fmtPrice } from "../lib/format";
import { catMeta } from "../lib/categoryMeta";
import { useLeadModal } from "../context/LeadModalContext";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const openLead = useLeadModal();

  const [state, setState] = useState({ product: null, loading: true, error: null });
  const [related, setRelated] = useState([]);

  const load = () => {
    setState({ product: null, loading: true, error: null });
    api
      .getProductBySlug(slug)
      .then((product) => setState({ product, loading: false, error: null }))
      .catch((error) => setState({ product: null, loading: false, error }));
  };
  useEffect(load, [slug]);

  const p = state.product;

  useEffect(() => {
    if (!p) {
      setRelated([]);
      return;
    }
    api
      .getProducts({ categorySlug: p.category.slug, size: 8 })
      .then((res) => setRelated(res.content.filter((x) => x.id !== p.id).slice(0, 4)))
      .catch(() => setRelated([]));
  }, [p]);

  if (state.loading) return <Loading label="Загружаем товар…" />;

  if (state.error) {
    if (state.error.status === 404) {
      return (
        <div className="wrap section">
          <p>Товар не найден.</p>
          <Button variant="primary" onClick={() => navigate("/catalog")}>
            В каталог
          </Button>
        </div>
      );
    }
    return <LoadError error={state.error} retry={load} />;
  }

  const meta = catMeta(p.category);
  const chars = Object.entries(p.characteristics || {});

  return (
    <div className="page-product">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { label: "Главная", to: "/" },
            { label: meta.shortTitle, to: catalogUrl({ cat: p.category.slug }) },
            { label: p.title },
          ]}
        />
      </div>

      <div className="wrap product-top">
        <div className="product-gallery">
          <ProductImage product={p} size={120} className="product-gallery__main" />
          <div className="product-gallery__thumbs">
            {[0, 1, 2].map((i) => (
              <div key={i} className={"product-gallery__thumb" + (i === 0 ? " is-active" : "")}>
                <ProductImage product={p} size={30} />
              </div>
            ))}
          </div>
        </div>

        <div className="product-info">
          <div className="product-info__tags">
            {p.popular && <Badge tone="accent" icon="star">Хит продаж</Badge>}
            {p.available ? (
              <Badge tone="ok" icon="check">В наличии на складе</Badge>
            ) : (
              <Badge tone="muted">Под заказ</Badge>
            )}
          </div>
          <h1 className="product-info__title">{p.title}</h1>
          <div className="product-info__meta">
            <span>
              Артикул: <code>{p.article}</code>
            </span>
            <span className="product-info__cat">{p.category.title}</span>
          </div>
          <p className="product-info__lead">{p.shortDescription}</p>

          <div className="buybox">
            <div className="buybox__price">
              {p.priceOnRequest ? (
                <>
                  <span className="buybox__req">Цена по запросу</span>
                  <small>Стоимость зависит от комплектации и объёма</small>
                </>
              ) : (
                <>
                  <b>{fmtPrice(p.price)}</b>
                  <span> / шт.</span>
                  <small>Оптовая цена — по запросу</small>
                </>
              )}
            </div>
            <div className="buybox__actions">
              <Button
                variant="primary"
                size="lg"
                icon={p.priceOnRequest ? "headset" : "doc"}
                onClick={() => openLead(p)}
              >
                {p.priceOnRequest ? "Запросить цену" : "Оставить заявку"}
              </Button>
              <Button variant="outline" size="lg" icon="phone" onClick={() => openLead(p)}>
                Заказать звонок
              </Button>
            </div>
            <ul className="buybox__perks">
              <li>
                <Icon name="truck" size={17} /> Доставка по РФ от 1 дня
              </li>
              <li>
                <Icon name="shield" size={17} /> Сертификат и документы в комплекте
              </li>
              <li>
                <Icon name="box" size={17} /> Опт и розница, спеццены для клиник
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="wrap product-detail">
        <div className="product-detail__main">
          <section className="panel">
            <h2 className="panel__title">Описание</h2>
            <p className="panel__text">{p.description}</p>
          </section>
          {chars.length > 0 && (
            <section className="panel">
              <h2 className="panel__title">Характеристики</h2>
              <table className="spec">
                <tbody>
                  {chars.map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>
                        <span className="spec__dots" />
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        <aside className="product-detail__aside">
          <div className="helpbox">
            <span className="helpbox__ic">
              <Icon name="headset" size={24} />
            </span>
            <h3>Поможем с выбором</h3>
            <p>Подберём аналоги, рассчитаем оптовую цену и сроки поставки.</p>
            <Button variant="primary" size="md" className="helpbox__btn" onClick={() => openLead(p)}>
              Получить консультацию
            </Button>
            <a className="helpbox__phone" href="tel:+78001234567">
              <Icon name="phone" size={16} /> 8 800 123-45-67
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section section--soft">
          <div className="wrap">
            <div className="section__head">
              <h2 className="section__title">Похожие товары</h2>
            </div>
            <div className="prod-grid">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
