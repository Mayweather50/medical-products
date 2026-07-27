import { useEffect, useRef, useState } from "react";
import { Loading, LoadError } from "../../components/StateBlock";
import Button from "../../components/Button";
import ConfirmModal from "../../components/ConfirmModal";
import { Icon, CatIcon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { api } from "../../api";
import { useCatalog } from "../../context/CatalogContext";

const EMPTY_FORM = {
  title: "", slug: "", shortTitle: "", description: "", icon: "clinic", photo: "",
};

const ICON_OPTIONS = [
  { key: "dental-unit", label: "Стоматологическая установка" },
  { key: "cadcam", label: "Cad/Cam, 3D" },
  { key: "lab", label: "Зуботехническая лаборатория" },
  { key: "anesthesia", label: "Анестезия" },
  { key: "consumables", label: "Расходные материалы" },
  { key: "ppe", label: "СИЗ / Маска" },
  { key: "diagnostics", label: "Диагностика" },
  { key: "rehab", label: "Реабилитация" },
  { key: "care", label: "Уход / Сердце" },
  { key: "disinfection", label: "Дезинфекция" },
  { key: "furniture", label: "Мебель" },
  { key: "clinic", label: "Клиника" },
];

const slugify = (s) =>
  s.toLowerCase()
    .replace(/[а-яё]/g, (ch) => ({
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
      й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
      у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
      э: "e", ю: "yu", я: "ya",
    }[ch] || ""))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminCategories() {
  const toast = useToast();
  const { categories, loading, error, reload } = useCatalog();
  const [editing, setEditing] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { reload(); }, []);

  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    setFormErrors((prev) => ({ ...prev, photo: undefined }));
    try {
      const { url } = await api.admin.uploadImage(file);
      setEditing((ed) => ({ ...ed, form: { ...ed.form, photo: url } }));
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, photo: err.message }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const openCreate = () => {
    setFormErrors({});
    setEditing({ category: null, form: { ...EMPTY_FORM } });
  };

  const openEdit = (c) => {
    setFormErrors({});
    setEditing({
      category: c,
      form: {
        title: c.title,
        slug: c.slug,
        shortTitle: c.shortTitle || "",
        description: c.description || "",
        icon: c.icon || "clinic",
        photo: c.imageUrl || "",
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
      slug: f.slug.trim(),
      shortTitle: f.shortTitle.trim() || null,
      description: f.description.trim() || null,
      // фото и иконка теперь независимы: иконка используется, когда фото нет
      imageUrl: f.photo || null,
      icon: f.icon,
    };
    try {
      if (editing.category) await api.admin.updateCategory(editing.category.id, payload);
      else await api.admin.createCategory(payload);
      setEditing(null);
      reload();
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

  const remove = (c) => setConfirmDelete(c);

  const doRemove = async () => {
    const c = confirmDelete;
    setConfirmDelete(null);
    try {
      await api.admin.deleteCategory(c.id);
      toast.success(`Категория «${c.title}» удалена`);
      reload();
    } catch (err) {
      toast.error("Не удалось удалить: " + err.message);
    }
  };

  const err = (key) => formErrors[key] && <span className="field__err">{formErrors[key]}</span>;

  return (
    <section>
      <div className="admin__head">
        <h2>Категории {categories && <small>({categories.length})</small>}</h2>
        <Button variant="primary" size="sm" icon="plus" onClick={openCreate}>
          Добавить категорию
        </Button>
      </div>

      {loading ? (
        <Loading label="Загружаем категории…" />
      ) : error ? (
        <LoadError error={error} retry={reload} />
      ) : categories.length === 0 ? (
        <p className="admin__empty">Категорий нет.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>№</th>
                <th></th>
                <th>Название</th>
                <th>URL-имя</th>
                <th>Описание</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {c.imageUrl ? (
                      <img className="admin-cat-thumb" src={c.imageUrl} alt="" />
                    ) : (
                      <CatIcon name={c.icon || "clinic"} size={22} />
                    )}
                  </td>
                  <td>
                    <b>{c.title}</b>
                    {c.shortTitle && c.shortTitle !== c.title && (
                      <div className="admin-table__sub">{c.shortTitle}</div>
                    )}
                  </td>
                  <td><code>{c.slug}</code></td>
                  <td className="admin-table__txt">{c.description || "—"}</td>
                  <td className="admin-table__actions">
                    <button onClick={() => openEdit(c)} aria-label="Редактировать">
                      <Icon name="doc" size={16} />
                    </button>
                    <button className="is-danger" onClick={() => remove(c)} aria-label="Удалить">
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
              <h3>{editing.category ? `Категория №${editing.category.id}` : "Новая категория"}</h3>
            </div>

            <form className="lead-form admin-form" onSubmit={save} noValidate>
              <label className={"field" + (formErrors.title ? " field--err" : "")}>
                <span className="field__lbl">Название <i>*</i></span>
                <input
                  type="text" value={editing.form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditing((ed) => ({
                      ...ed,
                      form: {
                        ...ed.form,
                        title,
                        slug: ed.category || ed.form.slugTouched ? ed.form.slug : slugify(title),
                      },
                    }));
                  }}
                />
                {err("title")}
              </label>

              <label className={"field" + (formErrors.slug ? " field--err" : "")}>
                <span className="field__lbl">URL-имя (латиницей) <i>*</i></span>
                <input
                  type="text" value={editing.form.slug}
                  onChange={(e) => setEditing((ed) => ({
                    ...ed, form: { ...ed.form, slug: e.target.value, slugTouched: true },
                  }))}
                />
                {err("slug")}
              </label>

              <label className={"field" + (formErrors.shortTitle ? " field--err" : "")}>
                <span className="field__lbl">
                  Короткое название <small>(для плиток и карточек товара)</small>
                </span>
                <input
                  type="text"
                  value={editing.form.shortTitle}
                  onChange={setF("shortTitle")}
                  placeholder={editing.form.title || "Совпадает с названием"}
                />
                {err("shortTitle")}
              </label>

              <div className={"field" + (formErrors.photo ? " field--err" : "")}>
                <span className="field__lbl">Фото категории</span>
                <div className="cat-photo-edit">
                  {editing.form.photo ? (
                    <img className="cat-photo-edit__preview" src={editing.form.photo} alt="" />
                  ) : (
                    <span className="cat-photo-edit__placeholder">
                      <CatIcon name={editing.form.icon} size={30} />
                    </span>
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
                      {uploading ? "Загрузка…" : editing.form.photo ? "Заменить фото" : "Загрузить фото"}
                    </Button>
                    {editing.form.photo && (
                      <Button
                        type="button" variant="ghost" size="sm"
                        onClick={() => setEditing((ed) => ({ ...ed, form: { ...ed.form, photo: "" } }))}
                      >
                        Убрать
                      </Button>
                    )}
                  </div>
                </div>
                {err("photo")}
              </div>

              <div className="field">
                <span className="field__lbl">
                  Иконка {editing.form.photo && <small>(показывается, если фото не загрузится)</small>}
                </span>
                <div className="icon-picker">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={"icon-picker__item" + (editing.form.icon === opt.key ? " is-active" : "")}
                      onClick={() => setEditing((ed) => ({ ...ed, form: { ...ed.form, icon: opt.key } }))}
                      title={opt.label}
                    >
                      <CatIcon name={opt.key} size={28} />
                    </button>
                  ))}
                </div>
              </div>

              <label className="field">
                <span className="field__lbl">Описание</span>
                <textarea rows={3} value={editing.form.description} onChange={setF("description")} />
              </label>

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
        title="Удалить категорию?"
        message={confirmDelete ? `Категория «${confirmDelete.title}» будет удалена.` : ""}
        confirmLabel="Удалить"
        danger
        onConfirm={doRemove}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}
