import { useEffect, useState } from "react";
import { Loading, LoadError } from "../../components/StateBlock";
import Button from "../../components/Button";
import { useToast } from "../../components/Toast";
import { api } from "../../api";
import { useSettings } from "../../context/SettingsContext";

/* Все тексты и контакты, которые раньше были зашиты в коде фронтенда.
   Группы — только для читаемости формы; на бэкенде это плоский набор ключей. */

const GROUPS = [
  {
    title: "Контакты",
    hint: "Показываются в подвале сайта и подставляются в юридические документы.",
    fields: [
      { key: "brand", label: "Название сайта" },
      { key: "phone", label: "Телефон", placeholder: "8 800 123-45-67" },
      { key: "phone_href", label: "Телефон для ссылки tel:", placeholder: "+78001234567" },
      { key: "email", label: "E-mail", placeholder: "zakaz@example.ru" },
      { key: "address", label: "Адрес" },
      { key: "site", label: "Домен сайта", placeholder: "example.ru" },
    ],
  },
  {
    title: "Реквизиты для юридических страниц",
    hint:
      "Без этих полей политика конфиденциальности и пользовательское соглашение " +
      "юридической силы не имеют — на страницах вместо них выводится «не указано».",
    fields: [
      { key: "legal_operator", label: "Полное наименование организации", placeholder: "ООО «Ромашка»" },
      { key: "legal_inn", label: "ИНН" },
      { key: "legal_ogrn", label: "ОГРН" },
      { key: "legal_address", label: "Юридический адрес", area: true },
      { key: "legal_updated_at", label: "Дата редакции документов", placeholder: "27 июля 2026 г." },
    ],
  },
  {
    title: "Подвал",
    fields: [
      { key: "footer_about", label: "Описание компании", area: true },
      { key: "footer_note", label: "Предупреждение внизу страницы", area: true },
      { key: "cta_title", label: "Заголовок блока «Связаться»" },
      { key: "cta_text", label: "Текст блока «Связаться»", area: true },
    ],
  },
  {
    title: "Заголовки на главной",
    fields: [
      { key: "categories_title", label: "Категории — заголовок" },
      { key: "categories_sub", label: "Категории — подпись", hint: "Перед текстом подставляется число направлений" },
      { key: "popular_title", label: "Популярные товары — заголовок" },
      { key: "popular_sub", label: "Популярные товары — подпись" },
      { key: "certs_title", label: "Сертификаты — заголовок" },
      { key: "certs_sub", label: "Сертификаты — подпись", area: true },
    ],
  },
];

export default function AdminSettings() {
  const toast = useToast();
  const { reload: reloadSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setForm(await api.admin.getSettings());
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => { load(); }, []);

  const setF = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      setForm(await api.admin.updateSettings(form));
      reloadSettings(); // чтобы подвал и шапка обновились сразу
      toast.success("Настройки сохранены");
    } catch (err) {
      toast.error("Не удалось сохранить: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <LoadError error={error} retry={load} />;
  if (!form) return <Loading label="Загружаем настройки…" />;

  return (
    <section>
      <div className="admin__head">
        <h2>Настройки сайта</h2>
      </div>

      <form className="admin-settings" onSubmit={save}>
        {GROUPS.map((g) => (
          <fieldset key={g.title} className="admin-settings__group">
            <legend>{g.title}</legend>
            {g.hint && <p className="admin-settings__hint">{g.hint}</p>}
            <div className="admin-settings__fields">
              {g.fields.map((f) => (
                <label className="field" key={f.key}>
                  <span className="field__lbl">
                    {f.label} {f.hint && <small>({f.hint})</small>}
                  </span>
                  {f.area ? (
                    <textarea
                      rows={2}
                      value={form[f.key] ?? ""}
                      onChange={setF(f.key)}
                      placeholder={f.placeholder}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[f.key] ?? ""}
                      onChange={setF(f.key)}
                      placeholder={f.placeholder}
                    />
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="admin-settings__foot">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Сохраняем…" : "Сохранить настройки"}
          </Button>
        </div>
      </form>
    </section>
  );
}
