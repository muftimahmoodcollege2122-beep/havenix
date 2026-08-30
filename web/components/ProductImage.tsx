import Image from "next/image";
import { ImageIcon } from "lucide-react";

/**
 * Renders a product image, or a clean branded placeholder when no image
 * has been uploaded yet. Swap in real product photography via the admin
 * product editor — this component just needs a non-empty `src`.
 *
 * Always used inside a `relative` parent with a fixed aspect ratio (product
 * cards, hero, gallery), so `fill` is safe everywhere this is used.
 */
export default function ProductImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-paper text-muted/60 ${className}`}>
        <ImageIcon size={28} strokeWidth={1.25} />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      loading={priority ? undefined : "lazy"}
    />
  );
}
