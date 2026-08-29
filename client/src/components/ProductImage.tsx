import { ImageIcon } from "lucide-react";

/**
 * Renders a product image, or a clean branded placeholder when no image
 * has been uploaded yet. Swap in real product photography via the admin
 * product editor — this component just needs a non-empty `src`.
 */
export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-paper text-muted/60 ${className}`}>
        <ImageIcon size={28} strokeWidth={1.25} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
