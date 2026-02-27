/**
 * Thumbnail strip for local folder images.
 * Uses image.fileUrl (file://) for src. Read-only.
 */

import type { LocalImageItem } from '../types/images';

export interface ThumbnailStripProps {
  images: LocalImageItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function ThumbnailStrip({ images, currentIndex, onSelect }: ThumbnailStripProps) {
  if (images.length === 0) return null;

  return (
    <div className="thumbnail-strip" role="tablist" aria-label="Image thumbnails">
      {images.map((img, index) => (
        <button
          key={img.path}
          type="button"
          role="tab"
          aria-selected={index === currentIndex}
          aria-label={`View image ${index + 1}: ${img.name}`}
          className={`thumbnail-strip__item ${index === currentIndex ? 'thumbnail-strip__item--active' : ''}`}
          onClick={() => onSelect(index)}
        >
          <img src={img.fileUrl} alt="" loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
  );
}
