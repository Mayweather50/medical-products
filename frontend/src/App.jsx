import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import { CatalogProvider } from "./context/CatalogContext";
import { LeadModalProvider } from "./context/LeadModalContext";

/* Скролл при навигации: к якорю из hash (с поправкой на липкую шапку)
   или наверх страницы. */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      if (hash) {
        const el = document.getElementById(hash.slice(1));
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - 150;
          window.scrollTo({ top, behavior: "smooth" });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <LeadModalProvider>
          <ScrollManager />
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </LeadModalProvider>
      </CatalogProvider>
    </BrowserRouter>
  );
}
