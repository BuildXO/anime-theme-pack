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
exports.saveBackgroundConfig = saveBackgroundConfig;
exports.clearBackgroundConfig = clearBackgroundConfig;
exports.getStoredThemeId = getStoredThemeId;
exports.storeInitialConfig = storeInitialConfig;
exports.restoreBackgroundInstallation = restoreBackgroundInstallation;
exports.attemptAutoInstall = attemptAutoInstall;
const vscode = __importStar(require("vscode"));
const constants_1 = require("./constants");
const backgroundService_1 = require("./backgroundService");
const checksumService_1 = require("./checksumService");
/**
 * Save background installation configuration for restoration
 */
function saveBackgroundConfig(theme, context) {
    const config = {
        themeId: theme.id,
        themLabel: theme.label
    };
    context.globalState.update(constants_1.BACKGROUND_INSTALL_KEY, JSON.stringify(config));
}
/**
 * Clear background installation configuration
 */
function clearBackgroundConfig(context) {
    context.globalState.update(constants_1.BACKGROUND_INSTALL_KEY, undefined);
}
/**
 * Check if background was previously installed
 */
function wasBackgroundInstalled(context) {
    const config = context.globalState.get(constants_1.BACKGROUND_INSTALL_KEY);
    return config !== undefined;
}
/**
 * Get stored background configuration
 */
function getBackgroundConfig(context) {
    const configString = context.globalState.get(constants_1.BACKGROUND_INSTALL_KEY);
    if (!configString) {
        return null;
    }
    try {
        return JSON.parse(configString);
    }
    catch {
        return null;
    }
}
/**
 * Get the theme ID that was last successfully installed, or undefined.
 * Used on activation to initialise the last-installed-theme tracker so
 * we never re-prompt for a theme that is already installed.
 */
function getStoredThemeId(context) {
    return getBackgroundConfig(context)?.themeId;
}
/**
 * Save current VSCode version
 */
function saveCurrentVersion(context) {
    context.globalState.update(constants_1.PREVIOUS_VERSION_KEY, vscode.version);
}
/**
 * Check if VSCode version has changed
 */
function hasVersionChanged(context) {
    const storedVersion = context.globalState.get(constants_1.PREVIOUS_VERSION_KEY);
    return storedVersion !== undefined && storedVersion !== vscode.version;
}
/**
 * Store initial configuration on first run
 */
function storeInitialConfig(context) {
    saveCurrentVersion(context);
    // Check if background is already installed in CSS
    if ((0, backgroundService_1.isBackgroundInstalled)()) {
        // Try to detect which theme is currently active
        const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
        const matchedTheme = constants_1.THEMES.find(t => currentTheme?.includes(t.label));
        if (matchedTheme) {
            saveBackgroundConfig(matchedTheme, context);
        }
    }
    else {
        clearBackgroundConfig(context);
    }
}
/**
 * Restore background installation after VSCode update
 */
async function restoreBackgroundInstallation(context) {
    saveCurrentVersion(context);
    if (!wasBackgroundInstalled(context)) {
        return;
    }
    const config = getBackgroundConfig(context);
    // Prefer the currently active anime theme over the stored config.
    // This prevents reverting to a stale stored theme (e.g. animee-classic)
    // when the user has already switched to a different theme between restarts.
    const currentThemeName = vscode.workspace
        .getConfiguration('workbench')
        .get('colorTheme');
    const currentTheme = constants_1.THEMES.find(t => currentThemeName?.includes(t.label));
    const storedTheme = config ? constants_1.THEMES.find(t => t.id === config.themeId) : undefined;
    // Use whichever theme is currently active; fall back to stored if no anime
    // theme is active right now (e.g. user is temporarily on a different theme).
    const theme = currentTheme ?? storedTheme;
    if (!theme) {
        console.warn(`[Anime Theme] No theme found for restoration (current: ${currentThemeName}, stored: ${config?.themeId})`);
        return;
    }
    // Show progress notification
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Restoring ${theme.label} background...`,
        cancellable: false
    }, async () => {
        const status = (0, backgroundService_1.installBackground)(context, theme);
        if (status === constants_1.InstallStatus.INSTALLED) {
            // Re-apply transparent/balancing colors for the current theme name
            // so panels stay transparent after the restore.
            await (0, backgroundService_1.applyTransparentColors)();
            (0, checksumService_1.fixChecksums)();
            // Update stored config to match what was actually restored
            saveBackgroundConfig(theme, context);
            vscode.window
                .showInformationMessage(`${theme.label} background restored. Please close VS Code now, then reopen it to load the updated workbench CSS.`, 'Close VS Code', 'Later')
                .then(async (selection) => {
                if (selection === 'Close VS Code') {
                    try {
                        await vscode.commands.executeCommand('workbench.action.quit');
                    }
                    catch {
                        await vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                }
            });
        }
        else {
            vscode.window.showErrorMessage(`Failed to restore ${theme.label} background. You may need to reinstall it manually.`);
        }
    });
}
/**
 * Attempt to perform auto-installation on extension activation
 */
async function attemptAutoInstall(context) {
    const storedVersion = context.globalState.get(constants_1.PREVIOUS_VERSION_KEY);
    if (!storedVersion) {
        // First run - store initial configuration
        storeInitialConfig(context);
    }
    else if (hasVersionChanged(context)) {
        // VSCode was updated - restore installation
        await restoreBackgroundInstallation(context);
    }
}
//# sourceMappingURL=autoInstaller.js.map