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
exports.getThemeById = getThemeById;
exports.getCurrentTheme = getCurrentTheme;
exports.installThemeBackground = installThemeBackground;
exports.uninstallBackground = uninstallBackground;
exports.installCurrentThemeBackground = installCurrentThemeBackground;
exports.showThemePicker = showThemePicker;
const vscode = __importStar(require("vscode"));
const constants_1 = require("./constants");
const backgroundService_1 = require("./backgroundService");
const checksumService_1 = require("./checksumService");
const autoInstaller_1 = require("./autoInstaller");
/**
 * Request a full VS Code restart (quit + manual reopen), which is more
 * reliable than window reload for workbench CSS file modifications.
 */
async function promptForFullRestart(message) {
    const selection = await vscode.window.showInformationMessage(message, 'Close VS Code', 'Later');
    if (selection === 'Close VS Code') {
        try {
            await vscode.commands.executeCommand('workbench.action.quit');
        }
        catch {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }
}
/**
 * Get theme by ID
 */
function getThemeById(themeId) {
    return constants_1.THEMES.find(t => t.id === themeId);
}
/**
 * Get currently active theme
 */
function getCurrentTheme() {
    const currentTheme = vscode.workspace
        .getConfiguration('workbench')
        .get('colorTheme');
    return constants_1.THEMES.find(t => currentTheme?.includes(t.label));
}
/**
 * Request user consent for CSS modification
 */
async function requestConsent(context) {
    const hasConsented = context.globalState.get(constants_1.CONSENT_KEY);
    if (hasConsented) {
        return true;
    }
    const message = 'Installing background images requires modifying VS Code\'s CSS files. ' +
        'This will show an "Unsupported" warning that can be safely dismissed. ' +
        'You can use the "Remove Background" command to restore VS Code to its original state.\n\n' +
        'Do you want to continue?';
    const result = await vscode.window.showWarningMessage(message, { modal: true }, 'Install Background', 'Cancel');
    if (result === 'Install Background') {
        context.globalState.update(constants_1.CONSENT_KEY, true);
        return true;
    }
    return false;
}
/**
 * Install background for a specific theme
 */
async function installThemeBackground(context, theme) {
    // Check consent
    const hasConsent = await requestConsent(context);
    if (!hasConsent) {
        return;
    }
    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Installing ${theme.label} background...`,
        cancellable: false
    }, async () => {
        const status = (0, backgroundService_1.installBackground)(context, theme);
        if (status === constants_1.InstallStatus.INSTALLED) {
            // Apply transparent color tokens via VS Code's settings API so theme
            // backgrounds don't cover the body background-image in any panel.
            await (0, backgroundService_1.applyTransparentColors)();
            // Fix checksums to remove "Unsupported" warning
            (0, checksumService_1.fixChecksums)();
            // Save configuration for auto-restore
            (0, autoInstaller_1.saveBackgroundConfig)(theme, context);
            await promptForFullRestart(`${theme.label} background installed. Please close VS Code now, then reopen it to load the updated workbench CSS.`);
        }
        else if (status === constants_1.InstallStatus.FAILURE) {
            vscode.window.showErrorMessage('Failed to install background. Please ensure VS Code has write permissions to its installation directory. ' +
                'You may need to run VS Code as administrator (Windows) or with appropriate permissions.');
        }
    });
}
/**
 * Remove all background images
 */
async function uninstallBackground(context) {
    if (!(0, backgroundService_1.isBackgroundInstalled)()) {
        vscode.window.showInformationMessage('No background image is currently installed.');
        return;
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Removing background image...',
        cancellable: false
    }, async () => {
        const status = (0, backgroundService_1.removeBackground)();
        if (status === constants_1.InstallStatus.INSTALLED) {
            // Remove transparent color token overrides
            await (0, backgroundService_1.removeTransparentColors)();
            // Restore original checksums
            (0, checksumService_1.restoreChecksums)();
            // Clear configuration
            (0, autoInstaller_1.clearBackgroundConfig)(context);
            await promptForFullRestart('Background removed successfully. Please close VS Code now, then reopen it to apply the restored workbench CSS.');
        }
        else {
            vscode.window.showErrorMessage('Failed to remove background image.');
        }
    });
}
/**
 * Install background for the currently active theme
 */
async function installCurrentThemeBackground(context) {
    const currentTheme = getCurrentTheme();
    if (!currentTheme) {
        vscode.window.showWarningMessage('Please activate one of the Anime Theme Pack themes first.');
        return;
    }
    await installThemeBackground(context, currentTheme);
}
/**
 * Show theme picker and install selected theme's background
 */
async function showThemePicker(context) {
    const items = constants_1.THEMES.map(theme => ({
        label: theme.label,
        description: theme.backgroundImage,
        theme: theme
    }));
    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a theme to install its background'
    });
    if (selected) {
        await installThemeBackground(context, selected.theme);
    }
}
//# sourceMappingURL=themeManager.js.map