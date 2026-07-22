import { useEffect, useState } from "react";
import ProductImage from "./ProductImage";

/* Галерея товара: крупный кадр + миниатюры.
   Если картинок нет — отдаём прежний плейсхолдер по категории. */
export default function ProductGallery({ product, className = "" }) {
  const images = product.images?.length
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  const [active, setActive] = useState(0);

  /* Переключились на другой товар — снова показываем обложку. */
  useEffect(() => { setActive(0); }, [product.id]);

  if (images.length === 0) {
    return <ProductImage product={product} size={130} className={className} />;
  }

  return (
    <div className="prod-gallery">
      <div className={`prod-gallery__main ${className}`}>
        <img src={images[active]} alt={product.title} />
      </div>

      {images.length > 1 && (
        <div className="prod-gallery__thumbs">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={"prod-gallery__thumb" + (i === active ? " is-active" : "")}
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              aria-current={i === active}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
