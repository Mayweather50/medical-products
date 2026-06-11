/* Презентационные атрибуты категорий (иконка, короткое название).
   Бэкенд хранит только данные; внешний вид — забота фронтенда. */

const META = {
  "rashodnye-materialy": { icon: "consumables", shortTitle: "Расходные материалы" },
  "siz": { icon: "ppe", shortTitle: "СИЗ" },
  "diagnosticheskoe-oborudovanie": { icon: "diagnostics", shortTitle: "Диагностика" },
  "reabilitatsionnye-tovary": { icon: "rehab", shortTitle: "Реабилитация" },
  "tovary-dlya-uhoda": { icon: "care", shortTitle: "Уход" },
  "dezinfektsiya-i-antiseptiki": { icon: "disinfection", shortTitle: "Дезинфекция" },
  "meditsinskaya-mebel": { icon: "furniture", shortTitle: "Мебель" },
  "oborudovanie-dlya-klinik": { icon: "clinic", shortTitle: "Для клиник" },
};

/** Принимает категорию API ({ slug, title, ... }) и возвращает { icon, shortTitle }. */
export function catMeta(category) {
  const m = (category && META[category.slug]) || {};
  return {
    icon: m.icon || "clinic",
    shortTitle: m.shortTitle || (category ? category.title : ""),
  };
}
