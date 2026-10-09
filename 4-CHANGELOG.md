# Change Log

All notable changes to the "anime-theme" extension will be documented in this file.

## [0.1.2] - Unreleased

### Fixed
- Use VS Code's installation root for background file paths, including macOS Code Helper processes and versioned Windows installs.
- Prefer the desktop workbench stylesheet, keep the web stylesheet fallback, and stop guessing the removed `workbench.web.api.css` file.
- Update vulnerable transitive dependencies: picomatch, flatted, js-yaml and brace-expansion.

### Development
- Add installation-layout regression tests and an extension manifest/file test.
- Add Linux, Windows and macOS CI for clean install, compile, tests and VSIX packaging, with downloadable build artifacts.
- Pin the VSIX packaging tool and update GitHub Actions runtimes; enable weekly dependency update groups.
- CodeQL scans now run successfully on current code.

### Release status
- Prepared for manual Marketplace publication. No automatic publishing workflow is added.
- Regression fixtures cover macOS paths, but real macOS background installation still needs testing. Issues #1 and #3 remain open pending that confirmation; actual write permissions may still need attention.

## [0.1.1] - 2026-03-28

### Themes Added 
- animee-color-theme (classic)
- neon-night

## [0.1.0] - 2026-03-21

### Added
- 🖼️ **Background Image Feature** - Add beautiful anime backgrounds to your editor
- Custom background image support for each theme
- Background customization settings (opacity, position, custom paths)
- Auto-restore feature for backgrounds after VS Code updates
- Commands for installing, removing, and managing backgrounds
- Checksum management to minimize "Unsupported" warnings
- Comprehensive background usage documentation
- TypeScript-based extension with proper error handling

### Commands Added
- `Anime Theme: Install Background for Current Theme`
- `Anime Theme: Choose and Install Background`
- `Anime Theme: Remove Background Image`
- `Anime Theme: Reinstall Background (Troubleshooting)`


## [0.0.3] - 2026-02-16

### Added
- logo :>

## [0.0.2] - 2026-02-11

### Added
- Jujutsu Kaisen: Gojo Satoru theme
- Attack on Titan: Eren's Determination theme
- My Hero Academia: Deku Plus Ultra theme
- Naruto: Hokage Orange theme
- One Piece: Straw Hat Red theme
- Demon Slayer: Sakura Breathing theme
- Cyberpunk Edgerunners: Neon Night theme
- Akira: Neo Tokyo theme
- Comprehensive 200+ color definitions for each theme
- Extensive UI customization across all themes
- Semantic highlighting support

### Changed
- Updated package metadata and description
- Renamed main theme to "Animee Classic"

## [0.0.1] - 2026-01-15

### Added
- Initial release with base Animee theme
- Dark theme optimized for coding
- Syntax highlighting for multiple languages
