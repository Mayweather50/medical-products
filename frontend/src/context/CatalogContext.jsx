import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

/* Категории нужны почти на каждом экране (шапка, подвал, фильтры),
   поэтому грузим их один раз и раздаём через контекст.
   reload() — для админки: после правок товаров обновить счётчики. */

const CatalogContext = createContext({
  categories: [],
  allCategories: [],
  loading: true,
  error: null,
  reload: () => {},
});

export function CatalogProvider({ children }) {
  const [state, setState] = useState({ categories: [], allCategories: [], loading: true, error: null });

  const reload = useCallback(() => {
    api
      .getCategories()
      .then((list) => {
        // icon и shortTitle приходят из БД; здесь только счётчик товаров
        const withMeta = list.map((c) => ({ ...c, count: c.productCount }));
        // Дерево: категории верхнего уровня (parentId=null) с вложенными children
        const tops = withMeta.filter((c) => !c.parentId);
        tops.forEach((t) => {
          t.children = withMeta.filter((c) => c.parentId === t.id);
          t.count += t.children.reduce((n, ch) => n + ch.count, 0);
        });
        setState({ categories: tops, allCategories: withMeta, loading: false, error: null });
      })
      .catch((error) => setState((s) => ({ ...s, loading: false, error })));
  }, []);

  useEffect(reload, [reload]);

  const value = useMemo(() => ({ ...state, reload }), [state, reload]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
