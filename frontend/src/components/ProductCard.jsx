import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "./Badge";
import ProductImage from "./ProductImage";
import { Icon } from "./Icon";
import { fmtPrice } from "../lib/format";
import { catShortTitle } from "../lib/category";
import { useLeadModal } from "../context/LeadModalContext";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product: p }) {
  const navigate = useNavigate();
  const openLead = useLeadModal();
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);
  const open = () => navigate(`/product/${p.slug}`);

  const addToCart = (e) => {
    e.stopPropagation();
    cart.add(p);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1200);
  };

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
        <div className="card__cat">{catShortTitle(p.category)}</div>
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
        {p.priceOnRequest ? (
          <button
            className="card__cta"
            aria-label="Запросить цену"
            onClick={(e) => {
              e.stopPropagation();
              openLead(p);
            }}
          >
            <Icon name="headset" size={19} />
          </button>
        ) : (
          <button
            className={"card__cta" + (added ? " is-added" : "")}
            aria-label="В корзину"
            onClick={addToCart}
          >
            <Icon name={added ? "check" : "cart"} size={19} />
          </button>
        )}
      </div>
    </article>
  );
}
