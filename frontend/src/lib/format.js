export const fmtPrice = (n) =>
  n == null ? "" : new Intl.NumberFormat("ru-RU").format(n) + " ₽";

export function plural(n, forms) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

/** Ссылка на каталог с фильтрами: { cat, popular, q }. */
export function catalogUrl({ cat, popular, q } = {}) {
  const p = new URLSearchParams();
  if (cat) p.set("cat", cat);
  if (popular) p.set("popular", "1");
  if (q) p.set("q", q);
  const s = p.toString();
  return "/catalog" + (s ? `?${s}` : "");
}
