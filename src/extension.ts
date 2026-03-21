import * as vscode from 'vscode';
import {
  installCurrentThemeBackground,
  installThemeBackground,
  uninstallBackground,
  showThemePicker,
  getCurrentTheme
} from './themeManager';
import { attemptAutoInstall, getStoredThemeId } from './autoInstaller';
import { cleanupOldBackups } from './checksumService';
import { isBackgroundInstalled } from './backgroundService';

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Anime Theme Pack is now active');

  // Check if running in development mode
  const isDevelopment = context.extensionMode === vscode.ExtensionMode.Development;
  if (isDevelopment) {
    console.warn('[Anime Theme] Running in DEVELOPMENT mode');
    console.warn('[Anime Theme] Background installation will modify your ACTUAL VS Code, not the Extension Development Host');
  }

  // Clean up old backup files from previous VSCode versions
  try {
    cleanupOldBackups(vscode.version);
  } catch (error) {
    console.error('Failed to cleanup old backups:', error);
  }

  // Attempt auto-installation if VSCode was updated
  try {
    await attemptAutoInstall(context);
  } catch (error) {
    console.error('Failed to perform auto-install:', error);
  }

  // Register command: Install background for current theme
  const installCurrentCommand = vscode.commands.registerCommand(
    'animeTheme.installBackground',
    async () => {
      await installCurrentThemeBackground(context);
    }
  );

  // Register command: Choose theme and install background
  const chooseThemeCommand = vscode.commands.registerCommand(
    'animeTheme.chooseBackground',
    async () => {
      await showThemePicker(context);
    }
  );

  // Register command: Remove background
  const removeCommand = vscode.commands.registerCommand(
    'animeTheme.removeBackground',
    async () => {
      await uninstallBackground(context);
    }
  );

  // Register command: Reinstall background (for troubleshooting)
  const reinstallCommand = vscode.commands.registerCommand(
    'animeTheme.reinstallBackground',
    async () => {
      await uninstallBackground(context);
      
      // Wait a moment before reinstalling
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await installCurrentThemeBackground(context);
    }
  );

  // Add commands to subscriptions
  context.subscriptions.push(
    installCurrentCommand,
    chooseThemeCommand,
    removeCommand,
    reinstallCommand
  );

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
  let themeChangeTimer: ReturnType<typeof setTimeout> | undefined;
  let lastInstalledThemeId: string | undefined = getStoredThemeId(context);

  // Watch for configuration changes
  const configWatcher = vscode.workspace.onDidChangeConfiguration(async (e) => {
    if (
      e.affectsConfiguration('animeTheme.background.enabled') ||
      e.affectsConfiguration('animeTheme.background.path') ||
      e.affectsConfiguration('animeTheme.background.opacity') ||
      e.affectsConfiguration('animeTheme.background.anchor') ||
      e.affectsConfiguration('animeTheme.background.blur')
    ) {
      const response = await vscode.window.showInformationMessage(
        'Background settings changed. Would you like to apply the changes?',
        'Apply',
        'Later'
      );
      if (response === 'Apply') {
        await installCurrentThemeBackground(context);
      }
    }

    if (e.affectsConfiguration('workbench.colorTheme')) {
      // Always reset the debounce timer on every event, including hover previews.
      if (themeChangeTimer) {
        clearTimeout(themeChangeTimer);
      }

      themeChangeTimer = setTimeout(async () => {
        themeChangeTimer = undefined;

        if (!isBackgroundInstalled()) {
          return;
        }

        // Capture the theme RIGHT NOW at debounce-settle time and use this
        // exact object throughout — never re-read getCurrentTheme() later so
        // a concurrent hover or event cannot swap in the wrong theme.
        const newTheme = getCurrentTheme();
        if (!newTheme) {
          // Switched away from an anime theme — nothing to install.
          return;
        }

        // Already installed for this exact theme — nothing to do.
        if (newTheme.id === lastInstalledThemeId) {
          return;
        }

        const response = await vscode.window.showInformationMessage(
          `Switched to "${newTheme.label}". Install its background image?`,
          'Install',
          'Later'
        );

        if (response === 'Install') {
          // Pass newTheme directly — do not call installCurrentThemeBackground
          // which would re-read getCurrentTheme() and could pick the wrong theme.
          await installThemeBackground(context, newTheme);
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
export function deactivate() {
  console.log('Anime Theme Pack is now deactivated');
  
  // Note: We cannot automatically clean up CSS modifications on deactivation
  // Users must manually run the "Remove Background" command before uninstalling
}
