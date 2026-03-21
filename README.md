# 🎌 Anime Theme Pack – Naruto, Jujutsu Kaisen & Anime VS Code Themes

Anime Theme Pack is a collection of beautiful anime-inspired VS Code themes designed for developers who love coding with anime aesthetics.

This extension includes themes inspired by Naruto, Jujutsu Kaisen, Attack on Titan, Demon Slayer, My Hero Academia, One Piece, and Cyberpunk Edgerunners, with carefully crafted dark color palettes, rich syntax highlighting, and optional anime background images.

If you're looking for the best anime VS Code theme, an anime coding theme, or an otaku developer setup, this theme pack is built for you.

## ✨ Features

- 🎨 Anime-Inspired VS Code Themes based on popular anime series
- 🌙 Beautiful Dark Themes optimized for long coding sessions
- 🖼️ Optional Anime Background Images for immersive coding
- 💻 Rich Syntax Highlighting across all programming languages
- 🔍 Semantic Highlighting Support for modern languages
- 🎭 Carefully Crafted Anime Color Palettes
- 🖥️ Full VS Code UI Coverage
- 🌈 Custom Terminal Themes
- 🔧 Git Decoration Colors
- 📦 Symbol Icon Coloring

Each theme contains 200+ color definitions to ensure a consistent and polished experience across the entire editor.

## 🎨 Theme Showcase

### Jujutsu Kaisen: Gojo Satoru
![Jujutsu Kaisen Theme](./images/screenshots/jjk-gojo.png)

A dark Jujutsu Kaisen VS Code theme inspired by Gojo Satoru's limitless blue aesthetic.
Perfect for developers who want a cool blue anime coding environment.

---

### Attack on Titan: Eren's Determination
![Attack on Titan Theme](./images/screenshots/attack-on-titan.png)

A dark Attack on Titan VS Code theme with earthy brown tones representing the fight for freedom.

---

### Demon Slayer: Sakura Breathing
![Demon Slayer Theme](./images/screenshots/demon-slayer.png)

An elegant Demon Slayer VS Code theme featuring soft sakura pink accents and smooth contrasts.

---

### Cyberpunk Edgerunners: Neon Night
![Cyberpunk Edgerunners Theme](./images/screenshots/cyberpunk-neon.png)

A neon Cyberpunk Edgerunners VS Code theme with vibrant futuristic colors.

---

### My Hero Academia: Deku Plus Ultra
![My Hero Academia Theme](./images/screenshots/my-hero-academia.png)

A vibrant My Hero Academia VS Code theme inspired by One For All energy and heroic green accents.

---

### Naruto: Hokage Orange
![Naruto Theme](./images/screenshots/naruto.png)

A bold Naruto VS Code theme featuring the iconic orange Will of Fire color palette.
Believe it - this anime coding theme powers through long coding sessions.

---

### One Piece: Straw Hat Red
![One Piece Theme](./images/screenshots/one-piece.png)

A One Piece VS Code theme inspired by Luffy's adventures with bold red highlights.



## 🖼️ Background Image Feature

Transform your coding environment with beautiful anime backgrounds:

### Quick Setup
```
1. Activate an Anime Theme
2. Ctrl+Shift+P → "Anime Theme: Install Background for Current Theme"
3. Accept consent → Reload VS Code
```

### Customization

Adjust background appearance in Settings:

```json
{
  "animeTheme.background.enabled": true,
  "animeTheme.background.opacity": 0.15,
  "animeTheme.background.anchor": "center",
  "animeTheme.background.path": "" // Leave empty for theme default
}
```

### Commands

| Command | Purpose |
|---------|---------|
| `Anime Theme: Install Background for Current Theme` | Apply background to active theme |
| `Anime Theme: Choose and Install Background` | Pick theme and apply background |
| `Anime Theme: Remove Background Image` | Restore original VS Code appearance |
| `Anime Theme: Reinstall Background (Troubleshooting)` | Fix background issues |

### From VS Code Marketplace

1. Open **Extensions** view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **"Anime Theme"** or **"Anime Theme Pack"**
3. Click **Install**
4. Open theme selector (`Ctrl+K Ctrl+T` / `Cmd+K Cmd+T`)
5. Choose your favorite anime theme

### Manual Installation

1. Download the `.vsix` file from [releases](https://github.com/BuildXO/anime-theme-pack/releases)
2. Open VS Code
3. Go to Extensions view
4. Click `...` menu → `Install from VSIX...`
5. Select the downloaded file

## 🖼️ Background Images (Optional)

After installing a theme, add immersive anime backgrounds:

1. **Install Background**: `Ctrl+Shift+P` → `Anime Theme: Install Background for Current Theme`
2. **Customize**: Adjust opacity and position in settings
3. **Remove**: `Anime Theme: Remove Background Image` to restore defaults

See the [Background Usage Guide](./BACKGROUND_USAGE.md) for detailed
- Git decoration colors
- Debug toolbar styling
- Notification and panel theming
- Comprehensive symbol icon colors
- Breadcrumb and peek view customization

## 🚀 Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Anime Theme Pack"
4. Click Install
5. Select your preferred theme from Command Palette (Ctrl+K Ctrl+T / Cmd+K Cmd+T)

## Anime Backgrounds
LookinQuick Start

### Installation from VS Code Marketplace

1. Open **Extensions** view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **"Anime Theme"**
3. Click **Install**
4. Press `Ctrl+K Ctrl+T` / `Cmd+K Cmd+T` to open theme selector
5. Choose your favorite anime theme

### Manual Installation

1. Download the `.vsix` file from [releases](https://github.com/LunaCode/anime-theme-pack/releases)
2. Open VS Code
3. Go to Extensions view
4. Click `...` menu → `Install from VSIX...`
5. Select the downloaded file

## 🖼️ Adding Custom Backgrounds

Want to add anime wallpapers to your editor? Check out the [background setup guide](./images/README.md) for step-by-step instructions.

## 🎯 What's Included

Each theme in this pack includes:

- **Editor Colors**: Background, foreground, selection, and line highlighting
- **Syntax Colors**: Keywords, strings, functions, classes, and more
- **UI Elements**: Activity bar, sidebar, status bar, tabs, and panels
- **Terminal**: Custom 16-color ANSI palette matching the theme
- **Git Decorations**: Modified, added, deleted, and conflict indicators
- **Widgets**: Autocomplete, hover tooltips, and notifications
- **Symbol Icons**: File types, classes, methods, and variables

## 🛠️ Customization

You can further customize any theme by adding overrides to your `settings.json`:

```json
{
  "workbench.colorCustomizations": {
    "[Jujutsu Kaisen: Gojo Satoru]": {
      "editor.background": "#0A0E14"
    }
  },
  "editor.tokenColorCustomizations": {
    "[Jujutsu Kaisen: Gojo Satoru]": {
      "comments": "#6E7681"
    }
  }
}
```

## 🐛 Issues & Suggestions

Found a bug or have a theme suggestion? Please [open an issue](https://github.com/LunaCode/anime-theme-pack/issues) on GitHub.

## 📝 License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## 🤝 Contributing

Contributions are welcome! Whether it's:
- 🎨 New anime theme suggestions
- 🐛 Bug fixes
- 📖 Documentation improvements
- 💡 Feature requests

Feel free to open issues or submit pull requests!

---

## ⭐ Show Your Support

If you enjoy these themes, please consider:
- ⭐ Starring the repository
- 🔄 Sharing with fellow anime fans
- 📝 Leaving a review on the marketplace

**Happy coding with your favorite anime themes!** 🎌✨