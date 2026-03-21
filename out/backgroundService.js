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
exports.canWrite = canWrite;
exports.installBackground = installBackground;
exports.removeBackground = removeBackground;
exports.applyTransparentColors = applyTransparentColors;
exports.removeTransparentColors = removeTransparentColors;
exports.isBackgroundInstalled = isBackgroundInstalled;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
/**
 * Check if we have write permission to VSCode's CSS file
 */
function canWrite() {
    try {
        // First check if the file exists
        if (!fs.existsSync(constants_1.editorCss)) {
            console.error('[Anime Theme] CSS file does not exist:', constants_1.editorCss);
            return false;
        }
        fs.accessSync(constants_1.editorCss, fs.constants.W_OK);
        console.log('[Anime Theme] Write permission check: SUCCESS');
        return true;
    }
    catch (error) {
        console.error('[Anime Theme] Write permission check: FAILED', error);
        return false;
    }
}
/**
 * Read the current VSCode CSS file
 */
function readCSS() {
    try {
        return fs.readFileSync(constants_1.editorCss, 'utf-8');
    }
    catch (error) {
        console.error('Failed to read CSS file:', error);
        throw error;
    }
}
/**
 * Write CSS to VSCode's CSS file
 */
function writeCSS(css) {
    try {
        console.log('[Anime Theme] Writing CSS to:', constants_1.editorCss);
        console.log('[Anime Theme] CSS length:', css.length, 'bytes');
        fs.writeFileSync(constants_1.editorCss, css, 'utf-8');
        console.log('[Anime Theme] CSS write successful!');
    }
    catch (error) {
        console.error('[Anime Theme] Failed to write CSS file:', error);
        throw error;
    }
}
/**
 * Find the index of the background comment in CSS
 */
function getBackgroundIndex(css) {
    return css.indexOf(constants_1.BACKGROUND_COMMENT);
}
/**
 * Remove background CSS from the provided CSS string
 */
function removeBackgroundCSS(css) {
    const backgroundIndex = getBackgroundIndex(css);
    if (backgroundIndex === -1) {
        return css;
    }
    // Remove everything from the background comment to the end
    return css.substring(0, backgroundIndex).trim();
}
/**
 * Build background CSS for injection.
 *
 * Technique:
 * - Set the wallpaper on `body` as the single source of truth.
 * - Set background-color: transparent on every VS Code container in the
 *   hierarchy so they act as windows into the body background.
 * - Use a ::before pseudo-element inside Monaco scrollable area so the
 *   wallpaper sits BEHIND the text with the user-controlled opacity.
 * - Add a dark overlay layer for readability when backgrounds are enabled.
 * - Apply optional blur effect to reduce visual distraction.
 */
