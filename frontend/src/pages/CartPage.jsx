import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Button from "../components/Button";
import ConsentCheckbox from "../components/ConsentCheckbox";
import ProductImage from "../components/ProductImage";
import { Icon } from "../components/Icon";
import { api } from "../api";
import { fmtPrice, plural } from "../lib/format";
import { useCart } from "../context/CartContext";
import { usePageTitle } from "../lib/usePageTitle";

const EMPTY_FORM = { name: "", phone: "", comment: "" };

function formatPhone(value) {
  const digits = value.replace(/\D/g, "");
  const d = digits.startsWith("8") ? "7" + digits.slice(1) : digits;
  let result = "";
  if (d.length > 0) result = "+" + d.slice(0, 1);
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length > 4) result += ") " + d.slice(4, 7);
  if (d.length > 7) result += "-" + d.slice(7, 9);
  if (d.length > 9) result += "-" + d.slice(9, 11);
  return result;
}

export default function CartPage() {
  usePageTitle("Корзина");
  const navigate = useNavigate();
  const cart = useCart();

  const [form, setForm] = useState(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [sending, setSending] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Укажите имя";
    const digits = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) er.phone = "Укажите телефон";
    else if (digits.length < 10) er.phone = "Проверьте номер телефона";
    if (!consent) er.consent = "Требуется согласие на обработку персональных данных";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate() || sending) return;

    setSending(true);
    setSubmitError(null);
    try {
      const order = await api.createOrder({
        name: form.name.trim(),
        phone: form.phone.trim(),
        comment: form.comment.trim() || null,
        items: cart.items.map((it) => ({ productId: it.product.id, quantity: it.qty })),
      });
      setPlacedOrder(order);
      cart.clear();
    } catch (err) {
      if (err.fieldErrors?.length) {
        const er = {};
        err.fieldErrors.forEach((fe) => { er[fe.field] = fe.message; });
        setErrors(er);
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setSending(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="wrap section">
        <div className="lead-done cart-done">
          <div className="lead-done__ic">
            <Icon name="check" size={34} />
          </div>
          <h3>Заказ №{placedOrder.id} оформлен</h3>
          <p>
            Спасибо! Менеджер свяжется с вами по телефону для подтверждения
            состава, цены и сроков доставки.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate("/catalog")}>
            Вернуться в каталог
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-cart">
      <div className="wrap catalog-top">
        <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Корзина" }]} />
        <h1 className="catalog-title">Корзина</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="wrap section">
          <div className="empty">
            <span className="empty__ic">
              <Icon name="cart" size={30} />
            </span>
            <h3>Корзина пуста</h3>
            <p>Добавьте товары из каталога — и оформите заказ в пару кликов.</p>
            <Button variant="primary" size="md" onClick={() => navigate("/catalog")}>
              Перейти в каталог
            </Button>
          </div>
        </div>
      ) : (
        <div className="wrap cart-layout">
          <div className="cart-items">
            {cart.items.map(({ product: p, qty }) => (
              <article key={p.id} className="cart-item">
                <Link to={`/product/${p.slug}`} className="cart-item__img">
                  <ProductImage product={p} size={36} />
                </Link>
                <div className="cart-item__main">
                  <Link to={`/product/${p.slug}`} className="cart-item__title">{p.title}</Link>
                  <span className="cart-item__art">Артикул {p.article}</span>
                  <span className="cart-item__price">
                    {p.priceOnRequest ? "Цена по запросу" : `${fmtPrice(p.price)} / шт.`}
                  </span>
                </div>
                <div className="cart-item__side">
                  <div className="qty">
                    <button onClick={() => cart.setQty(p.id, qty - 1)} aria-label="Меньше">
                      <Icon name="minus" size={15} />
                    </button>
                    <span>{qty}</span>
                    <button onClick={() => cart.setQty(p.id, qty + 1)} aria-label="Больше">
                      <Icon name="plus" size={15} />
                    </button>
                  </div>
                  <span className="cart-item__sum">
                    {p.priceOnRequest ? "—" : fmtPrice((p.price || 0) * qty)}
                  </span>
                  <button
                    className="cart-item__rm"
                    onClick={() => cart.remove(p.id)}
                    aria-label="Удалить из корзины"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h3 className="cart-summary__title">Оформление заказа</h3>
            <div className="cart-summary__row">
              <span>
                {cart.count} {plural(cart.count, ["товар", "товара", "товаров"])}
              </span>
              <b>{fmtPrice(cart.total)}</b>
            </div>
            {cart.hasOnRequest && (
              <p className="cart-summary__note">
                Часть товаров — с ценой по запросу: менеджер уточнит итоговую
                стоимость при подтверждении.
              </p>
            )}

            <form className="lead-form" onSubmit={submit} noValidate>
              <label className={"field" + (errors.name ? " field--err" : "")}>
                <span className="field__lbl">Имя <i>*</i></span>
                <input type="text" value={form.name} onChange={set("name")} placeholder="Иван Петров" />
                {errors.name && <span className="field__err">{errors.name}</span>}
              </label>

              <label className={"field" + (errors.phone ? " field--err" : "")}>
                <span className="field__lbl">Телефон <i>*</i></span>
                <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))} placeholder="+7 (900) 123-45-67" />
                {errors.phone && <span className="field__err">{errors.phone}</span>}
              </label>

              <label className="field">
                <span className="field__lbl">Комментарий</span>
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={set("comment")}
                  placeholder="Например: нужна доставка до склада"
                />
              </label>

              <ConsentCheckbox
                checked={consent}
                onChange={(v) => {
                  setConsent(v);
                  if (v) setErrors((er) => ({ ...er, consent: undefined }));
                }}
                error={errors.consent}
              />

              {submitError && <div className="lead-form__error">{submitError}</div>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                iconRight="arrow"
                className="lead-form__submit"
                disabled={sending}
              >
                {sending ? "Оформляем…" : "Оформить заказ"}
              </Button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
