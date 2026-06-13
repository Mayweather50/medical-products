import { useEffect, useRef, useState } from "react";
import { Loading, LoadError } from "../../components/StateBlock";
import Button from "../../components/Button";
import { Icon } from "../../components/Icon";
import { api } from "../../api";
import { fmtPrice } from "../../lib/format";
import { useCatalog } from "../../context/CatalogContext";

const PAGE_SIZE = 20;

const EMPTY_FORM = {
  title: "",
  slug: "",
  article: "",
  categoryId: "",
  price: "",
  priceOnRequest: false,
  shortDescription: "",
  description: "",
  imageUrl: "",
  available: true,
  popular: false,
  characteristics: "",
};

/* Характеристики редактируются текстом, по строке «ключ: значение» —
   проще, чем динамические поля, и достаточно для словаря на бэке. */
const charsToText = (chars) =>
  Object.entries(chars || {}).map(([k, v]) => `${k}: ${v}`).join("\n");

const textToChars = (text) => {
  const result = {};
  text.split("\n").forEach((line) => {
    const i = line.indexOf(":");
    if (i > 0) {
      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();
      if (key && value) result[key] = value;
    }
  });
  return result;
};

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

export default function AdminProducts() {
  const { categories, reload: reloadCategories } = useCatalog();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const [editing, setEditing] = useState(null); // null | { product|null, form }
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .getProducts({ query: query || undefined, page, size: PAGE_SIZE })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }));
  };
  useEffect(load, [page, query]);

  const openCreate = () => {
    setFormErrors({});
    setEditing({ product: null, form: { ...EMPTY_FORM, categoryId: categories[0]?.id || "" } });
  };

  const openEdit = (p) => {
    setFormErrors({});
    setEditing({
      product: p,
      form: {
        title: p.title,
        slug: p.slug,
        article: p.article || "",
        categoryId: p.category.id,
        price: p.price ?? "",
        priceOnRequest: p.priceOnRequest,
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        imageUrl: p.imageUrl || "",
        available: p.available,
        popular: p.popular,
        characteristics: charsToText(p.characteristics),
      },
    });
  };

  const setF = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditing((ed) => ({ ...ed, form: { ...ed.form, [key]: value } }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    const f = editing.form;
    setSaving(true);
    setFormErrors({});
    const payload = {
      title: f.title.trim(),
      slug: f.slug.trim(),
      article: f.article.trim() || null,
      categoryId: Number(f.categoryId),
      price: f.priceOnRequest || f.price === "" ? null : Number(f.price),
      priceOnRequest: f.priceOnRequest,
      shortDescription: f.shortDescription.trim() || null,
      description: f.description.trim() || null,
      imageUrl: f.imageUrl.trim() || null,
      available: f.available,
      popular: f.popular,
      characteristics: textToChars(f.characteristics),
    };
    try {
      if (editing.product) await api.admin.updateProduct(editing.product.id, payload);
      else await api.admin.createProduct(payload);
      setEditing(null);
      load();
      reloadCategories?.();
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

  const remove = async (p) => {
    if (!confirm(`Удалить товар «${p.title}»?`)) return;
    try {
      await api.admin.deleteProduct(p.id);
      load();
      reloadCategories?.();
    } catch (err) {
      alert("Не удалось удалить: " + err.message);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const { url } = await api.admin.uploadImage(file);
      setEditing((ed) => ({ ...ed, form: { ...ed.form, imageUrl: url } }));
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, imageUrl: err.message }));
    } finally {
      setUploading(false);
      if (imgRef.current) imgRef.current.value = "";
    }
  };

  const importExcel = async (file) => {
    setImporting(true);
    setImportResult(null);
    try {
      const result = await api.admin.importProducts(file);
      setImportResult(result);
      load();
      reloadCategories?.();
    } catch (err) {
      setImportResult({ totalRows: 0, successCount: 0, failedCount: 0, errors: [err.message] });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const d = state.data;
  const err = (key) => formErrors[key] && <span className="field__err">{formErrors[key]}</span>;

  return (
    <section>
      <div className="admin__head">
        <h2>Товары {d && <small>({d.totalElements})</small>}</h2>
        <div className="admin__head-actions">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => e.target.files[0] && importExcel(e.target.files[0])}
          />
          <Button variant="outline" size="sm" icon="doc" disabled={importing}
                  onClick={() => fileRef.current?.click()}>
            {importing ? "Импортируем…" : "Импорт из Excel"}
          </Button>
          <Button variant="primary" size="sm" icon="plus" onClick={openCreate}>
            Добавить товар
          </Button>
        </div>
      </div>

      {importResult && (
        <div className={"admin-import" + (importResult.failedCount ? " admin-import--warn" : "")}>
          <b>Импорт:</b> строк {importResult.totalRows}, загружено {importResult.successCount},
          с ошибками {importResult.failedCount}
          {importResult.errors?.length > 0 && (
            <ul>{importResult.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          )}
          <button className="admin-import__close" onClick={() => setImportResult(null)} aria-label="Скрыть">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      <div className="admin__search">
        <input
          type="text"
          value={query}
          placeholder="Поиск по названию или артикулу…"
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        />
      </div>

      {state.loading ? (
        <Loading label="Загружаем товары…" />
      ) : state.error ? (
        <LoadError error={state.error} retry={load} />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Название</th>
                  <th>Артикул</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Флаги</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {d.content.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td className="admin-table__txt"><b>{p.title}</b></td>
                    <td><code>{p.article}</code></td>
                    <td>{p.category.title}</td>
                    <td>{p.priceOnRequest ? "по запросу" : fmtPrice(p.price)}</td>
                    <td className="admin-table__flags">
                      {p.available ? "в наличии" : "под заказ"}
                      {p.popular && " · хит"}
                    </td>
                    <td className="admin-table__actions">
                      <button onClick={() => openEdit(p)} aria-label="Редактировать">
                        <Icon name="doc" size={16} />
                      </button>
                      <button className="is-danger" onClick={() => remove(p)} aria-label="Удалить">
                        <Icon name="close" size={16} />
                      </button>
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

      {editing && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="modal modal--wide" role="dialog" aria-modal="true">
            <button className="modal__close" onClick={() => setEditing(null)} aria-label="Закрыть">
              <Icon name="close" size={20} />
            </button>
            <div className="modal__head">
              <h3>{editing.product ? `Товар №${editing.product.id}` : "Новый товар"}</h3>
            </div>

            <form className="lead-form admin-form" onSubmit={save} noValidate>
              <div className="admin-form__grid">
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
                          // слаг автозаполняется только для нового товара, пока его не правили вручную
                          slug: ed.product || ed.form.slugTouched ? ed.form.slug : slugify(title),
                        },
                      }));
                    }}
                  />
                  {err("title")}
                </label>

                <label className={"field" + (formErrors.slug ? " field--err" : "")}>
                  <span className="field__lbl">Slug <i>*</i></span>
                  <input
                    type="text" value={editing.form.slug}
                    onChange={(e) => setEditing((ed) => ({
                      ...ed, form: { ...ed.form, slug: e.target.value, slugTouched: true },
                    }))}
                  />
                  {err("slug")}
                </label>

                <label className="field">
                  <span className="field__lbl">Артикул</span>
                  <input type="text" value={editing.form.article} onChange={setF("article")} />
                </label>

                <label className={"field" + (formErrors.categoryId ? " field--err" : "")}>
                  <span className="field__lbl">Категория <i>*</i></span>
                  <div className="select">
                    <select value={editing.form.categoryId} onChange={setF("categoryId")}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  {err("categoryId")}
                </label>

                <label className={"field" + (formErrors.price || formErrors.priceValid ? " field--err" : "")}>
                  <span className="field__lbl">Цена, ₽</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={editing.form.price}
                    onChange={setF("price")}
                    disabled={editing.form.priceOnRequest}
                  />
                  {err("price")}{err("priceValid")}
                </label>

                <div className={"field" + (formErrors.imageUrl ? " field--err" : "")}>
                  <span className="field__lbl">Изображение</span>
                  <input
                    ref={imgRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])}
                  />
                  <div className="admin-form__image-upload">
                    {editing.form.imageUrl && (
                      <div className="admin-form__image-preview">
                        <img src={editing.form.imageUrl} alt="Превью" />
                        <button type="button" className="admin-form__image-remove"
                                onClick={() => setEditing((ed) => ({ ...ed, form: { ...ed.form, imageUrl: "" } }))}>
                          <Icon name="close" size={14} />
                        </button>
                      </div>
                    )}
                    <Button type="button" variant="outline" size="sm" icon="doc" disabled={uploading}
                            onClick={() => imgRef.current?.click()}>
                      {uploading ? "Загружаем…" : editing.form.imageUrl ? "Заменить" : "Загрузить"}
                    </Button>
                  </div>
                  {err("imageUrl")}
                </div>
              </div>

              <div className="admin-form__checks">
                <label><input type="checkbox" checked={editing.form.priceOnRequest} onChange={setF("priceOnRequest")} /> Цена по запросу</label>
                <label><input type="checkbox" checked={editing.form.available} onChange={setF("available")} /> В наличии</label>
                <label><input type="checkbox" checked={editing.form.popular} onChange={setF("popular")} /> Хит (популярное)</label>
              </div>

              <label className={"field" + (formErrors.shortDescription ? " field--err" : "")}>
                <span className="field__lbl">Краткое описание</span>
                <textarea rows={2} value={editing.form.shortDescription} onChange={setF("shortDescription")} />
                {err("shortDescription")}
              </label>

              <label className="field">
                <span className="field__lbl">Описание</span>
                <textarea rows={4} value={editing.form.description} onChange={setF("description")} />
              </label>

              <label className="field">
                <span className="field__lbl">Характеристики (по строке «ключ: значение»)</span>
                <textarea
                  rows={4}
                  value={editing.form.characteristics}
                  onChange={setF("characteristics")}
                  placeholder={"Материал: нитрил\nРазмер: M"}
                />
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
    </section>
  );
}
