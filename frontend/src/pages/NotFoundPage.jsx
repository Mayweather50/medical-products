import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { Icon } from "../components/Icon";
import { usePageTitle } from "../lib/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Страница не найдена");
  const navigate = useNavigate();
  return (
    <div className="wrap section">
      <div className="empty">
        <span className="empty__ic">
          <Icon name="search" size={30} />
        </span>
        <h3>Страница не найдена</h3>
        <p>Возможно, ссылка устарела или страница была перемещена.</p>
        <div className="notfound__actions">
          <Button variant="primary" size="md" onClick={() => navigate("/")}>
            На главную
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate("/catalog")}>
            В каталог
          </Button>
        </div>
      </div>
    </div>
  );
}
