/**
 * Fullscreen control only. No open folder, nav, or count (security).
 */

export interface ControlsProps {
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function Controls({
  onToggleFullscreen,
  isFullscreen,
}: ControlsProps) {
  return (
    <div className="controls">
      <button
        type="button"
        className="controls__btn controls__btn--fullscreen"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (Enter)'}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? '✕' : '⛶'}
      </button>
    </div>
  );
}
