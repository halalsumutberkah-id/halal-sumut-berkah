'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: { imageUrl: string }[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-2xl bg-muted" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <Image src={images[activeIndex].imageUrl} alt={alt} fill className="object-cover" priority />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.imageUrl}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn('relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors', activeIndex === index ? 'border-primary' : 'border-transparent')}
            >
              <Image src={image.imageUrl} alt={`${alt} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
