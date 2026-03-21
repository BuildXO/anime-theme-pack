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
exports.InstallStatus = exports.THEMES = exports.outDirectory = exports.originalProductFile = exports.productFile = exports.editorCssCopy = exports.editorCss = exports.BACKGROUND_COMMENT = exports.CONSENT_KEY = exports.PREVIOUS_VERSION_KEY = exports.BACKGROUND_INSTALL_KEY = exports.CONFIG_BACKGROUND_BLUR = exports.CONFIG_BACKGROUND_ANCHOR = exports.CONFIG_BACKGROUND_OPACITY = exports.CONFIG_BACKGROUND_PATH = exports.CONFIG_BACKGROUND_ENABLED = exports.CONFIG_NAME = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Extension configuration
exports.CONFIG_NAME = 'animeTheme';
exports.CONFIG_BACKGROUND_ENABLED = 'background.enabled';
exports.CONFIG_BACKGROUND_PATH = 'background.path';
exports.CONFIG_BACKGROUND_OPACITY = 'background.opacity';
exports.CONFIG_BACKGROUND_ANCHOR = 'background.anchor';
exports.CONFIG_BACKGROUND_BLUR = 'background.blur';
// Storage keys
exports.BACKGROUND_INSTALL_KEY = 'anime.background.restore';
exports.PREVIOUS_VERSION_KEY = 'anime.vscode.version';
exports.CONSENT_KEY = 'anime.background.consent';
// CSS comments as markers
exports.BACKGROUND_COMMENT = '/* Anime Theme Background Image */';
// VSCode paths
// In Extension Development mode, require.main points to the extension host
// We need to find the actual VS Code installation using process.execPath
const getVSCodeBasePath = () => {
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
const getFileName = () => {
    if (fs.existsSync(path.join(workbenchDirectory, 'workbench.web.main.css'))) {
        return 'web.main';
    }
    const hasRegularVSCodeStuff = fs.existsSync(path.join(workbenchDirectory, 'workbench.desktop.main.css'));
    return hasRegularVSCodeStuff ? 'desktop.main' : 'web.api';
};
const fileName = getFileName();
const CSS_FILE_NAME = `workbench.${fileName}.css`;
exports.editorCss = path.join(workbenchDirectory, CSS_FILE_NAME);
exports.editorCssCopy = path.join(workbenchDirectory, `${CSS_FILE_NAME}.backup`);
// Debug logging
console.log('[Anime Theme] Path Detection:');
console.log('  Base directory:', base);
console.log('  Workbench directory:', workbenchDirectory);
console.log('  CSS file:', exports.editorCss);
console.log('  CSS file exists:', fs.existsSync(exports.editorCss));
// Product.json for checksum management
const appDirectory = path.dirname(base);
exports.productFile = path.join(appDirectory, 'product.json');
exports.originalProductFile = `${exports.productFile}.orig.${vscode.version}`;
exports.outDirectory = base;
exports.THEMES = [
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
var InstallStatus;
(function (InstallStatus) {
    InstallStatus["INSTALLED"] = "INSTALLED";
    InstallStatus["NOT_INSTALLED"] = "NOT_INSTALLED";
    InstallStatus["FAILURE"] = "FAILURE";
    InstallStatus["NETWORK_FAILURE"] = "NETWORK_FAILURE";
})(InstallStatus || (exports.InstallStatus = InstallStatus = {}));
//# sourceMappingURL=constants.js.map