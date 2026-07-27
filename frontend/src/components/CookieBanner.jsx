import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import {
  readCookieConsent,
  acceptAllCookies,
  acceptNecessaryCookies,
  onConsentChange,
} from "../lib/consent";

/* Баннер согласия на cookie. Показывается, пока пользователь не сделал выбор;
   решение хранится в localStorage (см. lib/consent.js). */

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // читаем после монтирования, чтобы не мигать баннером при гидрации
    setVisible(readCookieConsent() === null);
    return onConsentChange((value) => setVisible(value === null));
  }, []);

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Согласие на использование cookie">
      <div className="cookie-banner__in">
        <div className="cookie-banner__text">
          <b>Мы используем cookie</b>
          <p>
            Файлы cookie нужны для работы корзины и авторизации, а также помогают нам
            понять, как посетители пользуются сайтом. Подробнее — в{" "}
            <Link to="/cookie">политике cookie</Link> и{" "}
            <Link to="/privacy">политике конфиденциальности</Link>.
          </p>
        </div>
        <div className="cookie-banner__actions">
          <Button variant="primary" size="md" onClick={acceptAllCookies}>
            Принять все
          </Button>
          <Button variant="outline" size="md" onClick={acceptNecessaryCookies}>
            Только необходимые
          </Button>
        </div>
      </div>
    </div>
  );
}
