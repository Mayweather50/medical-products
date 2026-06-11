import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icon";

/** items: [{ label, to? }] — элементы без `to` отображаются как текущая страница. */
export default function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs">
      {items.map((it, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className="crumbs__sep">
              <Icon name="chevron" size={14} />
            </span>
          )}
          {it.to ? (
            <Link to={it.to}>{it.label}</Link>
          ) : (
            <span className="crumbs__cur">{it.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
