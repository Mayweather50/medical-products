import { useEffect, useState } from "react";
import { Loading, LoadError } from "../../components/StateBlock";
import Button from "../../components/Button";
import StatusBadge from "../../components/StatusBadge";
import { api } from "../../api";
import { STATUS_LABELS, STATUS_VALUES, fmtDate } from "./statuses";

const PAGE_SIZE = 20;

export default function AdminLeads() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api.admin
      .getLeads({ status: statusFilter || undefined, page, size: PAGE_SIZE })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
  };
  useEffect(load, [statusFilter, page]);

  const changeStatus = async (lead, status) => {
    try {
      const updated = await api.admin.updateLeadStatus(lead.id, status);
      setState((s) => ({
        ...s,
        data: {
          ...s.data,
          content: s.data.content.map((l) => (l.id === lead.id ? updated : l)),
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
        <h2>Заявки {d && <small>({d.totalElements})</small>}</h2>
        <div className="select">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            aria-label="Фильтр по статусу"
          >
            <option value="">Все статусы</option>
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {state.loading ? (
        <Loading label="Загружаем заявки…" />
      ) : state.error ? (
        <LoadError error={state.error} retry={load} />
      ) : d.content.length === 0 ? (
        <p className="admin__empty">Заявок нет.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Дата</th>
                  <th>Имя</th>
                  <th>Контакты</th>
                  <th>Товар / комментарий</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {d.content.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td className="admin-table__dt">{fmtDate(l.createdAt)}</td>
                    <td>{l.name}</td>
                    <td>
                      <a href={`tel:${l.phone}`}>{l.phone}</a>
                      {l.email && <><br /><a href={`mailto:${l.email}`}>{l.email}</a></>}
                    </td>
                    <td className="admin-table__txt">
                      {l.productName && <b>{l.productName}</b>}
                      {l.productName && l.comment && <br />}
                      {l.comment}
                    </td>
                    <td>
                      <StatusBadge
                        value={l.status}
                        options={STATUS_VALUES}
                        labels={STATUS_LABELS}
                        onChange={(s) => changeStatus(l, s)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
