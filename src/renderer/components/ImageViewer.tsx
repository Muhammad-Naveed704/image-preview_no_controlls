/**
 * Main image viewer with zoom and pan.
 * Read-only. Uses image.fileUrl (file://) for src.
 */

import { useRef, useCallback, useState, useEffect } from 'react';

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 0.25;

function clampScale(s: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, s));
}

export interface ImageViewerProps {
  image: { fileUrl: string; name: string } | null;
  scale?: number;
  setScale?: React.Dispatch<React.SetStateAction<number>>;
  onLoad?: (width: number, height: number) => void;
}

export function ImageViewer({ image, scale: controlledScale, setScale: setScaleFromParent, onLoad }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalScale, setInternalScale] = useState(1);
  const scale = controlledScale ?? internalScale;
  const setScale = setScaleFromParent ?? setInternalScale;
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setScale((prev: number) => clampScale(prev + delta));
    },
    [setScale]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, offsetX: offset.x, offsetY: offset.y };
    },
    [offset.x, offset.y]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: dragStart.current.offsetX + (e.clientX - dragStart.current.x),
        y: dragStart.current.offsetY + (e.clientY - dragStart.current.y),
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      dragStart.current = { x: t.clientX, y: t.clientY, offsetX: offset.x, offsetY: offset.y };
      setIsDragging(true);
    },
    [offset.x, offset.y]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 1 || !isDragging) return;
      e.preventDefault();
      const t = e.touches[0];
      setOffset({
        x: dragStart.current.offsetX + (t.clientX - dragStart.current.x),
        y: dragStart.current.offsetY + (t.clientY - dragStart.current.y),
      });
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [image?.fileUrl, setScale]);

  if (!image) {
    return (
      <div className="image-viewer image-viewer--empty" ref={containerRef}>
        <p className="image-viewer__placeholder">No image selected</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="image-viewer"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      role="img"
      aria-label={image.name}
    >
      <div
        className="image-viewer__inner"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
      >
        <img
          src={image.fileUrl}
          alt={image.name}
          draggable={false}
          className="image-viewer__img"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) onLoad?.(img.naturalWidth, img.naturalHeight);
          }}
        />
      </div>
    </div>
  );
}

export function useImageViewerZoom() {
  const [scale, setScale] = useState(1);
  const zoomIn = useCallback(() => setScale((s) => clampScale(s + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setScale((s) => clampScale(s - ZOOM_STEP)), []);
  const resetZoom = useCallback(() => setScale(1), []);
  return { scale, setScale, zoomIn, zoomOut, resetZoom };
}
