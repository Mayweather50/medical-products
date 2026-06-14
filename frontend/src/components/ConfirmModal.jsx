import { Icon } from "./Icon";
import Button from "./Button";

export default function ConfirmModal({ open, title, message, confirmLabel, danger, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal confirm-modal" role="dialog" aria-modal="true">
        <div className={"confirm-modal__icon" + (danger ? " is-danger" : "")}>
          <Icon name={danger ? "close" : "doc"} size={28} />
        </div>
        <h3 className="confirm-modal__title">{title}</h3>
        {message && <p className="confirm-modal__msg">{message}</p>}
        <div className="confirm-modal__actions">
          <Button variant="outline" size="md" onClick={onCancel}>Отмена</Button>
          <Button variant={danger ? "accent" : "primary"} size="md" onClick={onConfirm}>
            {confirmLabel || "Подтвердить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
