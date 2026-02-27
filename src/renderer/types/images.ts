/**
 * Types for local folder images.
 * All fields are read-only; no edit/delete metadata.
 */

/** Single image from a local folder */
export interface LocalImageItem {
  path: string;
  /** file:// URL for img src (from main process) */
  fileUrl: string;
  name: string;
  size?: number;
  width?: number;
  height?: number;
}
