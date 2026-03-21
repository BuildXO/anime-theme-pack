import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { productFile, originalProductFile, outDirectory } from './constants';

/**
 * Compute SHA256 checksum for a file
 */
function computeChecksum(file: string): string {
  try {
    const contents = fs.readFileSync(file);
    return crypto
      .createHash('sha256')
      .update(contents)
      .digest('base64')
      .replace(/=+$/, '');
  } catch (error) {
    console.error(`Failed to compute checksum for ${file}:`, error);
    throw error;
  }
}

/**
 * Fix VSCode checksums to remove "Unsupported" warning
 */
export function fixChecksums(): void {
  try {
    if (!fs.existsSync(productFile)) {
      console.warn('product.json not found, skipping checksum fix');
      return;
    }

    const product: any = JSON.parse(fs.readFileSync(productFile, 'utf8'));

    if (!product.checksums) {
      console.warn('No checksums found in product.json');
      return;
    }

    let checksumChanged = false;

    for (const [filePath, currentChecksum] of Object.entries(product.checksums)) {
      const fullPath = path.join(outDirectory, ...filePath.split('/'));
      
      if (!fs.existsSync(fullPath)) {
        continue;
      }

      const checksum = computeChecksum(fullPath);

      if (checksum !== currentChecksum) {
        product.checksums[filePath] = checksum;
        checksumChanged = true;
      }
    }

    if (checksumChanged) {
      // Backup original product.json if not already backed up
      if (!fs.existsSync(originalProductFile)) {
        fs.copyFileSync(productFile, originalProductFile);
      }

      // Write updated checksums
      const json = JSON.stringify(product, null, '\t');
      fs.writeFileSync(productFile, json, { encoding: 'utf8' });
      
      console.log('Checksums fixed successfully');
    }
  } catch (error) {
    console.error('Failed to fix checksums:', error);
  }
}

/**
 * Restore original checksums
 */
export function restoreChecksums(): void {
  try {
    if (fs.existsSync(originalProductFile)) {
      if (fs.existsSync(productFile)) {
        fs.unlinkSync(productFile);
      }
      fs.copyFileSync(originalProductFile, productFile);
      console.log('Checksums restored successfully');
    }
  } catch (error) {
    console.error('Failed to restore checksums:', error);
  }
}

/**
 * Clean up old backup files from previous versions
 */
export function cleanupOldBackups(currentVersion: string): void {
  try {
    const appDirectory = path.dirname(path.dirname(outDirectory));
    const files = fs.readdirSync(appDirectory);
    
    const oldBackups = files.filter(file => 
      /\.orig\./.test(file) && !file.endsWith(currentVersion)
    );

    for (const file of oldBackups) {
      const filePath = path.join(appDirectory, file);
      fs.unlinkSync(filePath);
      console.log(`Cleaned up old backup: ${file}`);
    }
  } catch (error) {
    console.error('Failed to cleanup old backups:', error);
  }
}
