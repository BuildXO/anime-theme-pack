import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Extension configuration
export const CONFIG_NAME = 'animeTheme';
export const CONFIG_BACKGROUND_ENABLED = 'background.enabled';
export const CONFIG_BACKGROUND_PATH = 'background.path';
export const CONFIG_BACKGROUND_OPACITY = 'background.opacity';
export const CONFIG_BACKGROUND_ANCHOR = 'background.anchor';
export const CONFIG_BACKGROUND_BLUR = 'background.blur';

// Storage keys
export const BACKGROUND_INSTALL_KEY = 'anime.background.restore';
export const PREVIOUS_VERSION_KEY = 'anime.vscode.version';
export const CONSENT_KEY = 'anime.background.consent';

// CSS comments as markers
export const BACKGROUND_COMMENT = '/* Anime Theme Background Image */';

// VS Code supplies the installation root, including when the extension host is
// a macOS Code Helper process or runs from a versioned Windows installation.
const base = path.join(vscode.env.appRoot, 'out');
const workbenchDirectory = path.join(base, 'vs', 'workbench');

// Prefer the desktop stylesheet. Keep the web filename for older/web layouts,
// but never fall back to the removed workbench.web.api.css file.
const CSS_FILE_NAME = fs.existsSync(
  path.join(workbenchDirectory, 'workbench.desktop.main.css')
) ? 'workbench.desktop.main.css' : fs.existsSync(
  path.join(workbenchDirectory, 'workbench.web.main.css')
) ? 'workbench.web.main.css' : 'workbench.desktop.main.css';

export const editorCss = path.join(workbenchDirectory, CSS_FILE_NAME);
export const editorCssCopy = `${editorCss}.backup`;

console.log('[Anime Theme] Path Detection:');
console.log('  Base directory:', base);
console.log('  Workbench directory:', workbenchDirectory);
console.log('  CSS file:', editorCss);
console.log('  CSS file exists:', fs.existsSync(editorCss));

// Product.json for checksum management
export const productFile = path.join(vscode.env.appRoot, 'product.json');
export const originalProductFile = `${productFile}.orig.${vscode.version}`;
export const outDirectory = base;

// Theme definitions
export interface ThemeDefinition {
  id: string;
  label: string;
  backgroundImage: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'animee-classic',
    label: 'Animee Classic',
    backgroundImage: 'animee-classic.png'
  },
  {
    id: 'jjk-gojo',
    label: 'Jujutsu Kaisen: Gojo Satoru',
    backgroundImage: 'jjk-gojo.png'
  },
  {
    id: 'attack-on-titan',
    label: 'Attack on Titan: Eren\'s Determination',
    backgroundImage: 'attack-on-titan.png'
  },
  {
    id: 'my-hero-academia',
    label: 'My Hero Academia: Deku Plus Ultra',
    backgroundImage: 'my-hero-academia.png'
  },
  {
    id: 'naruto',
    label: 'Naruto: Hokage Orange',
    backgroundImage: 'naruto.png'
  },
  {
    id: 'one-piece',
    label: 'One Piece: Straw Hat Red',
    backgroundImage: 'one-piece.png'
  },
  {
    id: 'demon-slayer',
    label: 'Demon Slayer: Sakura Breathing',
    backgroundImage: 'demon-slayer.png'
  },
  {
    id: 'cyberpunk-neon',
    label: 'Cyberpunk Edgerunners: Neon Night',
    backgroundImage: 'cyberpunk-neon.png'
  },
  {
    id: 'akira',
    label: 'Akira: Neo Tokyo',
    backgroundImage: 'akira.png'
  }
];

export enum InstallStatus {
  INSTALLED = 'INSTALLED',
  NOT_INSTALLED = 'NOT_INSTALLED',
  FAILURE = 'FAILURE',
  NETWORK_FAILURE = 'NETWORK_FAILURE'
}