function buildBackgroundCSS(backgroundImageURL, opacity = 0.15, anchor = 'center', blur = 0) {
    const config = vscode.workspace.getConfiguration(constants_1.CONFIG_NAME);
    const isEnabled = config.get(constants_1.CONFIG_BACKGROUND_ENABLED, true);
    if (!isEnabled) {
        return '';
    }
    // Clamp opacity: if user sets > 0.12, limit to safe range 0.08-0.10
    let clampedOpacity = opacity;
    if (opacity > 0.12) {
        clampedOpacity = Math.min(0.10, Math.max(0.08, 0.09)); // Default to 0.09 in the safe range
    }
    else {
        clampedOpacity = Math.min(1, Math.max(0, opacity));
    }
    const bgShorthand = `url('${backgroundImageURL}') ${anchor} / cover no-repeat fixed`;
    // Optional blur filter
    const blurFilter = blur > 0 ? `filter: blur(${blur}px) !important;` : '';
    return `
${constants_1.BACKGROUND_COMMENT}

/* ── 1. Wallpaper on body — single source of truth ── */
body {
  background: ${bgShorthand} !important;
  ${blurFilter}
}

/* ── 1a. Dark overlay for readability ── */
body::before {
  content: '' !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background-color: rgba(15, 20, 24, 0.65) !important;
}

/* ── 1b. Ensure workbench content sits above the overlay ── */
.monaco-workbench {
  position: relative !important;
  z-index: 1 !important;
}

/* ── 2. Override VS Code theme CSS variables so var()-based backgrounds go transparent ── */
body, :root {
  --vscode-sideBar-background: transparent !important;
  --vscode-sideBarSectionHeader-background: transparent !important;
  --vscode-activityBar-background: transparent !important;
  --vscode-panel-background: transparent !important;
  --vscode-terminal-background: transparent !important;
  --vscode-tab-activeBackground: transparent !important;
  --vscode-tab-inactiveBackground: transparent !important;
  --vscode-tab-hoverBackground: transparent !important;
  --vscode-editorWidget-background: transparent !important;
  --vscode-titleBar-activeBackground: transparent !important;
  --vscode-titleBar-inactiveBackground: transparent !important;
  --vscode-statusBar-background: transparent !important;
  --vscode-breadcrumbPicker-background: transparent !important;
  --vscode-menu-background: transparent !important;
  --vscode-dropdown-background: transparent !important;
  --vscode-input-background: transparent !important;
  --vscode-peekViewEditor-background: transparent !important;
  --vscode-peekViewResult-background: transparent !important;
}

/* ── 3. Clear background-color on every container so body shows through ── */
.monaco-workbench,
.monaco-workbench .part,
.monaco-workbench .part > .content,
.monaco-workbench .part .title,
.monaco-workbench .part .title-actions,
.monaco-workbench .part .composite,
.monaco-workbench .part .composite.title,
.monaco-workbench .part.activitybar > .content,
.monaco-workbench .part.statusbar,
.monaco-workbench .part.titlebar,
.monaco-workbench .part.sidebar,
.monaco-workbench .part.sidebar > .content,
.monaco-workbench .part.sidebar .title,
.monaco-workbench .part.sidebar .composite.title,
.monaco-workbench .part.auxiliarybar,
.monaco-workbench .part.auxiliarybar > .content,
.monaco-workbench .part.auxiliarybar .title,
.monaco-workbench .part.auxiliarybar .composite.title,
.monaco-workbench .part.panel,
.monaco-workbench .part.panel > .content,
.monaco-workbench .part.panel .title,
.monaco-workbench .part.panel .composite.title,
.monaco-workbench .part.panel .panel-switcher-container,
.monaco-workbench .part.editor > .content,
.monaco-workbench .editor-group-container,
.monaco-workbench .editor-group-container.empty,
.tabs-and-actions-container,
.tabs-container,
.tab,
.tab.active,
.tab.inactive,
.monaco-pane-view,
.monaco-pane-view .pane,
.monaco-pane-view .pane > .pane-header,
.monaco-pane-view .pane > .pane-body,
.pane-body,
.split-view-view,
.composite.viewlet,
.composite.panel,
.monaco-list,
.monaco-tree,
.settings-editor,
.settings-editor > .settings-body,
.settings-editor > .settings-body .settings-toc-container,
.settings-editor > .settings-body .settings-tree-container,
.monaco-workbench .basePart,
.terminal-outer-container,
.terminal-wrapper,
.terminal-group-container,
.terminal-tab,
.terminal .xterm,
.xterm-viewport,
.monaco-grid-view,
.monaco-grid-branch-node,
.monaco-grid-node,
.monaco-tl-row,
.monaco-tl-twistie,
.monaco-tl-contents {
  background-color: transparent !important;
}

/* ── 4. ::before pseudo-element for opacity-controlled wallpaper in editor ── */
[id="workbench.parts.editor"] .split-view-view .editor-container
  .editor-instance > .monaco-editor .overflow-guard
  > .monaco-scrollable-element::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important; left: 0 !important;
  width: 100% !important; height: 100% !important;
  z-index: 0 !important;
  pointer-events: none !important;
  opacity: ${clampedOpacity} !important;
  background: ${bgShorthand} !important;
  ${blurFilter}
}

/* ── 5. Keep text above the pseudo-element ── */
[id="workbench.parts.editor"] .split-view-view .editor-container
  .editor-instance > .monaco-editor .overflow-guard
  > .monaco-scrollable-element > .lines-content {
  position: relative !important;
  z-index: 1 !important;
}

/* ── 6. Scrollbar sliders ── */
.monaco-scrollable-element > .scrollbar > .slider {
  background: rgba(121, 121, 121, 0.4) !important;
}
`;
}
/**
 * Install background image by injecting CSS
 */
