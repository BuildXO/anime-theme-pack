# Anime Background Images

Want to add your favorite anime wallpaper to VS Code?

While VS Code themes don't support background images natively, you can easily add them using the [Background](https://marketplace.visualstudio.com/items?itemName=shalldie.background) extension.

## Setup Instructions

1. Install the **Background** extension from the marketplace.
2. Place your favorite anime images in this folder (or anywhere on your computer).
3. Add the following to your VS Code `settings.json`:

```json
"background.customImages": [
    "file:///C:/path/to/your/image.png" 
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
    "opacity": 0.2
},
"background.useDefault": false
```

*Note: Adjust opacity to ensure code remains readable!*
