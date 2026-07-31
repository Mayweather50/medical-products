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

/* Куда ведёт баннер: готовые варианты вместо ручного ввода адреса. */
const LINK_KINDS = [
  { key: "none", label: "Без ссылки" },
  { key: "catalog", label: "Весь каталог" },
  { key: "category", label: "Категория" },
  { key: "product", label: "Карточка товара" },
  { key: "custom", label: "Свой адрес" },
];

function parseLink(url) {
  if (!url) return { kind: "none", value: "" };
  if (url === "/catalog") return { kind: "catalog", value: "" };
  const cat = /^\/catalog\?cat=([a-z0-9-]+)$/.exec(url);
  if (cat) return { kind: "category", value: cat[1] };
  const prod = /^\/product\/([a-z0-9-]+)$/.exec(url);
  if (prod) return { kind: "product", value: prod[1] };
  return { kind: "custom", value: url };
}

function buildLink(kind, value) {
  if (kind === "catalog") return "/catalog";
  if (kind === "category") return value ? `/catalog?cat=${value}` : "";
  if (kind === "product") return value ? `/product/${value}` : "";
  if (kind === "custom") return value.trim();
  return "";
}

export default function AdminBanners() {
  const toast = useToast();
  const [banners, setBanners] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [cats, setCats] = useState([]);
  const [prods, setProds] = useState([]);
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

  /* Списки для выбора цели ссылки */
  useEffect(() => {
    api.getCategories().then(setCats).catch(() => setCats([]));
    api.getProducts({ size: 100 }).then((p) => setProds(p?.content || [])).catch(() => setProds([]));
  }, []);

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
    setEditing({ banner: null, form: { ...EMPTY_FORM, sortOrder: nextOrder }, link: { kind: "none", value: "" } });
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
      link: parseLink(b.linkUrl || ""),
    });
  };

  const setLink = (patch) =>
    setEditing((ed) => {
      const link = { ...ed.link, ...patch };
      return { ...ed, link, form: { ...ed.form, linkUrl: buildLink(link.kind, link.value) } };
    });

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

              <div className={"field" + (formErrors.linkUrl ? " field--err" : "")}>
                <span className="field__lbl">
                  Куда ведёт баннер <small>(кликабелен весь слайд, не только кнопка)</small>
                </span>
                <div className="link-picker">
                  {LINK_KINDS.map((k) => (
                    <button
                      key={k.key}
                      type="button"
                      className={"link-picker__item" + (editing.link.kind === k.key ? " is-active" : "")}
                      onClick={() => setLink({ kind: k.key, value: "" })}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>

                {editing.link.kind === "category" && (
                  <select
                    className="admin-select"
                    value={editing.link.value}
                    onChange={(e) => setLink({ value: e.target.value })}
                  >
                    <option value="">— выберите категорию —</option>
                    {cats
                      .filter((c) => !c.parentId)
                      .map((top) => (
                        <optgroup key={top.id} label={top.title}>
                          <option value={top.slug}>{top.title} — весь раздел</option>
                          {cats
                            .filter((c) => c.parentId === top.id)
                            .map((sub) => (
                              <option key={sub.id} value={sub.slug}>&nbsp;&nbsp;{sub.title}</option>
                            ))}
                        </optgroup>
                      ))}
                  </select>
                )}

                {editing.link.kind === "product" && (
                  <select
                    className="admin-select"
                    value={editing.link.value}
                    onChange={(e) => setLink({ value: e.target.value })}
                  >
                    <option value="">— выберите товар —</option>
                    {prods.map((p) => (
                      <option key={p.id} value={p.slug}>{p.title}</option>
                    ))}
                  </select>
                )}

                {editing.link.kind === "custom" && (
                  <input
                    type="text"
                    value={editing.link.value}
                    onChange={(e) => setLink({ value: e.target.value })}
                    placeholder="/catalog?cat=sterilizatsiya"
                  />
                )}

                {editing.form.linkUrl && (
                  <span className="field__hint">Адрес: <code>{editing.form.linkUrl}</code></span>
                )}
                {err("linkUrl")}
              </div>

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
