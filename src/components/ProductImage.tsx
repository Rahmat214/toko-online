import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
}

export function ProductImage({
  src,
  alt,
  className = '',
  aspectClassName = 'aspect-[4/3]',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`${aspectClassName} flex flex-col items-center justify-center bg-[#EFECE6] text-[#6B6963] px-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-7 h-7 mb-2 opacity-60" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-xs font-medium line-clamp-2 max-w-[20ch]">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`${aspectClassName} overflow-hidden bg-[#F2EFE9] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}
