import { Icon } from "./Icon";

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  children,
  className = "",
  ...rest
}) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim();
  const iconSize = size === "lg" ? 20 : 18;
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children != null && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}
