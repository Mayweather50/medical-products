import { useEffect, useState } from "react";
import { Loading, LoadError } from "../../components/StateBlock";
import Button from "../../components/Button";
import ConfirmModal from "../../components/ConfirmModal";
import { useToast } from "../../components/Toast";
import { api } from "../../api";

export default function AdminTrash() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmPerm, setConfirmPerm] = useState(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    api.admin.getTrash()
      .then((data) => { setItems(data); setLoading(false); })
      .catch((err) => { setError(err); setLoading(false); });
  };

  useEffect(load, []);

  const restore = async (p) => {
    try {
      await api.admin.restoreProduct(p.id);
      toast.success(`Товар «${p.title}» восстановлен`);
      setItems((prev) => prev.filter((t) => t.id !== p.id));
    } catch (err) {
      toast.error("Не удалось восстановить: " + err.message);
    }
  };

  const doDeletePermanently = async () => {
    const p = confirmPerm;
    setConfirmPerm(null);
    try {
      await api.admin.deleteProductPermanently(p.id);
      toast.success(`Товар «${p.title}» удалён навсегда`);
      setItems((prev) => prev.filter((t) => t.id !== p.id));
    } catch (err) {
      toast.error("Не удалось удалить: " + err.message);
    }
  };

  const doEmptyTrash = async () => {
    setConfirmEmpty(false);
    try {
      const res = await api.admin.emptyTrash();
      toast.success(`Корзина очищена: удалено ${res?.deleted ?? items.length}`);
      setItems([]);
    } catch (err) {
      toast.error("Не удалось очистить корзину: " + err.message);
    }
  };

  return (
    <section>
      <div className="admin__head">
        <h2>Корзина {!loading && <small>({items.length})</small>}</h2>
        {!loading && items.length > 0 && (
          <Button variant="accent" size="sm" onClick={() => setConfirmEmpty(true)}>
            Удалить всё
          </Button>
        )}
      </div>

      {loading ? (
        <Loading label="Загружаем корзину…" />
      ) : error ? (
        <LoadError error={error} retry={load} />
      ) : items.length === 0 ? (
        <p className="admin__empty">Корзина пуста — удалённых товаров нет.</p>
      ) : (
        <div className="trash-list">
          {items.map((p) => (
            <div key={p.id} className="trash-item">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt="" className="trash-item__img" />
              ) : (
                <div className="trash-item__img trash-item__img--empty" />
              )}
              <div className="trash-item__info">
                <b>{p.title}</b>
                <span>{p.category?.title || "—"} · {p.article || "без артикула"}</span>
              </div>
              <div className="trash-item__actions">
                <Button variant="primary" size="sm" onClick={() => restore(p)}>
                  Восстановить
                </Button>
                <Button variant="accent" size="sm" onClick={() => setConfirmPerm(p)}>
                  Удалить навсегда
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmPerm}
        title="Удалить навсегда?"
        message={confirmPerm ? `Товар «${confirmPerm.title}» будет удалён безвозвратно. Это действие нельзя отменить.` : ""}
        confirmLabel="Удалить навсегда"
        danger
        onConfirm={doDeletePermanently}
        onCancel={() => setConfirmPerm(null)}
      />

      <ConfirmModal
        open={confirmEmpty}
        title="Очистить корзину?"
        message={`Все товары в корзине (${items.length}) будут удалены безвозвратно. Это действие нельзя отменить.`}
        confirmLabel="Удалить всё"
        danger
        onConfirm={doEmptyTrash}
        onCancel={() => setConfirmEmpty(false)}
      />
    </section>
  );
}
