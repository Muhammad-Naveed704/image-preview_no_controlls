# Image Previewer (Electron)

A **preview-only** desktop image viewer built with Electron and React. Open a local folder to view .jpg, .png, and .webp images with zoom, pan, fullscreen, and keyboard navigation. No delete, rename, or edit actions anywhere.

## Features

- **Preview only** — View images only; no delete, rename, or edit
- **Fullscreen** — Toggle with **Enter**; exit with **Esc**
- **Zoom & pan** — Mouse wheel zoom (25%–400%); drag to pan
- **Zoom bar** — +/- buttons and click percentage to reset to 100%
- **Image info** — Name, size, and resolution below the image
- **Safe & read-only** — Renderer cannot access or modify files; main process serves images via a custom protocol
- **TypeScript** — Typed codebase, modular structure
- **Windows** — Builds to `.exe` (NSIS installer + portable)

## Project structure

```
image-previewer/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Window, folder picker, local-image protocol, IPC
│   │   └── preload.ts     # Safe bridge: openFolder, getImageUrl
│   ├── renderer/          # React UI
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── components/    # ImageViewer, Controls, ThumbnailStrip, ZoomBar, ImageInfo
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── types/
├── dist/                  # Build output
├── release/               # Packaged app / installer
├── package.json
├── tsconfig.json
├── tsconfig.main.json
└── vite.config.ts
```



## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

To run separately:

- Terminal 1: `npm run dev:renderer`
- Terminal 2: `npm run dev:main`

## Build and run (production)

```bash
npm run build
npm run start
```



## Package for Windows (.exe)

```bash
npm run dist:win
```

Outputs in `release/`:

- **Image Previewer Setup x.x.x.exe** — NSIS installer
- **Image Previewer x.x.x.exe** — Portable executable

For other platforms: `npm run dist`



## Tech stack

- **Electron** — Desktop shell, dialog, custom protocol
- **React 18** + **TypeScript** — UI
- **Vite** — Renderer build and dev server
- **electron-builder** — Windows (and other) packaging

## License

MIT
