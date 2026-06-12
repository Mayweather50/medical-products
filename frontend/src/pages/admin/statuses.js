/* Статусы заявок и заказов: подписи и тона бейджей. Значения совпадают
   с enum'ами LeadStatus / OrderStatus на бэкенде. */

export const STATUS_LABELS = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
};

export const ORDER_STATUS_LABELS = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
};

export const STATUS_VALUES = Object.keys(STATUS_LABELS);

export const fmtDate = (iso) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
