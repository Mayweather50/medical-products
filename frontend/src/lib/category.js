/* Иконка и короткое название категории приходят из БД (редактируются в админке).
   Здесь только защита от пустых значений — своих данных этот модуль не хранит. */

/** Имя иконки из набора CAT_ICONS; clinic — универсальная заглушка. */
export function catIcon(category) {
  return category?.icon || "clinic";
}

/** Короткое название для плиток и карточек; при отсутствии — полное. */
export function catShortTitle(category) {
  return category?.shortTitle || category?.title || "";
}
