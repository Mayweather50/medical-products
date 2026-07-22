import { useEffect, useRef, useState } from "react";
import { Loading, LoadError } from "../../components/StateBlock";
import Button from "../../components/Button";
import ConfirmModal from "../../components/ConfirmModal";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { api } from "../../api";

const EMPTY_FORM = {
  title: "",
  eyebrow: "",
  imageUrl: "",
  ctaLabel: "",
  linkUrl: "",
  tone: "teal",
  sortOrder: 0,
  active: true,
};

const TONE_OPTIONS = [
  { key: "teal", label: "Бирюзовый" },
  { key: "deep", label: "Глубокий" },
  { key: "azure", label: "Лазурный" },
];

export default function AdminBanners() {
  const toast = useToast();
  const [banners, setBanners] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    setError(null);
    try {
      setBanners(await api.admin.getBanners());
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => { load(); }, []);

  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    setFormErrors((prev) => ({ ...prev, imageUrl: undefined }));
    try {
      const { url } = await api.admin.uploadBannerImage(file);
      setEditing((ed) => ({ ...ed, form: { ...ed.form, imageUrl: url } }));
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, imageUrl: err.message }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const openCreate = () => {
    setFormErrors({});
    const nextOrder = banners?.length ? Math.max(...banners.map((b) => b.sortOrder ?? 0)) + 1 : 1;
    setEditing({ banner: null, form: { ...EMPTY_FORM, sortOrder: nextOrder } });
  };

  const openEdit = (b) => {
    setFormErrors({});
    setEditing({
      banner: b,
      form: {
        title: b.title || "",
        eyebrow: b.eyebrow || "",
        imageUrl: b.imageUrl || "",
        ctaLabel: b.ctaLabel || "",
        linkUrl: b.linkUrl || "",
        tone: b.tone || "teal",
        sortOrder: b.sortOrder ?? 0,
        active: b.active !== false,
      },
    });
  };

  const setF = (key) => (e) =>
    setEditing((ed) => ({ ...ed, form: { ...ed.form, [key]: e.target.value } }));

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    const f = editing.form;
    setSaving(true);
    setFormErrors({});
    const payload = {
      title: f.title.trim(),
      eyebrow: f.eyebrow.trim() || null,
      imageUrl: f.imageUrl || null,
      ctaLabel: f.ctaLabel.trim() || null,
      linkUrl: f.linkUrl.trim() || null,
      tone: f.tone,
      sortOrder: Number(f.sortOrder) || 0,
      active: f.active,
    };
    try {
      if (editing.banner) await api.admin.updateBanner(editing.banner.id, payload);
      else await api.admin.createBanner(payload);
      setEditing(null);
      toast.success(editing.banner ? "Баннер обновлён" : "Баннер добавлен");
      load();
    } catch (err) {
      if (err.fieldErrors?.length) {
        const er = {};
        err.fieldErrors.forEach((fe) => { er[fe.field] = fe.message; });
        setFormErrors(er);
      } else {
        setFormErrors({ _global: err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  /** Быстрое переключение показа слайда прямо из таблицы. */
  const toggleActive = async (b) => {
    try {
      await api.admin.updateBanner(b.id, {
        title: b.title,
        eyebrow: b.eyebrow,
        imageUrl: b.imageUrl,
        ctaLabel: b.ctaLabel,
        linkUrl: b.linkUrl,
        tone: b.tone,
        sortOrder: b.sortOrder,
        active: !b.active,
      });
      load();
    } catch (err) {
      toast.error("Не удалось изменить: " + err.message);
    }
  };

  const doRemove = async () => {
    const b = confirmDelete;
    setConfirmDelete(null);
    try {
      await api.admin.deleteBanner(b.id);
      toast.success(`Баннер «${b.title}» удалён`);
      load();
    } catch (err) {
      toast.error("Не удалось удалить: " + err.message);
    }
  };

  const err = (key) => formErrors[key] && <span className="field__err">{formErrors[key]}</span>;

  return (
    <section>
      <div className="admin__head">
        <h2>Баннеры {banners && <small>({banners.length})</small>}</h2>
        <Button variant="primary" size="sm" icon="plus" onClick={openCreate}>
          Добавить баннер
        </Button>
      </div>

      {error ? (
        <LoadError error={error} retry={load} />
      ) : !banners ? (
        <Loading label="Загружаем баннеры…" />
      ) : banners.length === 0 ? (
        <p className="admin__empty">Баннеров нет.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Фото</th>
                <th>Заголовок</th>
                <th>Кнопка</th>
                <th>Ссылка</th>
                <th>Порядок</th>
                <th>Показ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>
                    {b.imageUrl ? (
                      <img className="admin-banner-thumb" src={b.imageUrl} alt="" />
                    ) : (
                      <span className="admin-banner-thumb admin-banner-thumb--empty">—</span>
                    )}
                  </td>
                  <td>
                    <b>{b.title}</b>
                    {b.eyebrow && <div className="admin-table__sub">{b.eyebrow}</div>}
                  </td>
                  <td className="admin-table__txt">{b.ctaLabel || "—"}</td>
                  <td className="admin-table__txt"><code>{b.linkUrl || "—"}</code></td>
                  <td>{b.sortOrder}</td>
                  <td>
                    <button
                      type="button"
                      className={"admin-toggle" + (b.active ? " is-on" : "")}
                      onClick={() => toggleActive(b)}
                      aria-label={b.active ? "Скрыть баннер" : "Показать баннер"}
                    >
                      {b.active ? "Виден" : "Скрыт"}
                    </button>
                  </td>
                  <td className="admin-table__actions">
                    <button onClick={() => openEdit(b)} aria-label="Редактировать">
                      <Icon name="doc" size={16} />
                    </button>
                    <button className="is-danger" onClick={() => setConfirmDelete(b)} aria-label="Удалить">
                      <Icon name="close" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="modal" role="dialog" aria-modal="true">
            <button className="modal__close" onClick={() => setEditing(null)} aria-label="Закрыть">
              <Icon name="close" size={20} />
            </button>
            <div className="modal__head">
              <h3>{editing.banner ? `Баннер №${editing.banner.id}` : "Новый баннер"}</h3>
            </div>

            <form className="lead-form admin-form" onSubmit={save} noValidate>
              <div className={"field" + (formErrors.imageUrl ? " field--err" : "")}>
                <span className="field__lbl">Фото баннера</span>
                <div className="cat-photo-edit">
                  {editing.form.imageUrl ? (
                    <img className="banner-photo-edit__preview" src={editing.form.imageUrl} alt="" />
                  ) : (
                    <span className="banner-photo-edit__placeholder">Нет фото</span>
                  )}
                  <div className="cat-photo-edit__ctrl">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => uploadPhoto(e.target.files?.[0])}
                    />
                    <Button
                      type="button" variant="outline" size="sm"
                      disabled={uploading}
                      onClick={() => fileRef.current && fileRef.current.click()}
                    >
                      {uploading ? "Загрузка…" : editing.form.imageUrl ? "Заменить фото" : "Загрузить фото"}
                    </Button>
                    {editing.form.imageUrl && (
                      <Button
                        type="button" variant="ghost" size="sm"
                        onClick={() => setEditing((ed) => ({ ...ed, form: { ...ed.form, imageUrl: "" } }))}
                      >
                        Убрать
                      </Button>
                    )}
                  </div>
                </div>
                {err("imageUrl")}
              </div>

              <label className="field">
                <span className="field__lbl">Надпись над заголовком</span>
                <input type="text" value={editing.form.eyebrow} onChange={setF("eyebrow")} placeholder="Каталог" />
              </label>

              <label className={"field" + (formErrors.title ? " field--err" : "")}>
                <span className="field__lbl">Заголовок <i>*</i></span>
                <textarea rows={2} value={editing.form.title} onChange={setF("title")} />
                {err("title")}
              </label>

              <label className="field">
                <span className="field__lbl">Текст кнопки</span>
                <input type="text" value={editing.form.ctaLabel} onChange={setF("ctaLabel")} placeholder="Открыть каталог" />
              </label>

              <label className={"field" + (formErrors.linkUrl ? " field--err" : "")}>
                <span className="field__lbl">Ссылка кнопки</span>
                <input type="text" value={editing.form.linkUrl} onChange={setF("linkUrl")} placeholder="/catalog?cat=implantaty" />
                {err("linkUrl")}
              </label>

              <div className={"field" + (formErrors.tone ? " field--err" : "")}>
                <span className="field__lbl">Фон <small>(виден, если нет фото)</small></span>
                <div className="tone-picker">
                  {TONE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={
                        `tone-picker__item tone-picker__item--${opt.key}` +
                        (editing.form.tone === opt.key ? " is-active" : "")
                      }
                      onClick={() => setEditing((ed) => ({ ...ed, form: { ...ed.form, tone: opt.key } }))}
                      title={opt.label}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {err("tone")}
              </div>

              <label className="field">
                <span className="field__lbl">Порядок показа</span>
                <input type="number" value={editing.form.sortOrder} onChange={setF("sortOrder")} />
              </label>

              <div className="admin-form__checks">
                <label>
                  <input
                    type="checkbox"
                    checked={editing.form.active}
                    onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, active: e.target.checked } }))}
                  />
                  Показывать на сайте
                </label>
              </div>

              {formErrors._global && <div className="lead-form__error">{formErrors._global}</div>}

              <div className="admin-form__foot">
                <Button type="button" variant="outline" size="md" onClick={() => setEditing(null)}>
                  Отмена
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={saving}>
                  {saving ? "Сохраняем…" : "Сохранить"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Удалить баннер?"
        message={confirmDelete ? `Баннер «${confirmDelete.title}» будет удалён.` : ""}
        confirmLabel="Удалить"
        danger
        onConfirm={doRemove}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}