function installBackground(extensionContext, theme) {
    console.log('[Anime Theme] Starting background installation for:', theme.label);
    if (!canWrite()) {
        console.error('[Anime Theme] Cannot write to VSCode CSS file:', constants_1.editorCss);
        return constants_1.InstallStatus.FAILURE;
    }
    try {
        const config = vscode.workspace.getConfiguration(constants_1.CONFIG_NAME);
        const customBackgroundPath = config.get(constants_1.CONFIG_BACKGROUND_PATH);
        const opacity = config.get(constants_1.CONFIG_BACKGROUND_OPACITY, 0.15);
        const anchor = config.get(constants_1.CONFIG_BACKGROUND_ANCHOR, 'center');
        const blur = config.get(constants_1.CONFIG_BACKGROUND_BLUR, 0);
        // Determine which background image to use
        let backgroundImagePath;
        if (customBackgroundPath && (0, utils_1.fileExists)(customBackgroundPath)) {
            // Use custom background from settings
            backgroundImagePath = customBackgroundPath;
        }
        else {
            // Use theme's default background
            backgroundImagePath = path.join(extensionContext.extensionPath, 'images', 'background_images', theme.backgroundImage);
        }
        if (!(0, utils_1.fileExists)(backgroundImagePath)) {
            console.error(`Background image not found: ${backgroundImagePath}`);
            vscode.window.showErrorMessage(`Background image not found for ${theme.label}. Please ensure the image exists at: images/background_images/${theme.backgroundImage}`);
            return constants_1.InstallStatus.FAILURE;
        }
        // Convert image to base64 data URL
        console.log('[Anime Theme] Converting image to base64:', backgroundImagePath);
        const backgroundDataURL = (0, utils_1.loadImageBase64FromFile)(backgroundImagePath);
        console.log('[Anime Theme] Base64 conversion successful, length:', backgroundDataURL.length);
        // Read current CSS, remove old background, add new background
        console.log('[Anime Theme] Reading current CSS...');
        const currentCSS = readCSS();
        console.log('[Anime Theme] Current CSS length:', currentCSS.length);
        const cleanedCSS = removeBackgroundCSS(currentCSS);
        console.log('[Anime Theme] Cleaned CSS length:', cleanedCSS.length);
        const backgroundCSS = buildBackgroundCSS(backgroundDataURL, opacity, anchor, blur);
        console.log('[Anime Theme] Background CSS length:', backgroundCSS.length);
        const newCSS = cleanedCSS + '\n' + backgroundCSS;
        console.log('[Anime Theme] New CSS total length:', newCSS.length);
        // Write the updated CSS
        writeCSS(newCSS);
        console.log(`Background installed successfully for ${theme.label}`);
        return constants_1.InstallStatus.INSTALLED;
    }
    catch (error) {
        console.error('Failed to install background:', error);
        return constants_1.InstallStatus.FAILURE;
    }
}
/**
 * Remove background image by stripping CSS
 */
