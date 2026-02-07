# 🖼️ Custom Background Setup

Enhance your anime theme experience by adding custom background images to VS Code!

## 📋 Prerequisites

While VS Code themes don't support background images natively, you can add them using one of these popular extensions:

- **[Background](https://marketplace.visualstudio.com/items?itemName=shalldie.background)** - Recommended
- **[Background Cover](https://marketplace.visualstudio.com/items?itemName=manasxx.background-cover)** - Alternative option

## 🚀 Quick Setup (Using Background Extension)

### Step 1: Install Extension

1. Open Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for "Background"
3. Install the extension by **shalldie**

### Step 2: Prepare Your Image

1. Choose your favorite anime wallpaper
2. Save it to a known location (e.g., `C:/Users/YourName/Pictures/anime/`)
3. Supported formats: PNG, JPG, GIF

### Step 3: Configure Settings

Open your `settings.json` (`Ctrl+,` then click the file icon in the top right) and add:

```json
{
  "background.enabled": true,
  "background.useDefault": false,
  "background.customImages": [
    "file:///C:/Users/YourName/Pictures/anime/your-image.png"
  ],
  "background.style": {
    "content": "''",
    "pointer-events": "none",
    "position": "absolute",
    "z-index": "99999",
    "width": "100%",
    "height": "100%",
    "background-position": "center",
    "background-repeat": "no-repeat",
    "background-size": "cover",
    "opacity": 0.15
  }
}
```

> **Important**: Use forward slashes (`/`) in the file path, even on Windows!

### Step 4: Reload VS Code

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`
2. Type "Reload Window" and press Enter
3. Your background should now appear!

## 🎨 Recommended Opacity Settings

Different themes work better with different opacity levels:

```json
// Darker themes (Jujutsu Kaisen, Attack on Titan)
"opacity": 0.12

// Medium themes (My Hero Academia, Naruto)
"opacity": 0.15

// Lighter accents (Demon Slayer, One Piece)
"opacity": 0.10
```

## 🔧 Advanced Configuration

### Multiple Images (Slideshow)

```json
"background.customImages": [
  "file:///C:/path/to/image1.png",
  "file:///C:/path/to/image2.png",
  "file:///C:/path/to/image3.png"
],
"background.interval": 300  // Change image every 5 minutes
```

### Positioning Options

```json
"background.style": {
  // ... other properties ...
  "background-position": "bottom right",  // Options: center, top, bottom, left, right
  "background-size": "contain"  // Options: cover, contain, auto
}
```

### Image Blur Effect

```json
"background.style": {
  // ... other properties ...
  "filter": "blur(3px)"  // Add subtle blur
}
```

## 🎯 Theme-Specific Recommendations

### For Gojo Theme (Jujutsu Kaisen)
- **Colors**: Blue, purple, white aesthetic
- **Opacity**: 0.12-0.15
- **Position**: Center or bottom right

### For Eren Theme (Attack on Titan)
- **Colors**: Brown, beige, military green
- **Opacity**: 0.10-0.12
- **Position**: Center

### For Deku Theme (My Hero Academia)
- **Colors**: Green, white, dynamic action shots
- **Opacity**: 0.15-0.18
- **Position**: Bottom right

### For Naruto Theme
- **Colors**: Orange, yellow, blue
- **Opacity**: 0.12-0.15
- **Position**: Center or top right

## ⚠️ Troubleshooting

### Background Not Showing?

1. Make sure the file path is correct
2. Use forward slashes (`/`) instead of backslashes
3. Reload VS Code window
4. Check if the Background extension is enabled

### Text Hard to Read?

- Decrease opacity (try 0.08-0.10)
- Add blur effect
- Choose darker images
- Adjust image positioning

### Permission Errors?

The extension modifies VS Code files. If you encounter permission errors:
- Run VS Code as administrator (Windows)
- Grant necessary permissions (macOS/Linux)

## 📂 Folder Structure

```
images/
├── README.md (this file)
└── screenshots/
    ├── jjk-gojo.png
    ├── attack-on-titan.png
    ├── my-hero-academia.png
    ├── naruto.png
    ├── one-piece.png
    ├── demon-slayer.png
    ├── cyberpunk-neon.png
    ├── akira.png
    └── animee-classic.png
```

## 🌟 Tips for Best Results

1. **Use High-Quality Images**: 1920x1080 or higher
2. **Match Theme Colors**: Choose images that complement the theme's color palette
3. **Avoid Busy Images**: Simpler backgrounds work better
4. **Test Readability**: Make sure code is still easy to read
5. **Dark Images Work Best**: They blend better with dark themes

---

**Need help?** Open an issue on [GitHub](https://github.com/LunaCode/anime-theme-pack/issues)!

