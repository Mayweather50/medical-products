import { Link } from "react-router-dom";
import Button from "./Button";
import { Icon } from "./Icon";
import { catalogUrl } from "../lib/format";
import { useCatalog } from "../context/CatalogContext";
import { useLeadModal } from "../context/LeadModalContext";
import { useSettings } from "../context/SettingsContext";

export default function Footer() {
  const { categories } = useCatalog();
  const openLead = useLeadModal();
  const { settings: s } = useSettings();

  return (
    <footer className="site-foot" id="contacts">
      {(s.cta_title || s.cta_text) && (
        <div className="wrap site-foot__cta">
          <div>
            {s.cta_title && <h2>{s.cta_title}</h2>}
            {s.cta_text && <p>{s.cta_text}</p>}
          </div>
          <Button variant="light" size="lg" icon="headset" onClick={() => openLead()}>
            Связаться с нами
          </Button>
        </div>
      )}

      <div className="wrap site-foot__grid">
        <div className="site-foot__brandcol">
          <div className="brand brand--foot">
            <span className="brand__name">{s.brand}</span>
          </div>
          {s.footer_about && <p>{s.footer_about}</p>}
          <div className="site-foot__contacts">
            {s.phone && (
              <a href={`tel:${s.phone_href || s.phone}`}>
                <Icon name="phone" size={16} /> {s.phone}
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`}>
                <Icon name="mail" size={16} /> {s.email}
              </a>
            )}
            {s.address && (
              <span>
                <Icon name="pin" size={16} /> {s.address}
              </span>
            )}
          </div>
        </div>

        <div className="site-foot__col">
          <h4>Каталог</h4>
          {categories.slice(0, 6).map((c) => (
            <Link key={c.id} to={catalogUrl({ cat: c.slug })}>
              {c.shortTitle || c.title}
            </Link>
          ))}
        </div>

        <div className="site-foot__col">
          <h4>Компания</h4>
          <Link to="/#advantages">О компании</Link>
          <Link to="/#certificates">Сертификаты</Link>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openLead();
            }}
          >
            Оптовым клиентам
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openLead();
            }}
          >
            Доставка и оплата
          </a>
        </div>

        <div className="site-foot__col">
          <h4>Документы</h4>
          <Link to="/privacy">Политика конфиденциальности</Link>
          <Link to="/cookie">Использование cookie</Link>
          <Link to="/terms">Пользовательское соглашение</Link>
        </div>
      </div>

      <div className="site-foot__bottom">
        <div className="wrap site-foot__bottom-in">
          <span>
            © {new Date().getFullYear()} {s.brand}. Все права защищены.
          </span>
          {s.footer_note && <span className="site-foot__note">{s.footer_note}</span>}
        </div>
      </div>
    </footer>
  );
}
