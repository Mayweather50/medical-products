/* Иконографика: тонкие линейные SVG-иконы (stroke, 24×24).
   Icon — интерфейсные, CatIcon — иконки категорий. */

function Svg({ size = 24, stroke = 1.6, fill = "none", children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

const PATHS = {
  search: ["circle:11 11 7", "path:M21 21l-4.3-4.3"],
  arrow: ["path:M5 12h14", "path:M13 5l7 7-7 7"],
  arrowSm: ["path:M4 12h12", "path:M11 6l6 6-6 6"],
  chevron: ["path:M9 6l6 6-6 6"],
  chevronDown: ["path:M6 9l6 6 6-6"],
  close: ["path:M6 6l12 12", "path:M18 6L6 18"],
  check: ["path:M5 12.5l4.2 4.2L19 7"],
  phone: [
    "path:M5 4h3l1.6 4-2 1.4a12 12 0 005 5l1.4-2 4 1.6V21a1 1 0 01-1.1 1A16 16 0 014 6.1 1 1 0 015 4z",
  ],
  mail: ["rect:3 5 18 14 2", "path:M3.5 6.5l8.5 6 8.5-6"],
  pin: ["path:M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z", "circle:12 10 2.5"],
  clock: ["circle:12 12 8.5", "path:M12 7.5V12l3 1.8"],
  filter: ["path:M3 5h18", "path:M6 12h12", "path:M10 19h4"],
  grid: ["rect:4 4 7 7 1.5", "rect:13 4 7 7 1.5", "rect:4 13 7 7 1.5", "rect:13 13 7 7 1.5"],
  list: ["path:M8 6h12", "path:M8 12h12", "path:M8 18h12", "path:M4 6h.01", "path:M4 12h.01", "path:M4 18h.01"],
  star: ["path:M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"],
  shield: ["path:M12 3l7 2.5v5.5c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5V5.5z", "path:M9 12l2 2 4-4"],
  truck: ["rect:1.5 6 13 10 1.5", "path:M14.5 9h4l3 3.5V16h-7z", "circle:6 18.5 2", "circle:18 18.5 2"],
  doc: ["path:M7 3h7l4 4v14H7z", "path:M14 3v4h4", "path:M9.5 12.5h5", "path:M9.5 16h5"],
  plus: ["path:M12 5v14", "path:M5 12h14"],
  minus: ["path:M5 12h14"],
  headset: ["path:M5 13v-1a7 7 0 0114 0v1", "rect:3.5 13 3.5 5 1.5", "rect:17 13 3.5 5 1.5", "path:M20.5 18v.5a3 3 0 01-3 3H13"],
  box: ["path:M12 3l8 4.5v9L12 21l-8-4.5v-9z", "path:M4 7.5l8 4.5 8-4.5", "path:M12 12v9"],
  cart: ["circle:9 20 1.4", "circle:17 20 1.4", "path:M3 4h2l2.2 11h10l2-7H6.2"],
  pulse: ["path:M3 12h4l2-5 4 12 2.5-7H21"],
  menu: ["path:M4 7h16", "path:M4 12h16", "path:M4 17h16"],
  user: ["circle:12 8 3.5", "path:M5 20a7 7 0 0114 0"],
  logout: ["path:M14 4h-7v16h7", "path:M10 12h10", "path:M17 9l3 3-3 3"],
  trash: ["path:M4 7h16", "path:M10 11v6", "path:M14 11v6", "path:M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12", "path:M9 7V4h6v3"],
};

// Иконки категорий в стиле референса: тёмно-синий контур (base) + один
// бирюзовый акцент на детали (accent). Каждая — свой предмет.
const CAT_ICONS = {
  // расходные материалы — шприц (горизонтальный)
  consumables: {
    base: ["path:M3 12h3", "path:M6 10v4", "rect:6 9.5 8 5 1.2", "path:M14 12h3.5", "path:M17.5 9.5v5"],
    accent: ["path:M8 12h3.5"],
  },
  // СИЗ — медицинская маска с петлями
  ppe: {
    base: [
      "path:M5 9c4-1.4 10-1.4 14 0v5c0 1-.8 1.8-2 2.1-3 .8-7 .8-10 0-1.2-.3-2-1.1-2-2.1z",
      "path:M5 10l-2 1v3l2 1",
      "path:M19 10l2 1v3l-2 1",
    ],
    accent: ["path:M8.5 11.5h7", "path:M8.5 14h7"],
  },
  // диагностика — монитор с пульсом
  diagnostics: {
    base: ["rect:3 5 18 11 2", "path:M9 20h6", "path:M12 16v4"],
    accent: ["path:M6 11h2.5l1.3-3 2 6 1.4-3H18"],
  },
  // реабилитация — инвалидная коляска
  rehab: {
    base: ["circle:10 16.5 4", "circle:13 6 1.3", "path:M11 9.2h2.8l1.3 3.8H18", "path:M11 9.2l-.6-2.2"],
    accent: ["path:M16 13l1.6 3.5", "circle:10 16.5 0.5"],
  },
  // уход — сердце в ладонях (заботливая поддержка)
  care: {
    base: ["path:M4.5 13c2 3.2 4.8 4.9 7.5 4.9s5.5-1.7 7.5-4.9"],
    accent: ["path:M12 11.4s-3.1-2-3.1-4.1A1.6 1.6 0 0112 5.7 1.6 1.6 0 0115.1 7.3c0 2.1-3.1 4.1-3.1 4.1z"],
  },
  // дезинфекция — распылитель
  disinfection: {
    base: [
      "path:M9 21a1.2 1.2 0 01-1.2-1.2v-6.3A1.5 1.5 0 019.3 12h3.4a1.5 1.5 0 011.5 1.5v6.3A1.2 1.2 0 0113 21z",
      "path:M10 12V9.2h3",
      "rect:9.2 6.6 3.2 2 0.5",
    ],
    accent: ["path:M14.5 7h2.2", "path:M14.5 9h2.6", "path:M15 11h2"],
  },
  // мебель — офисное кресло
  furniture: {
    base: ["path:M8 4h6a1 1 0 011 1v5H7V5a1 1 0 011-1z", "rect:5.5 10 13 2 1", "path:M12 12v4", "path:M8 20l4-4 4 4"],
    accent: ["path:M9 20h6"],
  },
  // для клиник — аптечка с крестом
  clinic: {
    base: ["rect:3 7 18 12 2.5", "path:M8.5 7V5.2A1.2 1.2 0 019.7 4h4.6A1.2 1.2 0 0115.5 5.2V7"],
    accent: ["path:M12 10.8v4.4", "path:M9.8 13h4.4"],
  },
};

function renderShapes(defs) {
  return defs.map((d, i) => {
    const [type, args] = d.split(":");
    const n = args.split(" ").map(Number);
    if (type === "circle") return <circle key={i} cx={n[0]} cy={n[1]} r={n[2]} />;
    if (type === "rect")
      return <rect key={i} x={n[0]} y={n[1]} width={n[2]} height={n[3]} rx={n[4] || 0} />;
    return <path key={i} d={args} />;
  });
}

// У каждой категории свой цвет (двухтональный: основной + тёмный акцент того же тона).
const CAT_COLORS = {
  consumables:  ["#0ea5a5", "#0b7d7d"], // расходники — бирюза
  ppe:          ["#3b74d6", "#274f9c"], // СИЗ — синий
  diagnostics:  ["#6d5ce0", "#4a3caa"], // диагностика — индиго
  rehab:        ["#e0862f", "#b3651c"], // реабилитация — янтарь
  care:         ["#e05a8a", "#b23a68"], // уход — розовый
  disinfection: ["#14b8c4", "#0e8a93"], // дезинфекция — циан
  furniture:    ["#2fa46b", "#1f7a4d"], // мебель — зелёный
  clinic:       ["#5b7b95", "#3f5a70"], // для клиник — ниагара
};

export function Icon({ name, ...rest }) {
  return <Svg {...rest}>{renderShapes(PATHS[name] || PATHS.box)}</Svg>;
}

// Иконка категории: цветной глиф + акцент-деталь тёмным тоном того же цвета.
export function CatIcon({ name, style, ...rest }) {
  const g = CAT_ICONS[name] || CAT_ICONS.clinic;
  const [main, accent] = CAT_COLORS[name] || CAT_COLORS.clinic;
  return (
    <Svg stroke={1.8} style={style} {...rest}>
      <g stroke={main}>{renderShapes(g.base)}</g>
      {g.accent && <g stroke={accent}>{renderShapes(g.accent)}</g>}
    </Svg>
  );
}
