/**
 * Root application component.
 * Single-image only: opened via "Open with" image file. No folder, no gallery, no nav.
 * Security: no delete, reload, copy, paste, select all. Zoom and fullscreen only.
 */

import { useState, useCallback, useEffect } from 'react';
import { ImageViewer, useImageViewerZoom } from './components/ImageViewer';
import { Controls } from './components/Controls';
import { ZoomBar } from './components/ZoomBar';
import { ImageInfo } from './components/ImageInfo';
import type { LocalImageItem } from './types/images';
import './styles/main.css';

function getElectronAPI(): ElectronAPI | undefined {
  return typeof window !== 'undefined' ? window.electronAPI : undefined;
}

export default function App() {
  const [images, setImages] = useState<LocalImageItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const { scale, setScale, zoomIn, zoomOut, resetZoom } = useImageViewerZoom();

  const api = getElectronAPI();
  const currentImage: LocalImageItem | null = images.length > 0 ? images[0] ?? null : null;

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  /** When app was opened via "Open with" an image file, show only that single image */
  useEffect(() => {
    if (!api?.getInitialOpenFolder) return;
    api.getInitialOpenFolder().then((data: any) => {
      if (data?.images?.length) {
        setImages(data.images);
        setImageDimensions(null);
      }
    });
  }, [api]);

  const handleImageLoad = useCallback((width: number, height: number) => {
    setImageDimensions({ width, height });
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
        return;
      }
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        toggleFullscreen();
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  if (images.length === 0 && api) {
    return (
      <div className="app app--empty">
        <div className="app__empty">
          <p>Open an image with this app</p>
          <p className="app__empty-hint">Right-click image → Open with → Image Previewer</p>
        </div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="app app--error">
        <div className="app__error">
          <p>This app runs in Electron. Use the desktop build.</p>
        </div>
      </div>
    );
  }

  const currentWithDimensions: LocalImageItem | null = currentImage
    ? {
        ...currentImage,
        width: imageDimensions?.width ?? currentImage.width,
        height: imageDimensions?.height ?? currentImage.height,
      }
    : null;

  return (
    <div className={`app ${isFullscreen ? 'app--fullscreen' : ''}`}>
      <header className="app__header">
        <ZoomBar scale={scale} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
        <Controls onToggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />
      </header>

      <main className="app__main">
        <ImageViewer
          image={currentImage}
          scale={scale}
          setScale={setScale}
          onLoad={handleImageLoad}
        />
      </main>

      <footer className="app__footer">
        <ImageInfo image={currentWithDimensions} />
      </footer>
    </div>
  );
}
