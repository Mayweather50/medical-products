/* Состояния загрузки и ошибки для блоков, ждущих данные API. */

export function Loading({ label = "Загрузка…" }) {
  return (
    <div className="state-block">
      <span className="spinner" />
      {label}
    </div>
  );
}

export function LoadError({ error, retry }) {
  return (
    <div className="state-block state-block--err">
      <p>Не удалось загрузить данные{error?.message ? `: ${error.message}` : ""}.</p>
      {retry && (
        <button className="state-block__retry" onClick={retry}>
          Повторить
        </button>
      )}
    </div>
  );
}
