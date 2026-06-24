import { useEffect } from "react";

const BRAND = "Ugodent";

/** Выставляет document.title вида «Страница — Ugodent». */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BRAND}` : `${BRAND} — медицинские товары и оборудование`;
    return () => { document.title = `${BRAND} — медицинские товары и оборудование`; };
  }, [title]);
}
