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
// VS Code supplies the installation root, including when the extension host is
// a macOS Code Helper process or runs from a versioned Windows installation.
const base = path.join(vscode.env.appRoot, 'out');
const workbenchDirectory = path.join(base, 'vs', 'workbench');
// Prefer the desktop stylesheet. Keep the web filename for older/web layouts,
// but never fall back to the removed workbench.web.api.css file.
const CSS_FILE_NAME = fs.existsSync(path.join(workbenchDirectory, 'workbench.desktop.main.css')) ? 'workbench.desktop.main.css' : fs.existsSync(path.join(workbenchDirectory, 'workbench.web.main.css')) ? 'workbench.web.main.css' : 'workbench.desktop.main.css';
exports.editorCss = path.join(workbenchDirectory, CSS_FILE_NAME);
exports.editorCssCopy = `${exports.editorCss}.backup`;
console.log('[Anime Theme] Path Detection:');
console.log('  Base directory:', base);
console.log('  Workbench directory:', workbenchDirectory);
console.log('  CSS file:', exports.editorCss);
console.log('  CSS file exists:', fs.existsSync(exports.editorCss));
// Product.json for checksum management
exports.productFile = path.join(vscode.env.appRoot, 'product.json');
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
