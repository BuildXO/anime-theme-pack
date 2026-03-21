"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixChecksums = fixChecksums;
exports.restoreChecksums = restoreChecksums;
exports.cleanupOldBackups = cleanupOldBackups;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const constants_1 = require("./constants");
/**
 * Compute SHA256 checksum for a file
 */
function computeChecksum(file) {
    try {
        const contents = fs.readFileSync(file);
        return crypto
            .createHash('sha256')
            .update(contents)
            .digest('base64')
            .replace(/=+$/, '');
    }
    catch (error) {
        console.error(`Failed to compute checksum for ${file}:`, error);
        throw error;
    }
}
/**
 * Fix VSCode checksums to remove "Unsupported" warning
 */
function fixChecksums() {
    try {
        if (!fs.existsSync(constants_1.productFile)) {
            console.warn('product.json not found, skipping checksum fix');
            return;
        }
        const product = JSON.parse(fs.readFileSync(constants_1.productFile, 'utf8'));
        if (!product.checksums) {
            console.warn('No checksums found in product.json');
            return;
        }
        let checksumChanged = false;
        for (const [filePath, currentChecksum] of Object.entries(product.checksums)) {
            const fullPath = path.join(constants_1.outDirectory, ...filePath.split('/'));
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
            if (!fs.existsSync(constants_1.originalProductFile)) {
                fs.copyFileSync(constants_1.productFile, constants_1.originalProductFile);
            }
            // Write updated checksums
            const json = JSON.stringify(product, null, '\t');
            fs.writeFileSync(constants_1.productFile, json, { encoding: 'utf8' });
            console.log('Checksums fixed successfully');
        }
    }
    catch (error) {
        console.error('Failed to fix checksums:', error);
    }
}
/**
 * Restore original checksums
 */
function restoreChecksums() {
    try {
        if (fs.existsSync(constants_1.originalProductFile)) {
            if (fs.existsSync(constants_1.productFile)) {
                fs.unlinkSync(constants_1.productFile);
            }
            fs.copyFileSync(constants_1.originalProductFile, constants_1.productFile);
            console.log('Checksums restored successfully');
        }
    }
    catch (error) {
        console.error('Failed to restore checksums:', error);
    }
}
/**
 * Clean up old backup files from previous versions
 */
function cleanupOldBackups(currentVersion) {
    try {
        const appDirectory = path.dirname(path.dirname(constants_1.outDirectory));
        const files = fs.readdirSync(appDirectory);
        const oldBackups = files.filter(file => /\.orig\./.test(file) && !file.endsWith(currentVersion));
        for (const file of oldBackups) {
            const filePath = path.join(appDirectory, file);
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old backup: ${file}`);
        }
    }
    catch (error) {
        console.error('Failed to cleanup old backups:', error);
    }
}
//# sourceMappingURL=checksumService.js.map