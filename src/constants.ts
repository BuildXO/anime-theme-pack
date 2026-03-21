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

// VSCode paths
// In Extension Development mode, require.main points to the extension host
// We need to find the actual VS Code installation using process.execPath
const getVSCodeBasePath = (): string => {
  // Get the VS Code executable path
  const execPath = process.execPath;
  console.log('[Anime Theme] Process executable path:', execPath);
  
  // Navigate from the executable to the resources directory
  // VS Code structure on Windows:
  // C:\Users\{user}\AppData\Local\Programs\Microsoft VS Code\Code.exe
  // C:\Users\{user}\AppData\Local\Programs\Microsoft VS Code\{version}\resources\app\out
  
  const execDir = path.dirname(execPath);
  console.log('[Anime Theme] Executable directory:', execDir);
  
  // Try versioned directory structure first (common in user installs)
  const versionDirs = fs.existsSync(execDir) 
    ? fs.readdirSync(execDir).filter(name => /^[a-f0-9]{10,}$/.test(name))
    : [];
  
  if (versionDirs.length > 0) {
    // Sort by modification time and get the latest
    const latestVersion = versionDirs
      .map(name => ({
        name,
        path: path.join(execDir, name),
        mtime: fs.statSync(path.join(execDir, name)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0];
    
    const versionedPath = path.join(latestVersion.path, 'resources', 'app', 'out');
    if (fs.existsSync(versionedPath)) {
      console.log('[Anime Theme] Using versioned path:', versionedPath);
      return versionedPath;
    }
  }
  
  // Try direct resources path (common in system installs)
  const directResourcesPath = path.join(execDir, 'resources', 'app', 'out');
  if (fs.existsSync(directResourcesPath)) {
    console.log('[Anime Theme] Using direct resources path:', directResourcesPath);
    return directResourcesPath;
  }
  
  // Fallback to require.main (works when installed as regular extension)
  const fallbackPath = path.dirname(require.main?.filename || '');
  console.log('[Anime Theme] Using fallback path:', fallbackPath);
  return fallbackPath;
};

const base = getVSCodeBasePath();
const workbenchDirectory = path.join(base, 'vs', 'workbench');

const getFileName = (): string => {
  if (fs.existsSync(path.join(workbenchDirectory, 'workbench.web.main.css'))) {
    return 'web.main';
  }
  const hasRegularVSCodeStuff = fs.existsSync(
    path.join(workbenchDirectory, 'workbench.desktop.main.css')
  );
  return hasRegularVSCodeStuff ? 'desktop.main' : 'web.api';
};

const fileName = getFileName();
const CSS_FILE_NAME = `workbench.${fileName}.css`;

export const editorCss = path.join(workbenchDirectory, CSS_FILE_NAME);
export const editorCssCopy = path.join(workbenchDirectory, `${CSS_FILE_NAME}.backup`);

// Debug logging
console.log('[Anime Theme] Path Detection:');
console.log('  Base directory:', base);
console.log('  Workbench directory:', workbenchDirectory);
console.log('  CSS file:', editorCss);
console.log('  CSS file exists:', fs.existsSync(editorCss));

// Product.json for checksum management
const appDirectory = path.dirname(base);
export const productFile = path.join(appDirectory, 'product.json');
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
