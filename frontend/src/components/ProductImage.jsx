import { CatIcon } from "./Icon";
import { catMeta } from "../lib/categoryMeta";

/* Плейсхолдер изображения товара: цветовая схема и иконка категории.
   Если у товара появится imageUrl — показываем настоящую картинку. */
export default function ProductImage({ product, ratio = "1 / 1", size = 64, className = "" }) {
  const { icon } = catMeta(product.category);

  if (product.imageUrl) {
    return (
      <div className={`prod-img ${className}`} style={{ aspectRatio: ratio }} data-cat={icon}>
        <img src={product.imageUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div className={`prod-img ${className}`} style={{ aspectRatio: ratio }} data-cat={icon}>
      <div className="prod-img__grid" />
      <div className="prod-img__ic">
        <CatIcon name={icon} size={size} />
      </div>
      <span className="prod-img__art">{product.article}</span>
    </div>
  );
}
