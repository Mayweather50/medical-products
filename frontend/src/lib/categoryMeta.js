const META = {
  // Дентальный набор категорий
  "stomatologicheskoe-oborudovanie": { icon: "dental-unit", shortTitle: "Стомат. оборудование" },
  "cad-cam-tehnologii": { icon: "cadcam", shortTitle: "Cad/Cam технологии" },
  "zubotehnicheskoe-oborudovanie": { icon: "lab", shortTitle: "Зуботех. оборудование" },
  "reanimatsiya-i-anesteziologiya": { icon: "anesthesia", shortTitle: "Реанимация" },
  "mebel": { icon: "furniture", shortTitle: "Мебель" },

  // Прежние общемедицинские (оставлены на случай отката)
  "rashodnye-materialy": { icon: "consumables", shortTitle: "Расходные материалы" },
  "siz": { icon: "ppe", shortTitle: "СИЗ" },
  "diagnosticheskoe-oborudovanie": { icon: "diagnostics", shortTitle: "Диагностика" },
  "reabilitatsionnye-tovary": { icon: "rehab", shortTitle: "Реабилитация" },
  "tovary-dlya-uhoda": { icon: "care", shortTitle: "Уход" },
  "dezinfektsiya-i-antiseptiki": { icon: "disinfection", shortTitle: "Дезинфекция" },
  "meditsinskaya-mebel": { icon: "furniture", shortTitle: "Мебель" },
  "oborudovanie-dlya-klinik": { icon: "clinic", shortTitle: "Для клиник" },
};

export function catMeta(category) {
  if (!category) return { icon: "clinic", shortTitle: "" };

  const m = META[category.slug] || {};

  let icon = m.icon;
  if (!icon && category.imageUrl && category.imageUrl.startsWith("icon:")) {
    icon = category.imageUrl.slice(5);
  }

  return {
    icon: icon || "clinic",
    shortTitle: m.shortTitle || category.title,
  };
}
