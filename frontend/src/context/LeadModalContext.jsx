import { createContext, useCallback, useContext, useState } from "react";
import LeadModal from "../components/LeadModal";

/* Кнопка «Оставить заявку» есть в шапке, подвале, карточках и на страницах
   товара — модалка одна на всё приложение, открывается через контекст. */

const LeadModalContext = createContext(() => {});

export function LeadModalProvider({ children }) {
  const [modal, setModal] = useState({ open: false, product: null });

  const openLead = useCallback((product = null) => setModal({ open: true, product }), []);
  const close = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  return (
    <LeadModalContext.Provider value={openLead}>
      {children}
      <LeadModal open={modal.open} product={modal.product} onClose={close} />
    </LeadModalContext.Provider>
  );
}

/** Возвращает openLead(product?) — открыть модалку заявки. */
export const useLeadModal = () => useContext(LeadModalContext);
