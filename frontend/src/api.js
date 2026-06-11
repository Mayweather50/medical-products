/* Клиент REST API бэкенда medical-products.
   В dev запросы идут через прокси Vite, в prod — через nginx. */

const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
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

  /** POST /api/leads: { name, phone, email?, comment?, productName? } */
  createLead: (payload) =>
    request("/api/leads", { method: "POST", body: JSON.stringify(payload) }),
};
