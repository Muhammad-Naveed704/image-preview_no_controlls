/**
 * Displays optional image metadata: name, size, resolution.
 * Read-only display; no edit/delete actions.
 */

import type { LocalImageItem } from '../types/images';

export interface ImageInfoProps {
  image: LocalImageItem | null;
}

function formatSize(bytes?: number): string {
  if (bytes == null || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatResolution(width?: number, height?: number): string {
  if (width != null && height != null) return `${width} × ${height}`;
  return '—';
}

export function ImageInfo({ image }: ImageInfoProps) {
  if (!image) return null;

  return (
    <div className="image-info">
      <span className="image-info__name" title={image.name}>
        {image.name}
      </span>
      <span className="image-info__meta">
        {formatSize(image.size)} · {formatResolution(image.width, image.height)}
      </span>
    </div>
  );
}
