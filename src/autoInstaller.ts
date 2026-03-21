import * as vscode from 'vscode';
import {
  BACKGROUND_INSTALL_KEY,
  PREVIOUS_VERSION_KEY,
  THEMES,
  ThemeDefinition,
  InstallStatus
} from './constants';
import { installBackground, isBackgroundInstalled, applyTransparentColors } from './backgroundService';
import { fixChecksums } from './checksumService';

interface BackgroundRestoreConfig {
  themeId: string;
  themLabel: string;
}

/**
 * Save background installation configuration for restoration
 */
export function saveBackgroundConfig(
  theme: ThemeDefinition,
  context: vscode.ExtensionContext
): void {
  const config: BackgroundRestoreConfig = {
    themeId: theme.id,
    themLabel: theme.label
  };
  context.globalState.update(BACKGROUND_INSTALL_KEY, JSON.stringify(config));
}

/**
 * Clear background installation configuration
 */
export function clearBackgroundConfig(context: vscode.ExtensionContext): void {
  context.globalState.update(BACKGROUND_INSTALL_KEY, undefined);
}

/**
 * Check if background was previously installed
 */
function wasBackgroundInstalled(context: vscode.ExtensionContext): boolean {
  const config = context.globalState.get(BACKGROUND_INSTALL_KEY);
  return config !== undefined;
}

/**
 * Get stored background configuration
 */
function getBackgroundConfig(
  context: vscode.ExtensionContext
): BackgroundRestoreConfig | null {
  const configString = context.globalState.get<string>(BACKGROUND_INSTALL_KEY);
  
  if (!configString) {
    return null;
  }

  try {
    return JSON.parse(configString);
  } catch {
    return null;
  }
}

/**
 * Get the theme ID that was last successfully installed, or undefined.
 * Used on activation to initialise the last-installed-theme tracker so
 * we never re-prompt for a theme that is already installed.
 */
export function getStoredThemeId(context: vscode.ExtensionContext): string | undefined {
  return getBackgroundConfig(context)?.themeId;
}

/**
 * Save current VSCode version
 */
function saveCurrentVersion(context: vscode.ExtensionContext): void {
  context.globalState.update(PREVIOUS_VERSION_KEY, vscode.version);
}

/**
 * Check if VSCode version has changed
 */
function hasVersionChanged(context: vscode.ExtensionContext): boolean {
  const storedVersion = context.globalState.get<string>(PREVIOUS_VERSION_KEY);
  return storedVersion !== undefined && storedVersion !== vscode.version;
}

/**
 * Store initial configuration on first run
 */
export function storeInitialConfig(context: vscode.ExtensionContext): void {
  saveCurrentVersion(context);

  // Check if background is already installed in CSS
  if (isBackgroundInstalled()) {
    // Try to detect which theme is currently active
    const currentTheme = vscode.workspace.getConfiguration('workbench').get<string>('colorTheme');
    const matchedTheme = THEMES.find(t => currentTheme?.includes(t.label));

    if (matchedTheme) {
      saveBackgroundConfig(matchedTheme, context);
    }
  } else {
    clearBackgroundConfig(context);
  }
}

/**
 * Restore background installation after VSCode update
 */
export async function restoreBackgroundInstallation(
  context: vscode.ExtensionContext
): Promise<void> {
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
    .get<string>('colorTheme');
  const currentTheme = THEMES.find(t => currentThemeName?.includes(t.label));
  const storedTheme = config ? THEMES.find(t => t.id === config.themeId) : undefined;

  // Use whichever theme is currently active; fall back to stored if no anime
  // theme is active right now (e.g. user is temporarily on a different theme).
  const theme = currentTheme ?? storedTheme;

  if (!theme) {
    console.warn(`[Anime Theme] No theme found for restoration (current: ${currentThemeName}, stored: ${config?.themeId})`);
    return;
  }

  // Show progress notification
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Restoring ${theme.label} background...`,
      cancellable: false
    },
    async () => {
      const status = installBackground(context, theme);

      if (status === InstallStatus.INSTALLED) {
        // Re-apply transparent/balancing colors for the current theme name
        // so panels stay transparent after the restore.
        await applyTransparentColors();
        fixChecksums();
        // Update stored config to match what was actually restored
        saveBackgroundConfig(theme, context);

        vscode.window
          .showInformationMessage(
            `${theme.label} background restored. Please close VS Code now, then reopen it to load the updated workbench CSS.`,
            'Close VS Code',
            'Later'
          )
          .then(async selection => {
            if (selection === 'Close VS Code') {
              try {
                await vscode.commands.executeCommand('workbench.action.quit');
              } catch {
                await vscode.commands.executeCommand('workbench.action.reloadWindow');
              }
            }
          });
      } else {
        vscode.window.showErrorMessage(
          `Failed to restore ${theme.label} background. You may need to reinstall it manually.`
        );
      }
    }
  );
}

/**
 * Attempt to perform auto-installation on extension activation
 */
export async function attemptAutoInstall(
  context: vscode.ExtensionContext
): Promise<void> {
  const storedVersion = context.globalState.get<string>(PREVIOUS_VERSION_KEY);

  if (!storedVersion) {
    // First run - store initial configuration
    storeInitialConfig(context);
  } else if (hasVersionChanged(context)) {
    // VSCode was updated - restore installation
    await restoreBackgroundInstallation(context);
  }
}
