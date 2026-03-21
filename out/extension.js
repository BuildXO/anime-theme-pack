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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const themeManager_1 = require("./themeManager");
const autoInstaller_1 = require("./autoInstaller");
const checksumService_1 = require("./checksumService");
const backgroundService_1 = require("./backgroundService");
/**
 * Extension activation
 */
async function activate(context) {
    console.log('Anime Theme Pack is now active');
    // Check if running in development mode
    const isDevelopment = context.extensionMode === vscode.ExtensionMode.Development;
    if (isDevelopment) {
        console.warn('[Anime Theme] Running in DEVELOPMENT mode');
        console.warn('[Anime Theme] Background installation will modify your ACTUAL VS Code, not the Extension Development Host');
    }
    // Clean up old backup files from previous VSCode versions
    try {
        (0, checksumService_1.cleanupOldBackups)(vscode.version);
    }
    catch (error) {
        console.error('Failed to cleanup old backups:', error);
    }
    // Attempt auto-installation if VSCode was updated
    try {
        await (0, autoInstaller_1.attemptAutoInstall)(context);
    }
    catch (error) {
        console.error('Failed to perform auto-install:', error);
    }
    // Register command: Install background for current theme
    const installCurrentCommand = vscode.commands.registerCommand('animeTheme.installBackground', async () => {
        await (0, themeManager_1.installCurrentThemeBackground)(context);
    });
    // Register command: Choose theme and install background
    const chooseThemeCommand = vscode.commands.registerCommand('animeTheme.chooseBackground', async () => {
        await (0, themeManager_1.showThemePicker)(context);
    });
    // Register command: Remove background
    const removeCommand = vscode.commands.registerCommand('animeTheme.removeBackground', async () => {
        await (0, themeManager_1.uninstallBackground)(context);
    });
    // Register command: Reinstall background (for troubleshooting)
    const reinstallCommand = vscode.commands.registerCommand('animeTheme.reinstallBackground', async () => {
        await (0, themeManager_1.uninstallBackground)(context);
        // Wait a moment before reinstalling
        await new Promise(resolve => setTimeout(resolve, 100));
        await (0, themeManager_1.installCurrentThemeBackground)(context);
    });
    // Add commands to subscriptions
    context.subscriptions.push(installCurrentCommand, chooseThemeCommand, removeCommand, reinstallCommand);
    // ── Theme-change state ─────────────────────────────────────────────────────
    //
    // VS Code fires workbench.colorTheme on EVERY hover during live preview AND
    // again when the user commits a selection. Two guards prevent unwanted behaviour:
    //
    //   themeChangeTimer     – debounce: only act 1 500 ms after the LAST event.
    //                          Hover previews fire and settle within milliseconds;
    //                          only the theme the user commits to survives the wait.
    //
    //   lastInstalledThemeId – skip: if the committed theme is the same as what is
    //                          already installed, don't show a redundant popup.
    //
    // NOTE: we intentionally do NOT have a re-entrancy guard (isHandlingThemeChange).
    // Such a guard would silently drop theme-change events that arrive while a popup
    // is waiting for user input, causing the "image didn't change" bug. The debounce
    // alone is sufficient; concurrent installs cannot occur because each debounce
    // timer cancels its predecessor.
    //
    let themeChangeTimer;
    let lastInstalledThemeId = (0, autoInstaller_1.getStoredThemeId)(context);
    // Watch for configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('animeTheme.background.enabled') ||
            e.affectsConfiguration('animeTheme.background.path') ||
            e.affectsConfiguration('animeTheme.background.opacity') ||
            e.affectsConfiguration('animeTheme.background.anchor') ||
            e.affectsConfiguration('animeTheme.background.blur')) {
            const response = await vscode.window.showInformationMessage('Background settings changed. Would you like to apply the changes?', 'Apply', 'Later');
            if (response === 'Apply') {
                await (0, themeManager_1.installCurrentThemeBackground)(context);
            }
        }
        if (e.affectsConfiguration('workbench.colorTheme')) {
            // Always reset the debounce timer on every event, including hover previews.
            if (themeChangeTimer) {
                clearTimeout(themeChangeTimer);
            }
            themeChangeTimer = setTimeout(async () => {
                themeChangeTimer = undefined;
                if (!(0, backgroundService_1.isBackgroundInstalled)()) {
                    return;
                }
                // Capture the theme RIGHT NOW at debounce-settle time and use this
                // exact object throughout — never re-read getCurrentTheme() later so
                // a concurrent hover or event cannot swap in the wrong theme.
                const newTheme = (0, themeManager_1.getCurrentTheme)();
                if (!newTheme) {
                    // Switched away from an anime theme — nothing to install.
                    return;
                }
                // Already installed for this exact theme — nothing to do.
                if (newTheme.id === lastInstalledThemeId) {
                    return;
                }
                const response = await vscode.window.showInformationMessage(`Switched to "${newTheme.label}". Install its background image?`, 'Install', 'Later');
                if (response === 'Install') {
                    // Pass newTheme directly — do not call installCurrentThemeBackground
                    // which would re-read getCurrentTheme() and could pick the wrong theme.
                    await (0, themeManager_1.installThemeBackground)(context, newTheme);
                    lastInstalledThemeId = newTheme.id;
                }
            }, 1500);
        }
    });
    context.subscriptions.push(configWatcher);
    console.log('Anime Theme Pack commands registered successfully');
}
/**
 * Extension deactivation
 */
function deactivate() {
    console.log('Anime Theme Pack is now deactivated');
    // Note: We cannot automatically clean up CSS modifications on deactivation
    // Users must manually run the "Remove Background" command before uninstalling
}
//# sourceMappingURL=extension.js.map