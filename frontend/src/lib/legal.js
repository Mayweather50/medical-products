import { useSettings } from "../context/SettingsContext";

/* Реквизиты оператора персональных данных берутся из настроек сайта
   (админка → «Настройки» → блок «Реквизиты»). Раньше были зашиты здесь.

   Незаполненное поле показывается как «не указано» — намеренно заметно:
   документ с пустыми реквизитами юридической силы не имеет, и владелец
   должен это увидеть, а не поверить в правдоподобную заглушку. */

const MISSING = "не указано";

export function useLegal() {
  const { settings: s } = useSettings();

  return {
    operator: s.legal_operator || MISSING,
    inn: s.legal_inn || MISSING,
    ogrn: s.legal_ogrn || MISSING,
    address: s.legal_address || s.address || MISSING,
    email: s.email || MISSING,
    phone: s.phone || MISSING,
    phoneHref: s.phone_href || s.phone || "",
    site: s.site || MISSING,
    updatedAt: s.legal_updated_at || MISSING,
  };
}
