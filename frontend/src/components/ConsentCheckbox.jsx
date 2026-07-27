import { useId } from "react";
import { Link } from "react-router-dom";

/* Явное согласие на обработку персональных данных (ч. 1 ст. 9 152-ФЗ).
   Пассивной формулировки «нажимая кнопку, вы соглашаетесь» недостаточно —
   требуется конкретное, предметное и информированное действие пользователя.

   Ссылки внутри <label> активируют чекбокс, поэтому клик по ним гасим. */

const stop = (e) => e.stopPropagation();

export default function ConsentCheckbox({ checked, onChange, error }) {
  const id = useId();

  return (
    <div className={"consent" + (error ? " consent--err" : "")}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="consent__text" htmlFor={id}>
        Я даю согласие на обработку моих персональных данных (имя, телефон, e-mail) с
        целью обработки обращения и принимаю{" "}
        <Link to="/privacy" target="_blank" rel="noopener" onClick={stop}>
          политику конфиденциальности
        </Link>{" "}
        и{" "}
        <Link to="/terms" target="_blank" rel="noopener" onClick={stop}>
          пользовательское соглашение
        </Link>
        .
      </label>
      {error && <span className="field__err consent__err">{error}</span>}
    </div>
  );
}
