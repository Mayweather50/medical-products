import { Link } from "react-router-dom";
import Button from "./Button";
import { Icon } from "./Icon";
import { catalogUrl } from "../lib/format";
import { useCatalog } from "../context/CatalogContext";
import { useLeadModal } from "../context/LeadModalContext";

const BRAND = "Ugodent";

export default function Footer() {
  const { categories } = useCatalog();
  const openLead = useLeadModal();

  return (
    <footer className="site-foot" id="contacts">
      <div className="wrap site-foot__cta">
        <div>
          <h2>Нужна консультация или оптовый прайс?</h2>
          <p>
            Оставьте заявку — менеджер свяжется с вами в течение рабочего дня и подберёт
            товары под вашу задачу.
          </p>
        </div>
        <Button variant="light" size="lg" icon="headset" onClick={() => openLead()}>
          Связаться с нами
        </Button>
      </div>

      <div className="wrap site-foot__grid">
        <div className="site-foot__brandcol">
          <div className="brand brand--foot">
            <span className="brand__name">{BRAND}</span>
          </div>
          <p>
            Поставка медицинских товаров, расходных материалов и оборудования для клиник,
            больниц и частных покупателей.
          </p>
          <div className="site-foot__contacts">
            <a href="tel:+78001234567">
              <Icon name="phone" size={16} /> 8 800 123-45-67
            </a>
            <a href="mailto:zakaz@ugodent.ru">
              <Icon name="mail" size={16} /> zakaz@ugodent.ru
            </a>
            <span>
              <Icon name="pin" size={16} /> Москва, ул. Медицинская, 12
            </span>
          </div>
        </div>

        <div className="site-foot__col">
          <h4>Каталог</h4>
          {categories.slice(0, 6).map((c) => (
            <Link key={c.id} to={catalogUrl({ cat: c.slug })}>
              {c.shortTitle}
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
      </div>

      <div className="site-foot__bottom">
        <div className="wrap site-foot__bottom-in">
          <span>© 2026 {BRAND}. Все права защищены.</span>
          <span className="site-foot__note">
            Не является публичной офертой. Имеются противопоказания, необходима
            консультация специалиста.
          </span>
        </div>
      </div>
    </footer>
  );
}
