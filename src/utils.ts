import { existsSync, accessSync, constants } from 'fs';
import { readFile } from 'fs/promises';
import { platform } from 'os';
import { ChromeConfig, SVGDimensions } from './types';

/**
 * Find Chrome/Chromium executable path
 */
export async function findChrome(): Promise<ChromeConfig> {
  // Check environment variable first
  if (process.env.CHROME_PATH) {
    if (existsSync(process.env.CHROME_PATH)) {
      return { executablePath: process.env.CHROME_PATH };
    }
  }

  // Platform-specific paths
  const platformPaths: Record<string, string[]> = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
    ],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Chromium\\Application\\chrome.exe',
    ],
  };

  const paths = platformPaths[platform()] || [];

  for (const path of paths) {
    if (existsSync(path)) {
      return { executablePath: path };
    }
  }

  throw new Error(
    `Chrome/Chromium not found. Please install Chrome or set CHROME_PATH environment variable.\n\n` +
    `Installation instructions:\n` +
    `  macOS:   brew install --cask google-chrome\n` +
    `  Linux:   sudo apt install google-chrome-stable (or chromium-browser)\n` +
    `  Windows: Download from https://www.google.com/chrome/\n\n` +
    `Or set CHROME_PATH to your Chrome executable:\n` +
    `  export CHROME_PATH="/path/to/chrome"`
  );
}

/**
 * Parse SVG file and extract dimensions
 */
export async function parseSVGDimensions(svgPath: string): Promise<SVGDimensions> {
  const svgContent = await readFile(svgPath, 'utf-8');
  
  // Try to extract width and height from attributes
  const widthMatch = svgContent.match(/\swidth=["'](\d+(?:\.\d+)?)(px|pt|pc|in|cm|mm)?["']/i);
  const heightMatch = svgContent.match(/\sheight=["'](\d+(?:\.\d+)?)(px|pt|pc|in|cm|mm)?["']/i);
  
  if (widthMatch && heightMatch) {
    return {
      width: parseFloat(widthMatch[1]),
      height: parseFloat(heightMatch[1]),
    };
  }

  // Try to extract from viewBox
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const values = viewBoxMatch[1].split(/[\s,]+/).map(parseFloat);
    if (values.length === 4) {
      return {
        width: values[2] - values[0],
        height: values[3] - values[1],
      };
    }
  }

  // If we can't determine dimensions, we'll need to calculate from bounding box
  // This will be handled by the browser rendering
  throw new Error(
    'Unable to determine SVG dimensions. SVG must have width/height attributes or viewBox.'
  );
}

/**
 * Calculate final dimensions based on options
 */
export function calculateDimensions(
  intrinsic: SVGDimensions,
  options: {
    width?: number;
    height?: number;
    scale?: number;
  }
): SVGDimensions {
  const scale = options.scale || 1;
  
  // Both width and height specified - fill preserving aspect ratio
  if (options.width && options.height) {
    const targetAspect = options.width / options.height;
    const intrinsicAspect = intrinsic.width / intrinsic.height;
    
    let finalWidth: number;
    let finalHeight: number;
    
    if (intrinsicAspect > targetAspect) {
      // SVG is wider - fit to width
      finalWidth = options.width;
      finalHeight = options.width / intrinsicAspect;
    } else {
      // SVG is taller - fit to height
      finalHeight = options.height;
      finalWidth = options.height * intrinsicAspect;
    }
    
    return {
      width: Math.round(finalWidth * scale),
      height: Math.round(finalHeight * scale),
    };
  }
  
  // Only width specified
  if (options.width) {
    const aspectRatio = intrinsic.height / intrinsic.width;
    return {
      width: Math.round(options.width * scale),
      height: Math.round(options.width * aspectRatio * scale),
    };
  }
  
  // Only height specified
  if (options.height) {
    const aspectRatio = intrinsic.width / intrinsic.height;
    return {
      width: Math.round(options.height * aspectRatio * scale),
      height: Math.round(options.height * scale),
    };
  }
  
  // No dimensions specified - use intrinsic with scale
  return {
    width: Math.round(intrinsic.width * scale),
    height: Math.round(intrinsic.height * scale),
  };
}

/**
 * Validate file is readable
 */
export function validateInputFile(filePath: string): void {
  if (!existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }
  
  try {
    accessSync(filePath, constants.R_OK);
  } catch {
    throw new Error(`Input file is not readable: ${filePath}`);
  }
  
  if (!filePath.toLowerCase().endsWith('.svg')) {
    throw new Error(`Input file must be an SVG file: ${filePath}`);
  }
}

/**
 * Validate conversion options
 */
export function validateOptions(options: {
  width?: number;
  height?: number;
  scale?: number;
  quality?: number;
}): void {
  if (options.width !== undefined && (options.width <= 0 || !Number.isFinite(options.width))) {
    throw new Error(`Invalid width: ${options.width}. Must be a positive number.`);
  }
  
  if (options.height !== undefined && (options.height <= 0 || !Number.isFinite(options.height))) {
    throw new Error(`Invalid height: ${options.height}. Must be a positive number.`);
  }
  
  if (options.scale !== undefined && (options.scale <= 0 || !Number.isFinite(options.scale))) {
    throw new Error(`Invalid scale: ${options.scale}. Must be a positive number.`);
  }
  
  if (options.quality !== undefined && (options.quality < 0 || options.quality > 100)) {
    throw new Error(`Invalid quality: ${options.quality}. Must be between 0 and 100.`);
  }
}

/**
 * Generate output path from input path if not provided
 */
export function generateOutputPath(inputPath: string, outputPath?: string): string {
  if (outputPath) {
    return outputPath;
  }
  
  // Replace .svg extension with .png
  return inputPath.replace(/\.svg$/i, '.png');
}

/**
 * Validate and normalize background color
 */
export function normalizeBackgroundColor(background?: string): string {
  if (!background || background === 'transparent') {
    return 'transparent';
  }
  
  // Basic validation - allow hex, rgb, rgba, named colors
  const validColorPattern = /^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|[a-z]+)$/i;
  if (!validColorPattern.test(background)) {
    throw new Error(`Invalid background color: ${background}`);
  }
  
  return background;
}
