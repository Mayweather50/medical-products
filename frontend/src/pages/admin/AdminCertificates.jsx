import { useEffect, useRef, useState } from "react";
import { Loading, LoadError } from "../../components/StateBlock";
import Button from "../../components/Button";
import ConfirmModal from "../../components/ConfirmModal";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { api } from "../../api";

const EMPTY_FORM = { title: "", description: "", fileUrl: "" };

export default function AdminCertificates() {
  const toast = useToast();
  const [certs, setCerts] = useState(null);
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
      setCerts(await api.admin.getCertificates());
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => { load(); }, []);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setFormErrors((prev) => ({ ...prev, fileUrl: undefined }));
    try {
      const { url } = await api.admin.uploadCertificateFile(file);
      setEditing((ed) => ({ ...ed, form: { ...ed.form, fileUrl: url } }));
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, fileUrl: err.message }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const openCreate = () => {
    setFormErrors({});
    setEditing({ cert: null, form: { ...EMPTY_FORM } });
  };

  const openEdit = (c) => {
    setFormErrors({});
    setEditing({
      cert: c,
      form: {
        title: c.title || "",
        description: c.description || "",
        fileUrl: c.fileUrl || "",
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
      description: f.description.trim() || null,
      fileUrl: f.fileUrl.trim(),
    };
    try {
      if (editing.cert) await api.admin.updateCertificate(editing.cert.id, payload);
      else await api.admin.createCertificate(payload);
      setEditing(null);
      toast.success(editing.cert ? "Сертификат обновлён" : "Сертификат добавлен");
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

  const doRemove = async () => {
    const c = confirmDelete;
    setConfirmDelete(null);
    try {
      await api.admin.deleteCertificate(c.id);
      toast.success(`Сертификат «${c.title}» удалён`);
      load();
    } catch (err) {
      toast.error("Не удалось удалить: " + err.message);
    }
  };

  const err = (key) => formErrors[key] && <span className="field__err">{formErrors[key]}</span>;

  return (
    <section>
      <div className="admin__head">
        <h2>Сертификаты {certs && <small>({certs.length})</small>}</h2>
        <Button variant="primary" size="sm" icon="plus" onClick={openCreate}>
          Добавить сертификат
        </Button>
      </div>

      {error ? (
        <LoadError error={error} retry={load} />
      ) : !certs ? (
        <Loading label="Загружаем сертификаты…" />
      ) : certs.length === 0 ? (
        <p className="admin__empty">Сертификатов нет.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Название</th>
                <th>Описание</th>
                <th>Файл</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><b>{c.title}</b></td>
                  <td className="admin-table__txt">{c.description || "—"}</td>
                  <td className="admin-table__txt">
                    <a href={c.fileUrl} target="_blank" rel="noreferrer">
                      <code>{c.fileUrl}</code>
                    </a>
                  </td>
                  <td className="admin-table__actions">
                    <button onClick={() => openEdit(c)} aria-label="Редактировать">
                      <Icon name="doc" size={16} />
                    </button>
                    <button className="is-danger" onClick={() => setConfirmDelete(c)} aria-label="Удалить">
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
              <h3>{editing.cert ? `Сертификат №${editing.cert.id}` : "Новый сертификат"}</h3>
            </div>

            <form className="lead-form admin-form" onSubmit={save} noValidate>
              <label className={"field" + (formErrors.title ? " field--err" : "")}>
                <span className="field__lbl">Название <i>*</i></span>
                <input
                  type="text"
                  value={editing.form.title}
                  onChange={setF("title")}
                  placeholder="Регистрационное удостоверение Росздравнадзора"
                />
                {err("title")}
              </label>

              <label className="field">
                <span className="field__lbl">Описание</span>
                <textarea
                  rows={2}
                  value={editing.form.description}
                  onChange={setF("description")}
                  placeholder="Номер документа и что он подтверждает"
                />
              </label>

              <div className={"field" + (formErrors.fileUrl ? " field--err" : "")}>
                <span className="field__lbl">Файл документа <i>*</i></span>
                <div className="cat-photo-edit">
                  <span className="banner-photo-edit__placeholder">
                    <Icon name="doc" size={26} />
                  </span>
                  <div className="cat-photo-edit__ctrl">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/pdf,image/*"
                      style={{ display: "none" }}
                      onChange={(e) => uploadFile(e.target.files?.[0])}
                    />
                    <Button
                      type="button" variant="outline" size="sm"
                      disabled={uploading}
                      onClick={() => fileRef.current && fileRef.current.click()}
                    >
                      {uploading ? "Загрузка…" : editing.form.fileUrl ? "Заменить файл" : "Загрузить файл"}
                    </Button>
                    {editing.form.fileUrl && (
                      <a
                        className="btn btn--ghost btn--sm"
                        href={editing.form.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>Открыть</span>
                      </a>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={editing.form.fileUrl}
                  onChange={setF("fileUrl")}
                  placeholder="/uploads/… или https://…"
                />
                {err("fileUrl")}
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
        title="Удалить сертификат?"
        message={confirmDelete ? `Сертификат «${confirmDelete.title}» будет удалён.` : ""}
        confirmLabel="Удалить"
        danger
        onConfirm={doRemove}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}
