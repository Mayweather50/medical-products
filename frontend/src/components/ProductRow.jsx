import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "./Badge";
import Button from "./Button";
import ProductImage from "./ProductImage";
import { fmtPrice } from "../lib/format";
import { catShortTitle } from "../lib/category";
import { useLeadModal } from "../context/LeadModalContext";
import { useCart } from "../context/CartContext";

export default function ProductRow({ product: p }) {
  const navigate = useNavigate();
  const openLead = useLeadModal();
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);

  return (
    <article className="prow" onClick={() => navigate(`/product/${p.slug}`)}>
      <ProductImage product={p} size={40} className="prow__img" />
      <div className="prow__main">
        <div className="prow__cat">
          {catShortTitle(p.category)} · {p.article}
        </div>
        <h3 className="prow__title">{p.title}</h3>
        <p className="prow__desc">{p.shortDescription}</p>
        <div className="prow__tags">
          {p.popular && <Badge tone="accent" icon="star">Хит</Badge>}
          {p.available ? (
            <Badge tone="ok" icon="check">В наличии</Badge>
          ) : (
            <Badge tone="muted">Под заказ</Badge>
          )}
        </div>
      </div>
      <div className="prow__side">
        {p.priceOnRequest ? (
          <span className="prow__price-req">Цена по запросу</span>
        ) : (
          <span className="prow__price">{fmtPrice(p.price)}</span>
        )}
        <Button
          variant="primary"
          size="sm"
          icon={p.priceOnRequest ? "headset" : added ? "check" : "cart"}
          onClick={(e) => {
            e.stopPropagation();
            if (p.priceOnRequest) {
              openLead(p);
            } else {
              cart.add(p);
              setAdded(true);
              clearTimeout(addedTimer.current);
              addedTimer.current = setTimeout(() => setAdded(false), 1200);
            }
          }}
        >
          {p.priceOnRequest ? "Запросить" : added ? "Добавлено" : "В корзину"}
        </Button>
      </div>
    </article>
  );
}
