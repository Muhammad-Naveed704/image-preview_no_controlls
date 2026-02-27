/**
 * Zoom in / out and reset controls.
 * Read-only viewer: no edit or delete actions.
 */

import { MIN_ZOOM, MAX_ZOOM } from './ImageViewer';

export interface ZoomBarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomBar({ scale, onZoomIn, onZoomOut, onReset }: ZoomBarProps) {
  const canZoomIn = scale < MAX_ZOOM;
  const canZoomOut = scale > MIN_ZOOM;

  return (
    <div className="zoom-bar">
      <button
        type="button"
        className="zoom-bar__btn"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        type="button"
        className="zoom-bar__percent"
        onClick={onReset}
        title="Reset zoom to 100%"
        aria-label={`Zoom ${Math.round(scale * 100)}%. Reset to 100%.`}
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        className="zoom-bar__btn"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  );
}
