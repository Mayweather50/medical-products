import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../lib/usePageTitle";

export default function LoginPage() {
  usePageTitle("Вход");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setError(null);

    if (form.username.trim().length < 3) return setError("Логин — минимум 3 символа");
    if (form.password.length < 6) return setError("Пароль — минимум 6 символов");

    setSending(true);
    try {
      const auth =
        mode === "login"
          ? await login(form.username.trim(), form.password)
          : await register(form.username.trim(), form.password);
      const from = location.state?.from;
      navigate(from || (auth.role === "ROLE_ADMIN" ? "/admin" : "/"), { replace: true });
    } catch (err) {
      setError(
        err.status === 401
          ? "Неверный логин или пароль"
          : err.message
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="wrap section auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "is-active" : ""}
            onClick={() => { setMode("login"); setError(null); }}
          >
            Вход
          </button>
          <button
            className={mode === "register" ? "is-active" : ""}
            onClick={() => { setMode("register"); setError(null); }}
          >
            Регистрация
          </button>
        </div>

        <form className="lead-form" onSubmit={submit} noValidate>
          <label className="field">
            <span className="field__lbl">Логин</span>
            <input
              type="text"
              value={form.username}
              onChange={set("username")}
              placeholder="username"
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span className="field__lbl">Пароль</span>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {error && <div className="lead-form__error">{error}</div>}

          <Button type="submit" variant="primary" size="lg" className="lead-form__submit" disabled={sending}>
            {sending ? "Подождите…" : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </Button>
        </form>
      </div>
    </div>
  );
}