function removeBackground() {
    if (!canWrite()) {
        console.error('Cannot write to VSCode CSS file');
        return constants_1.InstallStatus.FAILURE;
    }
    try {
        // Delete backup if exists
        if (fs.existsSync(constants_1.editorCssCopy)) {
            fs.unlinkSync(constants_1.editorCssCopy);
        }
        // Read current CSS and remove background
        const currentCSS = readCSS();
        const cleanedCSS = removeBackgroundCSS(currentCSS);
        // Write cleaned CSS
        writeCSS(cleanedCSS);
        console.log('Background removed successfully');
        return constants_1.InstallStatus.INSTALLED;
    }
    catch (error) {
        console.error('Failed to remove background:', error);
        return constants_1.InstallStatus.FAILURE;
    }
}
// VS Code color token keys whose solid values block the body background-image.
// Setting them to #00000000 (transparent) via workbench.colorCustomizations is the
// only reliable way to clear them because VS Code applies theme colors as inline
// element styles at runtime — CSS !important in a stylesheet cannot override those.
const TRANSPARENT_COLORS = {
    'activityBar.background': '#00000000',
    'breadcrumb.background': '#00000000',
    'editor.background': '#00000000',
    'editorGroupHeader.noTabsBackground': '#00000000',
    'editorGroupHeader.tabsBackground': '#00000000',
    'panel.background': '#00000000',
    'sideBar.background': '#00000000',
    'sideBarSectionHeader.background': '#00000000',
    'statusBar.background': '#00000000',
    'statusBar.noFolderBackground': '#00000000',
    'statusBarItem.remoteBackground': '#00000000',
    'tab.activeBackground': '#00000000',
    'tab.inactiveBackground': '#00000000',
    'tab.hoverBackground': '#00000000',
    'terminal.background': '#00000000',
    'titleBar.activeBackground': '#00000000',
    'titleBar.inactiveBackground': '#00000000',
};
// Background balancing colors applied via workbench.colorCustomizations when a background
// is active. Only truly neutral, non-theme-personality colors belong here.
// Intentionally excluded:
//   editor.background          — stays #00000000 from TRANSPARENT_COLORS; CSS overlay darkens instead
//   editor.lineHighlightBackground — each theme has its own (e.g. JJK #161B22, Naruto #221E18)
//   editor.selectionBackground     — each theme has its own accent (JJK blue, Naruto orange, etc.)
//   editorCursor.foreground        — core personality color per theme, must not be overridden
const BALANCING_COLORS = {
    'editorIndentGuide.background': '#FFFFFF12',
    'editorIndentGuide.activeBackground': '#FFFFFF30',
};
/**
 * Apply transparent color customizations for the active theme so VS Code's
 * own theme color pipeline makes every panel background transparent, letting
 * the body background-image show through everywhere.
 *
 * Also applies background balancing colors to improve readability when
 * background images are enabled.
 */
async function applyTransparentColors() {
    const themeName = vscode.workspace.getConfiguration('workbench').get('colorTheme') ?? '';
    const config = vscode.workspace.getConfiguration();
    const existing = config.get('workbench.colorCustomizations', {});
    const key = `[${themeName}]`;
    // Merge transparent colors with balancing colors
    const colorsToApply = {
        ...TRANSPARENT_COLORS,
        ...BALANCING_COLORS,
    };
    const updated = {
        ...existing,
        [key]: {
            ...(existing[key] ?? {}),
            ...colorsToApply,
        },
    };
    await config.update('workbench.colorCustomizations', updated, vscode.ConfigurationTarget.Global);
    console.log('[Anime Theme] Applied transparent and balancing color customizations for:', themeName);
}
/**
 * Remove the transparent color customizations and balancing colors added by applyTransparentColors.
 */
async function removeTransparentColors() {
    const themeName = vscode.workspace.getConfiguration('workbench').get('colorTheme') ?? '';
    const config = vscode.workspace.getConfiguration();
    // Remove workbench color customizations
    const existing = config.get('workbench.colorCustomizations', {});
    const key = `[${themeName}]`;
    if (existing[key]) {
        const themeSection = { ...existing[key] };
        // Remove both transparent and balancing colors
        Object.keys(TRANSPARENT_COLORS).forEach(k => delete themeSection[k]);
        Object.keys(BALANCING_COLORS).forEach(k => delete themeSection[k]);
        const updated = { ...existing };
        if (Object.keys(themeSection).length === 0) {
            delete updated[key];
        }
        else {
            updated[key] = themeSection;
        }
        await config.update('workbench.colorCustomizations', updated, vscode.ConfigurationTarget.Global);
        console.log('[Anime Theme] Removed transparent and balancing color customizations for:', themeName);
    }
}
/**
 * Check if background is currently installed
 */
function isBackgroundInstalled() {
    try {
        if (!fs.existsSync(constants_1.editorCss)) {
            return false;
        }
        const currentCSS = readCSS();
        return getBackgroundIndex(currentCSS) > -1;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=backgroundService.js.map