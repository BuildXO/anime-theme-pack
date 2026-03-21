import * as fs from 'fs';
import * as path from 'path';

/**
 * Convert local image file to base64 data URL
 */
export function loadImageBase64FromFile(filePath: string): string {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const imageExtension = path.extname(filePath).substring(1);
    return `data:image/${imageExtension};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Failed to load image from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Create directory recursively if it doesn't exist
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
