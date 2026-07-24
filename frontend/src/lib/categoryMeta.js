const META = {
  // Дентальный набор категорий (иконки — запасной вариант, если у категории нет фото)
  "3d-tehnologii": { icon: "cadcam", shortTitle: "3D технологии" },
  "stomatologicheskoe-oborudovanie": { icon: "dental-unit", shortTitle: "Стомат. оборудование" },
  "stomatologicheskie-materialy": { icon: "consumables", shortTitle: "Стомат. материалы" },
  "zubotehnicheskie-materialy": { icon: "consumables", shortTitle: "Зуботех. материалы" },
  "zubotehnicheskoe-oborudovanie": { icon: "lab", shortTitle: "Зуботех. оборудование" },
  "implantologiya-i-hirurgiya": { icon: "dental-unit", shortTitle: "Имплантология" },
  "instrumenty": { icon: "clinic", shortTitle: "Инструменты" },
  "rentgen-oborudovanie": { icon: "diagnostics", shortTitle: "Рентген" },
  "sterilizatsiya": { icon: "disinfection", shortTitle: "Стерилизация" },
  "dezinfektsiya-i-sterilizatsiya": { icon: "disinfection", shortTitle: "Дезинфекция" },
  "anesteziya": { icon: "anesthesia", shortTitle: "Анестезия" },
  "skalery-i-nasadki": { icon: "dental-unit", shortTitle: "Скалеры и насадки" },
  "gigiena-i-profilaktika": { icon: "care", shortTitle: "Гигиена" },

  // Прежние наборы (оставлены на случай отката)
  "cad-cam-tehnologii": { icon: "cadcam", shortTitle: "Cad/Cam технологии" },
  "reanimatsiya-i-anesteziologiya": { icon: "anesthesia", shortTitle: "Реанимация" },
  "mebel": { icon: "furniture", shortTitle: "Мебель" },
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
