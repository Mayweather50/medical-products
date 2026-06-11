import { Icon } from "./Icon";

export default function Badge({ tone = "neutral", icon, children }) {
  return (
    <span className={`badge badge--${tone}`}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
