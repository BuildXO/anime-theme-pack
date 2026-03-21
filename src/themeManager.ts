import * as vscode from 'vscode';
import {
  THEMES,
  ThemeDefinition,
  InstallStatus,
  CONSENT_KEY
} from './constants';
import {
  installBackground,
  removeBackground,
  isBackgroundInstalled,
  applyTransparentColors,
  removeTransparentColors
} from './backgroundService';
import { fixChecksums, restoreChecksums } from './checksumService';
import { saveBackgroundConfig, clearBackgroundConfig } from './autoInstaller';

/**
 * Request a full VS Code restart (quit + manual reopen), which is more
 * reliable than window reload for workbench CSS file modifications.
 */
async function promptForFullRestart(message: string): Promise<void> {
  const selection = await vscode.window.showInformationMessage(
    message,
    'Close VS Code',
    'Later'
  );

  if (selection === 'Close VS Code') {
    try {
      await vscode.commands.executeCommand('workbench.action.quit');
    } catch {
      await vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
  }
}

/**
 * Get theme by ID
 */
export function getThemeById(themeId: string): ThemeDefinition | undefined {
  return THEMES.find(t => t.id === themeId);
}

/**
 * Get currently active theme
 */
export function getCurrentTheme(): ThemeDefinition | undefined {
  const currentTheme = vscode.workspace
    .getConfiguration('workbench')
    .get<string>('colorTheme');

  return THEMES.find(t => currentTheme?.includes(t.label));
}

/**
 * Request user consent for CSS modification
 */
async function requestConsent(
  context: vscode.ExtensionContext
): Promise<boolean> {
  const hasConsented = context.globalState.get<boolean>(CONSENT_KEY);

  if (hasConsented) {
    return true;
  }

  const message =
    'Installing background images requires modifying VS Code\'s CSS files. ' +
    'This will show an "Unsupported" warning that can be safely dismissed. ' +
    'You can use the "Remove Background" command to restore VS Code to its original state.\n\n' +
    'Do you want to continue?';

  const result = await vscode.window.showWarningMessage(
    message,
    { modal: true },
    'Install Background',
    'Cancel'
  );

  if (result === 'Install Background') {
    context.globalState.update(CONSENT_KEY, true);
    return true;
  }

  return false;
}

/**
 * Install background for a specific theme
 */
export async function installThemeBackground(
  context: vscode.ExtensionContext,
  theme: ThemeDefinition
): Promise<void> {
  // Check consent
  const hasConsent = await requestConsent(context);
  
  if (!hasConsent) {
    return;
  }

  // Show progress
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Installing ${theme.label} background...`,
      cancellable: false
    },
    async () => {
      const status = installBackground(context, theme);

      if (status === InstallStatus.INSTALLED) {
        // Apply transparent color tokens via VS Code's settings API so theme
        // backgrounds don't cover the body background-image in any panel.
        await applyTransparentColors();

        // Fix checksums to remove "Unsupported" warning
        fixChecksums();

        // Save configuration for auto-restore
        saveBackgroundConfig(theme, context);

        await promptForFullRestart(
          `${theme.label} background installed. Please close VS Code now, then reopen it to load the updated workbench CSS.`
        );
      } else if (status === InstallStatus.FAILURE) {
        vscode.window.showErrorMessage(
          'Failed to install background. Please ensure VS Code has write permissions to its installation directory. ' +
          'You may need to run VS Code as administrator (Windows) or with appropriate permissions.'
        );
      }
    }
  );
}

/**
 * Remove all background images
 */
export async function uninstallBackground(
  context: vscode.ExtensionContext
): Promise<void> {
  if (!isBackgroundInstalled()) {
    vscode.window.showInformationMessage('No background image is currently installed.');
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Removing background image...',
      cancellable: false
    },
    async () => {
      const status = removeBackground();

      if (status === InstallStatus.INSTALLED) {
        // Remove transparent color token overrides
        await removeTransparentColors();

        // Restore original checksums
        restoreChecksums();

        // Clear configuration
        clearBackgroundConfig(context);

        await promptForFullRestart(
          'Background removed successfully. Please close VS Code now, then reopen it to apply the restored workbench CSS.'
        );
      } else {
        vscode.window.showErrorMessage('Failed to remove background image.');
      }
    }
  );
}

/**
 * Install background for the currently active theme
 */
export async function installCurrentThemeBackground(
  context: vscode.ExtensionContext
): Promise<void> {
  const currentTheme = getCurrentTheme();

  if (!currentTheme) {
    vscode.window.showWarningMessage(
      'Please activate one of the Anime Theme Pack themes first.'
    );
    return;
  }

  await installThemeBackground(context, currentTheme);
}

/**
 * Show theme picker and install selected theme's background
 */
export async function showThemePicker(
  context: vscode.ExtensionContext
): Promise<void> {
  const items = THEMES.map(theme => ({
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
