import { useEffect, useState } from "react";
import { Loading, LoadError } from "../../components/StateBlock";
import Button from "../../components/Button";
import { api } from "../../api";
import { ORDER_STATUS_LABELS, STATUS_VALUES, fmtDate } from "./statuses";

const PAGE_SIZE = 20;

export default function AdminOrders() {
  const [page, setPage] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api.admin
      .getOrders({ page, size: PAGE_SIZE })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
  };
  useEffect(load, [page]);

  const changeStatus = async (order, status) => {
    try {
      const updated = await api.admin.updateOrderStatus(order.id, status);
      setState((s) => ({
        ...s,
        data: {
          ...s.data,
          content: s.data.content.map((o) => (o.id === order.id ? updated : o)),
        },
      }));
    } catch (err) {
      alert("Не удалось обновить статус: " + err.message);
    }
  };

  const d = state.data;

  return (
    <section>
      <div className="admin__head">
        <h2>Заказы {d && <small>({d.totalElements})</small>}</h2>
      </div>

      {state.loading ? (
        <Loading label="Загружаем заказы…" />
      ) : state.error ? (
        <LoadError error={state.error} retry={load} />
      ) : d.content.length === 0 ? (
        <p className="admin__empty">Заказов пока нет.</p>
      ) : (
        <>
          <div className="admin-orders">
            {d.content.map((o) => (
              <article key={o.id} className="admin-order">
                <div className="admin-order__head">
                  <b>Заказ №{o.id}</b>
                  <span className="admin-table__dt">{fmtDate(o.createdAt)}</span>
                  <span>
                    {o.customerName}, <a href={`tel:${o.customerPhone}`}>{o.customerPhone}</a>
                  </span>
                  <div className="select select--sm">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o, e.target.value)}
                      data-status={o.status}
                    >
                      {STATUS_VALUES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {o.comment && <p className="admin-order__comment">{o.comment}</p>}
                <ul className="admin-order__items">
                  {o.items.map((it) => (
                    <li key={it.productId}>
                      <span>{it.productTitle}</span>
                      <code>{it.article}</code>
                      <b>× {it.quantity}</b>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {d.totalPages > 1 && (
            <div className="admin__pager">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Назад
              </Button>
              <span>{page + 1} / {d.totalPages}</span>
              <Button variant="outline" size="sm" disabled={!d.hasNext} onClick={() => setPage(page + 1)}>
                Вперёд
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
