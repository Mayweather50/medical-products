import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/Badge";
import Breadcrumbs from "../components/Breadcrumbs";
import Button from "../components/Button";
import ProductGallery from "../components/ProductGallery";
import { Icon } from "../components/Icon";
import { Loading, LoadError } from "../components/StateBlock";
import { api } from "../api";
import { catalogUrl, fmtPrice } from "../lib/format";
import { catShortTitle } from "../lib/category";
import { useLeadModal } from "../context/LeadModalContext";
import { useCart } from "../context/CartContext";
import { usePageTitle } from "../lib/usePageTitle";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const openLead = useLeadModal();
  const cart = useCart();

  const [state, setState] = useState({ product: null, loading: true, error: null });
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);

  useEffect(() => { setQty(1); }, [slug]);
  usePageTitle(state.product?.title);

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


  const chars = Object.entries(p.characteristics || {});

  const addToCart = () => {
    cart.add(p, qty);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="page-product cliniq">
      <div className="wrap cliniq-nav">
        <button
          className="cliniq-back"
          onClick={() => navigate(catalogUrl({ cat: p.category.slug }))}
          aria-label="Назад в каталог"
        >
          <Icon name="chevron" size={18} style={{ transform: "rotate(180deg)" }} />
        </button>
        <Breadcrumbs
          items={[
            { label: "Главная", to: "/" },
            { label: catShortTitle(p.category), to: catalogUrl({ cat: p.category.slug }) },
            { label: p.title },
          ]}
        />
      </div>

      <div className="wrap">
        <div className="cliniq-hero">
          <div className="cliniq-hero__img">
            <ProductGallery product={p} className="cliniq-hero__pic" />
          </div>
          <div className="cliniq-hero__info">
            <div className="cliniq-hero__tags">
              {p.popular && <Badge tone="accent" icon="star">Хит продаж</Badge>}
              {p.available ? (
                <Badge tone="ok" icon="check">В наличии</Badge>
              ) : (
                <Badge tone="muted">Под заказ</Badge>
              )}
            </div>
            <h1 className="cliniq-hero__title">{p.title}</h1>
            <div className="cliniq-hero__meta">
              <span>{p.category.title}</span>
              <code>{p.article}</code>
            </div>
            <p className="cliniq-hero__desc">{p.shortDescription}</p>

            <div className="cliniq-actions">
              <button className="cliniq-action" onClick={() => openLead(p)}>
                <Icon name="phone" size={18} />
                <span>Заказать звонок</span>
              </button>
            </div>

            {chars.length > 0 && (
              <div className="cliniq-chips">
                {chars.slice(0, 4).map(([k, v]) => (
                  <div key={k} className="cliniq-chip">
                    <b>{v}</b>
                    <span>{k}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="cliniq-buy">
          <div className="cliniq-buy__left">
            <div className="cliniq-buy__price">
              {p.priceOnRequest ? (
                <>
                  <span className="cliniq-buy__req">Цена по запросу</span>
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
            <ul className="cliniq-buy__perks">
              <li>
                <span className="cliniq-perk-ic"><Icon name="truck" size={16} /></span>
                Доставка по РФ от 1 дня
              </li>
              <li>
                <span className="cliniq-perk-ic"><Icon name="shield" size={16} /></span>
                Сертификат и документы в комплекте
              </li>
              <li>
                <span className="cliniq-perk-ic"><Icon name="box" size={16} /></span>
                Опт и розница, спеццены для клиник
              </li>
            </ul>
          </div>

          <div className="cliniq-buy__right">
            {p.priceOnRequest ? (
              <Button
                variant="primary"
                size="lg"
                icon="headset"
                className="cliniq-buy__cta"
                onClick={() => openLead(p)}
              >
                Запросить цену
              </Button>
            ) : (
              <>
                <div className="qty qty--lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Меньше">
                    <Icon name="minus" size={16} />
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} aria-label="Больше">
                    <Icon name="plus" size={16} />
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  icon={added ? "check" : "cart"}
                  className="cliniq-buy__cta"
                  onClick={addToCart}
                >
                  {added ? "Добавлено в корзину" : "В корзину"}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="md"
              icon="phone"
              className="cliniq-buy__cta2"
              onClick={() => openLead(p)}
            >
              Заказать звонок
            </Button>
          </div>
        </div>
      </div>

      <div className="wrap cliniq-details">
        <section className="cliniq-panel">
          <h2>Описание</h2>
          <p>{p.description}</p>
        </section>
        {chars.length > 0 && (
          <section className="cliniq-panel">
            <h2>Характеристики</h2>
            <table className="spec">
              <tbody>
                {chars.map(([key, value]) => (
                  <tr key={key}>
                    <th>{key}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section__head">
              <h2 className="section__title">Похожие товары</h2>
            </div>
            <div className="cliniq-related">
              {related.map((r) => {
                const rm = catShortTitle(r.category);
                return (
                  <button
                    key={r.id}
                    className="cliniq-rcard"
                    onClick={() => navigate(`/product/${r.slug}`)}
                  >
                    <div className="cliniq-rcard__top">
                      <span className="cliniq-rcard__cat">{rm}</span>
                      <h3>{r.title}</h3>
                    </div>
                    <div className="cliniq-rcard__bot">
                      {r.priceOnRequest ? (
                        <span className="cliniq-rcard__price">По запросу</span>
                      ) : (
                        <>
                          <b>{fmtPrice(r.price)}</b>
                          <span> / шт.</span>
                        </>
                      )}
                      <span className="cliniq-rcard__arr">
                        <Icon name="arrowSm" size={18} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
