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
};

const CAT_PATHS = {
  // расходные материалы — шприц
  consumables: ["path:M14 4l6 6", "path:M16.5 6.5l-9 9-3.5.9.9-3.5 9-9z", "path:M11 10l3 3", "path:M5 19l-1.5 1.5"],
  // СИЗ — маска
  ppe: ["path:M4 9c2-1 4-1.5 8-1.5S18 8 20 9c0 5-3.5 8-8 8s-8-3-8-8z", "path:M4 11h-1.5", "path:M20 11h1.5", "path:M9 11.5h6", "path:M9.5 14h5"],
  // диагностика — стетоскоп
  diagnostics: ["path:M6 3v5a4 4 0 008 0V3", "path:M6 3h-1", "path:M14 3h1", "path:M10 16v1a4 4 0 008 0v-1", "circle:18 13 2"],
  // реабилитация — костыль
  rehab: ["path:M9 3h4", "path:M11 3v10", "path:M11 13l-3 8", "path:M11 13l3 8", "circle:11 16 0.6"],
  // уход — сердце
  care: ["path:M12 21s-6-4-6-9a3.2 3.2 0 016-1.4A3.2 3.2 0 0118 12c0 5-6 9-6 9z"],
  // дезинфекция — капля
  disinfection: ["path:M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z", "path:M9.5 13.5a2.6 2.6 0 002.5 2.5"],
  // мебель — кушетка
  furniture: ["path:M3 11h14a3 3 0 013 3v3", "path:M3 8v9", "path:M3 14h17", "path:M21 17v2", "path:M3 17v2", "rect:3 9 5 2.5 1"],
  // для клиник — корпус с крестом
  clinic: ["path:M4 21V6l8-3 8 3v15", "path:M4 21h16", "path:M12 8.5v4", "path:M10 10.5h4", "path:M9 21v-3h6v3"],
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

export function Icon({ name, ...rest }) {
  return <Svg {...rest}>{renderShapes(PATHS[name] || PATHS.box)}</Svg>;
}

export function CatIcon({ name, ...rest }) {
  return <Svg stroke={1.5} {...rest}>{renderShapes(CAT_PATHS[name] || CAT_PATHS.clinic)}</Svg>;
}
