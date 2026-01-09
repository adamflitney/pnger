# pnger

High-accuracy SVG to PNG converter CLI tool with full support for advanced SVG features including filters, masks, gradients, and more.

## Features

- **High Accuracy**: Uses headless Chrome for pixel-perfect rendering
- **Full SVG Support**: Handles filters, masks, clip-paths, gradients, patterns, and all SVG 1.1/2.0 features
- **Smart Dimensions**: Uses intrinsic SVG dimensions or custom sizes with aspect ratio preservation
- **Background Control**: Transparent backgrounds or custom colors
- **Quality Control**: Adjustable PNG quality settings
- **Scale Factor**: Easy 2x/3x exports for retina displays
- **Auto Output**: Automatically generates output filename if not specified

## Installation

### Prerequisites

- **Node.js** 18 or higher
- **Chrome or Chromium** must be installed on your system

#### Installing Chrome

**macOS:**
```bash
brew install --cask google-chrome
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install google-chrome-stable

# Or Chromium
sudo apt install chromium-browser
```

**Windows:**
Download from https://www.google.com/chrome/

### Install pnger

```bash
npm install -g pnger
```

Or use with npx (no installation required):
```bash
npx pnger input.svg output.png
```

## Usage

### Basic Usage

```bash
# Convert with intrinsic dimensions
pnger input.svg output.png

# Auto-generate output filename (input.svg → input.png)
pnger input.svg
```

### Custom Dimensions

```bash
# Specify width (height calculated automatically)
pnger input.svg output.png --width 512

# Specify height (width calculated automatically)
pnger input.svg output.png --height 512

# Specify both (fills while preserving aspect ratio)
pnger input.svg output.png --width 512 --height 512
```

### Scale Factor

```bash
# 2x resolution (retina)
pnger icon.svg icon@2x.png --scale 2

# 3x resolution
pnger icon.svg icon@3x.png --scale 3

# Combine with custom dimensions
pnger icon.svg icon@2x.png --width 256 --scale 2  # Output: 512x512
```

### Background Color

```bash
# Transparent background (default)
pnger input.svg output.png

# White background
pnger input.svg output.png --background white
pnger input.svg output.png --background "#FFFFFF"

# Custom color
pnger input.svg output.png --background "#FF0000"
pnger input.svg output.png --background "rgb(255,0,0)"
pnger input.svg output.png --background "rgba(255,0,0,0.5)"
```

### Quality Control

```bash
# Maximum quality (default: 100)
pnger input.svg output.png --quality 100

# Balanced quality/size
pnger input.svg output.png --quality 80
```

### Combined Options

```bash
# Complete example
pnger logo.svg logo@2x.png \
  --width 256 \
  --scale 2 \
  --background transparent \
  --quality 100
```

## CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `<input>` | - | Input SVG file path | Required |
| `[output]` | - | Output PNG file path | Auto-generated |
| `--width <number>` | `-w` | Output width in pixels | Intrinsic |
| `--height <number>` | `-h` | Output height in pixels | Intrinsic |
| `--scale <number>` | `-s` | Scale factor (e.g., 2 for 2x) | 1 |
| `--background <color>` | `-b` | Background color | transparent |
| `--quality <number>` | `-q` | PNG quality (0-100) | 100 |
| `--help` | - | Show help | - |
| `--version` | - | Show version | - |

## Advanced Features

### Dimension Calculation

When you specify dimensions, pnger intelligently calculates the output size:

1. **No dimensions**: Uses SVG's intrinsic dimensions
2. **Width only**: Calculates height maintaining aspect ratio
3. **Height only**: Calculates width maintaining aspect ratio
4. **Both dimensions**: Fits within dimensions while preserving aspect ratio (no distortion)
5. **Scale factor**: Applied after dimension calculation

### SVG Without Dimensions

If your SVG doesn't have width/height attributes or viewBox, pnger will attempt to calculate dimensions from the SVG's bounding box automatically.

### Custom Chrome Path

If Chrome/Chromium is installed in a non-standard location, set the `CHROME_PATH` environment variable:

```bash
export CHROME_PATH="/path/to/chrome"
pnger input.svg output.png
```

## Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd pnger

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode (run without building)
npm run dev -- input.svg output.png
```

### Project Structure

```
pnger/
├── src/
│   ├── cli.ts         # CLI entry point
│   ├── converter.ts   # Core conversion logic
│   ├── types.ts       # TypeScript interfaces
│   └── utils.ts       # Helper functions
├── test/
│   ├── fixtures/      # Sample SVG files
│   ├── converter.test.ts
│   └── utils.test.ts
└── package.json
```

## Examples

### Icon Generation

Generate multiple icon sizes for an app:

```bash
pnger icon.svg icon-16.png --width 16
pnger icon.svg icon-32.png --width 32
pnger icon.svg icon-64.png --width 64
pnger icon.svg icon-128.png --width 128
pnger icon.svg icon-256.png --width 256
pnger icon.svg icon-512.png --width 512
```

### Retina Images

Generate 1x, 2x, and 3x versions:

```bash
pnger logo.svg logo.png
pnger logo.svg logo@2x.png --scale 2
pnger logo.svg logo@3x.png --scale 3
```

### Social Media Images

Generate images for different platforms:

```bash
# Twitter card
pnger social.svg twitter-card.png --width 1200 --height 630

# Facebook share
pnger social.svg facebook-share.png --width 1200 --height 630

# Instagram post
pnger social.svg instagram.png --width 1080 --height 1080
```

## Troubleshooting

### Chrome Not Found

If you get a "Chrome/Chromium not found" error:

1. Install Chrome or Chromium (see Installation section)
2. Set `CHROME_PATH` environment variable to your Chrome executable
3. Check common installation paths are accessible

### SVG Dimensions Error

If you get "Unable to determine SVG dimensions":

1. Add `width` and `height` attributes to your SVG
2. Or add a `viewBox` attribute
3. Or the tool will try to calculate from bounding box

### Memory Issues

For very large SVGs or high resolutions:

1. Reduce the scale factor
2. Specify smaller dimensions
3. Increase Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=4096 pnger ...`

## Why pnger?

- **Accuracy First**: Uses the same rendering engine as Chrome for pixel-perfect output
- **Complete Feature Support**: Handles all SVG features that browsers support
- **Simple CLI**: Intuitive command-line interface
- **Smart Defaults**: Works great out of the box with sensible defaults
- **Future-Ready**: Built with TypeScript, easy to extend for Raycast or other integrations

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
