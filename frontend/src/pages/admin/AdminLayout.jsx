import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../lib/usePageTitle";

/* Каркас админки: доступ только с ролью ADMIN, иначе — на вход. */

export default function AdminLayout() {
  usePageTitle("Админ-панель");
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="wrap admin">
      <aside className="admin__nav">
        <span className="admin__nav-title">Админ-панель</span>
        <NavLink to="/admin" end>
          <Icon name="doc" size={17} /> Заявки
        </NavLink>
        <NavLink to="/admin/orders">
          <Icon name="cart" size={17} /> Заказы
        </NavLink>
        <NavLink to="/admin/products">
          <Icon name="box" size={17} /> Товары
        </NavLink>
        <NavLink to="/admin/categories">
          <Icon name="star" size={17} /> Категории
        </NavLink>
        <NavLink to="/admin/banners">
          <Icon name="image" size={17} /> Баннеры
        </NavLink>
        <NavLink to="/admin/trash">
          <Icon name="trash" size={17} /> Корзина
        </NavLink>
        <button className="admin__logout" onClick={logout}>
          <Icon name="close" size={15} /> Выйти ({user.username})
        </button>
      </aside>
      <div className="admin__main">
        <Outlet />
      </div>
    </div>
  );
}
