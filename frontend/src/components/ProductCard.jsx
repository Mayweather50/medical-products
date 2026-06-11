import { useNavigate } from "react-router-dom";
import Badge from "./Badge";
import ProductImage from "./ProductImage";
import { Icon } from "./Icon";
import { fmtPrice } from "../lib/format";
import { catMeta } from "../lib/categoryMeta";
import { useLeadModal } from "../context/LeadModalContext";

export default function ProductCard({ product: p }) {
  const navigate = useNavigate();
  const openLead = useLeadModal();
  const open = () => navigate(`/product/${p.slug}`);

  return (
    <article
      className="card"
      onClick={open}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
    >
      <div className="card__media">
        <ProductImage product={p} size={58} />
        <div className="card__tags">
          {p.popular && <Badge tone="accent" icon="star">Хит</Badge>}
          {p.available ? (
            <Badge tone="ok" icon="check">В наличии</Badge>
          ) : (
            <Badge tone="muted">Под заказ</Badge>
          )}
        </div>
      </div>
      <div className="card__body">
        <div className="card__cat">{catMeta(p.category).shortTitle}</div>
        <h3 className="card__title">{p.title}</h3>
        <p className="card__desc">{p.shortDescription}</p>
      </div>
      <div className="card__foot">
        <div className="card__price">
          {p.priceOnRequest ? (
            <span className="card__price-req">Цена по запросу</span>
          ) : (
            <>
              <span className="card__price-val">{fmtPrice(p.price)}</span>
              <span className="card__price-unit">/ шт.</span>
            </>
          )}
        </div>
        <button
          className="card__cta"
          aria-label="Запросить"
          onClick={(e) => {
            e.stopPropagation();
            openLead(p);
          }}
        >
          <Icon name={p.priceOnRequest ? "headset" : "arrowSm"} size={19} />
        </button>
      </div>
    </article>
  );
}
