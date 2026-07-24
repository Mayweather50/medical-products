/* Клиент REST API бэкенда medical-products.
   В dev запросы идут через прокси Vite, в prod — через nginx. */

const API_BASE = import.meta.env.VITE_API_URL || "";
const AUTH_KEY = "medcor_auth";

export function getStoredAuth() {
  try {
    const raw = JSON.parse(localStorage.getItem(AUTH_KEY));
    return raw?.token ? raw : null;
  } catch {
    return null;
  }
}

export function storeAuth(auth) {
  if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  else localStorage.removeItem(AUTH_KEY);
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  // Для FormData Content-Type выставляет браузер (с boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  const auth = getStoredAuth();
  if (auth) headers["Authorization"] = `Bearer ${auth.token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });
  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      // тело не JSON — оставляем null
    }
    const error = new Error(body?.message || `Ошибка запроса (HTTP ${res.status})`);
    error.status = res.status;
    error.fieldErrors = body?.fieldErrors || [];
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") p.set(key, value);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const api = {
  getCategories: () => request("/api/categories"),
  getCategoryBySlug: (slug) => request(`/api/categories/slug/${encodeURIComponent(slug)}`),

  /** Каталог: { categorySlug, available, popular, query, page, size } → PageResponse<Product> */
  getProducts: (params = {}) => request(`/api/products${qs(params)}`),
  getPopular: () => request("/api/products/popular"),
  getProductBySlug: (slug) => request(`/api/products/slug/${encodeURIComponent(slug)}`),

  getCertificates: () => request("/api/certificates"),

  /** Активные слайды баннера главной страницы */
  getBanners: () => request("/api/banners"),

  /** POST /api/leads: { name, phone, email?, comment?, productName? } */
  createLead: (payload) =>
    request("/api/leads", { method: "POST", body: JSON.stringify(payload) }),

  /** POST /api/orders: { name, phone, comment?, items: [{ productId, quantity }] } */
  createOrder: (payload) =>
    request("/api/orders", { method: "POST", body: JSON.stringify(payload) }),

  /* ---- Аутентификация ---- */
  login: (payload) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  /* ---- Админ (требуют JWT с ролью ADMIN) ---- */
  admin: {
    getLeads: (params = {}) => request(`/api/admin/leads${qs(params)}`),
    updateLeadStatus: (id, status) =>
      request(`/api/admin/leads/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),

    getOrders: (params = {}) => request(`/api/admin/orders${qs(params)}`),
    updateOrderStatus: (id, status) =>
      request(`/api/admin/orders/${id}/status${qs({ status })}`, { method: "PATCH" }),

    createProduct: (payload) =>
      request("/api/admin/products", { method: "POST", body: JSON.stringify(payload) }),
    updateProduct: (id, payload) =>
      request(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: "DELETE" }),
    getTrash: () => request("/api/admin/products/trash"),
    restoreProduct: (id) => request(`/api/admin/products/trash/${id}/restore`, { method: "POST" }),
    deleteProductPermanently: (id) => request(`/api/admin/products/trash/${id}`, { method: "DELETE" }),
    emptyTrash: () => request("/api/admin/products/trash", { method: "DELETE" }),
    importProducts: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return request("/api/admin/products/import", { method: "POST", body: fd });
    },
    uploadImage: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return request("/api/admin/products/upload-image", { method: "POST", body: fd });
    },

    createCategory: (payload) =>
      request("/api/admin/categories", { method: "POST", body: JSON.stringify(payload) }),
    updateCategory: (id, payload) =>
      request(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteCategory: (id) => request(`/api/admin/categories/${id}`, { method: "DELETE" }),

    getBanners: () => request("/api/admin/banners"),
    createBanner: (payload) =>
      request("/api/admin/banners", { method: "POST", body: JSON.stringify(payload) }),
    updateBanner: (id, payload) =>
      request(`/api/admin/banners/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteBanner: (id) => request(`/api/admin/banners/${id}`, { method: "DELETE" }),
    uploadBannerImage: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return request("/api/admin/banners/upload-image", { method: "POST", body: fd });
    },
  },
};
