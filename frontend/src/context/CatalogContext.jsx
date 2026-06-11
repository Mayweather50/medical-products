import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { catMeta } from "../lib/categoryMeta";

/* Категории нужны почти на каждом экране (шапка, подвал, фильтры),
   поэтому грузим их один раз и раздаём через контекст. */

const CatalogContext = createContext({ categories: [], loading: true, error: null });

export function CatalogProvider({ children }) {
  const [state, setState] = useState({ categories: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    api
      .getCategories()
      .then((list) => {
        if (cancelled) return;
        const categories = list.map((c) => ({ ...c, ...catMeta(c), count: c.productCount }));
        setState({ categories, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ categories: [], loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
