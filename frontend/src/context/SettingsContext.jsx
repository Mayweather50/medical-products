import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

/* Контакты, реквизиты и тексты сайта приходят из БД (админка → «Настройки»).
   Нужны в шапке, подвале и на юридических страницах, поэтому грузим один раз.

   DEFAULTS — не контент, а защита от пустого экрана, пока идёт запрос или если
   бэкенд недоступен: подписи полей, а не выдуманные телефоны и реквизиты. */

const DEFAULTS = {
  brand: "",
  phone: "",
  phone_href: "",
  email: "",
  address: "",
  site: "",
  footer_about: "",
  footer_note: "",
  cta_title: "",
  cta_text: "",
  categories_title: "Категории товаров",
  categories_sub: "",
  popular_title: "Популярные товары",
  popular_sub: "",
  certs_title: "Сертификаты и документы",
  certs_sub: "",
  legal_operator: "",
  legal_inn: "",
  legal_ogrn: "",
  legal_address: "",
  legal_updated_at: "",
};

const SettingsContext = createContext({ settings: DEFAULTS, loading: true, reload: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    api
      .getSettings()
      .then((data) => setSettings({ ...DEFAULTS, ...(data || {}) }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  const value = useMemo(() => ({ settings, loading, reload }), [settings, loading, reload]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Все настройки: const { settings } = useSettings(); */
export const useSettings = () => useContext(SettingsContext);

/** Одно значение с запасным вариантом: useSetting("phone") */
export function useSetting(key, fallback = "") {
  const { settings } = useContext(SettingsContext);
  return settings[key] || fallback;
}
