import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import ProductImage from "./ProductImage";
import { Icon } from "./Icon";
import { api } from "../api";

/* Модальное окно заявки. Отправляет POST /api/leads:
   name (required), phone (required), email, comment, productName. */

const EMPTY_FORM = { name: "", phone: "", email: "", comment: "" };

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

export default function LeadModal({ open, onClose, product }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSent(false);
      setErrors({});
      setSubmitError(null);
      setForm(EMPTY_FORM);
      setTimeout(() => firstRef.current && firstRef.current.focus(), 60);
    }
  }, [open, product]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Укажите имя";
    const digits = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) er.phone = "Укажите телефон";
    else if (digits.length < 10) er.phone = "Проверьте номер телефона";
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      er.email = "Проверьте e-mail";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate() || sending) return;

    setSending(true);
    setSubmitError(null);
    try {
      await api.createLead({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        comment: form.comment.trim() || null,
        productName: product ? product.title : null,
      });
      setSent(true);
    } catch (err) {
      // Ошибки валидации бэкенда раскладываем по полям формы
      if (err.fieldErrors?.length) {
        const er = {};
        err.fieldErrors.forEach((fe) => {
          er[fe.field] = fe.message;
        });
        setErrors(er);
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>

        {sent ? (
          <div className="lead-done">
            <div className="lead-done__ic">
              <Icon name="check" size={34} />
            </div>
            <h3>Заявка отправлена</h3>
            <p>
              Спасибо! Менеджер свяжется с вами в течение рабочего дня по указанному
              телефону.
            </p>
            <Button variant="primary" size="lg" onClick={onClose}>
              Хорошо
            </Button>
          </div>
        ) : (
          <>
            <div className="modal__head">
              <h3>{product ? "Запрос цены и наличия" : "Оставить заявку"}</h3>
              <p>
                {product
                  ? "Заполните контакты — пришлём актуальную цену, наличие и условия поставки."
                  : "Оставьте контакты, и менеджер подберёт товары под вашу задачу."}
              </p>
            </div>

            {product && (
              <div className="lead-prod">
                <ProductImage product={product} size={30} className="lead-prod__img" />
                <div className="lead-prod__t">
                  <b>{product.title}</b>
                  <small>Артикул {product.article}</small>
                </div>
              </div>
            )}

            <form className="lead-form" onSubmit={submit} noValidate>
              <label className={"field" + (errors.name ? " field--err" : "")}>
                <span className="field__lbl">
                  Имя <i>*</i>
                </span>
                <input
                  ref={firstRef}
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Иван Петров"
                />
                {errors.name && <span className="field__err">{errors.name}</span>}
              </label>

              <label className={"field" + (errors.phone ? " field--err" : "")}>
                <span className="field__lbl">
                  Телефон <i>*</i>
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                  placeholder="+7 (900) 123-45-67"
                />
                {errors.phone && <span className="field__err">{errors.phone}</span>}
              </label>

              <label className={"field" + (errors.email ? " field--err" : "")}>
                <span className="field__lbl">E-mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="ivan@example.com"
                />
                {errors.email && <span className="field__err">{errors.email}</span>}
              </label>

              <label className="field">
                <span className="field__lbl">Комментарий</span>
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={set("comment")}
                  placeholder={
                    product
                      ? "Например: интересует опт от 10 упаковок"
                      : "Опишите, что вас интересует"
                  }
                />
              </label>

              {submitError && <div className="lead-form__error">{submitError}</div>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                iconRight="arrow"
                className="lead-form__submit"
                disabled={sending}
              >
                {sending ? "Отправляем…" : "Отправить заявку"}
              </Button>
              <p className="lead-form__note">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
