/* Модальное окно заявки (lead). Соответствует POST /api/leads:
   name (required), phone (required), email, comment, productName. */
(function () {
  const React = window.React;
  const { useState, useEffect, useRef } = React;
  const h = React.createElement;
  const Icon = window.Icon;
  const Button = window.Button;
  const ProductImage = window.ProductImage;

  function LeadModal(props) {
    const { open, onClose, product } = props;
    const [form, setForm] = useState({ name: "", phone: "", email: "", comment: "" });
    const [errors, setErrors] = useState({});
    const [sent, setSent] = useState(false);
    const firstRef = useRef(null);

    useEffect(() => {
      if (open) {
        setSent(false);
        setErrors({});
        setForm({ name: "", phone: "", email: "",
          comment: product ? "" : "" });
        setTimeout(() => firstRef.current && firstRef.current.focus(), 60);
      }
    }, [open, product]);

    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const set = (k) => (e) => setForm((f) => Object.assign({}, f, { [k]: e.target.value }));

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

    const submit = (e) => {
      e.preventDefault();
      if (!validate()) return;
      // payload, который ушёл бы на POST /api/leads
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        comment: form.comment.trim() || null,
        productName: product ? product.title : null,
      };
      console.log("POST /api/leads", payload);
      setSent(true);
    };

    return h(
      "div",
      { className: "modal-overlay", onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
      h(
        "div",
        { className: "modal", role: "dialog", "aria-modal": "true", "data-screen-label": "Заявка" },
        h("button", { className: "modal__close", onClick: onClose, "aria-label": "Закрыть" },
          h(Icon, { name: "close", size: 20 })),
        sent
          ? h(
              "div",
              { className: "lead-done" },
              h("div", { className: "lead-done__ic" }, h(Icon, { name: "check", size: 34 })),
              h("h3", null, "Заявка отправлена"),
              h("p", null, "Спасибо! Менеджер свяжется с вами в течение рабочего дня по указанному телефону."),
              h(Button, { variant: "primary", size: "lg", onClick: onClose }, "Хорошо")
            )
          : h(
              React.Fragment,
              null,
              h(
                "div",
                { className: "modal__head" },
                h("h3", null, product ? "Запрос цены и наличия" : "Оставить заявку"),
                h("p", null, product
                  ? "Заполните контакты — пришлём актуальную цену, наличие и условия поставки."
                  : "Оставьте контакты, и менеджер подберёт товары под вашу задачу.")
              ),
              product
                ? h(
                    "div",
                    { className: "lead-prod" },
                    h(ProductImage, { product: product, size: 30, className: "lead-prod__img" }),
                    h("div", { className: "lead-prod__t" },
                      h("b", null, product.title),
                      h("small", null, "Артикул " + product.article)
                    )
                  )
                : null,
              h(
                "form",
                { className: "lead-form", onSubmit: submit, noValidate: true },
                h(
                  "label",
                  { className: "field" + (errors.name ? " field--err" : "") },
                  h("span", { className: "field__lbl" }, "Имя ", h("i", null, "*")),
                  h("input", { ref: firstRef, type: "text", value: form.name, onChange: set("name"), placeholder: "Иван Петров" }),
                  errors.name ? h("span", { className: "field__err" }, errors.name) : null
                ),
                h(
                  "label",
                  { className: "field" + (errors.phone ? " field--err" : "") },
                  h("span", { className: "field__lbl" }, "Телефон ", h("i", null, "*")),
                  h("input", { type: "tel", value: form.phone, onChange: set("phone"), placeholder: "+7 (900) 123-45-67" }),
                  errors.phone ? h("span", { className: "field__err" }, errors.phone) : null
                ),
                h(
                  "label",
                  { className: "field" + (errors.email ? " field--err" : "") },
                  h("span", { className: "field__lbl" }, "E-mail"),
                  h("input", { type: "email", value: form.email, onChange: set("email"), placeholder: "ivan@example.com" }),
                  errors.email ? h("span", { className: "field__err" }, errors.email) : null
                ),
                h(
                  "label",
                  { className: "field" },
                  h("span", { className: "field__lbl" }, "Комментарий"),
                  h("textarea", { rows: 3, value: form.comment, onChange: set("comment"),
                    placeholder: product ? "Например: интересует опт от 10 упаковок" : "Опишите, что вас интересует" })
                ),
                h(Button, { type: "submit", variant: "primary", size: "lg", iconRight: "arrow", className: "lead-form__submit" }, "Отправить заявку"),
                h("p", { className: "lead-form__note" },
                  "Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.")
              )
            )
      )
    );
  }

  window.LeadModal = LeadModal;
})();
