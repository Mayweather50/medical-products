/* Хранение решения пользователя по cookie.

   Значение лежит в localStorage под ключом COOKIE_KEY:
     { level: "all" | "necessary", at: <ISO-дата> }

   Решение действует TTL_DAYS дней — после этого баннер показывается снова
   (рекомендуемая практика: перезапрашивать согласие не реже раза в год). */

const COOKIE_KEY = "ugodent_cookie_consent";
const TTL_DAYS = 365;
const EVENT = "cookie-consent-change";

export function readCookieConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || (data.level !== "all" && data.level !== "necessary")) return null;

    const ageDays = (Date.now() - new Date(data.at).getTime()) / 86400000;
    if (!Number.isFinite(ageDays) || ageDays > TTL_DAYS) return null;

    return data;
  } catch {
    // приватный режим браузера или повреждённое значение — считаем, что выбора не было
    return null;
  }
}

function write(value) {
  try {
    if (value) localStorage.setItem(COOKIE_KEY, JSON.stringify(value));
    else localStorage.removeItem(COOKIE_KEY);
  } catch {
    /* localStorage недоступен — баннер просто появится снова */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

/** Принять все cookie, включая аналитические. */
export function acceptAllCookies() {
  write({ level: "all", at: new Date().toISOString() });
}

/** Только строго необходимые: корзина, авторизация, само согласие. */
export function acceptNecessaryCookies() {
  write({ level: "necessary", at: new Date().toISOString() });
}

/** Сбросить решение — баннер появится заново (ссылка «Изменить настройки cookie»). */
export function resetCookieConsent() {
  write(null);
}

/** Разрешена ли необязательная аналитика. */
export function analyticsAllowed() {
  return readCookieConsent()?.level === "all";
}

/** Подписка на изменения решения (в том числе из другой вкладки). */
export function onConsentChange(handler) {
  const local = () => handler(readCookieConsent());
  const cross = (e) => {
    if (e.key === COOKIE_KEY) handler(readCookieConsent());
  };
  window.addEventListener(EVENT, local);
  window.addEventListener("storage", cross);
  return () => {
    window.removeEventListener(EVENT, local);
    window.removeEventListener("storage", cross);
  };
}
