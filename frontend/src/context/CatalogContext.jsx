import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { catMeta } from "../lib/categoryMeta";

/* Категории нужны почти на каждом экране (шапка, подвал, фильтры),
   поэтому грузим их один раз и раздаём через контекст.
   reload() — для админки: после правок товаров обновить счётчики. */

const CatalogContext = createContext({ categories: [], loading: true, error: null, reload: () => {} });

export function CatalogProvider({ children }) {
  const [state, setState] = useState({ categories: [], loading: true, error: null });

  const reload = useCallback(() => {
    api
      .getCategories()
      .then((list) => {
        const categories = list.map((c) => ({ ...c, ...catMeta(c), count: c.productCount }));
        setState({ categories, loading: false, error: null });
      })
      .catch((error) => setState((s) => ({ ...s, loading: false, error })));
  }, []);

  useEffect(reload, [reload]);

  const value = useMemo(() => ({ ...state, reload }), [state, reload]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
