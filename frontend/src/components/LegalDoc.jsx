import { useEffect } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import { useLegal } from "../lib/legal";

/** Общий каркас юридических страниц: хлебные крошки, заголовок, дата редакции. */
export default function LegalDoc({ title, lead, children }) {
  const LEGAL = useLegal();

  // на эти страницы приходят из футера — без сброса скролла документ
  // открывался бы с середины
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="wrap legal">
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: title }]} />

      <header className="legal__head">
        <h1 className="legal__title">{title}</h1>
        {lead && <p className="legal__lead">{lead}</p>}
        <p className="legal__meta">
          Редакция от {LEGAL.updatedAt} · {LEGAL.operator}
        </p>
      </header>

      <div className="legal__body">{children}</div>

      <nav className="legal__nav">
        <Link to="/privacy">Политика конфиденциальности</Link>
        <Link to="/cookie">Использование cookie</Link>
        <Link to="/terms">Пользовательское соглашение</Link>
      </nav>
    </div>
  );
}
