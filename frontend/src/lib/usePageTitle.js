import { useEffect } from "react";

const BRAND = "Медкор";

/** Выставляет document.title вида «Страница — Медкор». */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BRAND}` : `${BRAND} — медицинские товары и оборудование`;
    return () => { document.title = `${BRAND} — медицинские товары и оборудование`; };
  }, [title]);
}
