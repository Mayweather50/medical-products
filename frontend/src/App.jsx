import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import TermsPage from "./pages/TermsPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminTrash from "./pages/admin/AdminTrash";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminSettings from "./pages/admin/AdminSettings";
import { CatalogProvider } from "./context/CatalogContext";
import { SettingsProvider } from "./context/SettingsContext";
import { LeadModalProvider } from "./context/LeadModalContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import CookieBanner from "./components/CookieBanner";


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
        <CatalogProvider>
          <CartProvider>
            <LeadModalProvider>
              <ToastProvider>
              <Header />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/cookie" element={<CookiePolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminLeads />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="certificates" element={<AdminCertificates />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="trash" element={<AdminTrash />} />
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <CookieBanner />
              </ToastProvider>
            </LeadModalProvider>
          </CartProvider>
        </CatalogProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
